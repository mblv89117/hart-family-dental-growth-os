# Production Compliance Checklist

Use before enabling ops, remote Open Dental, or outbound communications in any shared/staging/production environment. **Phases 0–4 do not satisfy this checklist.**

## Legal / contractual

- [ ] BAAs executed with: Postgres host, app host, email vendor, SMS vendor, Open Dental / API intermediary.  
- [ ] Privacy policy / SMS terms reviewed for lead forms.  
- [ ] Retention & deletion policy documented and implemented.  
- [ ] Incident notification contacts designated.

## Security

- [ ] Production auth method chosen and implemented (**not** synthetic local credentials).  
- [ ] `AUTH_PRODUCTION_APPROVED=true` only after Owner sign-off.  
- [ ] MFA for all ops users.  
- [ ] Secrets only in host secret store; `.env` not in git.  
- [ ] `AUTH_SECRET` rotated from example value; ≥32 chars.  
- [ ] TLS everywhere; Secure/HttpOnly/SameSite cookies verified.  
- [ ] Backup encryption + restore test.  
- [ ] Access inventory updated (`docs/audits/access-inventory.md`).

## Safety flags (verify live values)

- [ ] `OPS_ENABLED` intentional.  
- [ ] `AUTOMATION_MODE=draft` (or lower) until supervised UAT.  
- [ ] `OUTBOUND_COMMUNICATIONS_ENABLED=false` until pilot.  
- [ ] `OUTBOUND_ALLOWLIST` populated before any outbound pilot.  
- [ ] `OPEN_DENTAL_MODE` correct (`mock` until vendor acceptance).  
- [ ] `OPEN_DENTAL_WRITES_ENABLED=false` until booking UAT.  
- [ ] AI/voice/recording/reactivation/review flags remain false unless explicitly approved.  
- [ ] Emergency stop tested.

## Data / PHI

- [ ] PHI map reviewed (`DATA_FLOW_AND_PHI_MAP.md`).  
- [ ] Analytics configured to exclude PHI.  
- [ ] Log scrubbing verified in production log drain.  
- [ ] Staff trained on pending vs booked language.

## Open Dental

- [ ] Topology confirmed (shared vs separate).  
- [ ] Sandbox smoke + capability matrix recorded.  
- [ ] Vendor request items closed (`OPEN_DENTAL_VENDOR_REQUEST.md`).  
- [ ] Write UAT on sandbox with idempotency / downtime cases.

## Reliability

- [ ] Managed Postgres provisioned (not laptop Docker).  
- [ ] Durable worker always-on with health monitoring.  
- [ ] Job dead-letter alerting.  
- [ ] Disk/connection pool limits understood for Next + worker.

## Quality gates

- [ ] `npm run lint` pass  
- [ ] `npm run typecheck` pass  
- [ ] `npm run build` pass  
- [ ] `npm test` pass  
- [ ] `npm run test:integration` pass against isolated test DB  
- [ ] Manual ops smoke: login, inbox, lead 360, safety, scheduling  

## Explicit production blockers (current)

1. Postgres vendor  
2. Worker hosting  
3. Open Dental credentials + BAA  
4. Auth production method  
5. Outbound vendors + compliance sign-off  

Do not check this document “complete” while any blocker above remains.
