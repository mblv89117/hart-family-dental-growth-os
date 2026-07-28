# Go-Live Approval

**Status:** NOT READY FOR CONTROLLED PRODUCTION GO-LIVE  
**Date:** 2026-07-28  
**Public site:** hfdds.net (Growth OS disabled)

## What is ready

- Public marketing site stable; legacy Resend lead delivery working  
- PR #1 + docs closeout tagged `v0.1.0-public-safe-baseline`  
- Production safety flags verified and **must remain disabled**  
- Staging Vercel project `hart-family-dental-growth-os-staging` created (root `website/`)  
- `remote_readonly` Open Dental mode implemented (writes hard-blocked)  
- Fail-closed hosted auth rules; OIDC/MFA capability registry  
- Practice setup checklist surface; health endpoint; backup/restore scripts  
- Patient messaging adapters fail closed; distinct from public leads  

## What is not ready

- Hosted PostgreSQL (Neon) not provisioned  
- Durable worker host (Railway) not provisioned  
- Auth0 MFA not wired  
- Open Dental credentials / Clinics mapping not obtained  
- Hosted backup/restore drill not executed  
- Staff UAT not signed  
- Read-only real-data pilot not authorized  
- Production Growth OS database/worker not connected  

## Services and costs (proposed — not purchased)

| Service | Est. monthly |
| --- | --- |
| Neon Postgres | ~$19–69 |
| Railway worker | ~$5–20 |
| Auth0 | Free–$25+ (+ BAA quote) |
| Patient SMS (future) | ~$20–50+ usage |
| **Total recurring (staging-capable stack)** | **~$50–120+** before SMS |

## BAAs completed

None yet for Growth OS ePHI path.

## Credentials configured

Production public lead Resend only (unchanged). No OD keys. No staging DB URLs in git.

## Staff approvals received

None yet (Wendy / Lindsay / Manny UAT pending staging).

## Tests

Local gate on `cursor/production-readiness-4c45` (2026-07-28):

| Check | Result |
| --- | --- |
| Unit | 27 passed |
| Integration | 21 passed |
| Lint | passed |
| Typecheck | passed |
| Build | passed |
| npm audit | 0 vulnerabilities |

Hosted MFA/OIDC, backup restore drill, and staff UAT remain incomplete — **NOT READY FOR CONTROLLED PRODUCTION GO-LIVE**.

## Remaining risks

- Hosted auth not implemented → cannot enable staging OPS safely  
- OD topology unknown → mapping risk  
- Using public Resend for patients would be a compliance error — blocked by design  

## Rollback target (public site)

`dpl_5NUP4wLrJHaMVnByQShfsW7Rr4gU` (pre–Growth OS code on live domain history) / current Ready deploy as recorded in PR1 gate docs.

## Recommended first Production feature (after approvals)

**Open Dental remote_readonly** on staging → then one-location read-only pilot → then one supervised appointment category with writes still off until separate approval.

## Exact flags that would change at go-live (future — not now)

Only after a signed `GO_LIVE_APPROVAL` and checklist:

- Possibly `GROWTH_OS_PLATFORM_ENABLED` / `OPS_ENABLED` / `AUTH_MODE=oidc` / `OPEN_DENTAL_MODE=remote_readonly`  
- **Never** flip writes or outbound in the same step as first enablement  

## Monitoring window / rollback triggers (future go-live)

- 24–72h heightened watch on lead delivery, ops 404s when disabled, error rates  
- Rollback if public lead path breaks, ops accidentally exposed, OD write attempts, or secret leakage  

## Owner signature / approval required

- [ ] Approve Neon + Railway + Auth0 package (or written alternate)  
- [ ] Approve BAAs before ePHI  
- [ ] Approve OD credential process  
- [ ] Separate future signature for Production activation  

**PRODUCTION ACTIVATION PERFORMED: NO**
