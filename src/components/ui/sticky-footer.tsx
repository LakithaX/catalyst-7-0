import React from 'react';
import { cn } from '@/lib/utils';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';

type StickyFooterProps = React.ComponentProps<'footer'>;

/** A fixed footer revealed through its own clipped, in-flow scroll space. */
export function StickyFooter({ className, children, style, ...props }: StickyFooterProps) {
  const reduceMotion = useReducedMotion();
  return (
    <footer
      aria-label="Event organizers"
      className={cn('relative h-[240px] w-full bg-[#F8F3E9] sm:h-[220px]', className)}
      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', ...style }}
      {...props}
    >
      <div className="fixed bottom-0 left-0 h-[240px] w-full overflow-x-hidden overflow-y-auto border-t border-[#252321]/10 bg-[#F8F3E9] text-[#252321] sm:h-[220px]">
        <motion.div
          className="relative mx-auto flex w-full min-w-0 min-h-full max-w-[1540px] flex-col justify-center gap-5 px-6 py-6 sm:px-10"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: reduceMotion ? 0 : 0.45 }}
        >
          {children ?? <>
            <div className="grid w-full min-w-0 grid-cols-[1fr_2fr] items-center gap-4 sm:flex sm:justify-between sm:gap-6">
            <Link to="/" aria-label="Catalyst home" className="min-w-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9362B]">
              <img src="/assets/catalyst_7_logo.png" alt="Catalyst 7.0" className="h-14 w-full max-w-20 object-contain sm:h-20 sm:w-24" />
            </Link>
            <div className="grid min-w-0 grid-cols-2 items-center gap-3 sm:flex sm:gap-10">
              <img src="/assets/aiesec-logo-blue.png" alt="AIESEC" className="h-10 w-full min-w-0 object-contain sm:h-12 sm:w-40" />
              <img src="/assets/aiesec-sliit-blue.png" alt="AIESEC in SLIIT" className="h-12 w-full min-w-0 object-contain sm:h-16 sm:w-32" />
            </div>
            </div>
            <div className="flex w-full flex-col items-start justify-between gap-2 border-t border-[#252321]/10 pt-4 text-[9px] leading-relaxed text-[#736B63] sm:flex-row sm:items-center sm:text-[10px]">
              <p>© {new Date().getFullYear()} AIESEC in SLIIT. All rights reserved.</p>
              <p><span className="font-semibold uppercase tracking-[0.12em] text-[#9E2722]">Confidential</span><span aria-hidden="true"> · </span>Authorized personnel only. Handle delegate information with care.</p>
            </div>
          </>}
        </motion.div>
      </div>
    </footer>
  );
}
