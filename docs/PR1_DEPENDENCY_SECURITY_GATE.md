# PR #1 Dependency Security Gate

**Branch:** `cursor/open-dental-growth-os-4c45`  
**Date:** 2026-07-28  
**Scope:** Advisory-level remediation of High/Critical npm audit findings affecting the public Next.js marketing site and committed Growth OS platform. No Phase 5–8 work.

## Verdict

| Question | Answer |
| --- | --- |
| Runtime High/Critical after remediation? | **None** (`npm audit` → **0 vulnerabilities**) |
| Next.js on patched 15.5 maintenance line? | **Yes — `15.5.22`** (≥ `15.5.21` minimum) |
| Forced major / `npm audit fix --force`? | **No** |
| Regression suite? | **Pass** (unit 18, integration 21, lint, typecheck, build) |
| Platform-disabled prod-like (no `DATABASE_URL`)? | **Pass** |
| Vercel Production safety flags verified by this agent? | **Yes — authenticated Vercel CLI on July 28, 2026** |
| Merge recommendation | **APPROVE FOR MERGE** (platform/ops remain disabled) |

---

## Pre-remediation environment

| Item | Value |
| --- | --- |
| Node.js | `v22.14.0` |
| npm | `10.9.7` |
| package-lock `lockfileVersion` | `3` |
| Declared `next` | `15.5.21` |
| Installed `next` | `15.5.21` |
| Declared / installed `react` | `19.1.0` |
| Declared / installed `react-dom` | `19.1.0` |
| `react-server-dom-*` | Bundled inside Next (`next/dist/compiled/react-server-dom-webpack`, `react-server-dom-turbopack`) — no separate top-level package |
| `postcss` (Next nested) | `8.4.31` |
| `postcss` (Tailwind / Vite) | `8.5.21` |
| `sharp` (Next optional) | `0.34.5` |
| `eslint-config-next` | `15.5.21` |
| `prisma` / `@prisma/client` | `6.19.0` |
| `effect` (via `@prisma/config`) | `3.18.4` |
| `brace-expansion` | `1.1.16` (eslint) + `5.0.7` (typescript-eslint) |

Pre-remediation audit artifacts retained locally under `/tmp/pr1-dep-gate/` (not committed).

Pre-remediation `npm audit` summary: **15 high**, **0 critical** (package graph count; unique root advisories below).

---

## Application exposure inspection

| Feature | Present? | Notes |
| --- | --- | --- |
| App Router | **Yes** | `website/src/app/**` |
| Server Actions (`"use server"`) | **No** | Grep empty |
| Route Handlers | **Yes** | `/api/leads`, `/api/ops/*` — `runtime = "nodejs"` |
| Middleware | **Yes** | `website/src/middleware.ts` — host redirects + ops 404 gate |
| Node middleware runtime | **Yes** (default) | No `runtime = "edge"` on middleware |
| Edge runtime on APIs | **No** | Ops + leads use `nodejs` |
| Rewrites | **No** | Empty `next.config.ts` |
| Redirects (config) | **No** | Host redirects in middleware only (fixed destination hosts) |
| Dynamic external rewrite destinations | **No** | |
| Host-header-dependent behavior | **Yes** | Location funnel domains → `hfdds.net/...` |
| `next/image` | **Yes** | Local `/logo.svg` and heroes; no remote patterns |
| `remotePatterns` / SVG optimizer allow | **No** | Default config |
| Custom Next.js server | **No** | `next start` |
| Partial Prerendering / `cacheComponents` | **No** | |
| Experimental Next features | **No** | Empty config |
| CSP nonces | **No** | |
| `beforeInteractive` scripts | **No** | |
| User-controlled data in scripts | **No** (forms POST JSON to route handlers) | |
| Server-side fetch | **Yes** | Lead delivery adapters; OD remote scaffold (disabled in prod-like) |
| Request-body forwarding to untrusted URLs | **No** for public path | Legacy lead writes jsonl + configured delivery channels |
| Untrusted URL construction | **Limited** | Middleware builds fixed `https://hfdds.net/...` URLs |

