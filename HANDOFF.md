# Hart Family Dental — Project Handoff

**Date:** 2026-07-28  
**Repo:** https://github.com/mblv89117/hart-family-dental-growth-os  
**Branch:** `cursor/open-dental-growth-os-4c45`  
**Live marketing site:** https://hfdds.net  

Prefer this file over chat history.

---

## Current status

| Area | Status |
| --- | --- |
| Production marketing website | Live — must remain compatible with `GROWTH_OS_PLATFORM_ENABLED=false` |
| Phases 0–4 platform | Implemented on feature branch |
| Default production flags | Platform **off**, Ops **off**, OD writes **off**, outbound **off** |
| Production auth | Local credentials **forbidden** when OPS is on in production |
| Phases 5–8 | **Not implemented** |

### Production blockers

1. Managed Postgres vendor  
2. Worker hosting  
3. Open Dental credentials + BAA  
4. Production auth provider (OIDC/OAuth/magic_link/passkey) — not a boolean alone  
5. Outbound vendors + compliance  

---

## How to run

**Public-compatible (no Postgres):**

```bash
# GROWTH_OS_PLATFORM_ENABLED=false OPS_ENABLED=false
npm run build && npm run start
```

**Local platform:**

```bash
npm run db:up
# set GROWTH_OS_PLATFORM_ENABLED=true OPS_ENABLED=true (+ DATABASE_URL, AUTH_SECRET)
npm run db:migrate && npm run db:seed   # passwords printed once or from DEV_SEED_*
npm run dev
npm run worker
```

Synthetic emails: `wendy@local.test`, `lindsay@local.test`, `owner@local.test`, `readonly@local.test`, `yv-only@local.test`. Passwords are **not** stored in git.

---

## Key docs

| Doc | Purpose |
| --- | --- |
| `docs/PR1_RELEASE_GATE_AUDIT.md` | Independent release-gate findings |
| `docs/ACCEPTANCE_TEST_COVERAGE.md` | Requirement → test matrix |
| `docs/DATABASE_MIGRATION_AND_RECOVERY.md` | Migration / recovery |
| `docs/ARCHITECTURE.md` | System topology |
| `docs/IMPLEMENTATION_STATUS.md` | Phase status |

---

## Owner actions

1. Keep production Vercel env: `GROWTH_OS_PLATFORM_ENABLED=false`, `OPS_ENABLED=false`.  
2. Complete admin/vendor/compliance checklists before enabling platform.  
3. Do not enable OD writes or patient outbound without explicit approval.
