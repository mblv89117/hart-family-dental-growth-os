# Current State Audit — Hart Family Dental Growth OS

**Date:** 2026-07-28  
**Branch:** `cursor/open-dental-growth-os-4c45`  
**Auditor:** Autonomous implementation agent  

## Repository structure

| Path | Role |
| --- | --- |
| `website/` | Next.js 15 App Router marketing site (only runnable application) |
| `docs/` | Strategy, ops playbooks, approvals, audits |
| `ops/leads/` | Manual CSV lead workbook template |
| `data/` | `locations.json`; gitignored `leads/*.jsonl` |
| `brand/`, `content/legal/` | Brand assets and legal source markdown |
| Root `package.json` | Thin npm proxy into `website/` |

Not a monorepo workspace. Package manager: **npm** (`website/package-lock.json`).

## Runtime versions (baseline)

| Component | Version |
| --- | --- |
| Node | v22.14.0 |
| npm | 10.9.7 |
| Next.js | 15.5.21 |
| React / React DOM | 19.1.0 |
| TypeScript | ^5 (strict: true) |
| Tailwind CSS | 4 |
| nodemailer | ^9.0.3 |

## Baseline quality checks (pre-change)

| Check | Command | Result |
| --- | --- | --- |
| Lint | `npm run lint` | **PASS** (exit 0) |
| Production build | `npm run build` | **PASS** (exit 0) — 31 static/dynamic routes |
| Automated tests | n/a | **None existed** |

## Existing public lead behavior

- Forms: `AppointmentForm`, `SmileAssessmentForm` → `POST /api/leads`
- Validation: name, phone, email, location required; SMS consent required; honeypot
- Attribution: UTM, gclid, fbclid, referrer, pagePath
- Delivery order: SMTP → Resend → FormSubmit → optional webhook
- Local append to `data/leads/leads.jsonl` (ephemeral on Vercel)
- Response: `{ ok, id, notifyInbox, recipients, emailDelivered, deliveries }`

## Existing environment variables

```
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_GA_MEASUREMENT_ID
NEXT_PUBLIC_GTM_ID
LEAD_WEBHOOK_URL
LEAD_CC_EMAILS
RESEND_API_KEY
RESEND_FROM_EMAIL
SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_FROM
```

## Existing analytics

- `Analytics.tsx` / GTM / GA4 stubs — **IDs unset in production**
- AttributionCapture + dataLayer events on public marketing routes only

## Deployment

- Vercel project `high-value-capital-group/hart-family-dental`
- Live: https://hfdds.net
- `website/vercel.json` present
- Middleware host redirects for location funnel domains (DNS deferred)

## Security / persistence limitations (pre-platform)

- No database, auth, RBAC, audit log, or admin portal
- Lead API is public (honeypot + validation only)
- No Open Dental / PMS integration
- No durable CRM; Hotmail + spreadsheet is the inbox
- Credentials must never enter the repo (`SECURITY.md`)

## Files that must remain backward-compatible

- All public routes under `website/src/app/` (except additive `/ops` when gated)
- `website/src/components/AppointmentForm.tsx`, `SmileAssessmentForm.tsx`
- `website/src/lib/lead-delivery.ts` adapters
- `website/src/lib/locations.ts`, `tracking.ts`, `site.ts`
- Public `/api/leads` response contract fields
- `website/vercel.json`, SEO (`robots.ts`, `sitemap.ts`), branding CSS/fonts
- Approved hours/services content already published

## Gap vs Growth OS mission

Before this branch: marketing site + documentation playbooks only. No PostgreSQL, worker, consent ledger, Open Dental gateway, scheduling, or staff portal.