**Conclusion:** Hosting on Vercel is not a substitute for patching. Framework patches at ≥15.5.21 plus transitive PostCSS/Sharp overrides are required for the public site.

---

## Advisory-level review (pre → post)

Do **not** collapse these into one generic “Next issue.”

### ADV-001 — PostCSS XSS in CSS stringify

| Field | Value |
| --- | --- |
| Advisory ID | npm audit source `1117015` |
| GHSA / CVE | **GHSA-qx2v-qp2m-jg93** / **CVE-2026-41305** |
| Package | `postcss` |
| Installed (pre) | `8.4.31` (nested under `next`) |
| Affected range | `<8.5.10` |
| Patched version | `8.5.10` (gate uses `8.5.24`) |
| Direct / transitive | Transitive via `next` |
| Runtime / build / dev | **Build + production image optimization / CSS pipeline** (runtime-relevant for Next) |
| App uses affected functionality? | Yes — Next CSS processing |
| Public-site exposure | **Yes** |
| Ops-site exposure | **Yes** (same Next app) |
| Remediation | `overrides.postcss = 8.5.24`; upgrade `next` to `15.5.22` |
| Final status | **Remediated** |
| Evidence | `npm ls postcss` → `8.5.24 overridden`; `npm audit` → 0 |

### ADV-002 — PostCSS arbitrary file read via sourceMappingURL

| Field | Value |
| --- | --- |
| Advisory ID | npm audit source `1124252` |
| GHSA / CVE | **GHSA-6g55-p6wh-862q** / **CVE-2026-45623** |
| Package | `postcss` |
| Installed (pre) | `8.4.31` |
| Affected range | `<=8.5.11` |
| Patched version | `8.5.12` (gate uses `8.5.24`) |
| Direct / transitive | Transitive via `next` |
| Runtime / build / dev | Build/runtime CSS pipeline |
| App uses affected functionality? | Yes |
| Public-site exposure | **Yes** |
| Ops-site exposure | **Yes** |
| Remediation | Same PostCSS override |
| Final status | **Remediated** |
| Evidence | Same as ADV-001 |

### ADV-003 — PostCSS path traversal / `.map` disclosure

| Field | Value |
| --- | --- |
| Advisory ID | npm audit source `1124288` |
| GHSA / CVE | **GHSA-r28c-9q8g-f849** / (no CVE listed on GHSA at gate time) |
| Package | `postcss` |
| Installed (pre) | `8.4.31` |
| Affected range | `<=8.5.17` |
| Patched version | `8.5.18` (gate uses `8.5.24`) |
| Direct / transitive | Transitive via `next` |
| Runtime / build / dev | Build/runtime CSS pipeline |
| App uses affected functionality? | Yes |
| Public-site exposure | **Yes** |
| Ops-site exposure | **Yes** |
| Remediation | Same PostCSS override |
| Final status | **Remediated** |
| Evidence | Same as ADV-001 |

### ADV-004 — Sharp / libvips inherited CVEs

| Field | Value |
| --- | --- |
| Advisory ID | npm audit source `1124066` |
| GHSA / CVE | **GHSA-f88m-g3jw-g9cj** (CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591 referenced) |
| Package | `sharp` |
| Installed (pre) | `0.34.5` |
| Affected range | `<0.35.0` |
| Patched version | `0.35.0` (gate uses `0.35.3`) |
| Direct / transitive | Transitive optional dependency of `next` |
| Runtime / build / dev | **Runtime** for `next/image` optimization on Node |
| App uses affected functionality? | **Yes** — `next/image` on homepage, heroes, brand logo |
| Public-site exposure | **Yes** |
| Ops-site exposure | **Yes** (shared app) |
| Remediation | `overrides.sharp = 0.35.3` |
| Final status | **Remediated** |
| Evidence | `npm ls sharp` → `0.35.3 overridden`; build + image pages 200 |

### ADV-005 — npm audit “next” High rollup (via PostCSS + Sharp)

