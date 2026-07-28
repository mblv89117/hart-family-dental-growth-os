# Incident Response Runbook

**Applies to:** Growth OS application, ops portal, worker, Postgres, Open Dental integration, outbound messaging.  
**Also see:** Root `SECURITY.md` for marketing-credential exposure incidents.

## Severity levels

| Level | Examples | Response target |
| --- | --- | --- |
| SEV1 | Confirmed PHI breach; OD write storm; auth bypass on ops | Immediate — stop bleed |
| SEV2 | Outbound spam; emergency stop needed; DB down affecting leads | Hours |
| SEV3 | Single user lockout issues; mock/dev only failures | Next business day |

## Contacts

| Role | Name | Phone |
| --- | --- | --- |
| Corporate Secretary / Office Manager | Lindsay Hawkins | (760) 365-6595 |
| Tech | Ryan Blakeslee | (951) 515-6246 |
| Owner / clinical authority | Harry Hart / practice Owner | Via Lindsay |

Legal / privacy officer: **fill when designated** (`ADMIN_INFORMATION_REQUEST.md`).

## Immediate containment actions (engineering)

### A. Kill outbound automation

1. Set `OUTBOUND_COMMUNICATIONS_ENABLED=false` in host env and redeploy/restart worker.  
2. In ops Safety Center (if available): enable **emergency stop**.  
3. Set `AUTOMATION_MODE=off` or `draft`.  
4. Stop worker process if messages continue (`SIGINT`/`SIGTERM` on `npm run worker`).

### B. Disable ops portal

1. Set `OPS_ENABLED=false` → middleware returns 404 for `/ops` and `/api/ops`.  
2. Optionally revoke sessions: mark `Session.revokedAt` for affected users (SQL/Prisma).  
3. Rotate `AUTH_SECRET` only with a coordinated logout of all sessions.

### C. Freeze Open Dental writes

1. Ensure `OPEN_DENTAL_WRITES_ENABLED=false`.  
2. Set `OPEN_DENTAL_MODE=mock` if remote misbehaves (isolates live API).  
3. Coordinate with office IT if appointments were created incorrectly.

### D. Credential exposure

1. Rotate exposed secrets (DB URL, AUTH_SECRET, OD keys, SMTP/Resend, webhook tokens).  
2. Never commit rotated values to git.  
3. Follow `SECURITY.md` for platform passwords (Google, Yelp, Facebook, Hotmail).

## Investigation checklist

- [ ] Capture time window (UTC) and correlation IDs from `AuditLog` / job errors.  
- [ ] Export relevant `LoginAttempt`, `AuditLog`, `Job`, `OutboxEvent`, `AppointmentOperation` rows.  
- [ ] Identify affected leads/contacts (IDs only in tickets when possible).  
- [ ] Check whether confirmations were sent (`Message.status`).  
- [ ] Preserve logs; avoid copying raw PHI into Slack/email.

## Patient / staff communication

- Do **not** speculate clinically.  
- If appointments may be wrong: front desk calls patients using OD as source of truth.  
- Growth OS ambiguous/pending states mean: **do not tell patient they are booked**.

## Recovery

1. Confirm containment flags still correct.  
2. Restore DB from backup if integrity compromised (procedure depends on Postgres vendor — TBD).  
3. Re-enable capabilities gradually: ops → read-only OD → supervised writes → outbound allowlist pilot.  
4. Write post-incident notes in `docs/approvals/` or ops log (without secrets).

## Practice drills (recommended)

- Quarterly: emergency stop + worker shutdown.  
- Before production OD writes: simulate downtime and ambiguous booking using mock tests already in suite.

## What this runbook does not replace

HIPAA breach notification legal process, cyber insurance requirements, or Open Dental’s own incident channels — those must be defined with counsel before PHI go-live.
