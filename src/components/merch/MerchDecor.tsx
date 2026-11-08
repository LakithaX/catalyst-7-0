import React from 'react'

// ============================================================================
// Small shared pieces for the merch pages (decoration only, no logic).
// ============================================================================
export const KANJI_FONT = "'Noto Serif JP', 'Shippori Mincho', serif"

// seigaiha (wave) pattern, same as the About page
export const SEIGAIHA = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='20' viewBox='0 0 40 20'%3E%3Cg fill='%23FFFAF3' stroke='%23E6A8A8' stroke-width='1.4'%3E%3Ccircle cx='0' cy='10' r='18'/%3E%3Ccircle cx='0' cy='10' r='12'/%3E%3Ccircle cx='0' cy='10' r='6'/%3E%3Ccircle cx='40' cy='10' r='18'/%3E%3Ccircle cx='40' cy='10' r='12'/%3E%3Ccircle cx='40' cy='10' r='6'/%3E%3Ccircle cx='20' cy='20' r='18'/%3E%3Ccircle cx='20' cy='20' r='12'/%3E%3Ccircle cx='20' cy='20' r='6'/%3E%3C/g%3E%3C/svg%3E")`

// the same pattern in gold on wine, for dark bands
export const SEIGAIHA_DARK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='20' viewBox='0 0 40 20'%3E%3Cg fill='none' stroke='%23D6B25E' stroke-opacity='.25' stroke-width='1.4'%3E%3Ccircle cx='0' cy='10' r='18'/%3E%3Ccircle cx='0' cy='10' r='12'/%3E%3Ccircle cx='0' cy='10' r='6'/%3E%3Ccircle cx='40' cy='10' r='18'/%3E%3Ccircle cx='40' cy='10' r='12'/%3E%3Ccircle cx='40' cy='10' r='6'/%3E%3Ccircle cx='20' cy='20' r='18'/%3E%3Ccircle cx='20' cy='20' r='12'/%3E%3Ccircle cx='20' cy='20' r='6'/%3E%3C/g%3E%3C/svg%3E")`

export const WaveDivider = ({ flip = false, className = '' }: { flip?: boolean; className?: string }) => (
  <div
    aria-hidden="true"
    className={`h-5 w-full ${className}`}
    style={{
      backgroundImage: SEIGAIHA,
      backgroundSize: '40px 20px',
      backgroundRepeat: 'repeat-x',
      transform: flip ? 'scaleY(-1)' : undefined,
    }}
  />
)

// splits text into letters (word-safe, so long names still wrap). Put it inside an element
// that has the data-chars attribute (see useMerchMotion).
export const Chars = ({ text }: { text: string }) => (
  <>
    {text.split(' ').map((word, wi, all) => (
      <React.Fragment key={wi}>
        <span className="inline-block whitespace-nowrap" aria-hidden="true">
          {word.split('').map((c, i) => (
            <span key={i} data-char className="inline-block">
              {c}
            </span>
          ))}
        </span>
        {wi < all.length - 1 ? ' ' : null}
      </React.Fragment>
    ))}
  </>
)

// decorative image that quietly disappears if the file is missing
export const Ill = ({ src, className = '', ...rest }: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img
    src={src}
    alt=""
    aria-hidden="true"
    draggable={false}
    loading="lazy"
    decoding="async"
    className={`pointer-events-none select-none ${className}`}
    onError={(e) => { e.currentTarget.style.display = 'none' }}
    {...rest}
  />
)

// red kanji square + label, used as the small heading above sections
export const SectionTag = ({ kanji, children }: { kanji: string; children: React.ReactNode }) => (
  <div className="flex items-center gap-3">
    <span
      aria-hidden="true"
      className="flex h-8 w-8 items-center justify-center rounded-[3px] bg-[#C9362B] text-lg text-white"
      style={{ fontFamily: KANJI_FONT }}
    >
      {kanji}
    </span>
    <span className="font-['Montserrat',sans-serif] text-[11px] font-bold uppercase tracking-[0.28em] text-[#C9362B]">
      {children}
    </span>
  </div>
)