| Field | Value |
| --- | --- |
| Advisory ID | npm package finding `next` (via ADV-001–004) |
| GHSA / CVE | Not a separate Next CVE; inherits PostCSS + Sharp |
| Package | `next` |
| Installed (pre) | `15.5.21` |
| Affected range (audit) | `9.3.4-canary.0 - 16.3.0-preview.7` (audit graph — misleading `fix` suggested `next@9.3.3`) |
| Patched approach | Stay on 15.5 LTS; override vulnerable nested deps; advance to `15.5.22` |
| Direct / transitive | Direct dependency |
| Runtime / build / dev | Runtime framework |
| App uses affected functionality? | Yes |
| Public-site exposure | **Yes** |
| Ops-site exposure | **Yes** |
| Remediation | `next@15.5.22` + overrides; **did not** run `npm audit fix --force` |
| Final status | **Remediated** (rollup cleared when PostCSS/Sharp cleared) |
| Evidence | `npm audit` 0; installed `next@15.5.22` |

### ADV-006 — Effect AsyncLocalStorage context issue (Prisma CLI chain)

| Field | Value |
| --- | --- |
| Advisory ID | npm audit source `1115356` |
| GHSA / CVE | **GHSA-38f7-945m-qr2g** / **CVE-2026-32887** |
| Package | `effect` (via `@prisma/config` → `prisma`) |
| Installed (pre) | `effect@3.18.4`, `prisma@6.19.0` |
| Affected range | `effect <3.20.0`; prisma/`@prisma/config` through `6.19.2` |
| Patched version | `effect@3.20.0+`; `prisma@6.19.3` |
| Direct / transitive | Transitive via **devDependency** `prisma` |
| Runtime / build / dev | **Development / migrate / generate** — not `@prisma/client` query engine path for public marketing |
| App uses affected functionality? | Prisma CLI config only |
| Public-site exposure | **No** for Effect RPC fiber bug (CLI tooling) |
| Ops-site exposure | Ops uses `@prisma/client` when enabled; Effect advisory is in CLI config package |
| Remediation | Pin `prisma` + `@prisma/client` to `6.19.3` → pulls `effect@3.21.0` |
| Final status | **Remediated** |
| Evidence | `npm ls effect` → `3.21.0`; audit 0 |

### ADV-007 — brace-expansion DoS via unbounded expansion length

| Field | Value |
| --- | --- |
| Advisory ID | npm audit source `1124334` |
| GHSA / CVE | **GHSA-mh99-v99m-4gvg** / **CVE-2026-14257** |
| Package | `brace-expansion` |
| Installed (pre) | `5.0.7` (typescript-eslint) and `1.1.16` (eslint minimatch@3) |
| Affected range (GHSA) | `<=5.0.7` (patched `5.0.8`; advisory measured on `5.0.7`) |
| Patched version | `5.0.8` |
| Direct / transitive | Transitive via **eslint** / `eslint-config-next` (dev) |
| Runtime / build / dev | **Development-only** (lint). Not shipped as app runtime dependency for request handling |
| App uses affected functionality? | Only via ESLint glob matching at lint time |
| Public-site exposure | **No** at HTTP runtime |
| Ops-site exposure | **No** at HTTP runtime |
| Remediation | `overrides.brace-expansion = 5.0.8` (compatible with eslint after verification) |
| Final status | **Remediated** |
| Evidence | `npm ls brace-expansion` → `5.0.8`; `npm run lint` exit 0; audit 0 |

### Related Next.js framework advisories (already on ≥15.5.21 floor)

These were **not** reported as open by `npm audit` on `15.5.21`, but are part of the July 2026 Next security maintenance line. Recorded for completeness:

| GHSA | Severity | Topic | First patched (15.x) | Status on this branch |
| --- | --- | --- | --- | --- |
| GHSA-89xv-2m56-2m9x | High | SSRF in Server Actions on custom servers | 15.5.21 | **Not applicable / patched** — no custom server; no Server Actions; on 15.5.22 |
| GHSA-p9j2-gv94-2wf4 | High | SSRF in rewrites via attacker-controlled destination | 15.5.21 | **Not applicable / patched** — no rewrites; on 15.5.22 |
| GHSA-6gpp-xcg3-4w24 | High | Middleware bypass (Turbopack/proxy) | listed for 16.x line | Monitor — app uses middleware; stay on patched 15.5 maintenance |
| GHSA-q8wf-6r8g-63ch | Medium | Image Optimization DoS via SVG | 15.5.21 | Patched line; no SVG optimizer allow config |
| GHSA-955p-x3mx-jcvp | Medium | Server Function endpoint disclosure | 15.5.21 | No Server Actions |
| GHSA-4c39-4ccg-62r3 | Medium | Unbounded Server Action payload (Edge) | 15.5.21 | No Server Actions / Edge APIs |
| GHSA-68g3-v927-f742 / GHSA-4633-3j49-mh5q | Medium | Cache confusion with request bodies | 15.5.21 | On patched line |

