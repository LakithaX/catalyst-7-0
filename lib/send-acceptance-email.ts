import type { SupabaseClient } from '@supabase/supabase-js';
import { renderAcceptanceEmail } from './acceptance-email';

export type AcceptanceJob = { registration_id: string; recipient: string; full_name: string; reference: string; claim_token: string };
type Mail = { to: string; subject: string; html: string; text: string; messageId: string };
export type SendMail = (mail: Mail) => Promise<{ messageId: string; accepted: unknown[] }>;

export async function canRequestRegistrationEmail(db: SupabaseClient, userId: string, registrationId: string) {
  const membership = await db.from('admin_memberships').select('role,is_active').eq('user_id', userId).maybeSingle();
  if (membership.error) throw membership.error;
  if (membership.data?.is_active && membership.data.role === 'admin') return true;
  const registration = await db.from('registrations').select('user_id,status').eq('id', registrationId).maybeSingle();
  if (registration.error) throw registration.error;
  return Boolean(registration.data?.user_id === userId && ['pending', 'approved'].includes(registration.data.status));
}

// Only errors known to occur before SMTP DATA are safe to retry automatically.
export function safeToRetry(error: unknown) {
  const e = error as { code?: string; command?: string; responseCode?: number };
  return e?.code === 'EAUTH' || e?.code === 'ECONNECTION' ||
    ['CONN', 'EHLO', 'HELO', 'STARTTLS', 'AUTH', 'MAIL FROM', 'RCPT TO'].includes(e?.command || '') ||
    (typeof e?.responseCode === 'number' && e.responseCode >= 400 && e.responseCode < 600);
}
export async function sendAcceptanceEmail(db: SupabaseClient, id: string, send: SendMail, template: string, origin: string, sender: string) {
  // Validate rendering configuration before taking the durable claim.
  renderAcceptanceEmail(template, '', '', origin);
  const { data, error } = await db.rpc('claim_acceptance_email', { p_id: id });
  if (error) throw new Error('Could not reserve the acceptance email. Please retry.');
  const job = data?.[0] as AcceptanceJob | undefined;
  if (!job) return { status: 'unchanged' as const };
  const rendered = renderAcceptanceEmail(template, job.full_name, job.reference, origin);
  let status: 'sent' | 'failed' | 'uncertain' = 'uncertain';
  let messageId: string | null = null;
  try {
    const result = await send({ ...rendered, to: job.recipient, messageId: `<catalyst-acceptance-${id}@${sender.split('@')[1]}>` });
    if (result.accepted.length) { status = 'sent'; messageId = result.messageId; }
    else status = 'failed';
  } catch (error) {
    status = safeToRetry(error) ? 'failed' : 'uncertain';
  }
  const finished = await db.rpc('finish_acceptance_email', { p_id: id, p_token: job.claim_token, p_status: status, p_message_id: messageId });
  // Once SMTP may have accepted the message, never claim that retrying is safe.
  if (finished.error || !finished.data) return { status: 'uncertain' as const };
  return { status };
}
