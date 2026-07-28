# Threat Model

**Method:** Lightweight STRIDE-style review for Phases 0–4.  
**Assets:** Staff credentials/sessions, lead PII, consent records, Open Dental credentials (future), appointment mirrors, audit integrity, marketing site availability.

## Trust boundaries

1. **Internet → Public Next.js** (forms, marketing).  
2. **Internet → Ops** (should be gated; fail-closed when disabled).  
3. **App/Worker → PostgreSQL**.  
4. **App/Worker → Open Dental API** (remote; mock is in-process).  
5. **Worker → Messaging providers** (mock today; real vendors later).

## Threats and current mitigations

| ID | Threat | Phase 0–4 mitigation | Residual risk |
| --- | --- | --- | --- |
| T1 | Ops portal exposed without auth | Middleware 404 unless `OPS_ENABLED`; session required for pages/APIs; production needs `AUTH_PRODUCTION_APPROVED` | Misconfiguration in staging; local credentials weak for real use |
| T2 | Credential stuffing / password guessing | Lockout, login attempt log, generic error messages | No MFA; synthetic passwords documented for local only |
| T3 | Session theft | HttpOnly cookies expected via Set-Cookie on login routes; hashed tokens at rest; TTL; revoke on logout | Cookie flags / Secure / SameSite must be verified on deploy |
| T4 | CSRF on ops mutations | CSRF cookie + header check (`requireCsrf`) | Must be applied on every mutating route consistently |
| T5 | Cross-location data leak | Location ACL on leads/tasks/booking | Bugs in filter composition; Owner/Admin see all by design |
| T6 | Unauthorized OD writes | `OPEN_DENTAL_WRITES_ENABLED=false`; remote methods throw | Operator turns flag on prematurely |
| T7 | Duplicate / ambiguous bookings | Idempotency keys, slot consume lock, requery on timeout | Race under multi-worker without additional OD-side locks |
| T8 | Spam / abusive lead flood | Honeypot, validation, 10-minute duplicate suppression | No full rate limit / CAPTCHA yet |
| T9 | Accidental patient SMS | Outbound off; draft mode; allowlist; suppression + STOP | Human error if flags enabled without allowlist |
| T10 | Log leakage of PHI/secrets | `scrubForLog` / safeInfo / safeError | Incomplete coverage if callers bypass helpers |
| T11 | Supply chain / dependency | Pin lockfile; standard Next/Prisma stack | Ongoing npm risk |
| T12 | Insider misuse | Role separation; audit log | No SIEM; limited alerting |
| T13 | DB backup exposure | N/A locally | Production backups must be access-controlled |
| T14 | Fake “booked” confirmation | Confirmation message only after successful create; downtime → pending request language | Staff training still required |

## Abuse cases explicitly tested (integration)

- Emergency stop blocks outbound gate  
- Suppression (global, deceased, channel) blocks send  
- STOP recorded before later send  
- Name-only patient match → manual review  
- OD downtime → no confirmation-as-booked  
- Idempotent booking / timeout path  

## Out of scope for this model (Phases 5–8)

- Voice bots, call recording, AI with PHI  
- Patient self-serve portal  
- Ads platform credential compromise (covered partially in root `SECURITY.md`)  

## Recommended next hardening

1. Choose production auth with MFA.  
2. CAPTCHA / edge rate limits on `/api/leads`.  
3. Centralized audit shipping + alerting on `auth.login` failures and emergency stop.  
4. Penetration test before PHI + remote OD.  
