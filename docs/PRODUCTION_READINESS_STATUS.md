# Production Readiness Status

**Branch:** `cursor/production-readiness-4c45`  
**Updated:** 2026-07-28  
**Baseline tag:** `v0.1.0-public-safe-baseline`  
**Production domain:** hfdds.net (flags **unchanged** — Growth OS disabled)  
**Verdict:** **NOT PRODUCTION READY**

## Exact next action

1. Manny approves the single decision package in `OWNER_PRODUCTION_APPROVALS.md` (Neon + Railway + Auth0).  
2. After approval: provision staging Postgres + staging worker; wire Auth0 OIDC with MFA.  
3. Collect Open Dental access details via secrets process (never email/text keys).  
4. Run staff UAT on staging only (`STAFF_UAT_CHECKLIST.md`).

---

## Completed

| Item | Evidence |
| --- | --- |
| PR #2 docs merge | `55e89fb` (MERGED) |
| Public-safe baseline tag | `v0.1.0-public-safe-baseline` |
| Production safety flags verified / unchanged | All 14 remain false/disabled/mock |
| Staging Vercel project created | `hart-family-dental-growth-os-staging` (`prj_2DMa32mkEN2FdCbhXXTb7h6k23LG`), root `website/` |
| Staging env safety defaults | APP_ENV=staging + platform/ops/outbound/OD writes off |
| `OPEN_DENTAL_MODE=remote_readonly` | Env + gateway hard-block writes even if writes flag true; write-attempt alerts |
| Ops staging banner | Persistent STAGING banner when `APP_ENV=staging` |
| Practice setup checklist UI | `/ops/setup` |
| Unresolved mapping queue | `/ops/mappings` + `mappingQueue.ts` |
| Public `/api/health` | Liveness without DB/secrets |
| Authenticated `/api/ops/readiness` | Env/health snapshot for Owner/Admin |
| Patient messaging adapters (fail-closed) | Separate from public Resend leads |
| Pre-send outbound gate | Consent + suppression + daily caps + allowlist |
| Auth provider capability registry | OIDC preferred; hosted OPS fails closed until OIDC implemented |
| Worker Docker / Railway template | `Dockerfile.worker`, `railway.toml` |
| Backup/restore scripts | `db-backup.sh`, `db-restore.sh` (prod-URL guard fixed) |
| Failure drill runbook | `docs/FAILURE_DRILLS.md` |
| Staff UAT checklist | `docs/STAFF_UAT_CHECKLIST.md` |
| Go-live package | `docs/GO_LIVE_APPROVAL.md` |

## In progress

| Item | Notes |
| --- | --- |
| Hosted PostgreSQL | Code/migrations ready; **awaiting owner vendor approval** |
| Durable worker host | Template ready; **awaiting owner host approval** |
| MFA staff auth | Fail-closed; **OIDC implementation blocked on Auth0 approval** |
| Staging deploy URL / ops-staging.hfdds.net | Project exists; domain + DB required before useful staging portal |
| Open Dental read-only connection | Mode ready; **awaiting OD credentials + topology answers** |

## Blocked (owner / vendor / staff)

| Item | Blocker type |
| --- | --- |
| Neon (or approved) staging + future prod DBs | Owner approval / payment / BAA before ePHI |
| Railway (or approved) staging worker | Owner approval / payment |
| Auth0 MFA for Manny/Lindsay/Wendy | Owner approval / BAA before ePHI |
| Open Dental developer + customer keys | Staff/IT via secrets process |
| OD Clinics vs separate DBs mapping | Staff information |
| Patient SMS BAA vendor | Owner approval — not Resend public leads |
| Staff UAT sign-off | Requires staging auth + DB |
| Backup/restore drill on hosted DB | Requires hosted Postgres |
| Read-only real-data pilot | Requires BAAs + credentials + synthetic UAT |

## Tests (this branch)

| Suite | Status |
| --- | --- |
| Unit (incl. production-readiness) | **27 passed** |
| Integration | **21 passed** |
| Lint / typecheck / build | **passed** |
| npm audit | **0 vulnerabilities** |

## Safety verdict (current)

| Surface | Verdict |
| --- | --- |
| Public website | Live / stable |
| Staging Growth OS | Project scaffolded — **not fully ready** |
| Production Growth OS | **Disabled** |
| Open Dental read-only | Code ready — **not connected** |
| Open Dental writes | **Blocked** |
| Patient messaging | **Disabled** |
| Autonomous production | **Prohibited** |
