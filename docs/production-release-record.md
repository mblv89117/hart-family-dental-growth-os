# Production Release Record

**Release tags:** `v1.0.0-hfdds-production` (cutover) · `v1.1.0-ops-system` (ops system)  
**Git commit (latest):** `e75334a3ea3fdf8b85c3105acfa98dda7af2baa4`  
**Date:** 2026-07-21 (PT)  
**Status:** Production live + ops system deployed

## Domains

| Host | Role | DNS | HTTPS |
| --- | --- | --- | --- |
| https://hfdds.net | Canonical production | A `@` → `76.76.21.21` | Valid |
| https://www.hfdds.net | www alias | CNAME `www` → `hfdds.net` | Valid |
| https://hart-family-dental.vercel.app | Vercel alias | Vercel | Valid |

## Vercel

| Field | Value |
| --- | --- |
| Team | high-value-capital-group |
| Project | hart-family-dental |
| Latest production deployment | `dpl_B55pXSc6cLmc3Bo3cCyFG6Jd9aXK` |

## Environment variables (names only)

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL |
| `LEAD_CC_EMAILS` | Optional CC |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 — not set |
| `NEXT_PUBLIC_GTM_ID` | GTM — not set |
| `LEAD_WEBHOOK_URL` | Optional webhook |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Optional email |

## Rollback

1. Vercel → promote prior Ready deployment.  
2. DNS: restore park A records only if domain must leave Vercel.  
3. Notify Wendy.  
4. Log in approvals-log.
