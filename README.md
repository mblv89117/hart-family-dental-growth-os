# Hart Family Dental — Growth OS

Patient-acquisition operating system for **Hart Family Dental** (Yucca Valley + Desert Hot Springs).

- Public marketing site: **Next.js 15.5.22** (preserved; default path needs **no** PostgreSQL)
- Platform slice (Phases 0–4): **PostgreSQL + Prisma**, ops portal, durable worker, Open Dental **mock** gateway
- First public domain: **hfdds.net**
- Repo: [github.com/mblv89117/hart-family-dental-growth-os](https://github.com/mblv89117/hart-family-dental-growth-os)

**Honest status:** Phases 0–4 are on `main` (PR #1 merged). **Production keeps `GROWTH_OS_PLATFORM_ENABLED=false` and `OPS_ENABLED=false`.** Dependency-security + Vercel safety flags verified 2026-07-28. Phases 5–8 are **not** implemented.

## Safety defaults (`.env.example`)

| Flag | Default | Meaning |
| --- | --- | --- |
| `GROWTH_OS_PLATFORM_ENABLED` | `false` | Public leads use legacy adapters; no Prisma |
| `OPS_ENABLED` | `false` | `/ops` and `/api/ops/*` return 404 |
| `AUTOMATION_MODE` | `draft` | No autonomous sends |
| `OPEN_DENTAL_WRITES_ENABLED` | `false` | No live OD writes |
| `OUTBOUND_COMMUNICATIONS_ENABLED` | `false` | No patient outbound |
| `AUTH_MODE` | `local_credentials` | Dev/test only — **blocked in production when OPS is on** |

## Public site only (matches live Vercel today)

```bash
cd website && cp .env.example .env
# leave GROWTH_OS_PLATFORM_ENABLED=false and OPS_ENABLED=false
cd ..
npm run build && npm run start
```

No PostgreSQL, worker, OD keys, or AUTH_SECRET required for the public marketing path.

## Local platform + ops (optional)

```bash
npm run db:up
cd website && cp .env.example .env
# set GROWTH_OS_PLATFORM_ENABLED=true
# set OPS_ENABLED=true
# optionally set DEV_SEED_*_PASSWORD=... (else seed prints generated passwords once)
cd ..
npm run db:migrate && npm run db:seed
npm run dev          # terminal 1
npm run worker       # terminal 2
```

Synthetic users (emails only — passwords come from `DEV_SEED_*` env vars or are generated at seed time and printed locally):

- `wendy@local.test` (FrontDesk)
- `lindsay@local.test` (Administrator)
- `owner@local.test` (Owner)
- `readonly@local.test` (ReadOnly)
- `yv-only@local.test` (FrontDesk, YV only)

**Never commit seed passwords. Never use local_credentials for production OPS.**

## Dependency security (PR #1 gate)

Pinned after remediation:

- `next@15.5.22`, `eslint-config-next@15.5.22`
- `react` / `react-dom@19.1.0`
- `prisma` / `@prisma/client@6.19.3`
- overrides: `postcss@8.5.24`, `sharp@0.35.3`, `brace-expansion@5.0.8`

Do **not** run `npm audit fix --force`. Do **not** upgrade to Next 16 in this PR.

## Verify

```bash
npm test && npm run test:integration
npm run lint && npm run typecheck && npm run build
```

## Start here

1. [HANDOFF.md](./HANDOFF.md)
2. [docs/PR1_RELEASE_GATE_AUDIT.md](./docs/PR1_RELEASE_GATE_AUDIT.md)
3. [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
4. [SECURITY.md](./SECURITY.md)

## Official hours (both offices)

Mon–Thu 8:00 AM–4:30 PM · Fri 9:00 AM–2:00 PM · Sat/Sun Closed