---

## Package changes applied

| Change | Why |
| --- | --- |
| `next` `15.5.21` → `15.5.22` | Latest 15.5 maintenance release (≥ July 2026 security floor) |
| `eslint-config-next` `15.5.21` → `15.5.22` | Peer alignment with Next |
| `@prisma/client` → `6.19.3` | Clear Effect/`@prisma/config` High |
| `prisma` → `6.19.3` | Same |
| `overrides.postcss` = `8.5.24` | Next still declares nested `postcss@8.4.31`; override to patched line |
| `overrides.sharp` = `0.35.3` | Next optional `^0.34.3` still resolved vulnerable; override to patched |
| `overrides.brace-expansion` = `5.0.8` | Clear eslint-chain High without `npm audit fix --force` |

**Not changed:** React `19.1.0`, React DOM `19.1.0` (compatible; no separate High requiring bump).  
**Not done:** Next 16, `npm audit fix --force`, broad unrelated upgrades.

### Compatibility code

**None.** Dependency overrides + pin versions only.

---

## Post-remediation dependency state

| Item | Value |
| --- | --- |
| Node.js | `v22.14.0` |
| npm | `10.9.7` |
| lockfileVersion | `3` |
| `next` | **15.5.22** (declared + installed) |
| `react` / `react-dom` | **19.1.0** |
| `react-server-dom-*` | Bundled in Next 15.5.22 compiled tree |
| `postcss` | **8.5.24** (overridden; deduped) |
| `sharp` | **0.35.3** (overridden) |
| `eslint-config-next` | **15.5.22** |
| `prisma` / `@prisma/client` | **6.19.3** |
| `effect` | **3.21.0** |
| `brace-expansion` | **5.0.8** (overridden) |
| `npm audit` | **0 vulnerabilities** |
| Peer dependency errors | **None** |
| Unexpected downgrade | **None** |

---

## Remaining npm audit findings

**None.**

No remaining High/Critical. No production-runtime advisory left unresolved.

---

## Regression evidence

| Command | Exit | Notes |
| --- | --- | --- |
| `npm ci` | 0 | Clean install; 0 audit vulns |
| `npm run db:up` | 0 | Local Postgres accepting |
| `npm run db:migrate` | 0 | No pending migrations |
| `npm run db:seed` | 0 | Synthetic users (env/generated passwords) |
| `npm run lint` | 0 | |
| `npm run typecheck` | 0 | |
| `npm test` | 0 | **18 passed**, 0 failed, 0 skipped |
| `npm run test:integration` | 0 | **21 passed**, 0 failed, 0 skipped (includes worker concurrency + booking races) |
| `npm run build` | 0 | Next.js 15.5.22 Turbopack |
| Platform-disabled prod-like build (no `DATABASE_URL`) | 0 | Flags per §7 profile |
| Platform-disabled `next start` smoke | Pass | See below |

### Platform-disabled production-like smoke (PORT 3010)

Flags: `NODE_ENV=production`, `GROWTH_OS_PLATFORM_ENABLED=false`, `OPS_ENABLED=false`, `AUTH_MODE=disabled`, `AUTH_PRODUCTION_APPROVED=false`, OD writes/outbound/AI/voice/reactivation/etc. **false**, no `DATABASE_URL`.

