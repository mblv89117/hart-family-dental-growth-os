# Hart Family Dental — Production QA Report

**Branch:** `release/production-polish`  
**Date:** 2026-08-02  
**Status:** Ready for review — **DO NOT deploy / DO NOT merge** until approved.

---

## Executive summary

Production-hardening pass completed across visual QA, performance, accessibility, technical/local SEO, CRO, forms, security headers, analytics architecture, and AI readiness. Core Lighthouse targets are met on audited marketing pages.

| Category | Target | Result (avg of 10 key pages) |
|---|---|---|
| Performance | 95+ | **97** |
| Accessibility | 100 | **100** |
| Best Practices | 100 | **100** |
| SEO | 100 | **100** |

---

## Pages audited

### Marketing
Home, About, Contact, Financing, FAQ, Privacy, Accessibility, Thank You, New Patients, Services index, Service categories + detail pages (sample: dental implants, crowns), Location pages (Desert Hot Springs, Yucca Valley).

### Systems
`/robots.txt`, `/sitemap.xml`, `/api/knowledge`, `/llms.txt`, legacy 301 redirects, 404/error boundaries, lead form rate limiting.

### Devices reviewed (layout + chrome)
Desktop (1440), laptop-width, iPad-ish, iPhone/Android widths via Lighthouse mobile emulation + sticky mobile CTA bar.

Lighthouse HTML/JSON reports: `website/docs/audits/lighthouse/`  
Screenshots: `website/docs/audits/screenshots/`

---

## Final Lighthouse scores (mobile, simulated throttling)

| Page | Perf | A11y | BP | SEO |
|---|---:|---:|---:|---:|
| Home | 97 | 100 | 100 | 100 |
| About | 97 | 100 | 100 | 100 |
| Contact | 97 | 100 | 100 | 100 |
| Desert Hot Springs | 96 | 100 | 100 | 100 |
| Yucca Valley | 97 | 100 | 100 | 100 |
| Services | 97 | 100 | 100 | 100 |
| Dental Implants | 96 | 100 | 100 | 100 |
| FAQ | 96 | 100 | 100 | 100 |
| Financing | 97 | 100 | 100 | 100 |
| New Patients | 97 | 100 | 100 | 100 |
| **Average** | **97** | **100** | **100** | **100** |

Thank You is intentionally `noindex` (correct for conversion confirmation pages).

---

## Issues fixed

### Visual / UX / CRO
- Sticky header with scroll state + Escape-close mobile menu
- Skip-to-content link
- Mobile sticky **Schedule** + **Call now** bar (hides when form is in view)
- Brand logos framed on intentional black plates (source assets are black-backed)
- Homepage urgent-care CTA; conversion strips on service pages
- Breadcrumbs on location + service pages
- Consistent focus rings; reduced-motion respected

### Performance
- Font `display: swap` + preload
- Retina-friendly `next/image` with AVIF/WebP + sized logo assets (`*-800`, `*-256`)
- Compressed OG JPEG (~167KB vs ~920KB PNG)
- Long-cache headers for `/brand` and `/og`
- Route-group refactor made most marketing pages **static** (smaller TTFB)

### Accessibility (WCAG AA)
- Fixed link color inheritance that overrode white button text
- Footer/label contrast (`sky-deep` / `brand-deep` instead of low-contrast brand red)
- Underlined prose links for link-in-text distinction
- Form focus states + `aria-busy` on submit
- Semantic skip link + main landmark

### Technical SEO
- **Critical fix:** removed `headers()` from root layout so title/description hoist into `<head>` (Lighthouse SEO was falsely failing; Google head parsers need this)
- Unique titles via template (no duplicated brand suffix)
- Canonical + Open Graph + Twitter on key templates
- Organization / WebSite + SearchAction, Dentist+LocalBusiness+MedicalBusiness, Service, FAQPage, BreadcrumbList JSON-LD
- Clean `robots.txt` (disallows `/ops`, `/api`, `/thank-you`)
- Sitemap includes locations + all service paths

