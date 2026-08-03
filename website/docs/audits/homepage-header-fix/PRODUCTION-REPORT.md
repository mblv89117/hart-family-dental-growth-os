# Production release report — Homepage header/logo spacing (PR #5)

**Classification:** RELEASE COMPLETE WITH NON-BLOCKING ITEMS  
**Timestamp:** 2026-08-03T02:42:10Z (merge) / 2026-08-03T02:42:13Z (prod deploy created)  
**Validator:** automated Puppeteer + curl smoke + Lighthouse + screenshot review

## Release identity

| Field | Value |
|---|---|
| PR | https://github.com/mblv89117/hart-family-dental-growth-os/pull/5 |
| Production branch | `main` |
| Fix commit | `fcdc8fce308a784b783d0ffe4cf588bae52b24e9` |
| Release / merge commit | `002f0b01d12caa9158d1e466ec181df23236651d` |
| Production deployment ID | `dpl_9LzdNYicosS6NgYfKaJhGt2rsUfM` |
| Production deployment URL | https://hart-family-dental-1jqz2c1m1-high-value-capital-group.vercel.app |
| Active production URLs | https://hfdds.net , https://www.hfdds.net |
| Active production commit | `002f0b01d12caa9158d1e466ec181df23236651d` |

## Prior stable (rollback target)

| Field | Value |
|---|---|
| Prior deployment ID | `dpl_5yQ1KkkEq42QQwRHDN7mtoeQ7ygx` |
| Prior commit | `08868b69d8e567091ef69e21ee80ecf33ee7ca5d` |
| Prior URL | https://hart-family-dental-4xt442n92-high-value-capital-group.vercel.app |
| Rollback command | `vercel rollback dpl_5yQ1KkkEq42QQwRHDN7mtoeQ7ygx --scope high-value-capital-group` |
| Env restoration needed | No |
| DB migration | No |

## Pre-merge verification

- PR contained approved fix commit `fcdc8fc…`
- Required GitHub/Vercel checks passed; mergeable `CLEAN`
- Preview `https://hart-family-dental-kj320m5hj-high-value-capital-group.vercel.app` = `fcdc8fc…`
- Working tree clean before merge
- Default branch confirmed `main`
- Pre-release smoke: hfdds.net / www → 200

## Production validation summary

### Routes (all 200)

`/`, `/about`, `/contact`, `/financing`, `/faq`, `/locations/desert-hot-springs`, `/locations/yucca-valley`, `/services`, `/thank-you`, `/sitemap.xml`, `/robots.txt`, `/api/knowledge`, `/llms.txt`, plus `www` `/`

### Breakpoints tested

390, 430, 768, 1024, 1440, 1920 — screenshots under `production/`

### Header / logo (automated + visual)

| Check | Result |
|---|---|
| Readable light horizontal logo | PASS |
| Black plate absent in homepage header | PASS (visual; matches Preview) |
| Duplicate hero logo gone | PASS (`logosAboveH1: 0`) |
| Desktop headline gap | **80px** at 768–1920 (target ~80) |
| Mobile gap | 48px at 390/430 |
| Nav aligned | PASS |
| Request Appointment → `/contact#request` | PASS |
| Sticky mobile CTA | PASS |
| Mobile menu open/close | PASS (`aria-expanded` false→true→false) |
| Logo assets 200 | PASS |
| CLS | **0** |
| Canonical | `https://hfdds.net` |
| Shared header on `/about` uses light logo | PASS |

### Phone links

- DHS `tel:+17603144160` — PASS
- YV `tel:+17603897707` — PASS

### Lighthouse (mobile)

| Surface | Perf | A11y | BP | SEO |
|---|---:|---:|---:|---:|
| Local baseline (PR) | 96 | 100 | 100 | 100 |
| Preview remote (`kj320m5hj`) | 96–97 | 100 | 93* | 69* |
| Production remote (`hfdds.net`) | **81–82** | **100** | **100** | **100** |

\*Preview BP/SEO depressed by Preview host quirks (canonical / tooling), not production defects.

Production LCP remains the header logo (~4.2s in lab throttling). Acc/BP/SEO are perfect; CLS is 0. Perf delta vs Preview lab is recorded as **non-blocking** (not a visual/functional critical failure; no env/design changes made for this release).

### Environment / routing audit

- No production env vars modified
- No DNS / alias changes beyond normal Vercel production promotion
- HTTP→HTTPS redirects intact
- Forms/lead routing not changed (no synthetic leads submitted)

## Known non-blocking items

1. Minor ~768px horizontal overflow (pre-existing; unchanged from Preview)
2. Production GA `connect-src` CSP noise for `https://www.google.com/g/collect` (pre-existing analytics CSP; not logo-related)
3. Remote production Lighthouse Performance ~81–82 vs Preview/local ~96 (see above)
4. Inner-page `PageHero` black mark tile still out of scope

## Cleanup

- PR #5 merged into `main`
- Fix branch `fix/homepage-header-logo-spacing` deleted (remote 404 after delete / auto-delete on merge)
