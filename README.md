# Hart Family Dental — Growth OS

Patient-acquisition operating system for **Hart Family Dental** (Yucca Valley + Desert Hot Springs).

- Public marketing site: **Next.js 15** (preserved)
- Platform slice (Phases 0–4): **PostgreSQL + Prisma**, ops portal, durable worker, Open Dental **mock** gateway
- First public domain: **hfdds.net**
- Repo: [github.com/mblv89117/hart-family-dental-growth-os](https://github.com/mblv89117/hart-family-dental-growth-os)

**Honest status:** Phases 0–4 vertical slice is implemented locally. Phases 5–8 are **not** implemented. Production ops/OD/outbound are **blocked** (Postgres vendor, worker hosting, OD credentials, BAA, auth method, outbound vendors).

## Local setup (PostgreSQL required — not SQLite)

```bash
# 1) Start Postgres 16 (Docker Compose in website/)
npm run db:up

# 2) Env
cd website
cp .env.example .env
# For local ops portal, set:
#   OPS_ENABLED=true
# Keep defaults for safety:
#   AUTOMATION_MODE=draft
#   OPEN_DENTAL_WRITES_ENABLED=false
#   OUTBOUND_COMMUNICATIONS_ENABLED=false
cd ..

# 3) Migrate + seed
npm run db:migrate          # prisma migrate deploy
# OR during schema work: npm --prefix website run db:migrate:dev
npm run db:seed

# 4) App + worker (separate terminals)
npm run dev                 # Next.js marketing + ops
npm run worker              # durable outbox/job lease worker
```

### Verify

```bash
npm test && npm run test:integration
npm run lint
npm run typecheck
npm run build
```

## Synthetic local users (dev only)

| Email | Password | Role |
| --- | --- | --- |
| `wendy@local.test` | `LocalDev!Wendy2026` | FrontDesk |
| `lindsay@local.test` | `LocalDev!Admin2026` | Administrator |
| `owner@local.test` | `LocalDev!Owner2026` | Owner |
| `readonly@local.test` | `LocalDev!Read2026` | ReadOnly |
| `yv-only@local.test` | `LocalDev!YvOnly2026` | FrontDesk (YV only) |

Ops UI: [http://localhost:3000/ops](http://localhost:3000/ops) when `OPS_ENABLED=true`. With `OPS_ENABLED=false`, `/ops` returns 404 (public site unaffected).

## What you get in Phases 0–4

- Lead ingest → Postgres + consent + outbox + Wendy task  
- Ops: Today, Inbox, Lead 360, Safety, Scheduling  
- Mock supervised booking via Open Dental mock gateway  
- Custom session auth (`AUTH_MODE=local_credentials`) — **not** production Auth.js Credentials  

## Start here

1. **[HANDOFF.md](./HANDOFF.md)** — current status after Phases 0–4  
2. **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — system shape  
3. **[docs/IMPLEMENTATION_STATUS.md](./docs/IMPLEMENTATION_STATUS.md)** — phase checklist + test placeholders  
4. **[SECURITY.md](./SECURITY.md)** — never store real passwords in git  
5. **[docs/KNOWN_LIMITATIONS.md](./docs/KNOWN_LIMITATIONS.md)**  

## Official hours (both offices)

Mon–Thu 8:00 AM–4:30 PM · Fri 9:00 AM–2:00 PM · Sat/Sun Closed

## Contacts

| Role | Name | Notes |
| --- | --- | --- |
| Corporate Secretary | Lindsay Hawkins | (760) 365-6595 |
| Lead follow-up (both desks) | Wendy Delgado | Approved |
| Tech | Ryan Blakeslee | (951) 515-6246 |
