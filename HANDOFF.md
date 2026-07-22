# Hart Family Dental — Project Handoff

**Date:** 2026-07-21  
**Repo:** https://github.com/mblv89117/hart-family-dental-growth-os  
**Local path:** `/Volumes/MacMiniPro2TB/Hart Family Dental Marketing OS`  
**Branch:** `main`  
**Production release tag:** `v1.0.0-hfdds-production`  
**Live:** https://hfdds.net · https://www.hfdds.net  

Prefer this file over chat history.

---

## Mission

Measurable patient-acquisition for Yucca Valley + Desert Hot Springs: implants, dentist-supervised aligners, cash-pay, higher-value care — without DIY ortho claims, invented prices, or credential exposure.

---

## Current status

| Area | Status |
| --- | --- |
| Production website | **Live** on Vercel + hfdds.net HTTPS |
| Hours | Option A both offices |
| Lead owner | Wendy Delgado both desks |
| Lead API | Live; Hotmail notify wired; **inbox receipt pending human confirm** |
| Wendy workbook + scripts | `ops/leads/` + `docs/wendy-lead-workflow.md` |
| Analytics IDs | Code ready — **GA4/GTM IDs not set** |
| Service checklist detail | **Intentionally deferred** by owner |
| Location domain 301s | Middleware ready — **DNS queued** |
| Paid ads | Not activated |

---

## How to run

```bash
cd "/Volumes/MacMiniPro2TB/Hart Family Dental Marketing OS"
npm run dev      # local
npm run build
```

Production: Vercel project `high-value-capital-group/hart-family-dental`.

## Key docs

| Doc | Purpose |
| --- | --- |
| `docs/production-release-record.md` | Commit/tag/DNS/env/rollback |
| `docs/production-qa-report.md` | QA results |
| `docs/test-lead-matrix.md` | TEST leads submitted |
| `docs/analytics/analytics-setup.md` | GA4/GTM owner checklist |
| `docs/wendy-lead-workflow.md` | Wendy daily system |
| `docs/campaigns/campaign-foundation-pack.md` | Campaign pack (not paid yet) |
| `docs/approvals/location-domain-redirects.md` | YV/DHS domain 301s |
| `docs/audits/external-profile-launch-prep.md` | GBP/Yelp/FB prep |
| `docs/reliability/production-ops.md` | Monitoring / incidents |

## Owner actions still required

1. Confirm TEST LEAD emails arrived in YV + DHS Hotmail (or click FormSubmit confirm).  
2. Provide GA4 (and optional GTM) IDs → set on Vercel → redeploy.  
3. Point hartfamilyyv.com / hartfamilydhs.com DNS to Vercel when ready.  
4. Supervised GBP/Yelp login session to apply NAP/hours/URL.  
5. Explicit approval before any paid ad spend.

## Resume prompt

> Continue Hart Family Dental Growth OS at `/Volumes/MacMiniPro2TB/Hart Family Dental Marketing OS`. Read `HANDOFF.md`. Production is live at https://hfdds.net. Wendy owns leads. Confirm Hotmail test-lead receipt and add GA4 IDs next; do not reopen hours; service checklist remains deferred.
