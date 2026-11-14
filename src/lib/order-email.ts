import { requireSupabase } from './supabase';
export type OrderEmailKind = 'received' | 'confirmed';
export async function dispatchOrderEmail(orderId: string, kind: OrderEmailKind): Promise<'sent' | 'failed' | 'uncertain' | 'unchanged'> {
  const { data, error } = await requireSupabase().auth.getSession();
  if (error || !data.session || data.session.user.is_anonymous) throw new Error('Verify your registration email before continuing.');
  const response = await fetch('/api/order-email', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` },
    body: JSON.stringify({ orderId, kind }), signal: AbortSignal.timeout(45000),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Could not request the order email. Refresh its status before retrying.');
  if (!['sent','failed','uncertain','unchanged'].includes(result.status)) throw new Error('Unknown email result. Refresh its status.');
  return result.status;
}
// The database job survives a failed request; email failure must not undo an order/payment.
export async function requestOrderEmail(orderId: string, kind: OrderEmailKind) {
  try { return await dispatchOrderEmail(orderId, kind); } catch { return 'uncertain' as const; }
}
