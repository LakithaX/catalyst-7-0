import { useState } from 'react';
import { dispatchOrderEmail, type OrderEmailKind } from '../lib/order-email';
import { errorMessage } from '../lib/supabase';
export type OrderEmail = { kind: OrderEmailKind; status: string; sent_at: string | null };
export default function AdminOrderEmails({ orderId, jobs, readOnly, cancelled, onChanged }: { orderId: string; jobs: OrderEmail[]; readOnly: boolean; cancelled: boolean; onChanged: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function send(kind: OrderEmailKind) {
    if (busy || readOnly || cancelled) return;
    setBusy(true);setMessage('');
    try {
      const status = await dispatchOrderEmail(orderId, kind);
      setMessage(status === 'sent' ? 'Email sent.' : status === 'failed' ? 'Email failed. You can retry.' : 'Refresh status. Check Gmail Sent before retrying an uncertain delivery.');
    } catch (error) { setMessage(errorMessage(error)); }
    finally { await onChanged();setBusy(false); }
  }
  return <div className="admin-order-emails"><h4>Order emails</h4>{jobs.length === 0 && <p>No order emails queued for this historical order.</p>}{jobs.map(job => <div key={job.kind}><p>{job.kind === 'received' ? 'Order received' : 'Order confirmed'}: {job.status}{job.sent_at ? ` · ${new Date(job.sent_at).toLocaleString()}` : ''}</p>{!readOnly && <button className="admin-email-send" disabled={busy || cancelled || !['pending','failed'].includes(job.status)} onClick={() => void send(job.kind)}>{job.status === 'sent' ? 'Email sent' : job.status === 'sending' ? 'Sending / check status' : job.status === 'uncertain' ? 'Check Gmail Sent' : job.status === 'skipped' ? 'Superseded by confirmation' : job.status === 'failed' ? 'Retry email' : 'Send email'}</button>}</div>)}{message && <p role="status">{message}</p>}<button disabled={busy} onClick={() => void onChanged()}>Refresh email status</button></div>;
}
