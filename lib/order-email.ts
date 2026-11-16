import type { SupabaseClient } from '@supabase/supabase-js';
import { escapeHtml } from './acceptance-email.js';
import { safeToRetry } from './send-acceptance-email.js';
export type OrderEmailKind = 'received' | 'confirmed';
type Item = { name: string; variant: string; size: string; quantity: number; unit_price_minor: number };
export type OrderEmailJob = { order_id: string; kind: OrderEmailKind; recipient: string; full_name: string; reference: string; total_minor: number; items: Item[]; pickup_location: string; claim_token: string };
const money = (minor: number) => `LKR ${(minor / 100).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export function renderOrderEmail(job: OrderEmailJob, origin: string) {
  const site = new URL(origin);
  if (site.protocol !== 'https:' || site.username || site.password || site.pathname !== '/' || site.search || site.hash) throw new Error('EMAIL_SITE_URL must be an HTTPS origin');
  const confirmed = job.kind === 'confirmed';
  const heading = confirmed ? 'Your merch order is confirmed' : 'We’ve received your merch order';
  const message = confirmed
    ? 'Our team has verified your payment and confirmed your merchandise order. We’ll share pickup arrangements separately. This email does not mean your order is ready for collection yet.'
    : 'Your order and payment receipt have reached us. Your payment is still under verification by the Catalyst team. We’ll email you again once your payment is verified and your order is confirmed.';
  const lines = job.items.map(i => `${i.name} · ${i.variant}${i.size ? ` · ${i.size}` : ''} × ${i.quantity} — ${money(i.unit_price_minor * i.quantity)}`);
  const subject = `${confirmed ? 'Order confirmed' : 'Order received — awaiting verification'} | Catalyst 7.0 | ${job.reference}`;
  const text = `${heading}\n\nHey ${job.full_name},\n\n${message}\n\nOrder reference: ${job.reference}\n${lines.join('\n')}\nTotal: ${money(job.total_minor)}\nPickup location: ${job.pickup_location}\n\nQuestions? Contact the team: ${site.origin}/#contact\n\nThe Catalyst 7.0 Team\nAIESEC in SLIIT`;
  const e = escapeHtml;
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#f8f3e9;color:#252321;font-family:Arial,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#fffdf8"><tr><td><img src="${e(site.origin)}/assets/brand/catalyst-interest-logo-sakura.gif" alt="Catalyst 7.0" width="600" style="display:block;width:100%;height:auto"></td></tr><tr><td style="padding:28px"><h1 style="font-family:Georgia,serif;color:#b51e23;font-size:28px">${e(heading)}</h1><p>Hey ${e(job.full_name)},</p><p style="line-height:1.7">${e(message)}</p><p><strong>Order reference:</strong> ${e(job.reference)}</p><ul>${lines.map(line => `<li style="padding:6px 0">${e(line)}</li>`).join('')}</ul><p><strong>Total: ${e(money(job.total_minor))}</strong></p><p>Pickup location: ${e(job.pickup_location)}</p><p style="line-height:1.7">Questions? <a href="${e(site.origin)}/#contact">Contact the Catalyst team</a>.</p><p>The Catalyst 7.0 Team<br>AIESEC in SLIIT</p></td></tr></table></td></tr></table></body></html>`;
  return { subject, text, html };
}
export async function canRequestOrderEmail(db: SupabaseClient, userId: string, orderId: string) {
  const membership = await db.from('admin_memberships').select('role,is_active').eq('user_id', userId).maybeSingle();
  if (membership.error) throw membership.error;
  if (membership.data?.is_active && membership.data.role === 'admin') return true;
  const order = await db.from('orders').select('registration_id').eq('id', orderId).maybeSingle();
  if (order.error) throw order.error;
  if (!order.data) return false;
  const registration = await db.from('registrations').select('user_id').eq('id', order.data.registration_id).maybeSingle();
  if (registration.error) throw registration.error;
  return registration.data?.user_id === userId;
}
export async function sendOrderEmail(db: SupabaseClient, id: string, kind: OrderEmailKind, send: (mail: { to: string; subject: string; text: string; html: string; messageId: string }) => Promise<{ accepted: unknown[]; messageId: string }>, origin: string, sender: string) {
  // Validate the origin before claiming a job.
  renderOrderEmail({ kind, full_name: '', reference: '', total_minor: 0, items: [], pickup_location: '' } as unknown as OrderEmailJob, origin);
  const claim = await db.rpc('claim_order_email', { p_id: id, p_kind: kind });
  if (claim.error) throw new Error('Could not reserve the order email.');
  const job = claim.data?.[0] as OrderEmailJob | undefined;
  if (!job) return { status: 'unchanged' as const };
  let status: 'sent' | 'failed' | 'uncertain' = 'uncertain';
  let messageId: string | null = null;
  try {
    const rendered = renderOrderEmail(job, origin);
    const result = await send({ ...rendered, to: job.recipient, messageId: `<catalyst-order-${kind}-${id}@${sender.split('@')[1]}>` });
    if (result.accepted.length) { status = 'sent'; messageId = result.messageId; } else status = 'failed';
  } catch (error) { status = safeToRetry(error) ? 'failed' : 'uncertain'; }
  const finish = await db.rpc('finish_order_email', { p_id: id, p_kind: kind, p_token: job.claim_token, p_status: status, p_message_id: messageId });
  return { status: finish.error || !finish.data ? 'uncertain' as const : status };
}
