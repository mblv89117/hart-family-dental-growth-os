# Production Release Record

**Release tag:** `v1.0.0-hfdds-production`  
**Git commit (tagged):** `51814ae0f061e08c389f28841c60d951e4a80ef3`  
**Date:** 2026-07-21 (PT) / 2026-07-22 (UTC)  
**Status:** Production live

## Domains

| Host | Role | DNS | HTTPS |
| --- | --- | --- | --- |
| https://hfdds.net | Canonical production | A `@` → `76.76.21.21` | Valid (CN=hfdds.net) |
| https://www.hfdds.net | www alias | CNAME `www` → `hfdds.net` | Valid (CN=www.hfdds.net) |
| https://hart-family-dental.vercel.app | Vercel production alias | Vercel | Valid |

**Do not** add an A record for `www` while the CNAME exists (GoDaddy conflict).

## Vercel

| Field | Value |
| --- | --- |
| Team | high-value-capital-group |
| Project | hart-family-dental |
| Framework | nextjs |
| Production deployment (at cutover) | `dpl_6HgqrZwP34FTFqfS9GzfG4xpoJ1K` / `hart-family-dental-26pbdfi3w-…` |
| CLI account | mblv89117 |

## Environment variables (names only — never commit values)

| Name | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Production | Canonical URL `https://hfdds.net` |
| `LEAD_CC_EMAILS` | Production | Optional CC list (e.g. shared Gmail identity) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional | GA4 — not set yet |
| `NEXT_PUBLIC_GTM_ID` | Optional | GTM — not set yet |
| `LEAD_WEBHOOK_URL` | Optional | CRM webhook |
| `RESEND_API_KEY` | Optional | Redundant email delivery |
| `RESEND_FROM_EMAIL` | Optional | Verified from-address |

## Lead routing (public identities)

| Office | Notify inbox |
| --- | --- |
| Yucca Valley | hartdentalyv@hotmail.com |
| Desert Hot Springs | hartdental02@hotmail.com |
| Follow-up owner | Wendy Delgado (both desks) |

## Rollback procedure

1. **App rollback:** Vercel → Project → Deployments → Promote prior Ready deployment to Production.  
2. **DNS rollback:** Restore GoDaddy A `@` to previous park IPs (`3.33.130.190` / `15.197.148.33`) from screenshot; leave www CNAME or restore park CNAME.  
3. **Notify Wendy** that web forms may be offline during rollback.  
4. Record change in `docs/approvals/approvals-log.md`.

## Hours locked (both offices)

Mon–Thu 8:00 AM–4:30 PM · Fri 9:00 AM–2:00 PM · Sat/Sun Closed

## Deferred by owner direction

- Detailed service-verification checklist completion (marketing pages remain live; deep clinical matrix deferred)  
- Financing partner names  
- Paid ad activation  
- GA4/GTM IDs until provided  
