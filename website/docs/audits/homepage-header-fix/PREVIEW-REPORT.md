# Homepage Header / Logo Spacing — Preview Report

**Status:** PREVIEW READY WITH NON-BLOCKING ITEMS  
**Date:** 2026-08-02 (PDT)  
**Branch:** `fix/homepage-header-logo-spacing`  
**Production branch:** `main`  
**PR:** https://github.com/mblv89117/hart-family-dental-growth-os/pull/5  

## SHAs

| Role | SHA |
|---|---|
| Fix commit (visually tested on Preview) | `fcdc8fce308a784b783d0ffe4cf588bae52b24e9` |
| Docs commit (preview screenshots + report) | `61fbb5bc8a30b8f9940acd9451912677c7c053b4` (+ SHA note commit `1e2f493c5c6c43fceaeed56dcd5ee9bb0b8be512`) |

## Preview deployment

| Field | Value |
|---|---|
| Deployment ID | `dpl_CVh3RGxwzDYZj385sEjWQQV8S1BU` |
| Preview URL | https://hart-family-dental-kj320m5hj-high-value-capital-group.vercel.app |
| Inspector | https://vercel.com/high-value-capital-group/hart-family-dental/CVh3RGxwzDYZj385sEjWQQV8S1BU |
| Target | **preview** (not production) |
| Timestamp | 2026-08-02 19:32:11 PDT / 2026-08-03T02:32:11Z |
| Source | Local CLI deploy of clean tree at `fcdc8fc` (Vercel CLI meta may omit GitHub SHA) |

**Hard constraints honored:** no production deploy, no PR merge, no env var changes, no promote/alias/DNS changes.

## Local validation (pre-commit)

| Check | Result |
|---|---|
| Typecheck | PASS |
| Lint | PASS |
| Unit tests | 18/18 PASS |
| Production build | PASS |
| Homepage smoke `:3010` | 200; light logo; canonical `https://hfdds.net` |
| Lighthouse mobile | Perf 96 / A11y 100 / BP 100 / SEO 100 |

## Preview validation (automated Puppeteer + visual screenshot review)

| Check | Result |
|---|---|
| Homepage HTTP | **200** |
| Logo asset | **200**; light horizontal lockup; intrinsic 1080×319 sizing attrs |
| Black plate | **Absent** (desktop + mobile screenshots + DOM) |
| Duplicate hero logo | **Absent** (`logosAboveH1: 0`) |
| Desktop gap (1440/1920) | **80px** (target 64–88) |
| Tablet gap (768) | **80px** |
| Mobile gap (390) | **48px** |
| Desktop nav → Services | PASS |
| Mobile menu open/close | PASS; menu logo 150px; both phones present |
| Request Appointment | → `/contact#request` |
| Phones | `tel:+17603144160` (DHS), `tel:+17603897707` (YV) |
| Sticky header | sticky, top 0 after scroll |
| Sticky CTAs | Schedule + Call now present |
| Hero CTAs | Request / Choose location / Tooth pain present |
| Canonical | `https://hfdds.net` |
| Missing assets | None |
| Lead routing files | Unchanged vs `main` (`AppointmentForm`, `lead-delivery`, `/api/leads`, middleware) |
| Console | Preview-only CSP block of `vercel.live` feedback script (non-app) |

### Breakpoints

Reviewed: **390 / 768 / 1440 / 1920** (Preview screenshots) plus local **430 / 1024**.

Screenshots: `website/docs/audits/homepage-header-fix/preview/`

- `home-390x844.png`
- `home-768x1024.png`
- `home-1440x900.png`
- `home-1920x1080.png`
- `preview-validation.json`

## Non-blocking items

1. Minor horizontal overflow at ~768 from decorative hero float (`right-[-10%]`) and appointment form select — pre-existing pattern, not introduced by logo width sizing.
2. Preview console CSP noise from Vercel live feedback toolbar (`vercel.live`) — Preview-only; not present as an app regression.
3. Inner-page `PageHero` mark still uses black plate (out of scope).
4. Cursor browser MCP unavailable for this session; interactions validated via Puppeteer against live Preview (not source-inferred).

## Production release (await approval)

Do **not** run until explicit approval:

1. Merge PR #5 into `main`, or promote this Preview deployment in Vercel after approval.
2. Prefer GitHub merge → production auto-deploy; alternatively after merge:
   ```bash
   vercel deploy --prod --yes --scope high-value-capital-group
   ```
3. Verify https://hfdds.net header/logo/phones/spacing.
4. Do not change production env vars.

## Rollback

1. Revert the merge commit on `main`, or redeploy the prior Production deployment in Vercel.
2. Confirm https://hfdds.net restores previous header behavior.
3. No env rollback required.
