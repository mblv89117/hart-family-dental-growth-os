# Database Migration and Recovery

## Local / staging procedure

1. Backup (production/staging only): `pg_dump` before migrate.
2. `npm run db:up`
3. Set `DATABASE_URL` / `DIRECT_URL`
4. `npm run db:migrate` (`prisma migrate deploy`)
5. `npm run db:seed` **only** in development/test — refused when `NODE_ENV=production` unless `ALLOW_PRODUCTION_SEED=true`

## Blank database verification

Verified 2026-07-28:

- Create empty DB → `prisma migrate deploy` → success
- Seed twice → idempotent upserts → success

## Failed migration

1. Do not delete migration history casually.
2. Inspect `prisma migrate status`
3. Prefer **roll-forward** (new migration) over editing applied SQL
4. Prisma does **not** provide automatic safe rollback of data migrations

## Production rollback limitations

- Application rollback (Vercel) does not reverse schema
- Keep `GROWTH_OS_PLATFORM_ENABLED=false` until migrate is deliberately applied to hosted Postgres
- Audit logs should not cascade-delete with operational data in future schema changes (current schema uses explicit FKs; review before destructive alters)

## Seed restrictions

- Synthetic `@local.test` users only
- Passwords from `DEV_SEED_*_PASSWORD` or randomly generated (printed once locally)
- Never commit passwords
- Never seed real PHI

## Validation queries (examples)

```sql
SELECT COUNT(*) FROM "Organization";
SELECT email, role FROM "User";
SELECT key, mode FROM "OpenDentalConnection";
SELECT status, COUNT(*) FROM "Job" GROUP BY status;
SELECT status, COUNT(*) FROM "OutboxEvent" GROUP BY status;
```
