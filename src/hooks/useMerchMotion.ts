import { useLayoutEffect } from 'react'
import type { RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// ============================================================================
// ONE motion engine for every merch page and component.
// Put the hook on a page's root element, then switch effects on with data attributes.
// Nothing here touches elements that have no attribute, and everything is skipped for
// prefers-reduced-motion (the content simply stays visible).
//
//   data-reveal="up|left|right|scale|fade"   slides/fades in once when scrolled to
//   data-delay="0.2"                          extra delay (seconds) for data-reveal
//   data-reveal-group                         its direct children rise in one after another
//   data-chars                                container holding <Chars/>; letters drop in
//   data-parallax="0.15"                      drifts slower/faster than the page while scrolling
//   data-float="14"                           gentle endless bobbing (px), only while on screen
//   data-tilt                                 tilts toward the mouse (desktop only)
//   data-magnetic                             pulls toward the mouse (desktop only)
//   data-progress                             a fixed bar that fills as the page scrolls
//
// Don't put data-parallax and data-float on the same element (they both move it up/down).
// ============================================================================
export function useMerchMotion(scope: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useLayoutEffect(() => {
    const root = scope.current
    if (!root) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const q = gsap.utils.selector(root)
        const cleanups: Array<() => void> = []

        // ----- single reveals
        q('[data-reveal]').forEach((node) => {
          const el = node as HTMLElement
          const kind = el.dataset.reveal || 'up'
          const delay = parseFloat(el.dataset.delay || '0')
          const from: gsap.TweenVars =
            kind === 'left' ? { x: -64 }
              : kind === 'right' ? { x: 64 }
                : kind === 'scale' ? { scale: 0.88 }
                  : kind === 'fade' ? {}
                    : { y: 44 }
          gsap.from(el, {
            ...from, opacity: 0, duration: 1, delay, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          })
        })

        // ----- staggered groups
        q('[data-reveal-group]').forEach((node) => {
          const el = node as HTMLElement
          const items = Array.from(el.children)
          if (!items.length) return
          gsap.from(items, {
            y: 46, opacity: 0, duration: 0.85, stagger: 0.09, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          })
        })

        // ----- letters dropping in like brush strokes
        q('[data-chars]').forEach((node) => {
          const el = node as HTMLElement
          const chars = el.querySelectorAll('[data-char]')
          if (!chars.length) return
          gsap.from(chars, {
            yPercent: -130, rotation: () => gsap.utils.random(-14, 14), opacity: 0,
            duration: 0.95, stagger: 0.04, ease: 'back.out(1.7)',
            scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          })
        })

        // ----- scroll parallax (triggered by the element's parent so it doesn't chase itself)
        q('[data-parallax]').forEach((node) => {
          const el = node as HTMLElement
          const s = parseFloat(el.dataset.parallax || '0.15')
          gsap.fromTo(el, { yPercent: -s * 100 }, {
            yPercent: s * 100, ease: 'none',
            scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
          })
        })

        // ----- floating decorations, only animated while visible
        q('[data-float]').forEach((node, i) => {
          const el = node as HTMLElement
          const amp = parseFloat(el.dataset.float || '12')
          const t = gsap.to(el, {
            y: `+=${amp}`, rotation: `+=${i % 2 ? 2.5 : -2.5}`,
            duration: 3 + (i % 3) * 0.6, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true,
          })
          ScrollTrigger.create({
            trigger: el, start: 'top bottom', end: 'bottom top',
            onToggle: (self) => (self.isActive ? t.play() : t.pause()),
          })
        })

        // ----- page scroll progress bar
        const bar = q('[data-progress]')[0]
        if (bar) {
          gsap.fromTo(bar, { scaleX: 0 }, {
            scaleX: 1, ease: 'none', transformOrigin: '0% 50%',
            scrollTrigger: { start: 0, end: 'max', scrub: 0.2 },
          })
        }

        // ----- mouse effects (desktop pointers only)
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
          q('[data-magnetic]').forEach((node) => {
            const el = node as HTMLElement
            const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
            const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })
            const move = (e: PointerEvent) => {
              const r = el.getBoundingClientRect()
              xTo((e.clientX - (r.left + r.width / 2)) * 0.22)
              yTo((e.clientY - (r.top + r.height / 2)) * 0.32)
            }
            const leave = () => { xTo(0); yTo(0) }
            el.addEventListener('pointermove', move)
            el.addEventListener('pointerleave', leave)
            cleanups.push(() => {
              el.removeEventListener('pointermove', move)
              el.removeEventListener('pointerleave', leave)
            })
          })

          q('[data-tilt]').forEach((node) => {
            const el = node as HTMLElement
            gsap.set(el, { transformPerspective: 900 })
            const rx = gsap.quickTo(el, 'rotationX', { duration: 0.7, ease: 'power3.out' })
            const ry = gsap.quickTo(el, 'rotationY', { duration: 0.7, ease: 'power3.out' })
            const move = (e: PointerEvent) => {
              const r = el.getBoundingClientRect()
              const nx = (e.clientX - r.left) / r.width - 0.5
              const ny = (e.clientY - r.top) / r.height - 0.5
              rx(-ny * 9)
              ry(nx * 12)
            }
            const leave = () => { rx(0); ry(0) }
            el.addEventListener('pointermove', move)
            el.addEventListener('pointerleave', leave)
            cleanups.push(() => {
              el.removeEventListener('pointermove', move)
              el.removeEventListener('pointerleave', leave)
            })
          })
        }

        return () => cleanups.forEach((fn) => fn())
      })
    }, root)

    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
