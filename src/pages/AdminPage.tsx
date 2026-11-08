import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, Package, ArrowUpRight, ArrowRight, Search, RefreshCw, LogOut, ShieldCheck, Check, ChevronRight, Sparkles, Menu } from 'lucide-react';
import { useSession } from '../components/EmailSignIn';
import { supabase, errorMessage } from '../lib/supabase';
import './admin.css';
import AdminMerch from '../components/AdminMerch';
import AdminDelegateDetails from '../components/AdminDelegateDetails';
import { StickyFooter } from '../components/ui/sticky-footer';
import AdminLogin from '../components/AdminLogin';

type Registration = { id: string; full_name: string; personal_email: string; university: string; reference: string; status: string; created_at: string; checked_in_at: string | null };
type Order = { id: string; registration_id: string; registrations: {full_name:string;personal_email:string}|null; reference: string; status: string; payment_status: string; total_minor: number; created_at: string };
type Variant = { id: string; sku: string; size: string; price_minor: number };
type Summary = { registrations: number; checked_in: number; orders: number; collected: number; paid_minor: number; pending_registrations: number; awaiting_collection: number; registrations_by_status: Record<string,number> };
const money = (n: number) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(n / 100);
const tabs = [{ name: 'Overview', icon: LayoutDashboard }, { name: 'Registrations', icon: Users }, { name: 'Orders', icon: ShoppingBag }, { name: 'Merchandise', icon: Package }];
export default function AdminPage() {
  const { session, loading } = useSession();
  const currentUser = useRef(session?.user.id);
  currentUser.current = session?.user.id;
  const [selectedDelegate,setSelectedDelegate] = useState<string|null>(null);
  const [tab, setTab] = useState('Overview');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [summary, setSummary] = useState<Summary>({ registrations: 0, checked_in: 0, orders: 0, collected: 0, paid_minor: 0, pending_registrations: 0, awaiting_collection: 0, registrations_by_status: {} });
  const [authorized, setAuthorized] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  async function load() {
    if (!supabase || !session) return;
    const userId=session.user.id;
    setBusy(true); setError('');
    try {
      const membership = await supabase.from('admin_memberships').select('role,is_active').eq('user_id', session.user.id).maybeSingle();
      if (membership.error) throw membership.error;
      if (!membership.data?.is_active || !['admin'].includes(membership.data.role)) throw new Error('This account is not the Catalyst administrator.');
      const [s, r, o, v] = await Promise.all([supabase.rpc('admin_summary'), supabase.from('registrations').select('id,full_name,personal_email,university,reference,status,created_at,checked_in_at').order('created_at', { ascending: false }).order('id',{ascending:false}).range(0,199), supabase.from('orders').select('*,registrations(full_name,personal_email)').order('created_at', { ascending: false }).order('id',{ascending:false}).range(0,199), supabase.from('product_variants').select('*').order('sku')]);
      for (const result of [s, r, o, v]) if (result.error) throw result.error;
      if(s.data.schema_version!==7)throw new Error('The admin setup needs a database update. Apply the Supabase UI integration upgrade before continuing.');
      if(currentUser.current!==userId)return;
      setSummary(s.data); setRegistrations(r.data || []); setOrders(o.data || []); setVariants(v.data || []); setAuthorized(true);
    } catch (e) { if(currentUser.current===userId){setAuthorized(false);setError(errorMessage(e));} }
    finally { if(currentUser.current===userId)setBusy(false); }
  }
  useEffect(() => { setAuthorized(false); setRegistrations([]); setOrders([]); setVariants([]); if (session) void load(); }, [session]);
  async function loadMore(kind: 'registrations'|'orders') {
    if(!supabase || !session || busy)return;
    const userId=session.user.id;
    setBusy(true);setError('');
    try {
      const count=kind==='registrations'?registrations.length:orders.length;
      const query=kind==='registrations'
        ?supabase.from('registrations').select('id,full_name,personal_email,university,reference,status,created_at,checked_in_at')
        :supabase.from('orders').select('*,registrations(full_name,personal_email)');
      const {data,error}=await query.order('created_at',{ascending:false}).order('id',{ascending:false}).range(count,count+199);
      if(error)throw error;
      if(currentUser.current!==userId)return;
      if(kind==='registrations')setRegistrations(previous=>[...previous,...(data as Registration[])]);
      else setOrders(previous=>[...previous,...(data as unknown as Order[])]);
    }catch(e){if(currentUser.current===userId)setError(errorMessage(e));}
    finally{if(currentUser.current===userId)setBusy(false);}
  }
  function navigate(name: string) { setTab(name); setSearch(''); setFilter('all'); setMobileNav(false); }
  async function mutate(rpc: string, args: Record<string, unknown>) {
    if (!supabase) return;
    setBusy(true); setError('');
    const { error } = await supabase.rpc(rpc, args);
    if (error) { setError(errorMessage(error)); setBusy(false); } else await load();
  }
  const visibleRegistrations = registrations.filter(r => `${r.full_name} ${r.reference} ${r.personal_email} ${r.university}`.toLowerCase().includes(search.toLowerCase()) && (filter === 'all' || r.status === filter));
  const visibleOrders = orders.filter(o => o.reference.toLowerCase().includes(search.toLowerCase()) && (filter === 'all' || o.status === filter));
  if (!supabase) return <div className="admin-root admin-gate"><div className="admin-login"><h1>Admin sign-in unavailable</h1><p role="alert">Supabase is not configured for this build. Contact the site administrator.</p><Link to="/">Back to Catalyst</Link></div></div>;
  if (loading) return <div className="admin-root admin-gate"><p role="status">Checking your session…</p></div>;
  if (!session || !authorized) return <><AdminLogin signedIn={Boolean(session)} busy={busy || loading} error={error} onRetry={() => void load()} onSignOut={() => void supabase?.auth.signOut()} /><StickyFooter /></>;
  return <><div className="admin-root"><div className="admin-shell">
    <aside className={`admin-sidebar ${mobileNav ? 'is-open' : ''}`}><Link to="/" className="admin-brand" aria-label="Catalyst home"><img className="admin-logo" src="/assets/catalyst_7_logo.png" alt="Catalyst 7.0" /></Link><div className="admin-nav">{tabs.map(({ name, icon: Icon }) => <button key={name} title={name} aria-label={name} aria-current={tab === name ? 'page' : undefined} className={tab === name ? 'active' : ''} onClick={() => navigate(name)}><Icon size={21} /><span>{name}</span></button>)}</div><div className="admin-sidebar-bottom"><ShieldCheck size={22} /><span>Single admin</span><button aria-label="Sign out" title="Sign out" onClick={() => void supabase?.auth.signOut()}><LogOut size={20} /></button></div></aside>
    <main className="admin-main"><header className="admin-header"><div className="admin-title-group"><button className="admin-mobile-menu" aria-label="Toggle navigation" onClick={() => setMobileNav(!mobileNav)}><Menu /></button><div><p className="admin-eyebrow">CATALYST 7.0 <span>/ CONTROL ROOM</span></p><h1>{tab}</h1></div></div><div className="admin-header-actions"><span className="admin-connection"><i />Connected</span><button className="admin-icon-button" title="Refresh data" aria-label="Refresh data" disabled={busy} onClick={() => void load()}><RefreshCw size={18} className={busy ? 'admin-spin' : ''} /></button><div className="admin-avatar">A</div></div></header>

      {error && <div className="admin-error" role="alert">{error}<button aria-label="Dismiss message" onClick={() => setError('')}>×</button></div>}
      {tab === 'Overview' ? <>
      <div className="admin-welcome"><div><h2>A little planning. A big impact<span>✦</span></h2><p>Here’s how your Catalyst experience is coming together.</p></div><span className="admin-season">THE NEXT CHAPTER ↗</span></div>
      <div className="admin-overview-grid"><section className="admin-hero-card"><div className="admin-card-heading"><span>Delegate overview</span><span className="admin-pill">All time <ChevronRight size={13} /></span></div><div className="admin-hero-number">{summary.registrations}<span>registered delegates</span></div><svg className="admin-chart" viewBox="0 0 600 140" role="img" aria-label="Registration status breakdown"><defs><linearGradient id="adminArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e5c5a6" stopOpacity=".35"/><stop offset="100%" stopColor="#e5c5a6" stopOpacity="0"/></linearGradient></defs>{[25,65,105].map(y => <path key={y} d={`M0 ${y}H600`} stroke="#ffffff16" strokeDasharray="4 7"/>)}{['pending','approved','rejected','cancelled'].map((status, i) => { const count = summary.registrations_by_status?.[status] || 0; const height = Math.max(3, count / Math.max(summary.registrations, 1) * 95); return <g key={status}><rect x={45 + i * 145} y={108-height} width="66" height={height} rx="9" fill={i === 1 ? '#e87861' : '#c8aa83'}/><text x={78+i*145} y="133" textAnchor="middle" fill="#eadac6" fontSize="11">{status}</text></g>; })}</svg><div className="admin-hero-footer"><div><small>Checked in</small><strong>{summary.checked_in}<span> delegates</span></strong></div><div><small>Check-in rate</small><strong>{summary.registrations ? Math.round(summary.checked_in / summary.registrations * 100) : 0}<span>%</span></strong></div><button aria-label="View registrations" onClick={() => navigate('Registrations')}><ArrowUpRight size={24}/></button></div></section>
      <div className="admin-highlight-stack"><button className="admin-quick-card" onClick={() => navigate('Registrations')}><span className="admin-feature-icon"><Users size={28}/></span><div><small>THE PEOPLE MAKE IT</small><strong>Manage delegates</strong></div><ArrowUpRight size={20}/></button><section className="admin-revenue-card"><div className="admin-card-heading"><ShoppingBag size={22}/><span className="admin-pill">Merchandise</span></div><small>Verified payments</small><strong>{money(summary.paid_minor)}</strong><div><span>{summary.orders} orders placed</span><button aria-label="View orders" onClick={() => navigate('Orders')}><ArrowRight size={20}/></button></div></section></div></div>
      <div className="admin-stat-grid">{[{ label: 'Registrations to review', value: summary.pending_registrations, sub: 'Give every delegate a warm welcome.', icon: Users, page: 'Registrations', color: 'purple' }, { label: 'Awaiting collection', value: summary.awaiting_collection, sub: 'A little Catalyst to take home.', icon: ShoppingBag, page: 'Orders', color: 'pink' }, { label: 'Pre-order variants', value: variants.length, sub: 'Manage your merchandise collection.', icon: Package, page: 'Merchandise', color: 'green' }].map(({ label, value, sub, icon: Icon, page, color }) => <button className="admin-stat-card" key={label} onClick={() => navigate(page)}><span className={`admin-stat-icon ${color}`}><Icon size={21}/></span><ArrowUpRight className="admin-stat-arrow" size={18}/><strong>{value}</strong><h3>{label}</h3><p>{sub}</p></button>)}</div>
      </> : null}
      {(tab === 'Overview' || tab === 'Registrations') && <section className="admin-table-card"><div className="admin-section-heading"><div><h2>{tab === 'Overview' ? 'Latest registrations' : 'Delegate directory'}</h2><p>{tab === 'Overview' ? 'The newest faces in our next chapter.' : 'Review registrations and welcome your delegates.'}</p></div>{tab === 'Overview' ? <button className="admin-text-button" onClick={() => navigate('Registrations')}>View all <ArrowRight size={16}/></button> : <select aria-label="Filter registrations" value={filter} onChange={e => setFilter(e.target.value)}>{['all','pending','approved','rejected','cancelled'].map(s => <option key={s}>{s}</option>)}</select>}</div>{tab !== 'Overview' && <SearchBox value={search} onChange={setSearch}/>}<div className="admin-table-scroll"><table><thead><tr><th>Delegate</th><th>Reference</th><th>Status</th>{tab !== 'Overview' && <th>Actions</th>}</tr></thead><tbody>{(tab === 'Overview' ? visibleRegistrations.slice(0,4) : visibleRegistrations).map((r,i) => <tr key={r.id}><td><div className="admin-person"><span className={`admin-person-avatar tone-${i%3}`}>{r.full_name.split(' ').map(n => n[0]).slice(0,2).join('')}</span><div><button className="admin-delegate-link" onClick={()=>setSelectedDelegate(r.id)}>{r.full_name}</button><small>{tab === 'Overview' ? 'Catalyst 7.0 delegate' : r.personal_email}</small></div></div></td><td className="admin-reference">{r.reference}</td><td><span className={`admin-status ${r.status}`}>{r.status}</span>{r.checked_in_at && <small>Checked in</small>}</td>{tab !== 'Overview' && <td><div className="admin-row-actions">{r.status === 'pending' && <><button disabled={busy} onClick={() => void mutate('admin_registration', { p_id:r.id,p_status:'approved' })}>Approve</button><button disabled={busy} onClick={() => void mutate('admin_registration', { p_id:r.id,p_status:'rejected' })}>Reject</button></>}{r.status === 'approved' && !r.checked_in_at && <button disabled={busy} onClick={() => void mutate('admin_registration', { p_id:r.id,p_status:'approved',p_check_in:true })}><Check size={13}/> Check in</button>}</div></td>}</tr>)}</tbody></table>{!visibleRegistrations.length && <p className="admin-empty">No registrations found.</p>}</div></section>}
      {tab === 'Registrations' && <div className="admin-record-pagination"><span>Showing { registrations.length } of {summary.registrations}. Search filters the loaded records.</span>{ registrations.length < summary.registrations && <button disabled={busy} onClick={()=>void loadMore('registrations')}>{busy?'Loading…':'Load more records'}</button>}</div>}
      {tab === 'Orders' && <section className="admin-table-card"><div className="admin-section-heading"><div><h2>Merchandise orders</h2><p>From the first reservation to the final handover.</p></div><select aria-label="Filter orders" value={filter} onChange={e=>setFilter(e.target.value)}>{['all','reserved','ready_for_pickup','collected','cancelled'].map(s=><option key={s}>{s}</option>)}</select></div><SearchBox value={search} onChange={setSearch}/><div className="admin-table-scroll"><table><thead><tr><th>Delegate</th><th>Reference</th><th>Total</th><th>Payment</th><th>Status</th><th>Next action</th></tr></thead><tbody>{visibleOrders.map(o=><tr key={o.id}><td><button className="admin-delegate-link" onClick={()=>setSelectedDelegate(o.registration_id)}>{o.registrations?.full_name||'View delegate'}</button></td><td className="admin-reference"><button onClick={()=>setSelectedDelegate(o.registration_id)}>{o.reference}</button></td><td>{money(o.total_minor)}</td><td><span className={`admin-status ${o.payment_status === 'paid' ? 'approved' : 'pending'}`}>{o.payment_status}</span></td><td>{o.status === 'reserved' ? 'Pre-ordered' : o.status.replaceAll('_',' ')}</td><td><div className="admin-row-actions">{o.payment_status === 'unpaid' && o.status !== 'cancelled' && <button disabled={busy} onClick={()=>setSelectedDelegate(o.registration_id)}>Review payment</button>}{o.status === 'reserved' && <button disabled={busy} onClick={()=>void mutate('admin_order',{p_id:o.id,p_status:'ready_for_pickup'})}>Mark ready</button>}{o.status === 'ready_for_pickup' && o.payment_status === 'paid' && <button disabled={busy} onClick={()=>void mutate('admin_order',{p_id:o.id,p_status:'collected'})}>Mark collected</button>}</div></td></tr>)}</tbody></table>{!visibleOrders.length && <p className="admin-empty">No orders found.</p>}</div></section>}
      {tab === 'Orders' && <div className="admin-record-pagination"><span>Showing { orders.length } of {summary.orders}. Search filters the loaded records.</span>{ orders.length < summary.orders && <button disabled={busy} onClick={()=>void loadMore('orders')}>{busy?'Loading…':'Load more records'}</button>}</div>}
      {tab === 'Merchandise' && <AdminMerch onChanged={() => void load()} />}
      <footer className="admin-footer"><span>CATALYST 7.0 <b>✦</b> Made for what comes next.</span><span><ShieldCheck size={13}/> One admin. Everything in view.</span></footer>
    </main>
    <aside className="admin-right-rail"><div className="admin-rail-heading"><h2>Event pulse</h2><span className="admin-live-dot"/></div><p className="admin-eyebrow">A LITTLE BIG PICTURE</p><div className="admin-ring" style={{'--progress': `${summary.registrations ? summary.checked_in/summary.registrations*100 : 0}%`} as React.CSSProperties}><div><strong>{summary.registrations ? Math.round(summary.checked_in/summary.registrations*100) : 0}%</strong><span>checked in</span></div></div><h3>Bring everyone together.</h3><p>Every check-in is the beginning of another connection.</p><div className="admin-rail-count"><span>Registered</span><strong>{summary.registrations}</strong></div><div className="admin-rail-count"><span>On the ground</span><strong>{summary.checked_in}</strong></div><div className="admin-rail-divider"/><h2>Quick access</h2>{tabs.slice(1).map(({name,icon:Icon})=><button className="admin-rail-link" key={name} onClick={()=>navigate(name)}><span><Icon size={17}/>{name}</span><ChevronRight size={15}/></button>)}<div className="admin-rail-note"><Sparkles size={24}/><h3>Small details.<br/>Unforgettable moments.</h3><p>Your backstage pass to a smoother Catalyst.</p><Link to="/">Visit the event site <ArrowUpRight size={15}/></Link></div></aside>
  </div></div><StickyFooter />{selectedDelegate&&<AdminDelegateDetails key={selectedDelegate} id={selectedDelegate} onClose={()=>setSelectedDelegate(null)} onChanged={()=>void load()}/>}</>;
}
function SearchBox({ value, onChange }: { value: string; onChange: (s: string) => void }) { return <label className="admin-search"><Search size={17}/><input aria-label="Search records" placeholder="Search by name, reference or keyword…" value={value} onChange={e=>onChange(e.target.value)}/></label>; }
