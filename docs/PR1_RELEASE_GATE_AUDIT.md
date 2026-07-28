# PR #1 Release-Gate Audit

**Branch:** `cursor/open-dental-growth-os-4c45`  
**Reviewed commits (pre-remediation):** `afd0d2e`, `7d3f3dc`, `dbb568c`  
**Auditor:** Independent release-gate review  
**Date:** 2026-07-28  

## Verdict

Functional release-gate remediations (public compatibility, auth fail-closed, seed passwords, tests) remain **accepted**.

**Dependency-security gate (2026-07-28):** see `PR1_DEPENDENCY_SECURITY_GATE.md`.

- Next.js patched to **15.5.22**; PostCSS/Sharp/Prisma Effect/brace-expansion advisories cleared.
- `npm audit` → **0** vulnerabilities after controlled overrides (no `npm audit fix --force`, no Next 16).
- **Vercel Production safety flags verified through authenticated Vercel CLI on July 28, 2026** (project `hart-family-dental`, domain `hfdds.net`). Existing lead-delivery variables preserved; 14 safety flags set Production-only; forbidden DB/seed/OD vars absent.
- **PR #1 merged** (`b70c233`). Production deploy `dpl_FeWyfiKd2vr1h3xTcjGZXvifQMRD` Ready on `hfdds.net`; public smoke + `/ops` 404 + Resend-accepted synthetic lead completed. Rollback not required.

Do **not** treat npm audit Highs as non-blocking merely because `GROWTH_OS_PLATFORM_ENABLED=false` — the public site runs Next.js.

---

## Findings

### RG-001 — Critical — Public lead path required PostgreSQL

- **File:** `website/src/app/api/leads/route.ts` (pre-fix)
- **Description:** Platform ingest/Prisma ran unconditionally; hosted Postgres not provisioned → live form regression risk.
- **Exploit/failure:** Production deploy of PR without Postgres → 503 on every lead.
- **Remediation:** `GROWTH_OS_PLATFORM_ENABLED` (default `false`); legacy path restored; lazy Prisma import only when enabled; no silent fallback when enabled + DB down.
- **Status:** **Remediated**
- **Proof:** `tests/unit/platform-disabled-leads.test.ts`; production-like build without `DATABASE_URL` exit 0.

### RG-002 — Critical — Hardcoded reusable seed passwords in git

- **Files:** `prisma/seed.ts`, `README.md`, `HANDOFF.md`, tests
- **Description:** Fixed `LocalDev!*` passwords committed.
- **Remediation:** Env `DEV_SEED_*_PASSWORD` or random generation; refuse production seed; docs no longer list passwords.
- **Status:** **Remediated**
- **Proof:** `rg LocalDev!` empty; seed prints passwords only locally.

### RG-003 — High — AUTH_PRODUCTION_APPROVED alone could expose ops

- **Files:** `middleware.ts`, `env.ts` (pre-fix)
- **Description:** Production + OPS + `AUTH_PRODUCTION_APPROVED=true` + `local_credentials` was not fully blocked.
- **Remediation:** Production OPS forbids `local_credentials` and `disabled` regardless of approval flag; middleware mirrors this; login rejects production local credentials.
- **Status:** **Remediated**
- **Proof:** `tests/unit/auth-fail-closed.test.ts` (7 cases).

### RG-004 — High — getEnv required DATABASE_URL/AUTH_SECRET always

- **File:** `website/src/server/env.ts`
- **Description:** Ops/public checks could throw without platform secrets.
- **Remediation:** `getRuntimeFlags` / `isPlatformEnabled` / `isOpsEnabled` without DB; `getPlatformEnv` only when platform/ops needs secrets.
- **Status:** **Remediated**

### RG-005 — High — Prisma imported on public lead path

- **Files:** leads route, audit logging
- **Remediation:** Split `logging.ts` (no Prisma); dynamic import of ingest when platform on.
- **Status:** **Remediated**

### RG-006 — Medium — Worker claim tests incomplete / queue pollution

- **Remediation:** Concurrency + lease + dead-letter tests with job cleanup.
- **Status:** **Remediated** — `tests/integration/worker-concurrency.test.ts`

### RG-007 — Medium — Booking race coverage thin

- **Remediation:** Concurrent same-slot, idempotency replay, expire/downtime tests.
- **Status:** **Remediated** — `tests/integration/booking-races.test.ts`

### RG-008 — High — npm audit (Next / PostCSS / Sharp / Prisma Effect / brace-expansion)

- **Risk:** Public marketing site runs Next.js; transitive PostCSS + Sharp Highs are runtime-relevant. Prisma Effect and brace-expansion were also High in the pre-gate tree.
- **Remediation:** `next@15.5.22`, `eslint-config-next@15.5.22`, `prisma`/`@prisma/client@6.19.3`, overrides for `postcss@8.5.24`, `sharp@0.35.3`, `brace-expansion@5.0.8`. Full advisory table in `PR1_DEPENDENCY_SECURITY_GATE.md`.
- **Status:** **Remediated** (`npm audit` 0). Merge still gated on Vercel env verification.

### RG-009 — Low — Lint unused imports / seed label

- **Status:** Cleaned during remediation.

### RG-010 — Informational — Rate limiting on public leads

- **Status:** Documented production blocker / next hardening item (not Critical for merge with platform off).

---

## Platform behavior matrix

| Condition | Behavior |
| --- | --- |
| Platform disabled | Legacy lead path; JSONL + email adapters; no Prisma |
| Platform enabled + DB healthy | Transactional lead/attribution/consent/outbox/task + notify |
| Platform enabled + DB down | **503** — no legacy fallback |
| Email fails, DB ok (platform on) | Lead accepted; `emailDelivered:false` |
| Duplicate within window | Same lead id; skipNotify |
| Worker unavailable | Outbox remains pending until worker runs |

---

## Merge criteria checklist

| Criterion | Met? |
| --- | --- |
| No unresolved Critical | Yes (after fix) |
| No unresolved High | Yes (after fix) |
| Public build without Postgres | Yes |
| Legacy lead without Prisma | Yes |
| Ops 404 when disabled | Yes (middleware + handlers) |
| Production cannot use local_credentials for OPS | Yes |
| No fixed passwords in git | Yes |
| Blank DB migration | Yes |
| Seed refuses production (default) | Yes |
| Worker concurrency tested | Yes |
| OD isolation tested | Yes |
| Booking idempotency tested | Yes |
| Lint/typecheck/unit/integration/build | Yes |
| npm audit clean | **No** — documented Next transitive highs |
| PHI scrub unit test | Yes |

**Merge recommendation:** Yes, with non-blocking npm-audit condition and mandatory production env flags above.
