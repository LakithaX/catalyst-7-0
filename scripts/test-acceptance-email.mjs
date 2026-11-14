import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderAcceptanceEmail } from '../lib/acceptance-email.ts';
import { canRequestRegistrationEmail, sendAcceptanceEmail } from '../lib/send-acceptance-email.ts';
import handler, { createAcceptanceHandler } from '../api/registration-acceptance.ts';

const template = readFileSync(new URL('../supabase/templates/registration-accepted.html', import.meta.url), 'utf8');
const origin = 'https://catalyst.example.test';
const rendered = renderAcceptanceEmail(template, '<img src=x onerror=alert(1)> {{ reference }}', 'CAT&123', origin);
assert.ok(rendered.html.includes('&lt;img src=x onerror=alert(1)&gt; {{ reference }}'));
assert.ok(rendered.html.includes('CAT&amp;123'));
assert.ok(!rendered.html.includes('https://catalyst-7-0.vercel.app'));
assert.ok(rendered.html.includes(`${origin}/assets/brand/catalyst-interest-logo-sakura.gif`));
assert.ok(rendered.text.includes('CAT&123'));
assert.equal(rendered.subject, 'Your spark has reached us | Catalyst 7.0');
for (const content of [rendered.subject, rendered.html, rendered.text]) {
  assert.ok(!/accepted|you’re in|registration confirmed/i.test(content));
}
assert.ok(rendered.html.includes('We’ve received your interest'));
assert.ok(rendered.text.includes('Our team will review your details'));
assert.throws(() => renderAcceptanceEmail(template, '', '', 'http://untrusted.test'), /HTTPS/);

const job = { registration_id: 'test-id', recipient: 'delegate@example.test', full_name: 'Test Delegate', reference: 'TEST-ONLY', claim_token: 'claim-1' };
let claimed = false, sent = 0, finishArgs;
const db = { async rpc(name, args) {
  if (name === 'claim_acceptance_email') {
    if (claimed) return { data: [], error: null };
    claimed = true; return { data: [job], error: null };
  }
  finishArgs = args; return { data: true, error: null };
} };
const send = async mail => {
  sent++;
  assert.equal(mail.to, job.recipient);
  assert.ok(mail.html.includes(job.full_name));
  return { messageId: mail.messageId, accepted: [mail.to] };
};
const args = [template, origin, 'sender@example.test'];
const results = await Promise.all([sendAcceptanceEmail(db, 'test-id', send, ...args), sendAcceptanceEmail(db, 'test-id', send, ...args)]);
assert.equal(sent, 1);
assert.deepEqual(results.map(r => r.status).sort(), ['sent', 'unchanged']);
assert.equal(finishArgs.p_status, 'sent');
for (const [error, expected] of [
  [{ code: 'EAUTH' }, 'failed'],
  [{ code: 'ESOCKET', command: 'CONN' }, 'failed'],
  [{ responseCode: 550, command: 'DATA' }, 'failed'],
  [{ code: 'ETIMEDOUT', command: 'DATA' }, 'uncertain'],
  [new Error('connection interrupted'), 'uncertain'],
]) {
  claimed = false;
  assert.equal((await sendAcceptanceEmail(db, 'test-id', async () => { throw error; }, ...args)).status, expected);
  assert.equal(finishArgs.p_status, expected);
}
claimed = false;
const brokenAck = { rpc: (name, params) => name === 'finish_acceptance_email' ? Promise.resolve({ data: null, error: { message: 'offline' } }) : db.rpc(name, params) };
assert.equal((await sendAcceptanceEmail(brokenAck, 'test-id', send, ...args)).status, 'uncertain');
let responseCode, responseBody;
const response = { setHeader() {}, set statusCode(code) { responseCode = code; }, end(body) { responseBody = JSON.parse(body); } };
await handler({ method: 'GET', headers: {} }, response);
assert.equal(responseCode, 405);
await handler({ method: 'POST', headers: {} }, response);
assert.equal(responseCode, 401);
assert.ok(!JSON.stringify(responseBody).includes(job.recipient));
// An anonymous registrant can request only their own saved registration email.
function accessDb(role, active, owner, status = 'pending') {
  return { from(table) {
    return { select() { return this; }, eq() { return this; }, async maybeSingle() {
      return { data: table === 'admin_memberships' ? { role, is_active: active } : owner ? { user_id: owner, status } : null, error: null };
    } };
  } };
}
assert.equal(await canRequestRegistrationEmail(accessDb(null, false, 'anonymous-id'), 'anonymous-id', 'id'), true);
assert.equal(await canRequestRegistrationEmail(accessDb(null, false, 'other-id'), 'anonymous-id', 'id'), false);
assert.equal(await canRequestRegistrationEmail(accessDb(null, false, null), 'anonymous-id', 'id'), false);
assert.equal(await canRequestRegistrationEmail(accessDb('viewer', true, 'other-id'), 'viewer-id', 'id'), false);
assert.equal(await canRequestRegistrationEmail(accessDb('admin', false, 'other-id'), 'admin-id', 'id'), false);
assert.equal(await canRequestRegistrationEmail(accessDb('admin', true, 'other-id'), 'admin-id', 'id'), true);
assert.equal(await canRequestRegistrationEmail(accessDb(null, false, 'anonymous-id', 'rejected'), 'anonymous-id', 'id'), false);
const savedEnv = { ...process.env };
try {
  process.env.SUPABASE_URL = 'https://database.example.test';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only';
  for (const [role, active, owner, expected] of [['viewer', true, 'other-id', 403], ['admin', false, 'other-id', 403], [null, false, 'other-id', 403], ['admin', true, 'other-id', 503], [null, false, 'caller-id', 503]]) {
    delete process.env.GMAIL_APP_PASSWORD;
    const protectedHandler = createAcceptanceHandler(() => ({
      ...accessDb(role, active, owner),
      auth: { async getUser(token) { assert.equal(token, 'test-session'); return { data: { user: { id: 'caller-id' } }, error: null }; } },
    }));
    await protectedHandler({ method: 'POST', headers: { authorization: 'Bearer test-session' }, body: { registrationId: '10000000-0000-4000-8000-000000000001' } }, response);
    assert.equal(responseCode, expected);
  }
  const invalidSession = createAcceptanceHandler(() => ({ auth: { async getUser() { return { data: { user: null }, error: new Error('expired') }; } } }));
  await invalidSession({ method: 'POST', headers: { authorization: 'Bearer expired' } }, response);
  assert.equal(responseCode, 401);
} finally {
  for (const key of Object.keys(process.env)) if (!(key in savedEnv)) delete process.env[key];
  Object.assign(process.env, savedEnv);
}
console.log('PASS: acceptance template escaping, concurrent sends, SMTP failures, ambiguous delivery, failed acknowledgements and API entry guards. No real email sent.');
