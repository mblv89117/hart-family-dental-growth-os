# Acceptance Test Coverage — Phases 0–4 / PR #1 Release Gate

| ID | Requirement | Test file | Test name | Type | Result |
| --- | --- | --- | --- | --- | --- |
| A1 | Public lead contract / legacy path | `tests/unit/platform-disabled-leads.test.ts` | legacy lead path succeeds without PostgreSQL | unit | PASS |
| A2 | Platform on + DB fail → no fallback | `tests/unit/platform-disabled-leads.test.ts` | platform enabled without database fails closed | unit | PASS |
| A3 | Draft automation default | `tests/unit/safety.test.ts` | defaults automation mode to draft… | unit | PASS |
| A4 | OD writes / outbound off default | same | same | unit | PASS |
| A5 | STOP detection | `tests/unit/safety.test.ts` | detects STOP… | unit | PASS |
| A6 | Log scrub Authorization/body | `tests/unit/safety.test.ts` | scrubs authorization… | unit | PASS |
| A7 | OD connection isolation | `tests/unit/safety.test.ts` | separate Open Dental mock connections isolated | unit | PASS |
| A8 | Mock OD health | `tests/unit/safety.test.ts` | mock Open Dental health check succeeds | unit | PASS |
| A9 | Prod local_credentials rejected | `tests/unit/auth-fail-closed.test.ts` | cases 4–7 | unit | PASS |
| A10 | Dev/test local_credentials allowed | `tests/unit/auth-fail-closed.test.ts` | cases 1–2 | unit | PASS |
| A11 | Prod OPS disabled safe | `tests/unit/auth-fail-closed.test.ts` | case 3 | unit | PASS |
| A12 | Lead+outbox+task transactional | `tests/integration/vertical-slice.test.ts` | persists a valid lead… | integration | PASS |
| A13 | Duplicate submission | same | deduplicates rapid duplicate… | integration | PASS |
| A14 | Wendy login session | same | logs in synthetic Wendy… | integration | PASS |
| A15 | Location ACL shape | same | blocks location access for YV-only… | integration | PASS |
| A16 | Emergency stop | same + worker-concurrency | emergency stop… | integration | PASS |
| A17 | Suppression types | same | global and deceased… | integration | PASS |
| A18 | STOP before send | same | processes STOP before… | integration | PASS |
| A19 | No name-only auto-link / multi match | same | never auto-links on name-only… | integration | PASS |
| A20 | Slot filter/expire/book/confirm | same | filters availability… | integration | PASS |
| A21 | Downtime AppointmentRequest | same + booking-races | OD downtime / expire+downtime | integration | PASS |
| A22 | Timeout idempotency | same + booking-races | timeout path / repeated client timeout | integration | PASS |
| A23 | Categories autoBook false | same | appointment categories default… | integration | PASS |
| A24 | Worker dual-claim | `tests/integration/worker-concurrency.test.ts` | two workers cannot claim same job | integration | PASS |
| A25 | Lease reclaim | same | expired leases… | integration | PASS |
| A26 | Dead letter | same | max attempts… | integration | PASS |
| A27 | Concurrent slot race | `tests/integration/booking-races.test.ts` | concurrent bookings… | integration | PASS |
| A28 | Platform disabled default | `tests/unit/auth-fail-closed.test.ts` | platform disabled by default | unit | PASS |

## Summary

- Requirements mapped above: **28**
- Covered with automated evidence: **28**
- Remaining gaps (documented, not merge-blocking with platform off): public HTTP rate limiting; full adversarial SSRF matrix; all 15 booking edge cases as separate named tests (several covered in composite tests)

## Quality gate snapshot (2026-07-28 dependency-security gate)

| Command | Result |
| --- | --- |
| `npm test` | 18 passed |
| `npm run test:integration` | 21 passed (worker concurrency + booking races included) |
| `npm run lint` | pass (0 errors) |
| `npm run typecheck` | pass |
| `npm run build` | pass (Next.js **15.5.22**) |
| Production-like build (no DATABASE_URL, platform off) | pass |
| Production-like HTTP smoke (pages, leads legacy, `/ops` 404) | pass |
| `npm audit` | **0 vulnerabilities** |
| Blank DB migrate + double seed | pass |
| Stack pins | next 15.5.22 · react 19.1.0 · postcss 8.5.24 · sharp 0.35.3 · prisma 6.19.3 |
