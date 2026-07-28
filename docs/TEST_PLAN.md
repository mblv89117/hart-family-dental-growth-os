# Test Plan

**Scope:** Phases 0–4 vertical slice.  
**Harness:** Vitest — unit (`vitest.config.ts`) and integration (`vitest.integration.config.ts`).

## Commands

```bash
npm run db:up
cd website && cp .env.example .env   # ensure DATABASE_URL / DATABASE_URL_TEST
npm run db:migrate:dev   # or: npm run db:migrate  (prisma migrate deploy)
npm run db:seed
npm test                 # unit
npm run test:integration
npm run lint
npm run typecheck
npm run build
```

Worker is not required for the automated suite but is required for manual end-to-end outbox→notify observation:

```bash
npm run worker
```

## Feature labels used in results

- **Implemented and tested**  
- **Mock only**  
- **Partially implemented**  
- **Not implemented**

## Unit suite (`website/tests/unit/safety.test.ts`)

Expected: **6 passed**

| # | Case | Label |
| --- | --- | --- |
| 1 | STOP / opt-out phrase detection | Implemented and tested |
| 2 | Log scrubbing of Authorization / body | Implemented and tested |
| 3 | Defaults: automation `draft`, OD writes off, outbound off | Implemented and tested |
| 4 | Separate mock OD connections isolated | Mock only / tested |
| 5 | Mock OD health check | Mock only / tested |
| 6 | Deterministic draft first-response text | Implemented and tested |

## Integration suite (`website/tests/integration/vertical-slice.test.ts`)

Expected: **14 passed** (requires Postgres + migrated/seeded schema)

| # | Case | Label |
| --- | --- | --- |
| 1 | Lead persist with attribution, consent, outbox, Wendy task | Implemented and tested |
| 2 | Rapid duplicate form suppression | Implemented and tested |
| 3 | Automation mode defaults to draft | Implemented and tested |
| 4 | Synthetic Wendy login (hashed password session) | Implemented and tested |
| 5 | YV-only locationIds isolation concept | Implemented and tested |
| 6 | Emergency stop blocks outbound gate | Implemented and tested |
| 7 | Global/deceased/SMS suppressions | Implemented and tested |
| 8 | STOP before later queued send | Implemented and tested |
| 9 | Name-only match → manual review (no auto-link) | Implemented and tested |
| 10 | Slot filter, expiry, revalidate, mock book, confirm after success | Mock only / tested |
| 11 | OD downtime → AppointmentRequest, no confirmation-as-booked | Mock only / tested |
| 12 | Timeout path idempotent (no duplicate apt) | Mock only / tested |
| 13 | Outbox → staff notify job + atomic claim | Implemented and tested |
| 14 | Appointment categories `autoBook=false` / inactive defaults in seed | Implemented and tested |

## Manual smoke (local)

Prerequisites: `OPS_ENABLED=true` in `website/.env`, DB seeded, `npm run dev`, optional `npm run worker`.

1. Public site loads; submit appointment form with SMS consent.  
2. Confirm lead in DB / ops inbox.  
3. Login as `wendy@local.test` → Today, Inbox, Lead 360.  
4. Safety: view mode; Owner/Admin toggle emergency stop.  
5. Scheduling: list slots; book mock appointment; confirm draft confirmation message.  
6. Login as `yv-only@local.test` — cannot act on DHS-only data.  
7. With `OPS_ENABLED=false`, `/ops` returns 404.

## Quality gate placeholders (record results here)

| Check | Expected | Recorded |
| --- | --- | --- |
| Unit | 6 passed | 6 passed |
| Integration | 14 passed | 14 passed |
| Lint | pass (warnings only OK) | pass (warnings only) |
| Typecheck | pass | pass |
| Build | pass | pass |

## Not in this plan

- Live Open Dental API contract tests  
- Real SMS/email provider delivery  
- Load / chaos beyond mock downtime helpers  
- Phases 5–8 features  
