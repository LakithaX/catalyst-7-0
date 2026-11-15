# Font inventory (issue #5, step 2)

This file lists every Google Fonts family the site loads today, the weights the code actually renders, which routes use each one, and what to do with it. It is the reference for replacing the global Google Fonts stylesheet with fonts loaded per route.

Audited on branch `perf/issue-5-google-fonts` at commit `0d167ff` (2026-11-15).

Where fonts are loaded today:

| Source | Families |
|---|---|
| `index.html:40` (render-blocking, every route) | Anton, Cinzel, Cormorant Garamond, Droid Serif, Inter, Montserrat, Noto Sans JP, Noto Serif JP, Oswald, Permanent Marker, Shippori Mincho, Playfair Display, Yuji Boku, Zen Kaku Gothic New |
| `src/components/EbRoster.tsx:312` `@import` | Montserrat 500/700/800, **Kaushan Script**, Noto Serif JP 700/900 |
| `src/components/OcRoster.tsx:189` `@import` | Oswald 500, Noto Serif JP 700 |
| `src/pages/ContactPage.tsx:746` `@import` | Inter 400–700, Noto Serif JP 700 |

Every family loaded by an `@import` is also loaded by `index.html`, except Kaushan Script, so those imports download the same fonts twice.

---

## Summary

