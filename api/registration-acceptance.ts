import type { IncomingMessage, ServerResponse } from 'node:http';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { loadAcceptanceTemplate } from '../lib/acceptance-email';
import { canRequestRegistrationEmail, sendAcceptanceEmail } from '../lib/send-acceptance-email';

type ApiRequest = IncomingMessage & { body?: unknown };
export function createAcceptanceHandler(clientFactory: typeof createClient = createClient) {
 return async function handler(req: ApiRequest, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  const respond = (code: number, body: object) => { res.statusCode = code; res.end(JSON.stringify(body)); };
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return respond(405, { error: 'Method not allowed' }); }
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) return respond(401, { error: 'A valid registration or administrator session is required.' });
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)?.trim().replace(/\/+$/, '').replace(/\/rest\/v1$/i, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return respond(503, { error: 'Registration email backend is not configured.' });
  try {
    const db = clientFactory(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: auth, error: authError } = await db.auth.getUser(authorization.slice(7));
    if (authError || !auth.user) return respond(401, { error: 'Your session expired. Sign in again.' });
    let body: unknown = req.body;
    if (body === undefined) {
      let input = '';
      for await (const chunk of req) { input += chunk; if (input.length > 2048) return respond(413, { error: 'Request too large' }); }
      try { body = JSON.parse(input); } catch { return respond(400, { error: 'Invalid request' }); }
    } else if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { return respond(400, { error: 'Invalid request' }); }
    }
    const id = (body as { registrationId?: unknown } | null)?.registrationId;
    if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return respond(400, { error: 'Invalid registration' });
    if (!await canRequestRegistrationEmail(db, auth.user.id, id)) return respond(403, { error: 'Registration access required.' });
    const user = process.env.GMAIL_USER?.trim();
    const password = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, '');
    const origin = process.env.EMAIL_SITE_URL?.trim();
    if (!user || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(user) || !password || !origin) return respond(503, { error: 'Configure Gmail and the public site URL before sending registration emails.' });
    const transport = nodemailer.createTransport({
      host: 'smtp.gmail.com', port: 465, secure: true,
      auth: { user, pass: password }, connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000,
    });
    const result = await sendAcceptanceEmail(db, id, mail => transport.sendMail({ ...mail, from: { name: 'Catalyst 7.0 · AIESEC in SLIIT', address: user } }), loadAcceptanceTemplate(), origin, user);
    return respond(200, result);
  } catch {
    // Do not expose database errors, SMTP credentials or delegate information.
    return respond(500, { error: 'Could not complete the email request. Refresh its status before retrying.' });
  }
 };
}
export default createAcceptanceHandler();
