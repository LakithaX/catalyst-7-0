import { ArrowRight, ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const links = [
  ['Home', '/'],
  ['About', '/about'],
  ['Conference Team', '/conference-team'],
  ['Gallery', '/gallery'],
  ['Official merchandise', '/merch'],
  ['Play', '/game'],
] as const;

export default function SiteFooter() {
  const backToTop = () => window.scrollTo({
    top: 0,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  });

  return (
    <footer id="contact" className="relative isolate w-full overflow-hidden border-t border-[#252321]/10 bg-[#F3ECE0] font-['Montserrat',sans-serif] text-[#252321]">
      <img src="/assets/illustrations/gdj-bonsai-tree-8143900.svg" alt="" loading="lazy" aria-hidden="true" className="pointer-events-none absolute -bottom-8 -right-10 w-64 opacity-[0.04] sm:w-80" />
      <div className="relative mx-auto max-w-7xl px-6 pb-6 pt-14 sm:px-10 lg:px-12 lg:pt-20">
        <div className="grid gap-12 pb-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-16">
          <div>
            <Link to="/" aria-label="Catalyst 7.0 home" className="inline-flex rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9362B]">
              <img src="/assets/catalyst_7_logo.png" alt="Catalyst 7.0" loading="lazy" className="h-20 w-auto object-contain" />
            </Link>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[#C9362B]">Dare beyond definition</p>
            <p className="mt-4 max-w-xs text-sm leading-7 text-[#736B63]">A journey of leadership, connection, and growth. An experience by AIESEC in SLIIT.</p>
          </div>
          <nav aria-label="Footer navigation">
            <h2 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#736B63]">Explore Catalyst</h2>
            <ul className="grid gap-3">
              {links.map(([label, to]) => (
                <li key={to}><Link to={to} className="inline-block rounded-sm py-1 text-sm transition-colors hover:text-[#C9362B] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9362B]">{label}</Link></li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#736B63]">Your next chapter</h2>
            <p className="max-w-xs text-sm leading-7 text-[#736B63]">Step into the Catalyst 7.0 experience.</p>
            <Link to="/register" className="mt-6 inline-flex min-h-12 items-center justify-center gap-4 rounded-full bg-[#C9362B] px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#9E2722] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9362B]">Register now <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>
        <div className="flex flex-col gap-5 border-t border-[#252321]/10 pt-6 text-xs text-[#736B63] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} AIESEC in SLIIT. All rights reserved.</p>
          <button type="button" onClick={backToTop} className="inline-flex min-h-11 w-fit items-center gap-2 rounded-sm font-semibold transition-colors hover:text-[#C9362B] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9362B]">Back to top <ArrowUp size={15} aria-hidden="true" /></button>
        </div>
      </div>
    </footer>
  );
}
