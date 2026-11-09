import React, { useEffect, useId, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, errorMessage } from '../lib/supabase';

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    let revision = 0;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      revision++;
      if (active) { setSession(next); setLoading(false); }
    });
    const initialRevision = revision;
    supabase.auth.getSession().then(({ data, error }) => {
      if (active && revision === initialRevision) { setSession(error ? null : data.session); setLoading(false); }
    }).catch(() => { if (active && revision === initialRevision) { setSession(null); setLoading(false); } });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  return { session, loading };
}

export default function EmailSignIn({ initialEmail = '', admin = false }: { initialEmail?: string; admin?: boolean }) {
  const { session, loading } = useSession();
  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const id = useId();
  async function run(action: 'send' | 'verify' | 'out') {
    if (!supabase) return;
    setBusy(true); setMessage('');
    try {
      if (action === 'out') {
        const { error } = await supabase.auth.signOut(); if (error) throw error;
        setSent(false); setToken('');
      } else if (action === 'send') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw new Error('Enter a valid email address.');
        const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: !admin } });
        if (error) throw error;
        setSent(true); setMessage('Check your email for your sign-in code.');
      } else {
        const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: token.trim(), type: 'email' });
        if (error) throw error;
        if (!admin) {
          const linked = await supabase.rpc('link_registration_to_verified_email');
          if (linked.error) throw linked.error;
        }
      }
    } catch (error) { setMessage(errorMessage(error)); }
    finally { setBusy(false); }
  }
  if (!supabase) return <p role="status">Booking is awaiting setup. Please check back soon.</p>;
  if (loading) return <p role="status">Checking sign-in…</p>;
  const button = 'rounded-lg bg-[#C9362B] px-4 py-3 text-sm text-white disabled:opacity-50';
  return <div className="my-5 space-y-3 rounded-xl border border-[#E5DDD0] bg-white p-4 text-[#252321]">
    {session ? <><p className="text-sm">Signed in as {session.user.email}</p><button type="button" disabled={busy} className={button} onClick={() => run('out')}>Sign out</button></> : <>
      <p className="text-sm">{admin ? 'Sign in with your invited admin email.' : 'Verify your registration email to continue.'}</p>
      <label className="block text-sm" htmlFor={`${id}-email`}>Email address</label>
      <input id={`${id}-email`} className="w-full rounded-lg border p-3" type="email" autoComplete="email" value={email} disabled={sent || busy} onChange={e => setEmail(e.target.value)} />
      {!sent ? <button type="button" className={button} disabled={busy} onClick={() => run('send')}>{busy ? 'Sending…' : 'Send sign-in code'}</button> : <>
        <label className="block text-sm" htmlFor={`${id}-code`}>Email code</label>
        <input id={`${id}-code`} className="w-full rounded-lg border p-3" autoComplete="one-time-code" inputMode="numeric" value={token} onChange={e => setToken(e.target.value)} />
        <div className="flex flex-wrap gap-3"><button type="button" className={button} disabled={busy || !token.trim()} onClick={() => run('verify')}>Verify code</button><button type="button" disabled={busy} onClick={() => { setSent(false); setToken(''); setMessage(''); }}>Change email</button><button type="button" disabled={busy} onClick={() => run('send')}>Resend code</button></div>
      </>}
    </>}
    {message && <p role="status" className="text-sm">{message}</p>}
  </div>;
}
