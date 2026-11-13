import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { errorMessage, requireSupabase } from '../lib/supabase';
import { BACK_OFFICES, FRONT_OFFICES, loadOfficeCounts, type OfficeKind } from '../lib/front-office';

export function OfficeToggle({ kind, onChange }: { kind: OfficeKind; onChange: (kind: OfficeKind) => void }) {
  return <div className="admin-office-toggle" role="group" aria-label="Classify registrations by office">
    <button type="button" aria-pressed={kind === 'front'} onClick={() => onChange('front')}>Front Office</button>
    <button type="button" aria-pressed={kind === 'back'} onClick={() => onChange('back')}>Back Office</button>
  </div>;
}

export default function AdminFrontOfficeChart({ onSelect, kind, onKindChange }: { onSelect: (code: string) => void; kind: OfficeKind; onKindChange: (kind: OfficeKind) => void }) {
  const [breakdown, setBreakdown] = useState<Awaited<ReturnType<typeof loadOfficeCounts>> | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    void loadOfficeCounts(requireSupabase(), controller.signal).then(data => {
      if (!controller.signal.aborted) setBreakdown(data);
    }).catch(cause => {
      if (!controller.signal.aborted) setError(errorMessage(cause));
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [revision]);

  const counts = breakdown?.[kind];
  const label = kind === 'front' ? 'front office' : 'back office';
  const offices = [...(kind === 'front' ? FRONT_OFFICES : BACK_OFFICES), ...(counts?.other ? [{ code: 'other', name: 'Other / unspecified', color: '#8c8174' }] : [])];
  return <section className="admin-table-card admin-front-office" aria-labelledby="front-office-heading" aria-busy={loading}>
    <div className="admin-section-heading">
      <div><h2 id="front-office-heading">Registrations by {label}</h2><p>All registration statuses. Select a group to view its delegates.</p></div>
      <button className="admin-icon-button" aria-label={`Refresh ${label} chart`} title={`Refresh ${label} chart`} disabled={loading} onClick={() => setRevision(value => value + 1)}>
        <RefreshCw size={18} className={loading ? 'admin-spin' : ''} />
      </button>
    </div>
    <OfficeToggle kind={kind} onChange={onKindChange} />
    {error ? <p className="admin-error" role="alert">{error}</p> : loading ? <p role="status">Loading office breakdown…</p> : breakdown && <>
      <p className="admin-front-office-total"><strong>{breakdown.total.toLocaleString()}</strong> registered delegates</p>
      {!breakdown.total && <p className="admin-empty">No registrations yet. Office counts will appear here.</p>}
      <div key={kind} className="admin-front-office-bars">
        {offices.map(office => {
          const count = counts?.[office.code] || 0;
          const percentage = breakdown.total ? count / breakdown.total * 100 : 0;
          const formatted = `${percentage.toFixed(1)}%`;
          return <button key={office.code} className="admin-front-office-row" onClick={() => onSelect(office.code)}
            aria-label={`${office.code === 'other' ? office.name : office.code}: ${count} delegates, ${formatted}. View registrations.`}>
            <span className="admin-front-office-label"><strong>{office.code === 'other' ? 'Other' : office.code}</strong><span>{office.name}</span></span>
            <span className="admin-front-office-track" aria-hidden="true"><span style={{ width: `${percentage}%`, backgroundColor: office.color }} /></span>
            <span className="admin-front-office-value"><strong>{count.toLocaleString()}</strong><span>{formatted}</span></span>
          </button>;
        })}
      </div>
    </>}
  </section>;
}
