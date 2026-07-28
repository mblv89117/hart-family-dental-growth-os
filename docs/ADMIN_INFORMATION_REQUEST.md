# Admin Information Request

**Audience:** Lindsay Hawkins (Administrator), Harry Hart / Owner, Ryan Blakeslee (tech)  
**Why:** Phases 0–4 built a local vertical slice. Production and staff rollout need decisions and facts we do not invent.

## A. Practice & locations

- [ ] Confirm legal entity name(s) for BAA and privacy notices.
- [ ] Confirm both office addresses, phones, and lead notify inboxes still correct (seed uses Hotmail notify emails from prior launch).
- [ ] Confirm time zone handling expectation (`America/Los_Angeles` seeded).
- [ ] Confirm which staff may access which location in ops (YV-only vs both desks).

## B. Open Dental

- [ ] Shared clinics vs separate databases (see `OPEN_DENTAL_VENDOR_REQUEST.md`).
- [ ] Who holds developer/customer keys today?
- [ ] Preferred first appointment category for supervised booking UAT (seed focuses on `new_patient_exam`).
- [ ] Providers/operatories allowed for web-originated new patients.
- [ ] Any hard rules: min notice, days closed, lunch blocks, emergency-only paths.

## C. Staff roster & roles

Map real people to Growth OS roles (synthetic seed users are **local-only**):

| Role | Needed for |
| --- | --- |
| Owner | Autonomous mode approval, production auth approval |
| Administrator | Safety Center, scheduling config |
| FrontDesk | Inbox, lead 360, supervised booking |
| Marketing | Lead manage (no booking unless also FrontDesk+) |
| ReadOnly | Audits / oversight |
| ClinicalReviewer | Future clinical content / treatment follow-up gates |

- [ ] Names + work emails for each seat.
- [ ] Preferred production auth: Google Workspace SSO, Microsoft, magic link, hardware key, etc. (**local passwords are not the production plan**).

## D. Communications

- [ ] Approve SMS vendor shortlist (Twilio, etc.) — **not wired for real send** yet.
- [ ] Approve transactional email vendor (Resend already used for marketing lead notify path; separate from ops outbound).
- [ ] Quiet hours / SLA for Wendy first response.
- [ ] Exact STOP / privacy language for templates (seed template is draft).
- [ ] Allowlist of phones/emails for any supervised outbound pilot.

## E. Compliance & legal

- [ ] HIPAA / privacy officer contact.
- [ ] BAA status with hosting, email, SMS, Open Dental.
- [ ] Retention period for leads, messages, audit logs.
- [ ] Incident notification expectations (see `INCIDENT_RESPONSE_RUNBOOK.md`).

## F. Hosting decisions

- [ ] Postgres vendor (Neon, RDS, Supabase, etc.).
- [ ] Worker host (Fly, Railway, ECS, VM) — required for durable jobs.
- [ ] Whether ops portal is allowed on public Vercel domain behind auth, or private network only.
- [ ] Backup / restore RPO-RTO targets.

## G. Marketing continuity

- [ ] Confirm public lead API must keep Hotmail / SMTP / Resend / FormSubmit behavior during transition.
- [ ] GA4 / GTM IDs (still unset in prior handoff).
- [ ] Any change to Wendy workbook vs ops inbox cutover date.

## H. Explicit approvals required before enabling

| Flag / capability | Approver |
| --- | --- |
| `OPS_ENABLED=true` in production | Owner + tech |
| `AUTH_PRODUCTION_APPROVED=true` | Owner |
| `OUTBOUND_COMMUNICATIONS_ENABLED=true` | Owner + compliance |
| `OPEN_DENTAL_MODE=remote` | Owner + IT |
| `OPEN_DENTAL_WRITES_ENABLED=true` | Owner + clinical/admin |
| `AUTOMATION_MODE=supervised` or `autonomous` | Owner (autonomous: Owner/Admin only in code) |

Do not enable these based on engineering convenience alone.
