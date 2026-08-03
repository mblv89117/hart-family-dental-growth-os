# Homepage Header / Logo Spacing Fix — Phase 10 Report

**Branch:** `fix/homepage-header-logo-spacing`  
**Date:** 2026-08-02  
**Status:** READY FOR REVIEW (not deployed, not merged)  
**Production reference:** https://hfdds.net (unchanged)

---

## Root causes (Phase 1 audit)

1. **Header logo unreadably small / “black rectangle”**
   - `BrandLogo` forced horizontal assets into a **rounded black plate** (`rounded-xl bg-black`) sized by **height 44px**.
   - Header used `hart-family-dental-logo-horizontal-800.png` (dark-oriented / transparent on black plate), displayed ≈ **88×44**.
   - Wordmark became illegible; the plate read as a tiny black thumbnail.
   - On narrow viewports, header swapped to a **mark** tile instead of a readable horizontal lockup.

2. **Canvas padding on approved horizontal asset**
   - `hart-family-dental-logo-horizontal.png` is **1200×600 on a white canvas** with large empty margins around the lockup (~142–163px vertical padding). Even without a black plate, height-based sizing wasted pixels on empty canvas.

3. **Excessive hero vertical gap**
   - Homepage hero used `min-h-[calc(100svh-5.5rem)]` with `justify-end` (mobile) / `justify-center` (desktop), plus large `pt`/`pb`.
   - Combined with a **duplicate hero `BrandLogo`**, the headline sat ~**250–316px** below the header on desktop production.

---

## Changes made

### Logo asset (crop derivative — no new mark invented)

| Item | Detail |
|---|---|
| Source | `public/brand/hart-family-dental-logo-horizontal.png` (approved horizontal lockup, white canvas) |
| Outputs | `hart-family-dental-logo-horizontal-light.png` (1080×319, white→transparent) · `…-light-880.png` (retina width) |
| Method | Tight content bbox + 12px pad; near-white pixels made transparent |
| Script | `website/scripts/crop-horizontal-logo-light.mjs` (reproducible) |

### Code

- **`BrandLogo`**: light transparent horizontal lockup; **no black plate**; width-based sizing (~200px desktop / ~150px mobile); alt “Hart Family Dental”; links home; retina-friendly `sizes`.
- **`SiteHeader`**: larger logo, slightly tighter row padding, phone bar on subtle paper strip so both phones stay clear of logo; mobile menu uses horizontal 150px logo (not tiny mark).
- **Homepage**: removed duplicate hero logo; dropped full-viewport `min-h` centering; hero padding tuned so desktop headline is **~80px** below header; CTA split into **primary row** (Request Appointment, Choose a Location, Tooth pain) + **secondary call row**; **exact headline/support copy preserved**.
- **`SiteChrome` footer**: horizontal light logo at 180px.
- **`globals.css`**: `--header-offset` → `6.75rem` for two-row header.
- **`site.ts`**: registered `horizontalLight` / `horizontalLightSm` paths.
- **`next.config.ts`**: added `150`/`200` to `imageSizes` for crisp logo delivery.

### Explicitly unchanged

Brand colors, phones, hours, nav destinations, lead routing, analytics, SEO architecture, form behavior, production env vars, unrelated page content. No deploy / no merge.

---

## Measured before → after (viewport top)

| Viewport | Before logo | Before gap (h1 below header) | After logo | After gap |
|---|---|---|---|---|
| 1440×900 | ~88×44 black plate | ~316px | **200×59** light lockup | **80px** |
| 1366×768 | ~88×44 | ~250px | **200×59** | **80px** |
| 390×844 | mark / illegible plate | ~269px | **150×44** | **48px** |

Headline + primary CTAs remain in the first viewport on all three sizes. Desktop gap is within the **70–130px** target.

---

## Files touched

```
website/src/components/BrandLogo.tsx
website/src/components/SiteHeader.tsx
website/src/components/SiteChrome.tsx
website/src/app/(marketing)/page.tsx
website/src/app/globals.css
website/src/lib/site.ts
website/next.config.ts
website/public/brand/hart-family-dental-logo-horizontal-light.png
website/public/brand/hart-family-dental-logo-horizontal-light-880.png
website/scripts/crop-horizontal-logo-light.mjs
website/docs/audits/homepage-header-fix/**
```

---

## Validation

| Check | Result |
|---|---|
| Typecheck | PASS |
| Lint | PASS |
| Unit tests | **18/18 PASS** |
| Production build | PASS |
| Homepage smoke (`http://127.0.0.1:3010/`) | **200**; serves `horizontal-light` |
| Mobile menu open/close | PASS; both phones present; menu logo 150px |
| Extra breakpoints 768 / 1024 / 1280 | Logo 200px; phone bar visible ≥768; gaps ~82–86px |

### Lighthouse (mobile, local `:3010`)

| Category | Score |
|---|---|
| Performance | **96** |
| Accessibility | **100** |
| Best Practices | **100** |
| SEO | **100** |

Artifacts: `website/docs/audits/homepage-header-fix/lighthouse-home-mobile.report.html` (+ `.json`)

---

## Screenshot paths

**Before (live hfdds.net):**

- `website/docs/audits/homepage-header-fix/before/home-1440x900.png`
- `website/docs/audits/homepage-header-fix/before/home-1366x768.png`
- `website/docs/audits/homepage-header-fix/before/home-390x844.png`

**After (local build):**

- `website/docs/audits/homepage-header-fix/after/home-1440x900.png`
- `website/docs/audits/homepage-header-fix/after/home-1366x768.png`
- `website/docs/audits/homepage-header-fix/after/home-390x844.png`

---

## Remaining concerns / follow-ups (non-blocking)

1. **`PageHero` mark tile** on inner pages still uses a black rounded plate + mark asset — out of scope for this homepage/header pass; may deserve the same light treatment later.
2. **Tagline at 150px width** is small but readable; if stakeholders want larger type, prefer a slightly wider mobile logo (up to 165px) rather than a new mark.
3. **Original black-backed / padded assets** remain in `public/brand/` for OG/icons and dark contexts; header/footer now prefer the light crop.
4. **Perf 96** (target ≥95) — fine; no further image work needed for merge readiness.
5. Awaiting approval before commit push / PR / deploy.

---

## Ask

Please review the after screenshots vs production before. If approved, next step is commit + PR on `fix/homepage-header-logo-spacing` (still no production deploy until you say so).
