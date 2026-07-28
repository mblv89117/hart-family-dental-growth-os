# Next Phase Backlog

**Do not claim these as implemented.** Phases 0–4 delivered a vertical slice only.

## Production readiness (cross-cutting blockers)

0. **Before merging PR #1:** owner verifies Vercel Production safety flags (`PR1_DEPENDENCY_SECURITY_GATE.md`). Dependency Highs on Next/PostCSS/Sharp/Prisma Effect/brace-expansion are remediated on-branch (`npm audit` 0 at gate time).  
1. Choose and provision **managed PostgreSQL**.  
2. Host **durable worker** with health checks and dead-letter alerts.  
3. Complete **Open Dental vendor request** + BAA; sandbox remote read smoke.  
4. Replace local credentials with **production auth** (SSO/MFA); set approval flag deliberately.  
5. Select **SMS/email** vendors; compliance review; allowlisted pilot.  
6. Execute `PRODUCTION_COMPLIANCE_CHECKLIST.md`.  
7. Monitor Next.js 15.5 maintenance advisories; do not force Next 16 in a rush.

## Phase 5 — Live OD read path & sync foundations

- Enable `OPEN_DENTAL_MODE=remote` against sandbox.  
- Persist capability matrix from real smoke.  
- Read-only patient/appointment sync jobs using `SyncCursor`.  
- Webhook ingress with token verification.  
- Integration health dashboard depth (circuit state, last errors).  
- Staff tools to resolve `MANUAL_REVIEW` patient links.

## Phase 6 — Supervised real booking & outbound pilot

- Turn on writes only in sandbox → then limited production with `OPEN_DENTAL_WRITES_ENABLED`.  
- Activate appointment categories with Owner approval.  
- Supervised mode outbound with allowlist + template approval workflow.  
- Real staff notify (email/SMS) replacing mock provider.  
- Wendy SLA timers and escalation.

## Phase 7 — Conversations, campaigns, nurture

- Full omnichannel inbox (SMS/email two-way).  
- Campaign / nurture sequences with compliance gates.  
- Review request workflow (`REVIEW_REQUESTS_ENABLED`).  
- Patient reactivation (`PATIENT_REACTIVATION_ENABLED`) with clinical rules.  
- Treatment plan follow-up (`TREATMENT_PLAN_FOLLOWUP_ENABLED`) — clinical approval required.

## Phase 8 — Advanced automation (high bar)

- `AUTOMATION_MODE=autonomous` only with Owner approval and proven supervised metrics.  
- AI features (`AI_ENABLED`) with `AI_PHI_ALLOWED` explicit policy.  
- Voice automation / call recording — legal and clinical review first.  
- Patient self-serve scheduling (if ever) with hard category allowlists.  
- Deeper analytics that never ship PHI to ad platforms.

## Engineering hygiene (any phase)

- CAPTCHA / rate limits on public lead API.  
- Cookie security audit on deployed ops login.  
- Retention sweeper + legal hold tooling.  
- Expand integration tests for remote gateway with recorded fixtures.  
- Ops UI polish without weakening safety copy.

## Explicit non-goals until approved

- DIY orthodontics claims or unsupervised aligner booking.  
- Invented pricing or outcome guarantees.  
- Storing real passwords in git or docs (synthetic local passwords are the only documented exception).  
