import { useEffect, useRef, useState } from 'react';
import { dispatchRegistrationEmail } from '../lib/acceptance-email';
import { errorMessage, requireSupabase } from '../lib/supabase';

type Progress = { completed: number; total: number; sent: number; failed: number; uncertain: number; skipped: number };
const empty: Progress = { completed: 0, total: 0, sent: 0, failed: 0, uncertain: 0, skipped: 0 };
export default function AdminRegistrationEmails({ readOnly, onChanged, refreshKey }: { readOnly: boolean; onChanged: () => void; refreshKey: unknown }) {
  const [pending, setPending] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState<Progress>(empty);
  const [error, setError] = useState('');
  const running = useRef(false);
  const stopped = useRef(false);
  const mounted = useRef(true);
  async function loadCount() {
    const result = await requireSupabase().from('registration_acceptance_emails')
      .select('registration_id,registrations!inner(status)', { count: 'exact', head: true })
      .eq('status', 'pending').in('registrations.status', ['pending', 'approved']);
    if (!mounted.current) return;
    if (result.error) setError(errorMessage(result.error));
    else setPending(result.count || 0);
  }
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; stopped.current = true; };
  }, []);
  useEffect(() => { void loadCount(); }, [refreshKey]);

  async function sendPending() {
    if (readOnly || running.current) return;
    running.current = true; stopped.current = false;
    setSending(true); setError(''); setProgress(empty);
    try {
      // Snapshot IDs with keyset pagination so this is not limited to the 200
      // loaded directory rows or Supabase's default response size. Each job is
      // attempted only once per run; concurrent senders are guarded in the DB.
      const db = requireSupabase();
      const ids: string[] = [];
      let cursor: string | null = null;
      while (!stopped.current) {
        let query = db.from('registration_acceptance_emails')
          .select('registration_id,registrations!inner(status)')
          .eq('status', 'pending').in('registrations.status', ['pending', 'approved'])
          .order('registration_id').limit(500);
        if (cursor) query = query.gt('registration_id', cursor);
        const result = await query;
        if (result.error) throw result.error;
        const rows = result.data || [];
        ids.push(...rows.map(row => row.registration_id));
        if (rows.length < 500) break;
        cursor = rows[rows.length - 1].registration_id;
      }
      let next = { ...empty, total: ids.length };
      if (mounted.current) setProgress(next);
      for (const id of ids) {
        if (stopped.current) break;
        const status = await dispatchRegistrationEmail(id);
        next = { ...next, completed: next.completed + 1 };
        if (status === 'unchanged') next.skipped++;
        else next[status]++;
        if (mounted.current) setProgress(next);
      }
    } catch (cause) {
      if (mounted.current) setError(`${errorMessage(cause)} Sending stopped. Completed sends are saved; refresh status before resuming.`);
    } finally {
      running.current = false;
      if (mounted.current) { setSending(false); await loadCount(); onChanged(); }
    }
  }

  return <section className="admin-email-bulk" aria-label="Registration acknowledgement emails">
    <div>
      <h2>Send registration acknowledgements</h2>
      <p>{pending === null ? 'Checking pending emails…' : `${pending} pending ${pending === 1 ? 'email' : 'emails'} for existing and new registrations.`} Already-sent emails are skipped.</p>
      <p>Pending and approved registrations only. Keep this tab open while sending.</p>
      {(sending || progress.total > 0) && <p role="status">{progress.completed} / {progress.total} processed · {progress.sent} sent · {progress.failed} failed · {progress.uncertain} need checking · {progress.skipped} skipped</p>}
      {error && <p role="alert">{error}</p>}
    </div>
    {!readOnly && <div className="admin-row-actions">
      <button disabled={sending || !pending} onClick={() => void sendPending()}>{sending ? 'Sending…' : 'Send pending acknowledgements'}</button>
      {sending && <button onClick={() => { stopped.current = true; }}>Stop after current email</button>}
    </div>}
  </section>;
}
