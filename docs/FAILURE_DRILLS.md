# Failure drills (staging / local synthetic only)

Run these against staging or local Docker Postgres. Never against Production hfdds.net Growth OS (which remains disabled).

## 1. Database unavailable

1. Stop staging Postgres or set `DATABASE_URL` to an unreachable host.
2. Confirm `/api/health` still returns liveness (no DB).
3. Confirm `/ops` and `/api/ops/*` fail closed (no false appointment confirmations).
4. Confirm an actionable `database_unavailable` / connection error is visible in logs.
5. Restore DB; confirm queued jobs reconcile without duplicate patient messages (outbound remains disabled).

**Result:** _pending hosted DB_

## 2. Worker crash

1. Start staging worker against staging DB.
2. Kill the process mid-lease (`SIGKILL`).
3. Confirm lease expires and a second worker reclaims the job once.
4. Confirm dead-letter path after max attempts.
5. Confirm `worker_failure` alerts for handler errors.

**Result:** Covered by `tests/integration/worker-concurrency.test.ts` for lease/dead-letter; hosted crash drill _pending Railway_.

## 3. Open Dental unavailable

1. With mock or remote_readonly, simulate downtime / circuit open.
2. Confirm scheduling UI surfaces downtime; no write succeeds.
3. Confirm write attempts in remote_readonly emit `open_dental_write_attempt` alerts and fail.

**Result:** Mock downtime covered in integration suite; live OD downtime drill _pending credentials_.
