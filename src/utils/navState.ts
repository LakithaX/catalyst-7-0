// Tiny shared helpers. A refresh always lands at the TOP of the page (no scroll restoration).

export function getSS(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setSS(key: string, val: string): void {
  try {
    sessionStorage.setItem(key, val);
  } catch {
    // Ignore blocked storage
  }
}

export function delSS(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Ignore blocked storage
  }
}

/** Kept so existing pages that import it keep working: always go to the top. */
export function scrollTopOrRestore(): void {
  if (typeof window === 'undefined') return;
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
}

// ---- Boot info: was THIS page load a browser refresh, and on which path? -------------------
let bootReload = false;
let bootPath = '';
let booted = false;

/** Call once at app start (App.tsx module scope). */
export function initBoot(): void {
  if (booted || typeof window === 'undefined') return;
  booted = true;
  bootPath = window.location.pathname;
  try {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    bootReload = nav?.type === 'reload';
  } catch {
    bootReload = false;
  }
}

let homeFreshDecision: boolean | null = null;

/**
 * True only for the FIRST home-page render after the browser was refreshed while on the home page.
 * Stays stable across re-renders until markHomeBootHandled() is called.
 */
export function isFreshHomeReload(): boolean {
  if (homeFreshDecision === null) {
    homeFreshDecision =
      bootReload && typeof window !== 'undefined' && window.location.pathname === bootPath;
  }
  return homeFreshDecision;
}

export function markHomeBootHandled(): void {
  homeFreshDecision = false;
}