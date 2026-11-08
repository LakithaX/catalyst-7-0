import * as React from 'react';
import { Drawer } from '@base-ui/react/drawer';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Eye, EyeOff, LoaderCircle, ShieldCheck, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AuthDrawerProps = {
  trigger: React.ReactElement;
  onSignIn: (credentials: { email: string; password: string }) => Promise<void>;
  onSuccess?: () => void;
  className?: string;
};

export function AuthDrawer({ trigger, onSignIn, onSuccess, className }: AuthDrawerProps) {
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const submitting = React.useRef(false);
  const id = React.useId();
  const reduce = useReducedMotion();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) && password.length > 0;

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    if (!valid || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError('');
    try {
      await onSignIn({ email: email.trim(), password });
      setPassword('');
      setOpen(false);
      onSuccess?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed. Please try again.');
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  const field = 'flex min-h-12 w-full min-w-0 items-center rounded-2xl border border-[#e5d9c8] bg-[#f2eadd] px-4 focus-within:ring-2 focus-within:ring-[#c9362b]/40';
  const input = 'min-w-0 flex-1 rounded-xl border-0 bg-transparent py-3 text-base text-[#252321] outline-none focus-visible:outline-none';

  return <Drawer.Root open={open} onOpenChange={next => {
    if (submitting.current) return;
    setOpen(next);
    setPassword('');
    setShowPassword(false);
    setError('');
  }}>
    <Drawer.Trigger render={trigger} />
    <Drawer.Portal>
      <Drawer.Backdrop className="fixed inset-0 z-[100] bg-[#252321]/35 backdrop-blur-sm" />
      <Drawer.Viewport className="fixed inset-0 z-[101] flex items-end justify-center p-4 sm:p-6">
        <Drawer.Popup className={cn('auth-sheet relative w-full max-w-[400px] overflow-hidden rounded-[28px] border border-white/60 bg-[#fffaf1] text-[#252321] shadow-2xl outline-none', className)}>
          <Drawer.Close disabled={busy} aria-label="Close sign in" className="absolute right-5 top-5 z-10 flex size-8 items-center justify-center rounded-full bg-[#eee4d5] text-[#736b63] disabled:opacity-40"><X size={16} /></Drawer.Close>
          <motion.div initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : .16 }} className="p-6 pt-7">
            <Drawer.Title className="mb-5 pr-10 text-xl font-semibold tracking-tight">Welcome backstage.</Drawer.Title>
            <Drawer.Description className="mb-6 text-sm leading-relaxed text-[#827361]">Sign in with your admin email and password to enter the Catalyst control room.</Drawer.Description>
            <form onSubmit={event => void signIn(event)} className="space-y-4" aria-busy={busy}>
              <div>
                <label htmlFor={`${id}-email`} className="mb-2 block text-xs font-medium text-[#736b63]">Admin email</label>
                <div className={field}><input id={`${id}-email`} required autoFocus type="email" autoComplete="username" placeholder="Your admin email address" value={email} disabled={busy} onChange={e => setEmail(e.target.value)} className={input} /></div>
              </div>
              <div>
                <label htmlFor={`${id}-password`} className="mb-2 block text-xs font-medium text-[#736b63]">Password</label>
                <div className={cn(field, 'pr-1.5')}>
                  <input id={`${id}-password`} required type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Your password" value={password} disabled={busy} onChange={e => setPassword(e.target.value)} className={input} />
                  <button type="button" disabled={busy} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)} className="flex size-11 shrink-0 items-center justify-center text-[#827361]">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              {error && <p role="alert" className="text-xs leading-relaxed text-[#b22e24]">{error}</p>}
              <button type="submit" disabled={!valid || busy} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#c9362b] px-4 py-3 text-sm font-semibold text-white disabled:opacity-40">{busy ? <LoaderCircle size={17} className="animate-spin" /> : null}{busy ? 'Signing in…' : 'Enter control room'}<ArrowRight size={16} /></button>
            </form>
            <div className="mt-6 flex items-center justify-center gap-2 border-t border-[#e5d9c8] pt-4 text-[10px] text-[#9a8c79]"><ShieldCheck size={13} className="shrink-0" />Confidential · Authorized administrator only</div>
          </motion.div>
        </Drawer.Popup>
      </Drawer.Viewport>
    </Drawer.Portal>
  </Drawer.Root>;
}
export default AuthDrawer;