| Check | Result |
| --- | --- |
| `/` `/yucca-valley` `/desert-hot-springs` service + form pages | **200** |
| Appointment + smile forms render | **Yes** |
| Valid lead → legacy path `ok:true`, `lead_*` id, attribution fields preserved | **200** |
| Invalid lead rejected | **400** |
| `/ops`, `/ops/login`, `/ops/inbox`, `/ops/safety`, `/api/ops/*` | **404** |
| Sitemap / nav expose `/ops` | **No** |
| Prisma/DB errors in server log | **None** |
| Worker / Open Dental required | **No** |

---

## Vercel Production safety flags (verified)

**Vercel Production safety flags verified through authenticated Vercel CLI on July 28, 2026.**

| Field | Value |
| --- | --- |
| Vercel account / team | `mblv89117` / **High Value Capital Group** (`high-value-capital-group`) |
| Project | **hart-family-dental** |
| Project ID | `prj_aGXp1cSsfuzp7z20A5AtdzUeCJtO` |
| Production domain | **hfdds.net** (also www.hfdds.net) |
| Application directory linked | `website/` |
| Framework | Next.js |
| Known-good Production deployment (pre-merge rollback target) | `dpl_5NUP4wLrJHaMVnByQShfsW7Rr4gU` (`hart-family-dental-aady0ghex-high-value-capital-group.vercel.app`) |

### Production env metadata

- **Before:** 6 Production variables (lead delivery + analytics + site URL only)
- **After:** 20 Production variables (6 preserved + 14 safety flags added)
- **Preview / Development:** no safety-flag definitions added
- **Forbidden variables in Production:** absent (`DATABASE_URL`, `DIRECT_URL`, `DEV_SEED_*`, Open Dental keys)

### Existing public lead-delivery variables preserved (names only)

- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `RESEND_FROM_EMAIL`
- `RESEND_API_KEY`
- `LEAD_CC_EMAILS`
- `LEAD_PRIMARY_EMAIL`
- `NEXT_PUBLIC_SITE_URL`

### Exact value verification (`vercel env run -e production`, local `.env` isolated)

```
GROWTH_OS_PLATFORM_ENABLED: PASS
OPS_ENABLED: PASS
AUTH_MODE: PASS
AUTH_PRODUCTION_APPROVED: PASS
OPEN_DENTAL_MODE: PASS
OPEN_DENTAL_WRITES_ENABLED: PASS
OUTBOUND_COMMUNICATIONS_ENABLED: PASS
AI_ENABLED: PASS
AI_PHI_ALLOWED: PASS
VOICE_AUTOMATION_ENABLED: PASS
CALL_RECORDING_ENABLED: PASS
TREATMENT_PLAN_FOLLOWUP_ENABLED: PASS
PATIENT_REACTIVATION_ENABLED: PASS
REVIEW_REQUESTS_ENABLED: PASS
```

Confirmed configuration (non-secret controls):

- Growth OS platform **disabled**
- Operations portal **disabled**
- Production authentication **disabled**
- Open Dental mode **mock**; writes **disabled**
- Outbound patient communications **disabled**
- AI / AI PHI / voice / call recording **disabled**
- Treatment-plan follow-up / patient reactivation / review-request automation **disabled**
- No Production database configured
- No development seed variables configured
- No Open Dental credentials configured
- No new patient-messaging credentials configured
- Existing public lead-delivery variables preserved
- **Growth OS remains not production-ready**

---

## Merge gate matrix

| Condition | Status |
| --- | --- |
| Next ≥ 15.5.21 on 15.5 line | **PASS** (`15.5.22`) |
| No unresolved exploitable High/Critical runtime | **PASS** |
| Advisories individually classified | **PASS** |
| Unit / integration / concurrency / booking / security / PHI scrub | **PASS** |
| Lint / typecheck / build / platform-off prod-like | **PASS** |
| Public lead compatibility / ops 404 | **PASS** |
| No secrets in git diff | **PASS** |
| Growth OS / OD writes / outbound remain off by default | **PASS** |
| Vercel Production flags verified | **PASS** (authenticated CLI, 2026-07-28) |

**MERGE PR #1: YES** — keep platform/ops disabled; monitor Git-triggered Production deploy; roll back to `dpl_5NUP4wLrJHaMVnByQShfsW7Rr4gU` on material regression.