"Renders" is the weight the browser actually draws today, after matching the requested weight against the weights that are loaded (see [How the weights were found](#how-the-weights-were-found), step 5). Keep exactly these weights and the site will look the same.

| Family | Loaded now | Renders (keep) | Drop | Used on routes | Decision |
|---|---|---|---|---|---|
| Zen Kaku Gothic New | 500, 700 | **500, 700** | none | every route, including `/admin` (body font) | **Keep global** |
| Montserrat | 400–900 | **600, 700** global; 400, 500, 800 per page | 900 | 600/700: nearly every route (Navbar, GlobalLoader, BackgroundMusic). 400/800: `/register`, `/team`, `/merch*`. 500: `/merch/:productId` | **Keep global (600, 700)**; move 400/500/800 to pages |
| Noto Sans JP | 400, 500, 700 | **400, 700** | 500 | `/`, `/about`, `/team`, `/gallery`, `/game`, `/merch`, `/merch/cart`, `/partnership` | **Move to pages** |
| Noto Serif JP | 300, 400, 600, 700, 900 | **400, 700, 900** | 300, 600 | `/`, `/about`, `/team`, `/contact`, `/register`, `/partnership`, `/merch*` | **Move to pages** |
| Shippori Mincho | 400–800 | **400, 700, 800** | 500, 600 | `/`, `/gallery`, `/game`, `/partnership`, `/merch/cart`; Japanese text only on `/about`, `/team` | **Move to pages** |
| Yuji Boku | 400 | **400** | none | `/`, shared footer (all Layout routes), `/merch/cart`, `/partnership` | **Move** (footer, home, cart, partnership) |
| Inter | 400–700 | **400, 500, 600, 700** | none | 400/700: shared footer, `/`, `/contact`. 400: `/partnership`. 500: `/contact`. 600: `/contact`, `/partnership` | **Move** (400/700 with the footer, the rest per page) |
| Cinzel | 400, 600, 700, 800, 900 | **400, 600, 700, 800** | 900 | `/` only | **Move to home** |
| Playfair Display | 700 italic, 800 italic | **800 italic** | 700 italic | `/` only | **Move to home** |
| Oswald | 500, 600, 700 | **500, 700** | 600 | `/team` only | **Move to `/team`** |
| Anton | 400 | **400** | none | `/team` only | **Move to `/team`** |
| Kaushan Script | 400 (EbRoster `@import` only) | **400** | none | `/team` only | **Move to `/team`** (self-host it instead of the `@import`) |
| Droid Serif | 400, 700, 400 italic, 700 italic | **400 italic** | 400, 700, 700 italic | `/merch`, `/merch/:productId`, `/merch/cart` | **Move to merch** |
| Cormorant Garamond | 400–700, 400 italic | none | all | none (0 references) | **Remove** |
| Permanent Marker | 400 | none | all | none (0 references) | **Remove** |

So only **Zen Kaku Gothic New (500, 700)** and **Montserrat (600, 700)** need to load on every route. `/admin` needs nothing more than that.

---

## How the weights were found

Six steps. The family sections below show the evidence for each weight.

### 1. Find every reference to the family

Tailwind arbitrary values write spaces as underscores (`font-['Noto_Sans_JP',…]`), so search for both spellings. For Inter, match the quoted name so that words like `Interval` and `International` don't match.

```bash
grep -rnE "Noto.Sans.JP" src
grep -rnE "Shippori.Mincho" src
grep -rnE "['\"]Inter['\"]" src
```

### 2. Follow the indirect references

Most families are used through a name, not written out where they're used:

- **CSS variables in `src/index.css`**: `--font-display` / `--font-label` = Cinzel, `--font-accent` = Playfair Display, `--font-body` = Zen Kaku Gothic New, `--entrance-font-kanji` = Yuji Boku. Then search `var(--font-display)` and so on, including Tailwind's `font-[family-name:var(--font-display)]`. `--entrance-font-*` point back to these tokens.
- **CSS variables in `src/styles/samurai-registration.css`**: `--body` = `'Source Sans 3','Source Sans Pro','Montserrat',…` and `--brush` = `'Jansina','Brusher','Noto Serif JP',serif`. Source Sans is never loaded, so **Montserrat is the real `/register` body font**.
- **JS constants** such as `LABEL_FONT`, `KANJI_FONT`, `HEADING_FONT`, `F_LABEL`, `F_HEAD`, `BRUSH`, `JANSINA`, `BODY`, `HEAD`, `DISPLAY`, and the `fonts.body/label/kanji` object in `animated-gallery-demo.tsx`. For each one, search the constant's name in its own file.

### 3. Pair each use with its weight

The weight has to come from the same place that sets the family:

- **CSS rule**: `font-weight:` inside the same `{ … }` block, or the shorthand `font:700 11px …`.
- **JSX element**: Tailwind `font-medium` (500), `font-semibold` (600), `font-bold` (700), `font-extrabold` (800) or `font-black` (900) in the same `className`, or `fontWeight` in the same `style={{ }}`. Check the whole opening tag, because the family is often in `style` and the weight in `className`.
- **Nothing set** means the weight is inherited from the parent, normally 400. **Containers** (a parent that sets the family for its children) were checked by hand. Child rules without their own `font-family` inherit the container's family:
  - `.ebm-card` (Montserrat) → `.ebm-last` 800
  - `.ebf`, `.ocx-poster`, `.ocg`, `.cm` (Oswald) → `.ebf-eye` 500, `.ocg-cap span` 500, `.ocg-rec` 700
  - `.cx` (Inter, ContactPage) → `.cx-role` 600, `.cx-div b` 700, plus JSX `font-medium` ×10, `font-semibold` ×1, `font-bold` ×19
  - `.pp` (Inter, PartnershipPage) → `.pp-line.first` 600
  - `.rg` (Montserrat via `--body`, registration) → child rules at 400, 600 ×3, 700 ×13, 800 ×8
  - `html, body` (Zen Kaku Gothic New) → any text with no family of its own, e.g. `JapaneseParallaxHero.tsx:378-379` (`font-semibold` / `font-bold`). 132 classNames use `font-bold`/`font-semibold` with no family.

### 4. Account for Tailwind's base styles

`@import "tailwindcss"` includes preflight, which sets `h1–h6 { font-weight: inherit }` (`node_modules/tailwindcss/preflight.css:85`). **Headings in this project are not bold by default.** `b`/`strong` stay `bolder` (400 becomes 700) and `th` stays bold. The site also sets `font-synthesis: none` on `body`, so the browser never fakes bold or italic. A weight that isn't loaded is replaced by the nearest real one.

### 5. Work out the weight that actually renders

A requested weight that isn't loaded is matched using the [CSS font-matching rules](https://www.w3.org/TR/css-fonts-4/#font-style-matching):

- 400–500 requested: check up to 500, then lighter, then heavier
- below 400: lighter first
- above 500: heavier first

Examples from this codebase:

| Request | Loaded | Renders |
|---|---|---|
| Zen Kaku body text, 400 (inherited) | 500, 700 | **500** |
| Zen Kaku `font-semibold`, 600 | 500, 700 | **700** |
| Cinzel `.gate-note`, 500 (`EntryGate.tsx:62`) | 400, 600, 700, 800, 900 | **400** |
| Shippori `font-black`, 900 (`GameComingSoonPage.tsx:25`) | 400–800 | **800** |
| Oswald container, 400 (inherited) | 500, 600, 700 | **500** |

When self-hosting, **import the weight that renders, not the one that's requested**. For example, if you import Cinzel 500, `.gate-note` will change how it looks.

### 6. Classify the family's place in the font stack

Only some entries in a `font-family` list ever draw text:

- **Primary**: the first loaded font in the stack. It draws all the text it has glyphs for.
- **Japanese-glyph fallback**: a Japanese font placed after a Latin-only font, e.g. `'Cinzel', 'Noto Serif JP'`. It draws only Japanese characters. I checked the actual text of these elements (entry gate, hero, partnership announcement, footer, entrance titles). On the home page they are Latin-only, apart from the kanji spans drawn by Yuji Boku.
- **Unused fallback**: placed after a font that already covers the text. Examples:
  - Montserrat in `'Noto Sans JP','Montserrat'` (Noto Sans JP includes Latin): 41 places
  - Noto Sans JP in `--font-body` (after Zen Kaku Gothic New)
  - Noto Serif JP after Yuji Boku or Shippori Mincho
  - Shippori Mincho after Noto Serif JP
- **Load-failure fallback**: Anton after the local `'Jansina','Brusher'` fonts. It only draws if those local files fail to load.

### 7. Map files to routes

For each file, I followed the imports from the lazy route pages in `src/App.tsx`:

- `main.tsx`, `App.tsx` and `Layout.tsx` count as shared.
- Shared components:
  - `Navbar`: every Layout route plus `/`
  - `outro-footer`: every Layout route plus `/`
  - `GlobalLoader`: every route
  - `BackgroundMusic`: every route except `/admin`
- `@/components/ui/*` imports go through the one-line re-export files in the root `components/ui/` folder to `src/components/ui/*`.

---

## Per family

Evidence lines are `file:line`, showing what sets the weight. *Requested → renders* is shown where they differ.

### Zen Kaku Gothic New: keep global (500, 700)

- **How it's used:** `--font-body` → `html, body { font-family: var(--font-body) }` at `src/index.css:135`. It's also used directly in `pages/admin.css:43` (`--font-sans`, admin detail panel), `JapaneseParallaxHero.tsx:377` and `partnership-announcement.tsx:250`.
- **500:** body text inherits 400, and **400 renders as 500** because 400 isn't loaded.
- **700:** `font-semibold`/`font-bold` on text with no family of its own, e.g. `JapaneseParallaxHero.tsx:378-379`.
- **Routes:** every route. On `/admin` it's the only Google font used, in the delegate detail panel. The rest of admin uses `'Plus Jakarta Sans'` (never loaded) and the local `Osaka Bright`/`Brusher` fonts.
- **Note:** keep **500, not 400**, or all body text gets lighter.

### Montserrat: keep 600 and 700 global, the rest per page, drop 900

| Weight | Evidence | Routes |
|---|---|---|
| 700 | `GlobalLoader.tsx:80` `font-bold`; `BackgroundMusic.tsx:298` `fontWeight:700`; `Navbar.tsx:277/310/444/477` `font-bold`; `brand/CatalystTag.tsx:52`; 55 places in total | **every route** (GlobalLoader), Navbar routes, `/register` |
| 600 | `Navbar.tsx:637` `font-semibold`; `merch/CartDrawer.tsx:191`; `merch/ClaimConfirmationModal.tsx:489/653`; `merch/MerchToast.tsx:20`; `.rg` child rules (×3) | Navbar routes, `/merch*`, `/register` |
| 800 | `merch/MerchHero.tsx:327` `font-extrabold`; `EbRoster` `.ebm-last` (inside `.ebm-card`); `.rg` child rules (×8) | `/merch`, `/team`, `/register` |
| 500 | `ProductDetailPage.tsx:377/384/394/401` `font-medium` | `/merch/:productId` |
| 400 | inherited: `EbRoster.tsx:329` `.ebm-card`; `CartDrawer.tsx:155/162`; `MerchProductCard.tsx:105`; `ProductDetailPage.tsx:180`; `.rg` (registration body) | `/team`, `/merch*`, `/register` |

- **900:** no evidence anywhere, so drop it.
- **Unused fallback (41 places):** these never render Montserrat, e.g. `AboutPage.tsx` `LABEL_FONT`, `CartPage.tsx:116…384`, `PartnershipPage.tsx` `F_LABEL`, `ConferenceTeamPage.tsx` `LABEL_FONT`.
- **Duplicate:** the `EbRoster.tsx:312` `@import` (500/700/800).

### Noto Sans JP: move to pages (400, 700), drop 500

| Weight | Evidence | Routes |
|---|---|---|
| 700 | `font-bold` with `font-['Noto_Sans_JP',…]`: `merch/MerchBrandStatement.tsx:27/54/65`, `merch/MerchCollection.tsx:22`, `merch/MerchHero.tsx:296/407`, `GalleryPage.tsx:424`, `GameComingSoonPage.tsx:57`, `CartPage.tsx:126…384`; `PartnershipPage.tsx:68` `font:700 11px ${F_LABEL}`; `full-screen-scroll-fx.tsx:850/912/927` (`--fx-label`); 50 places in total | `/`, `/about`, `/team`, `/gallery`, `/game`, `/merch`, `/merch/cart`, `/partnership` |
| 400 | inherited: `CartPage.tsx:323`, `PartnershipPage.tsx:239` | `/merch/cart`, `/partnership` |

- **No evidence for 500.**
- **Unused fallback:** in `--font-body`, because Zen Kaku Gothic New already covers the text.
- **About and team pages:** `AboutPage.tsx` and `ConferenceTeamPage.tsx` use it through `LABEL_FONT` together with `font-bold`, so only 700 is needed there.

### Noto Serif JP: move to pages (400, 700, 900), drop 300 and 600

| Weight | Evidence | Routes |
|---|---|---|
| 700 | `EbRoster.tsx:411/829/832/855`; `OcRoster.tsx:216/245/560/563` (`font-weight:700`); `ContactPage.tsx:758/784/787/803/816`; `samurai-registration.css:98/109/168/194/228/239`; `AboutPage.tsx:225/307/539` and `ConferenceTeamPage.tsx:152/227/332/403` (`KANJI_FONT` + `font-bold`); `3-d-coverflow-carousel.tsx:581/821` | `/`, `/about`, `/team`, `/contact`, `/register` |
| 900 | `EbRoster.tsx:383` `.ebm-kj font-weight:900`; `AboutPage.tsx:279/436/602/651` and `ConferenceTeamPage.tsx:118` (`font-black`) | `/about`, `/team` |
| 400 | inherited: `merch/MerchDecor.tsx:67` (`KANJI_FONT`); `animated-gallery-demo.tsx:453/616/849/911` (`fonts.kanji`); `ConferenceTeamPage.tsx:268/274/370/434/455`; `AboutPage.tsx:385/469`; `samurai-registration.css:111`; `--brush` rules in registration (400 ×5, Japanese characters only) | `/`, `/about`, `/team`, `/register`, `/merch*` |

- **300:** no evidence.
- **600:** appears only as a Japanese-glyph fallback under Cinzel (`EntryGate.tsx:46`, `index.css:958`), and that text is Latin, so it never renders.
- **Unused fallback:** wherever it follows Yuji Boku or Shippori Mincho (`CartPage.tsx`, `PartnershipPage.tsx` `F_BRUSH`/`F_HEAD`, `outro-footer.tsx` `BRUSH`).
- **Duplicates:** the `@import`s in `EbRoster.tsx`, `OcRoster.tsx` and `ContactPage.tsx`.

### Shippori Mincho: move to pages (400, 700, 800), drop 500 and 600

| Weight | Evidence | Routes |
|---|---|---|
| 800 | `GalleryPage.tsx:464` `.sg-word font-weight:800`; `GalleryPage.tsx:418` and `GameComingSoonPage.tsx:25` `font-black` (900 → 800); `PartnershipPage.tsx:102/109` `.pp-card h3` and `F_HEAD` `font-weight:800`; `CartPage.tsx:249/347` (900 → 800, Japanese characters) | `/gallery`, `/game`, `/partnership`, `/merch/cart` |
| 700 | `3-d-coverflow-carousel.tsx:618` `HEAD` `fontWeight:700`; `PartnershipPage.tsx:132`; `GalleryPage.tsx:472` (Japanese characters); `AboutPage.tsx:543/622`, `CartPage.tsx:417` (`HEADING_FONT` + bold, Japanese characters) | `/`, `/partnership`, `/gallery`, `/about`, `/merch/cart` |
| 400 | inherited: `full-screen-scroll-fx.tsx:142` (`DISPLAY_FONT`); `CartPage.tsx:176/395`; Japanese characters in `HEADING_FONT`/`JANSINA` headings (`AboutPage.tsx`, `ConferenceTeamPage.tsx:163/301/460`, `PartnershipPage.tsx` `F_JANSINA`) | `/`, `/merch/cart`, `/about`, `/team`, `/partnership` |

- **No evidence for 500 or 600.**
- **Japanese characters only:** on `/about` and `/team` it sits after the local Jansina font, so it only draws Japanese characters. Because Google and Fontsource split these fonts by `unicode-range`, the font files only download when Japanese text actually appears.

### Yuji Boku: move (400 only)

- **400 (its only weight):**
  - `index.css:910` `.title-kanji b` (体験, home entrance)
  - `EntryGate.tsx:52` `.gate-kanji` (触媒)
  - `outro-footer.tsx:164/175/262/322` (`BRUSH`: column titles, 武士道, 主催, 共に、先へ)
  - `japanese-cursor.tsx:193`
  - `partnership-announcement.tsx` `BRUSH` (第五章, 共に歩む, 提携発表, hanko seals)
  - `CartPage.tsx:124/125`
  - `PartnershipPage.tsx:71/92`
- **Routes:** `/`, the shared footer (all Layout routes), `/merch/cart`, `/partnership`.
- **Where to import it:** in `outro-footer.tsx`, `HomePage` (entrance, gate, announcement, cursor), `CartPage` and `PartnershipPage`.

### Inter: move (400 with the footer; 500/600/700 per page)

| Weight | Evidence | Routes |
|---|---|---|
| 400 | inherited: `outro-footer.tsx:168` (`<footer style={{ fontFamily: BODY }}>`); `animated-gallery-demo.tsx:576/628/880`; `3-d-coverflow-carousel.tsx:360/827`; `ContactPage.tsx:748` `.cx`; `PartnershipPage.tsx:51` `.pp` | shared footer (all Layout routes and `/`), `/`, `/contact`, `/partnership` |
| 700 | `animated-gallery-demo.tsx:590/919` `font-bold`; `.cx` children: `.cx-div b`, JSX `font-bold` ×19 | `/`, `/contact` |
| 600 | `.cx-role`, JSX `font-semibold`; `.pp-line.first` | `/contact`, `/partnership` |
| 500 | `.cx` JSX `font-medium` ×10 | `/contact` |

- **Unused fallback:** in `full-screen-scroll-fx.tsx` `--fx-label` (after Noto Sans JP).
- **Duplicate:** the `ContactPage.tsx:746` `@import`.

### Cinzel: move to home (400, 600, 700, 800), drop 900

| Weight | Evidence |
|---|---|
| 800 | `EntryGate.tsx:48` `.gate-title font-weight:800` |
| 700 | `EntryGate.tsx:56` `.gate-btn`; `JapaneseParallaxHero.tsx:361/369/389/401/404/412` (`font-bold`); `partnership-announcement.tsx:104/136/277/314/315/349`; `index.css:873` `.title-experience`, `:921` `.title-org`, `:991` |
| 600 | `EntryGate.tsx:46` `.gate-eyebrow`; `index.css:958` |
| 400 | `EntryGate.tsx:62` `.gate-note` requests **500 → renders 400** |

- **Routes:** `/` only (and the `*` catch-all, which also renders `HomePage`). The `--font-display` and `--font-label` tokens are defined globally in `index.css`, but every use is on the home page.
- **900:** no evidence, so drop it.

### Playfair Display: move to home (800 italic), drop 700 italic

- **800 italic:** `index.css:940` `.title-org-in` (`font-style: italic; font-weight: 800`), the word "in" in "AIESEC in SLIIT".
- **The other `--font-accent` uses never draw Playfair:** `EntryGate.tsx:52` `.gate-kanji` and `partnership-announcement.tsx` `BRUSH` contain only kanji, which Playfair doesn't have, so Yuji Boku draws them. That's why 700 italic can go.
- **Only italic is loaded** (`ital,wght@1,700;1,800`); no upright faces.
- **Route:** `/` only.

### Oswald: move to `/team` (500, 700), drop 600

- **500:**
  - `OcRoster.tsx:238/243` `.ocx-nm` and `.ocx-nm p` `font-weight:500`
  - `EbRoster.tsx:428` `.ebm-ptitle`
  - `.ebf-eye`, `.ocg-cap span`
  - inherited 400 → 500 in `.ebf`, `.ocx-poster`, `.ocg`, `.cm`
  - `.ocx-nm h3` (inherits 500 because of the preflight heading reset)
- **700:** `EbRoster.tsx:422` `.ebm-tier font-weight:700`; `.ocg-rec`.
- **600:** no evidence.
- **Route:** `/team` (`EbRoster`, `OcRoster`).
- **Duplicate:** the `OcRoster.tsx:189` `@import`.

### Anton: move to `/team` (400)

- **400, primary in one place only:** `OcRoster.tsx:227` `.ocx-big { font-family:'Anton','Impact',sans-serif; font-weight:400 }`.
- **Load-failure fallback in 8 places**, behind the local `'Jansina','Brusher'` fonts: `EbRoster.tsx:424/825`, `OcRoster.tsx:529/612/1101/1102/1118`, `ContactPage.tsx:749` `.cx-brush`. **`/contact` doesn't need Anton**; `Impact` already backs it up.

### Kaushan Script: move to `/team` (400)

- **400:** `EbRoster.tsx:407` `.ebm-first { font-family:'Kaushan Script',…; font-weight:400 }`.
- **Currently** it's loaded only by the `EbRoster.tsx:312` `@import`. Self-host it in `EbRoster.tsx` instead.

### Droid Serif: move to merch (400 italic only)

- **400 italic:** `font-['Droid_Serif',Georgia,serif] italic` with no weight in `merch/CartDrawer.tsx:67`, `merch/ClaimConfirmationModal.tsx:691` and `ProductDetailPage.tsx:124`.
- **Routes:** `/merch`, `/merch/:productId`, `/merch/cart`.
- **Unused weights:** 400 upright, 700 and 700 italic are loaded but never used.
- **Availability:** Google still serves this family (checked 2026-11-15, HTTP 200). There is no `@fontsource/droid-serif`; its successor `@fontsource/noto-serif` (400 italic) is the self-hosted replacement. Check the three paragraphs visually after the switch.

### Cormorant Garamond: remove

0 references in `src/`, `components/` or `lib/` (`grep -rn "Cormorant" src components lib` returns nothing).

### Permanent Marker: remove

0 references (`grep -rn "Permanent" src components lib` returns nothing).

---

## What each route needs

Based on the decisions above. Global = Zen Kaku Gothic New 500/700 and Montserrat 600/700.

| Route | Additional families (weights) |
|---|---|
| `/admin` | none |
| `/register` | Montserrat 400/800, Noto Serif JP 400/700 |
| `/` | Cinzel 400/600/700/800, Playfair Display 800i, Yuji Boku 400, Inter 400/700, Noto Sans JP 700, Noto Serif JP 400/700/900, Shippori Mincho 400/700/800 |
| `/about` | Noto Sans JP 700, Noto Serif JP 400/700/900, Shippori Mincho 400/700*, footer fonts |
| `/team` | Oswald 500/700, Anton 400, Kaushan Script 400, Montserrat 400/800, Noto Sans JP 700, Noto Serif JP 400/700/900, Shippori Mincho 400*, footer fonts |
| `/gallery` | Shippori Mincho 700/800, Noto Sans JP 700, footer fonts |
| `/game` | Shippori Mincho 800, Noto Sans JP 700, footer fonts |
| `/contact` | Inter 400/500/600/700, Noto Serif JP 700, footer fonts |
| `/partnership` | Inter 400/600, Noto Sans JP 400/700, Noto Serif JP 900, Shippori Mincho 400/700/800, Yuji Boku 400, footer fonts |
| `/merch` | Montserrat 400/800, Noto Sans JP 700, Noto Serif JP 400, Droid Serif 400i, footer fonts |
| `/merch/:productId` | Montserrat 400/500, Noto Serif JP 400, Droid Serif 400i, footer fonts |
| `/merch/cart` | Noto Sans JP 400/700, Shippori Mincho 400/700/800, Yuji Boku 400, Noto Serif JP 400, Droid Serif 400i, footer fonts |

\* Only draws Japanese characters inside Jansina headings.

"Footer fonts" = Inter 400/700 + Yuji Boku 400 (`outro-footer.tsx`, rendered by `Layout` and `HomePage`). `Layout` is in the main bundle, so Inter 400/700 (14 small rules) ends up in the shared CSS. Yuji Boku is loaded with a dynamic `import()` when the footer mounts. That keeps its ~120 rules out of the CSS every route waits for, and off `/admin` and `/register`, which never show the footer.

## Runtime check (step 5)

The static scan above missed four things. Each was found by loading the built site with the Google link removed and comparing, for every text element, the weight drawn now against the weight the old Google set would have drawn:

| Missed | Why the scan missed it | Fix |
|---|---|---|
| Noto Serif JP **900** on `/partnership` (`.pp-card .kj`, `.pp-ph .gk` kanji) | Set with the `font:` shorthand (`font:900 64px/1 'Noto Serif JP'`), not `font-family:` | imported in `PartnershipPage.tsx` |
| Noto Serif JP **700/900** on `/` (`.fx-vertical`, `.fx-seal`, `.fx-hanko`) | Set through the `--fx-jp` CSS variable in `full-screen-scroll-fx.tsx` | imported in `full-screen-scroll-fx.tsx` |
| Shippori Mincho **800** on `/` (`.fx-header`, `.fx-word`, `.fx-featured-title`, `.fx-footer-title`) | The family is passed as a `fontFamily` prop; the weights are in child CSS rules | imported in `full-screen-scroll-fx.tsx` |
| Inter **700** in the footer ("Register now", "Shop merch", "CATALYST 7.0") | Bold children inherit the footer's Inter, the same container case as step 3 | imported in `outro-footer.tsx` |

After the fixes, every route reports no differences. One expected exception: the kanji "触媒" lists Playfair Display first, but Playfair has no kanji, so Yuji Boku draws it either way.

Fonts the browser loaded only briefly were left out. Examples: Noto Serif JP 600 under Cinzel, Playfair 700 italic, and Noto Serif JP 400 under Jansina. A browser can briefly use the next font in a stack while the first one is still downloading, and these were only ever used that way.

After steps 6 and 7 removed the component `@import`s and the `index.html` link, I ran the check again on all 12 routes. Every route made 0 requests to `fonts.googleapis.com` / `fonts.gstatic.com` and showed no differences, including `/team` and `/contact`, where the `@import`s had hidden gaps before. The merch pages render "The collection is being prepared" locally (no product data), so the product grid was checked by the static scan only.

---

## Baseline numbers (before)

I fetched the current `index.html` stylesheet with a desktop Chrome user agent on 2026-11-15:

- **2,091 `@font-face` rules, 1,875,306 bytes uncompressed.** The issue measured 483,707 encoded bytes.
- **1,967 of those rules (94%) belong to the five Japanese families.** Google splits each Japanese weight into ~120 `unicode-range` slices:

| Family | `@font-face` rules |
|---|---|
| Noto Serif JP | 620 |
| Shippori Mincho | 610 |
| Noto Sans JP | 372 |
| Zen Kaku Gothic New | 242 |
| Yuji Boku | 123 |
| Montserrat | 30 |
| Inter | 28 |
| Cormorant Garamond | 25 |
| Oswald | 15 |
| Cinzel | 10 |
| Playfair Display | 8 |
| Droid Serif | 4 |
| Anton | 3 |
| Permanent Marker | 1 |

The weights dropped above remove about 620 of the Japanese rules: Noto Serif JP 300/600, Shippori Mincho 500/600 and Noto Sans JP 500. Moving the rest off the global stylesheet leaves only Zen Kaku Gothic New and Montserrat on every route. Record the real before/after numbers in DevTools as described in step 1 of the issue plan.

---

## Before/after measurements

**Setup.** `main` at `0d167ff` (before) and this branch (after), each built with `npm run build` and served by `vite preview` (gzip). Measured with headless Chrome 1366 × 768, **cache disabled, no CPU or network throttling, a 6-second window per load**: the same conditions as the issue's audit. Each route was loaded **5 times per version**, alternating which version went first, after one unrecorded warm-up load. Values are **medians** (min–max in brackets). Byte counts are bytes on the wire (gzip).

These are local lab numbers, and the setup favours "after". The Google request went over the real internet, while the site's own files came from `localhost` with almost no latency. In production, the self-hosted CSS and fonts also come over the network (from Vercel), so expect a smaller FCP gain than shown here. The byte reductions hold everywhere, and production still saves the separate connection to `fonts.googleapis.com`. The Vercel deploy preview's Lighthouse score is the place to confirm the real-world gain.

### Bytes

| Route | Google Fonts CSS | Render-blocking CSS | Font files |
|---|---|---|---|
| `/` | 473.3 KB → **0** | 498.5 KB → **142.7 KB** | 1421.0 KB (50) → 1212.3 KB (57) |
| `/register` | 473.3 KB → **0** | 498.5 KB → **142.7 KB** | 93.9 KB (3) → 113.3 KB (5) |
| `/team` | 563.3 KB → **0** | 498.6 KB → **142.7 KB** | 1041.2 KB (40) → 1025.3 KB (49) |
| `/admin` | 473.3 KB → **0** | 498.5 KB → **142.7 KB** | 309.4 KB (3) → 291.3 KB (3) |
| `/about` | 473.3 KB → **0** | 498.5 KB → **142.7 KB** | 1317.5 KB (41) → 1233.5 KB (59) |

- The Google stylesheet measured 484,693 bytes, matching the issue's 483,707.
- `/team` fetched 563 KB of Google CSS, because the `EbRoster`/`OcRoster` `@import`s added more.
- Render-blocking CSS after = the app's own CSS (~25 KB) + the global Zen Kaku Gothic New / Montserrat `@font-face` rules (~117 KB gzip).
- **Font files** stay about the same, because the same text still needs the same glyphs.
- **More font files after** (e.g. `/register` 3 → 5): Google serves Montserrat as one variable font covering every weight, while Fontsource uses one static file per weight. `/register` uses 4 Montserrat weights, so it downloads 19 KB more. Every other route downloads fewer font bytes than before.

### Timing and layout stability

| Route | Google CSS request (before) | Render-blocking CSS done | First Contentful Paint | Largest Contentful Paint | CLS |
|---|---|---|---|---|---|
| `/` | 525 ms (417–763) | 538 → **79 ms** | 684 (592–976) → **196 ms** (172–264) | 2240 → **1544 ms** | 0.002 → 0.000 |
| `/register` | 505 ms (333–523) | 520 → **64 ms** | 656 (500–712) → **180 ms** (172–196) | 1260 → **736 ms** | 0.000 → 0.000 |
| `/team` | 380 ms (329–595) | 392 → **69 ms** | 548 (488–756) → **196 ms** (172–384) | 2852 → **2344 ms** | 0.000 → 0.000 |
| `/admin` | 509 ms (379–1432) | 519 → **71 ms** | 676 (544–1612) → **196 ms** (168–1104) | 992 → **512 ms** | 0.000 → 0.000 |
| `/about` | 539 ms (367–684) | 551 → **60 ms** | 700 (528–872) → **176 ms** (168–1124) | 2444 → **2100 ms** | 0.000 → 0.000 |

- **First paint is about 3.5× faster on every route**, because the browser no longer waits for the Google request.
- **Layout shift (CLS) stays at zero.**

### Visual comparison

Side-by-side screenshots at 1 s and 6 s are in [`docs/pr-screenshots/issue-5-fonts/`](pr-screenshots/issue-5-fonts/README.md).

- **At 6 s the pages match:** 0.00–0.21% of pixels differ, except `/register` at 3.79%, where the difference is the animated petals and ink layers, not text.
- **Japanese text renders identically:** 参加登録, 人々, 士, 触媒 and the kanji backgrounds.
- **At 1 s,** "before" is often still on the loading screen, while "after" has already painted.

## Limits of this audit

- **Inherited weights** are assumed to be 400 unless the parent was checked by hand (the containers listed in step 3). A few large decorative watermarks use `font-black` with no family (e.g. `MerchPage.tsx:67`, `CartPage.tsx:108`). They render in the body font at 700, which is already kept.
- **Unused files** were skipped because no route imports them:
  - `src/components/RegistrationModal.tsx`
  - `src/components/SiteFooter.tsx`
  - `src/components/ui/tiger-tear-reveal.tsx` (only used by the unused `tiger-demo.tsx`)
  - `src/components/ui/lycoris-specimen.tsx` (only used by the unused `lycoris-demo.tsx`)

  If any of them is brought back, re-check Montserrat 700, Noto Sans JP 700, Anton and Oswald.
- **Text content changes:** the stack-role checks (Latin vs Japanese text) are based on what the text contains today. If someone adds Japanese characters to a Cinzel heading, it will need Noto Serif JP at that heading's weight. Thanks to `unicode-range` that costs nothing until it happens, as long as the weight is imported on that page.
