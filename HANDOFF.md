# Hart Family Dental — Project Handoff

**Date:** 2026-07-28  
**Repo:** https://github.com/mblv89117/hart-family-dental-growth-os  
**Branch:** `cursor/open-dental-growth-os-4c45`  
**Live marketing site:** https://hfdds.net · https://www.hfdds.net  

Prefer this file over chat history.

---

## Mission

Measurable patient-acquisition for Yucca Valley + Desert Hot Springs: implants, dentist-supervised aligners, cash-pay, higher-value care — without DIY ortho claims, invented prices, or credential exposure.

---

## Current status (after Phases 0–4 vertical slice)

| Area | Status | Label |
| --- | --- | --- |
| Production website (marketing) | Live on Vercel + hfdds.net | Preserved |
| Growth OS Phases 0–4 | Implemented on this branch | Local / not production-enabled |
| PostgreSQL + Prisma | Implemented (Compose local) | Not SQLite |
| Custom session auth | Implemented | `local_credentials` only; production auth **blocked** |
| Ops portal `/ops` | Implemented; gated | Default `OPS_ENABLED=false` |
| Durable worker | Implemented (`npm run worker`) | Job leasing + outbox |
| Open Dental | Mock gateway + remote scaffold | Mock only / awaiting credentials |
| Lead → DB + outbox + Wendy task | Implemented | Plus legacy email notify adapters |
| Supervised booking | Mock OD path | Mock only |
| Outbound SMS/email automation | Gated off | Draft mode; mock providers |
| Phases 5–8 | **Not implemented** | See `docs/NEXT_PHASE_BACKLOG.md` |

### Production blockers

1. Managed Postgres vendor  
2. Worker hosting  
3. Open Dental credentials + BAA  
4. Production auth method (`AUTH_PRODUCTION_APPROVED`)  
5. Outbound vendors + compliance sign-off  

### Marketing continuity (pre-platform items still true)

| Area | Status |
| --- | --- |
| Lead owner | Wendy Delgado both desks |
| Analytics IDs | Code ready — GA4/GTM IDs may still be unset in production |
| Location domain 301s | Middleware ready — DNS may still be queued |
| Paid ads | Not activated |

---

## How to run locally

```bash
npm run db:up
cd website && cp .env.example .env
# set OPS_ENABLED=true for local ops
cd ..
npm run db:migrate    # or: npm --prefix website run db:migrate:dev
npm run db:seed
npm run dev           # terminal 1
npm run worker        # terminal 2
```

Synthetic users (local only):

- `wendy@local.test` / `LocalDev!Wendy2026` (FrontDesk)  
- `lindsay@local.test` / `LocalDev!Admin2026` (Administrator)  
- `owner@local.test` / `LocalDev!Owner2026` (Owner)  
- `readonly@local.test` / `LocalDev!Read2026`  
- `yv-only@local.test` / `LocalDev!YvOnly2026`  

Tests: `npm test && npm run test:integration` (expect unit **6** / integration **14**).

---

## Key platform docs

| Doc | Purpose |
| --- | --- |
| `docs/ARCHITECTURE.md` | System topology |
| `docs/IMPLEMENTATION_STATUS.md` | Phase status + quality placeholders |
| `docs/OPEN_DENTAL_INTEGRATION.md` | Gateway behavior |
| `docs/OPEN_DENTAL_VENDOR_REQUEST.md` | What to ask OD/IT |
| `docs/ADMIN_INFORMATION_REQUEST.md` | Decisions needed from staff |
| `docs/SECURITY_AND_PRIVACY.md` | Security posture |
| `docs/THREAT_MODEL.md` | Threats / mitigations |
| `docs/DATA_FLOW_AND_PHI_MAP.md` | Data/PHI flows |
| `docs/INCIDENT_RESPONSE_RUNBOOK.md` | Containment steps |
| `docs/PRODUCTION_COMPLIANCE_CHECKLIST.md` | Go-live gate |
| `docs/TEST_PLAN.md` | Automated + manual tests |
| `docs/KNOWN_LIMITATIONS.md` | Honest gaps |
| `docs/NEXT_PHASE_BACKLOG.md` | Phases 5–8 + blockers |

Marketing/ops playbooks remain under `docs/wendy-lead-workflow.md`, `docs/approvals/`, etc.

---

## Owner / admin actions still required

1. Answer `docs/ADMIN_INFORMATION_REQUEST.md` and `docs/OPEN_DENTAL_VENDOR_REQUEST.md`.  
2. Do **not** enable production ops, OD writes, or outbound without checklist sign-off.  
3. Prior marketing: confirm lead email receipt, GA4 IDs, location DNS when ready.  
4. Explicit approval before paid ad spend.

---

## Resume prompt

> Continue Hart Family Dental Growth OS. Read `HANDOFF.md` and `docs/IMPLEMENTATION_STATUS.md`. Phases 0–4 vertical slice is done (Postgres, session auth, ops portal, worker, mock OD, supervised mock booking). Do not claim Phases 5–8. Next work should address production blockers or admin/vendor information requests—not new autonomous automation.
