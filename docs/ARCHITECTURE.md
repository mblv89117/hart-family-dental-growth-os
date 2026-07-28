# Architecture — Hart Family Dental Growth OS

**Scope:** Phases 0–4 vertical slice (as of 2026-07-28)  
**Branch:** `cursor/open-dental-growth-os-4c45`  
**Honest label:** Local / development platform slice. Not production-ready for PHI or live Open Dental writes.

## What this system is

A patient-acquisition **Growth OS** layered onto the existing **Next.js 15** marketing site for Hart Family Dental (Yucca Valley + Desert Hot Springs). The public site remains the primary surface. An isolated **ops portal** (`/ops`), **PostgreSQL + Prisma**, a **durable worker**, and an **Open Dental gateway** (mock by default) form the operational core.

## What was implemented (Phases 0–4)

| Layer | Status | Notes |
| --- | --- | --- |
| Marketing site | **Preserved** | Public routes, forms, lead delivery adapters unchanged in contract |
| PostgreSQL + Prisma | **Implemented** | Not SQLite; Docker Compose for local Postgres 16 |
| Custom session auth | **Implemented (local only)** | `AUTH_MODE=local_credentials`; bcrypt passwords; DB sessions + CSRF |
| Ops gate | **Implemented** | `OPS_ENABLED` middleware; production fail-closed without `AUTH_PRODUCTION_APPROVED` |
| Safety controls | **Implemented** | Automation modes, emergency stop, workflow flags, outbound allowlist, daily caps |
| Consent / suppression | **Implemented** | Consent ledger on ingest; STOP / opt-out; pre-send suppression check |
| Open Dental gateway | **Mock implemented; remote scaffolded** | Interface + mock store; remote HTTP client with write gate / circuit |
| Lead ingest → CRM | **Implemented** | DB lead + contact + conversation + consent + outbox + Wendy task |
| Durable worker | **Implemented** | `npm run worker`; outbox → jobs; lease claim with `FOR UPDATE SKIP LOCKED` |
| Ops portal UI | **Implemented (basic)** | Today, inbox, lead 360, safety, scheduling, login |
| Supervised booking | **Mock only** | Staff-driven slot list + book via mock OD; confirmations draft unless outbound on |
| Phases 5–8 | **Not implemented** | See `NEXT_PHASE_BACKLOG.md` |

## Runtime topology

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js 15 (website/)                                      │
│  ├── Public marketing + POST /api/leads                     │
│  └── /ops/* + /api/ops/*  (gated by OPS_ENABLED)            │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
                ▼                             ▼
        ┌───────────────┐            ┌────────────────┐
        │  PostgreSQL   │◄───────────│  Worker process│
        │  (Prisma)     │  lease     │  npm run worker│
        └───────┬───────┘  jobs      └────────────────┘
                │
                ▼
        ┌───────────────────┐
        │ OpenDentalGateway │
        │  mock | remote    │
        └───────────────────┘
```

- **Web app** and **worker** are separate processes. Do not assume Vercel serverless persistence for jobs.
- Local Postgres: `website/compose.yaml` via `npm run db:up`.
- Defaults in `.env.example`: `AUTOMATION_MODE=draft`, `OPEN_DENTAL_WRITES_ENABLED=false`, `OUTBOUND_COMMUNICATIONS_ENABLED=false`, `OPS_ENABLED=false`.

## Repository layout

| Path | Role |
| --- | --- |
| `website/` | Only runnable application (Next.js + Prisma + worker script) |
| `website/prisma/` | Schema, migrations, seed |
| `website/src/server/` | Auth, safety, leads, OD, jobs, scheduling, compliance |
| `website/src/app/ops/` | Ops portal pages |
| `website/src/app/api/ops/` | Ops API routes |
| `website/scripts/worker.ts` | Durable worker loop |
| `docs/` | Strategy playbooks + platform docs (this set) |
| Root `package.json` | Thin npm proxy into `website/` |

## Auth model (honest)

- **Implemented:** Custom session cookies (`hfd_ops_session`, `hfd_ops_csrf`), password hashing (bcrypt), login attempt logging, lockout after failed attempts, role + location ACL.
- **Not Auth.js Credentials in production.** Local credentials exist for synthetic allowlist testing only.
- **Production:** If `NODE_ENV=production` and `OPS_ENABLED=true` without `AUTH_PRODUCTION_APPROVED=true`, env validation and middleware **fail closed** (ops returns 404 / process throws).
- Production auth method is **undecided / blocked** — see production blockers below.

## Roles (seeded)

`Owner`, `Administrator`, `FrontDesk`, `Marketing`, `ClinicalReviewer`, `ReadOnly`, `SystemService`

Authorization helpers live in `website/src/server/authz/roles.ts` (lead manage, book, safety, scheduling config).

## Data plane highlights

- **Organization** multi-tenant root (seeded as `hart-family-dental`).
- **Locations:** Yucca Valley, Desert Hot Springs.
- **Lead path:** public form → `ingestPublicLead` → Lead + Contact + Conversation + Consent + DomainEvent + OutboxEvent + FrontDeskTask (assigned to synthetic Wendy when seeded).
- **Jobs:** Outbox `lead.created` → enqueue `lead.notify_staff`; worker claims with leasing; mock staff notify provider.
- **Scheduling:** AppointmentCategory + SchedulingRule + OfferedSlot + AppointmentOperation + AppointmentMirror; mock createAppointment.

## Open Dental topology (seeded)

Supports both configuration shapes without choosing production topology yet:

1. **Shared clinics** connection `shared-clinics` with clinic mappings for YV (`ClinicNum=1`) and DHS (`ClinicNum=2`).
2. **Separate DB** connections `yv-separate` and `dhs-separate` (mock-isolated stores).

Default mode: `OPEN_DENTAL_MODE=mock`.

## Safety defaults

| Control | Default |
| --- | --- |
| Automation mode | `draft` (no auto-send) |
| Open Dental writes | `false` (remote writes blocked; mock local writes allowed for supervised booking) |
| Outbound communications | `false` |
| Ops portal | `false` |
| AI / voice / reactivation / review requests | `false` |
| Appointment categories | `autoBook=false`, mostly `active=false`; supervised mock rules exist for `new_patient_exam` |

## Production blockers (not resolved in Phases 0–4)

1. Managed **PostgreSQL** vendor / hosting  
2. **Worker** hosting (always-on process, not Vercel cron alone)  
3. **Open Dental** credentials + API access + BAA  
4. **Auth** production method (beyond local credentials)  
5. **Outbound** vendors (SMS/email) and compliance sign-off  

## Related docs

- `OPEN_DENTAL_INTEGRATION.md` — gateway details  
- `SECURITY_AND_PRIVACY.md` / `THREAT_MODEL.md` / `DATA_FLOW_AND_PHI_MAP.md`  
- `KNOWN_LIMITATIONS.md` / `NEXT_PHASE_BACKLOG.md`  
- `IMPLEMENTATION_STATUS.md` — phase checklist + test placeholders  
