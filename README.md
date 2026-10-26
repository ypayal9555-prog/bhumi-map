# Bhumi Map — Land Area Calculator

Interactive land measurement app for Indian revenue plots. Enter the four sides (and
optionally the BD diagonal) of a quadrilateral plot and get its area in local units, split it
between shareholders, and keep a history of saved calculations.

Runs entirely in the browser. No backend, no account, no network calls after the page loads.

**Live app:** <https://ypayal9555-prog.github.io/bhumi-map/>

## Features

- **Live plot drawing** — reconstructs points A/B/C/D from the four sides + diagonal using
  circle–circle intersection, then scales the shape to the canvas (`src/geometryUtils.ts`).
- **Two area methods**
  - *Village Average*: `((AB + CD) / 2) * ((BC + DA) / 2)`
  - *Exact Triangular*: Heron's formula on triangles ABD and BCD, used automatically when a
    diagonal is provided (falls back to Village Average if the math is invalid).
- **Units** — input in Feet, Links (0.66 ft) or Lattha (6.6 ft); output in Biswa, Bigha, Acre,
  Kanal, Marla, Decimal/Cent, Guntha, Hectare (`src/types.ts` → `LAND_UNITS`).
- **Share splitting** — divide the total area between N shareholders.
- **Sarvguniya Measurer** — separate survey tool for map-based (1/4000, 16 or 32 inch = 1 mile)
  and ground-based measurement with guniya / tape / kadi scales.
- **Bilingual UI (English + Hindi)** and dark mode — both persisted in `localStorage`.

## Privacy

Everything is local. Calculated plots, the saved history, the chosen language and the theme
live in `localStorage` on the device. The app makes no `fetch`/XHR calls and bundles no
analytics or AI SDK, so there is nothing to leak and nothing to configure.

The one external request is the Google Fonts stylesheet in `src/index.css`; if you need a fully
offline build, self-host Fraunces/Inter/JetBrains Mono and drop that `@import`.

## Design tokens

The UI uses one palette, defined in `src/index.css` under `@theme`. Components never hard-code
a colour.

| Token | Meaning |
| --- | --- |
| `brand-*` | Deep emerald — primary actions, area figures, highlights |
| `gold-*` | Brass accent — hairlines, plot handles, small emphasis only |
| `warn-*` | Ochre — warnings and "cannot draw" states, kept distinct from brand |
| `stone-*` | Warm paper (light) → charcoal (dark) neutrals |
| `font-serif` | Fraunces — wordmark, hero numbers, certificate titles |

Change the palette here, not in components. `stone-850/450/650/250` are project-specific steps;
they are declared explicitly so no utility silently resolves to nothing.

## Land-unit standards (do not "fix" these)

The factors in `LAND_UNITS` (`src/types.ts`) follow the **local revenue standard used by this
app's users** — e.g. 1 Biswa = 1,220 sq ft and 1 Bigha = 24,400 sq ft. They intentionally do not
match the UP pucca figures quoted on the internet. Treat them as the source of truth.

Every other file imports them from `src/units.ts`; never hard-code a factor elsewhere, or the
converter, the report and the Sarvguniya tool will silently drift apart.

## Safety behaviours

- **Stale diagonal** — the diagonal is a separate input, so editing the sides alone can leave a
  diagonal that describes a totally different plot. When the triangular area and the average
  area disagree by more than 25%, the app shows a warning with the diagonal the sides imply.
  It never edits the number for you.
- **Invalid diagonal** — if the diagonal cannot form two real triangles, the headline area is
  the Village Average value. The method badge and a note say so instead of claiming
  "Exact Triangular".
- **Undrawable input** — if the measurements cannot close a quadrilateral, the canvas shows a
  "cannot draw" state rather than a placeholder shape.

## Getting started

**Prerequisites:** Node.js 20 or newer.

```bash
git clone <your-fork-url> bhumi-map
cd bhumi-map
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run lint     # type-check only (tsc --noEmit)
npm test         # geometry + unit regressions (node:test)
npm run build    # production build -> dist/
npm run preview  # preview the production build
npm run check    # lint + tests + build in one go
```

No environment variables are required. Copying the old `.env.example` around is not needed —
nothing reads it.

## Deploying

`npm run build` emits a static site into `dist/`, so any static host works:

- **GitHub Pages** — live at <https://ypayal9555-prog.github.io/bhumi-map/>. Every push to
  `main` runs `.github/workflows/deploy-pages.yml`, which type-checks, tests, builds and
  publishes. The base path is derived from `GITHUB_REPOSITORY` in `vite.config.ts`, so a fork
  or a rename deploys to its own subpath without edits. Local builds stay at `/`.
- **Netlify / Vercel / Cloudflare Pages** — build command `npm run build`, output directory
  `dist`.

## Repository

Published at <https://github.com/ypayal9555-prog/bhumi-map> (public, default branch `main`).
To work from another machine:

```bash
git clone https://github.com/ypayal9555-prog/bhumi-map.git
cd bhumi-map
npm ci
npm run dev      # http://localhost:3000
```

A fork deploys to its own Pages URL as soon as Actions is allowed to run there.

## Project Layout

```
src/
  App.tsx                 screen layout, tabs, records/theme/language state
  types.ts                shared types + the LAND_UNITS table (source of truth)
  units.ts                pre-computed conversion factors derived from LAND_UNITS
  geometryUtils.ts        plot reconstruction, area formulas, isPlottable()
  locales.ts              English/Hindi translation strings
  components/
    Header.tsx            title bar, language and dark-mode toggles
    PlotCanvas.tsx        SVG plot with draggable vertices and side badges
    FieldBanner.tsx       drawn (not downloaded) plot illustration for empty states
    DimensionsForm.tsx    side/diagonal inputs + diagonal-mismatch warning
    MethodAccordion.tsx   explains both area methods with live numbers
    SplitShares.tsx       shareholder division
    HistoryList.tsx       saved calculations
    ReportModal.tsx       printable plot report
    GuideModal.tsx        in-app usage guide
    Sarvguniya*.tsx       Sarvguniya measurer, visualizer and report
  index.css               the single @theme palette
tests/
  geometry.test.ts        area formulas, unit factors, drawing invariants
public/
  favicon.svg
```

## Notes

- All data (saved records, language, theme) lives in `localStorage`; there is no backend.
- Any inline `@license SPDX-License-Identifier: Apache-2.0` header in a source file describes
  that file; the whole project is Apache-2.0.

## License

[Apache-2.0](LICENSE) © Bhumi Map contributors
