# Production QA Report

**Date:** 2026-07-21 (PT)  
**Environment:** https://hfdds.net · https://www.hfdds.net  
**Release:** `v1.0.0-hfdds-production` @ `51814ae` (+ subsequent ops commit)

## Summary

| Area | Result |
| --- | --- |
| Desktop HTTP crawl (core pages) | **Pass** — all primary routes 200 |
| Expected 404 | `/does-not-exist` → 404 |
| Validation errors | **Pass** — missing fields / missing SMS consent → 400 JSON errors (no stack traces) |
| Thank-you | **Pass** — 200 |
| tel: links | **Pass** — both office numbers present |
| Maps links | **Pass** — Google Maps search links on location pages |
| JSON-LD Dentist + hours | **Pass** on location pages |
| robots.txt / sitemap.xml | **Pass** — canonical host hfdds.net |
| Open Graph | **Pass** — title/description/url present |
| TTFB (home) | ~0.13s observed |
| Cash-pay page | Added in this release cycle (deploy with next production push) |
| Mobile | Responsive layout (viewport meta + CSS); full device lab not run in this pass |
| Accessibility basics | Landmarks/header/main/footer; form labels present; honeypot aria-hidden |
| Spam protection | Honeypot field + SMS consent required |
| Lead API acceptance | **Pass** — see `test-lead-matrix.md` |
| Hotmail **inbox receipt** | **Pending human confirm** — see owner action below |

## Pages tested (HTTP 200)

`/` · `/yucca-valley` · `/desert-hot-springs` · `/dental-implants` · `/full-mouth-dental-implants` · `/teeth-straightening` · `/smile-assessment` · `/cosmetic-dentistry` · `/restorative-dentistry` · `/emergency-dentistry` · `/financing` · `/new-patients` · `/about` · `/providers` · `/reviews` · `/faq` · `/contact` · `/privacy` · `/terms` · `/disclaimer` · `/accessibility` · `/thank-you` · `/sitemap.xml` · `/robots.txt`

## Forms / submit

| Form | API | Patient confirmation |
| --- | --- | --- |
| Appointment (multiple pages) | POST `/api/leads` | Redirect `/thank-you` |
| Smile assessment | POST `/api/leads` formType=smile-assessment | Redirect `/thank-you` |

## Owner action — Hotmail receipt (required to close email verification)

Please check **today** for subjects starting with `[HFD Lead]` and messages containing **TEST LEAD — DO NOT CONTACT**:

1. `hartdentalyv@hotmail.com` — expect YV test leads  
2. `hartdental02@hotmail.com` — expect DHS test leads  

If a first-time FormSubmit “confirm this email” message appears, click confirm once, then reply in chat: **“Hotmail confirmed”**.

Until that reply, email delivery is **API-notified only**, not inbox-verified.
