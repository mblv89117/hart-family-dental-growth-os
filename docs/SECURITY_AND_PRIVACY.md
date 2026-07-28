# Security and Privacy

**Scope:** Growth OS Phases 0–4 implementation. Complements root `SECURITY.md` (credential incident protocol) and `docs/compliance/operating-rules.md`.

## Principles

1. **Fail closed** for ops, outbound automation, and remote Open Dental writes.  
2. **Least privilege** via roles + location ACL.  
3. **No secrets in git**; synthetic local passwords are for `.local.test` users only.  
4. **Scrub logs** — never log Authorization headers, passwords, or message/clinical bodies (`scrubForLog`).  
5. **Marketing tools ≠ clinical systems** — do not export PHI into analytics or ad platforms.

## Authentication & session

| Control | Implementation |
| --- | --- |
| Mode | `AUTH_MODE=local_credentials` (custom sessions — **not** Auth.js Credentials for production) |
| Password storage | bcrypt (cost 12) |
| Session | Random token; only **SHA-256 hash** stored (`Session.tokenHash`) |
| CSRF | Twin cookie `hfd_ops_csrf` checked on mutating ops APIs |
| Lockout | 5 failures → 15-minute lock; additional IP/email rate awareness |
| LoginAttempt | Success/failure audit trail |
| TTL | `SESSION_TTL_HOURS` (default 8) |

### Production fail-closed

- Middleware: `/ops` and `/api/ops` return **404** unless `OPS_ENABLED` is true.  
- In production, ops also requires `AUTH_PRODUCTION_APPROVED=true` or returns 404.  
- `getEnv()` throws if production + ops enabled without auth production approval.

**Honest label:** Local credentials are for synthetic testing. Production auth method is **blocked / not chosen**.

## Authorization

Roles enforce:

- Safety mode changes / emergency stop: Owner, Administrator  
- Lead management: Owner, Administrator, FrontDesk, Marketing  
- Booking: Owner, Administrator, FrontDesk  
- Location isolation: non-Owner/Admin limited to `UserLocationAccess`

## Feature safety gates

| Gate | Behavior |
| --- | --- |
| `AUTOMATION_MODE` | `draft` / `observe` never auto-send |
| `OUTBOUND_COMMUNICATIONS_ENABLED` | Master outbound switch (default false) |
| Outbound allowlist | Env + DB; empty allowlist blocks when outbound required |
| Workflow flags | Missing `workflow:*` flag = disabled |
| `emergency_stop` | Blocks automation may-run |
| Consent / suppression | Checked immediately before send in worker |
| `OPEN_DENTAL_WRITES_ENABLED` | Blocks remote write methods |

## Data protection

- **Database:** PostgreSQL (local Docker; production vendor TBD).  
- **Transit:** Expect TLS at host edge (Vercel / reverse proxy); local HTTP for dev.  
- **At rest:** Rely on vendor encryption once hosted; not configured in-app.  
- **AuditLog:** Action metadata with `previousSafe` / `nextSafe` JSON — callers must not put raw PHI bodies there.

## PHI handling (summary)

See `DATA_FLOW_AND_PHI_MAP.md`. Leads and contacts in Postgres are **sensitive** and may become PHI when linked to Open Dental patients. Treat Growth OS DB as a regulated system once live OD sync or clinical data is introduced.

## Public surface

- Marketing site remains public.  
- Lead API remains public with validation + honeypot; now also persists to DB when org is seeded.  
- Ops is isolated and noindex (`X-Robots-Tag: noindex, nofollow`).

## What is not yet security-complete

- SSO / MFA / hardware keys  
- WAF / bot protection beyond honeypot  
- Field-level encryption  
- Formal penetration test  
- Production secret rotation runbooks tied to a specific vendor  
- BAA coverage for all subprocessors  

## Related

- `THREAT_MODEL.md`  
- `INCIDENT_RESPONSE_RUNBOOK.md`  
- `PRODUCTION_COMPLIANCE_CHECKLIST.md`  
