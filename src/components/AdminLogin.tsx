import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { AuthDrawer } from './ui/auth-drawer';
import { requireSupabase } from '../lib/supabase';
export default function AdminLogin({signedIn,busy,error,onRetry,onSignOut}:{signedIn:boolean;busy:boolean;error:string;onRetry:()=>void;onSignOut:()=>void}){
 return <div className="admin-root admin-auth-page"><div className="admin-auth-art" aria-hidden="true"/><div className="admin-auth-wash" aria-hidden="true"/>
 <header className="admin-auth-header"><Link to="/" aria-label="Catalyst home"><img src="/assets/catalyst_7_logo.png" alt="Catalyst 7.0"/></Link><span><ShieldCheck size={14}/> PRIVATE CONTROL ROOM</span></header>
 <main className="admin-auth-copy"><p className="admin-auth-kicker">CATALYST 7.0 / BEHIND THE EXPERIENCE</p><h1>Every great story<br/>starts with <em>a stroke.</em></h1><p className="admin-auth-description">A space for the people making Catalyst happen.<br/>Your delegates, your event, your next chapter.</p>
 {signedIn?<div className="admin-auth-access"><p role="status">{busy?'Checking administrator access…':error||'Checking your account…'}</p><div><button disabled={busy} onClick={onRetry}>Check access again <ArrowRight size={16}/></button><button onClick={onSignOut}>Sign out</button></div></div>:<AuthDrawer trigger={<button className="admin-auth-enter">Enter control room <ArrowRight size={17}/></button>} onSignIn={async({email,password})=>{const {error}=await requireSupabase().auth.signInWithPassword({email,password});if(error)throw new Error(error.message);}}/>}
 <div className="admin-auth-restricted"><ShieldCheck size={13}/> For the invited Catalyst administrator.</div>
 </main><div className="admin-auth-bottom"><Link to="/"><ArrowLeft size={14}/> Back to Catalyst</Link><span>DARE BEYOND DEFINITION</span></div></div>;
}
