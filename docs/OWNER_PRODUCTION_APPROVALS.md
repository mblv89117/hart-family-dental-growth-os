# Owner Production Approvals

Actionable unresolved decisions only. One recommended package.

**Do not purchase, accept paid plans, sign BAAs, or activate billing until Manny explicitly approves.**

---

## Recommended decision package

| # | Recommended option | Purpose | Est. monthly cost | BAA | Real patient data? | Exact owner action | If not approved | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | **Neon** (Launch → scale as needed; separate staging + future prod projects) | Hosted PostgreSQL for Prisma, TLS, backups, PITR | ~$19–69 staging+prod (plan-dependent) | Available on Business/enterprise paths — **required before ePHI** | Staging: synthetic only first | Approve Neon account + BAA path; create project; hand off connection strings via secrets vault only | Staging DB remains local Docker only; no hosted readiness | **Awaiting approval** |
| 2 | **Railway** (persistent Node worker service) | Durable Growth OS worker (not Vercel Functions) | ~$5–20 | Confirm Railway BAA before ePHI worker | Staging synthetic first | Approve Railway project; deploy `npm run worker` against staging DB | Worker stays local-only | **Awaiting approval** |
| 3 | **Auth0** (Okta) with MFA enforced for Owner/Admin | Staff auth for staging/prod OPS | Free–~$25+; Healthcare/BAA add-on as quoted | **Required before ePHI** | Staff identity only until OD pilot | Approve Auth0 tenant; enable MFA; provide OIDC client via secrets | Hosted OPS cannot enable (local_credentials forbidden) | **Awaiting approval** |
| 4 | Open Dental API access | remote_readonly integration | Vendor/IT fees vary | OD BAA / integration agreement | Read-only pilot later | Authorize IT to provision keys into secrets process (**never email/text keys**); confirm Clinics vs separate DBs | OD remains mock | **Awaiting staff/IT** |
| 5 | Patient SMS (recommend **Twilio** with BAA or dental-specific HIPAA SMS) | Future outbound — **not enabled now** | ~$20–50+ usage | **Required** | Not until go-live approval | Approve vendor + BAA only; keep `OUTBOUND_COMMUNICATIONS_ENABLED=false` | Patient SMS stays mock/fail-closed | **Awaiting approval** |
| 6 | Patient email | Distinct from public Resend lead notify | TBD with BAA vendor | **Required** if patient content | Not until go-live | Do **not** reuse public lead Resend without compliance review | Patient email stays unconfigured | **Awaiting approval** |
| 7 | Domain `ops-staging.hfdds.net` | Staging ops hostname | DNS only | N/A | N/A | Approve DNS CNAME to staging Vercel project | Use Vercel staging URL temporarily | **Awaiting approval** |

### Backup option (if Neon blocked)

**Supabase Pro** (Postgres) — similar Prisma support; confirm BAA; expect ~$25+/mo.

### Backup option (if Railway blocked)

**Render** background worker — similar persistent process pricing.

### Backup option (if Auth0 blocked)

**Clerk Enterprise** (HIPAA/BAA path) or **AWS Cognito** with BAA — higher setup cost.

---

## Explicit non-actions until approval

- No Production Growth OS activation  
- No Production safety flag changes  
- No Open Dental writes  
- No patient outbound messaging  
- No autonomous workflows  