### Local SEO
- Map embed + directions + click-to-call + click-to-email
- Area context, parking guidance (call-ahead; no invented lot claims)
- Hours, NAP, emergency policy, same-day, new patients, financing, review CTA, location FAQs

### Service CRO content
- Benefits, procedure overview, FAQs, related services, location availability, CareCredit/new-patient/urgent CTAs, appointment form

### Forms / security
- Existing lead routing preserved
- In-memory IP rate limit on `/api/leads` (8/min)
- Honeypot unchanged
- Security headers: CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy
- Custom `not-found` + `error` boundaries
- HSTS **not** set in-app (set at CDN/edge — app-level HSTS poisoned localhost QA)

### Analytics architecture (IDs not installed)
Env-gated hooks for GTM, GA4, Clarity, Meta Pixel, Google Ads, CallRail swap URL + `window.hfdTrack` / `dataLayer` event surface. See `.env.example`.

### AI readiness
- `/api/knowledge` public JSON graph
- `/llms.txt` agent consumption guide
- Expanded schema.org coverage for services/locations/FAQs

---

## Remaining recommendations (non-blocking)

1. **Transparent / SVG logos** — current raster lockups are black-plate assets; request light-background and SVG versions from brand for premium crispness.
2. **Yucca Valley Google Business Profile URL** — still missing; do not invent (documented TODO).
3. **Parking confirmation** — replace call-ahead guidance with office-confirmed parking copy when available.
4. **HSTS + preload** — enable at Vercel/CDN for production HTTPS only.
5. **Provider pages / geo coordinates** — deepen provider schema + lat/long when verified.
6. **Edge rate limiting** — upgrade in-memory limiter to Redis/WAF before heavy ad spend.
7. **Real photography** — add office/team photography for stronger trust signals (without redesigning the system).
8. **Desktop sticky CTAs** — optional; currently mobile-only by design.
9. **Clear Chrome HSTS for `localhost`** on engineering machines that previously hit this build (`chrome://net-internals/#hsts`).

---

## QA checklist run

- [x] Typecheck
- [x] Lint
- [x] Unit tests (18 passed)
- [x] Production build
- [x] Lighthouse (10 key pages)
- [x] Accessibility (LH a11y 100)
- [x] Schema present (Organization, WebSite, Dentist/LocalBusiness/MedicalBusiness, Service, FAQ, Breadcrumb)
- [x] Robots + sitemap
- [x] Spot-check link + redirect validation (major routes 200; legacy 301s verified)
- [x] Responsive sticky header + mobile menu + sticky CTA

### Link validation (spot check)
Audited marketing routes returned **200**. Legacy paths returned **301** as expected (`/yucca-valley`, `/desert-hot-springs`, `/dental-implants`, `/cash-pay-dentistry`, `/smile-assessment`). `/api/knowledge`, `/robots.txt`, `/sitemap.xml`, `/llms.txt` returned **200**.

---

## Files changed (high level)

- `website/src/app/layout.tsx` — sync root layout; explicit `<head />`
- `website/src/app/(marketing)/**` — marketing route group + chrome layout
- Components: `StickyCtaBar`, `SkipLink`, `Breadcrumbs`, `JsonLd`, header/footer/hero/form/logo/UI updates
- `website/src/lib/schema.ts`, `locations.ts`, `tracking.ts`, `services` meta titles
- `website/next.config.ts` — CSP/security/cache headers (no app HSTS)
- `website/src/server/rate-limit.ts` + leads route integration
- `website/src/app/api/knowledge/route.ts`, `public/llms.txt`
- `website/.env.example` — analytics architecture vars
- Brand OG JPEG; audit artifacts under `website/docs/audits/`

---

## Approval gate

Awaiting explicit approval before merge or production deploy.
