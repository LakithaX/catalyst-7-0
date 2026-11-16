# Issue #5: fonts before vs after

Each image shows **before (`main`, Google Fonts) on the left** and **after (self-hosted, per-route fonts) on the right**. Captures are from headless Chrome at 1366 × 768 with the cache disabled, taken 1 s and 6 s after navigation started. Both builds were served by a local `vite preview`. Images are scaled to 60%.

| Route | 1 s after navigation | 6 s after navigation | Pixels that differ at 6 s |
|---|---|---|---|
| `/` | [home-1s](home-1s-before-vs-after.webp) | [home-6s](home-6s-before-vs-after.webp) | 0.08% |
| `/register` | [register-1s](register-1s-before-vs-after.webp) | [register-6s](register-6s-before-vs-after.webp) | 3.79% (animated petals and ink layers) |
| `/team` | [team-1s](team-1s-before-vs-after.webp) | [team-6s](team-6s-before-vs-after.webp) | 0.00% |
| `/admin` | [admin-1s](admin-1s-before-vs-after.webp) | [admin-6s](admin-6s-before-vs-after.webp) | 0.00% |
| `/about` | [about-1s](about-1s-before-vs-after.webp) | [about-6s](about-6s-before-vs-after.webp) | 0.21% |

At 6 s the pages match. At 1 s, `register-1s` shows the difference best: before is still on the loading screen, waiting for the Google stylesheet, while after has already painted the page.

`/admin` shows "Supabase is not configured for this build" in both captures, because the local preview has no admin configuration. Numbers and method are in [`docs/fonts.md`](../../fonts.md#beforeafter-measurements).
