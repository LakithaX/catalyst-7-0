import React, { useEffect, useState } from 'react';
import { requireSupabase, errorMessage } from '../lib/supabase';

const sheetUrl = 'https://docs.google.com/spreadsheets/d/1czkQD3vo7NQ0vi2xU8RCCjXYBsYJkM_n5FbFotml61k/edit';
type Status = {total:number;pending:number;failed:number;last_synced_at:string|null};
export default function AdminSheetSync({ readOnly = true }: { readOnly?: boolean }) {
  const [status,setStatus]=useState<Status|null>(null);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  useEffect(()=>{
    let active=true;
    async function refresh(){
      try {
        const result=await requireSupabase().rpc('admin_sheet_sync_status');
        if(result.error)throw result.error;
        if(active){setStatus(result.data);setError('');}
      }catch(e){if(active)setError(errorMessage(e));}
    }
    void refresh();
    const timer=window.setInterval(()=>void refresh(),15000);
    return()=>{active=false;window.clearInterval(timer);};
  },[]);
  async function queue(all:boolean){
    if(readOnly)return;
    setBusy(true);setError('');setMessage('');
    try{
      const result=await requireSupabase().rpc('admin_requeue_sheet_sync',{p_all:all});
      if(result.error)throw result.error;
      setMessage('Records queued. The scheduled worker will pick them up on its next run.');
      const latest=await requireSupabase().rpc('admin_sheet_sync_status');
      if(latest.error)throw latest.error;
      setStatus(latest.data);
    }catch(e){setError(errorMessage(e));}finally{setBusy(false);}
  }
  return <section className="admin-table-card admin-sheet-sync">
    <div className="admin-section-heading"><div><h2>Google Sheets</h2><p>Automatic registration updates in your team spreadsheet.</p></div><a href={sheetUrl} target="_blank" rel="noopener noreferrer">Open Sheet ↗</a></div>
    {error&&<p className="admin-error" role="alert">{error}</p>}
    {status?<>
      <dl className="admin-sync-stats"><div><dt>Registrations tracked</dt><dd>{status.total}</dd></div><div><dt>Pending</dt><dd>{status.pending}</dd></div><div><dt>Failed writes</dt><dd>{status.failed}</dd></div><div><dt>Last successful write</dt><dd>{status.last_synced_at?new Date(status.last_synced_at).toLocaleString():'No successful sync yet'}</dd></div></dl>
      {!status.last_synced_at&&<p>Awaiting the first sync. Complete the Apps Script setup to enable automatic updates.</p>}
      {!readOnly&&<div className="admin-row-actions"><button disabled={busy||!status.total} onClick={()=>void queue(true)}>{busy?'Queuing…':'Sync existing registrations'}</button><button disabled={busy||!status.failed} onClick={()=>void queue(false)}>Retry failed syncs</button></div>}
    </>:!error&&<p role="status">Loading sync status…</p>}
    {message&&<p role="status">{message}</p>}
    <p className="admin-sync-note">The scheduled worker checks about once a minute, including when this panel is closed. Existing rows are updated by registration ID. Supabase remains the source of truth; edits in Sheets are not imported. Wellbeing details and CV files are excluded.</p>
  </section>;
}
