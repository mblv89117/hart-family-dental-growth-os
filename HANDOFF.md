# Hart Family Dental — Project Handoff

**Date:** 2026-07-21  
**Repo:** https://github.com/mblv89117/hart-family-dental-growth-os  
**Local path:** `/Volumes/MacMiniPro2TB/Hart Family Dental Marketing OS`  
**Branch:** `main`

This document is the single handoff for continuing the Growth OS. Prefer this file over chat history.

---

## Mission (one line)

Build a measurable patient-acquisition system for Hart Family Dental (Yucca Valley + Desert Hot Springs) that increases qualified traffic, cash-pay revenue, implant consults, and dentist-supervised straightening — without unauthorized live changes, DIY ortho claims, or credential exposure.

---

## Current status

| Area | Status |
| --- | --- |
| Growth OS docs / scripts / strategy | Built in repo |
| Marketing website (Next.js) | Built; production go-live to **hfdds.net** authorized |
| Password rotation | **Complete** (leadership confirmed) |
| Lead follow-up owner | **Wendy Delgado** (both desks) |
| Hours | **Approved Option A both offices** — Mon–Thu 8:00–4:30; Fri 9:00–2:00; Sat/Sun Closed |
| Services | **Approved** — see `docs/strategy/service-verification-checklist.md` |
| Financing partners | **Deferred** — do not name lenders yet |
| DNS / go-live | **Authorized** for hfdds.net |
| Paid ads | **Blocked** until production tracking + Wendy follow-up verified |
| Lead routing | YV Hotmail / DHS Hotmail (+ optional Resend / webhook) |

**No further owner response required for hours or services.**

---

## Domains

| Domain | Role | Now |
| --- | --- | --- |
| `localhost:3000` | Develop & QA | Use this |
| **hfdds.net** | Preferred **first** public host | Go-live target |
| hartfamilydds.com | Long-term SEO / brand | Align after hfdds.net stable |
| hartfamilyyv.com | YV funnel → `/yucca-valley` | Deferred 301 |
| hartfamilydhs.com | DHS funnel → `/desert-hot-springs` | Deferred 301 |

**Rule:** One live website app. Do not run competing full sites on hfdds.net and hartfamilydds.com. Cutover runbook: `docs/approvals/dns-cutover-runbook.md`.

---

## How to run locally

```bash
cd "/Volumes/MacMiniPro2TB/Hart Family Dental Marketing OS"
npm run dev
```

Open: http://localhost:3000

```bash
npm run build   # production build check
npm run start   # serve production build
```

Website code lives in `website/`. Root `package.json` proxies scripts.

### Env (optional / production)

Copy `website/.env.example` → `website/.env.local` (never commit):

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL (`https://hfdds.net`) |
| `LEAD_WEBHOOK_URL` | Optional CRM webhook |
| `LEAD_CC_EMAILS` | Comma list (default includes `hartdental@gmail.com`) |
| `RESEND_API_KEY` | Optional Resend email delivery |
| `RESEND_FROM_EMAIL` | Verified from-address for Resend |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 |
| `NEXT_PUBLIC_GTM_ID` | GTM |

Lead inboxes (public identities): YV `hartdentalyv@hotmail.com` · DHS `hartdental02@hotmail.com`.

---

## What was built

### Website (`website/`)

- Homepage + location pages: `/yucca-valley`, `/desert-hot-springs`
- Services: implants, full-mouth implants, teeth straightening, cosmetic, restorative, emergency, financing
- `/smile-assessment` — preliminary only (not diagnosis / not DIY approval)
- `/contact`, `/thank-you`, legal pages, sitemap, robots
- Brand logo + burgundy `#7D0E0E`
- Mobile nav · official Option A hours · JSON-LD opening hours
- `POST /api/leads` → `data/leads/leads.jsonl` + Hotmail notify (FormSubmit) + optional Resend/webhook

### Ops & strategy (`docs/`)

| Path | Contents |
| --- | --- |
| `docs/00-executive-brief.md` | Day-0 findings + asks |
| `docs/approvals/approvals-log.md` | Leadership decisions |
| `docs/approvals/dns-cutover-runbook.md` | hfdds.net-first move steps |
| `docs/approvals/weekday-hours-confirmation.md` | Option A approved both offices |
| `docs/approvals/offers-for-approval.md` | Offers not yet approved |
| `docs/operations/lead-routing.md` | Wendy + SLAs + Hotmail routing |
| `docs/operations/front-desk-scripts/` | Phone / web / implant / straighten scripts |
| `docs/strategy/service-verification-checklist.md` | **Approved** service matrix |
| `SECURITY.md` | Credential rules |

### Data

- `data/locations.json` — NAP, **official hours**, domains, servicesApproved
- `brand/logo.svg` — brand mark
- `brand/hours/saturday-sunday-closed.png` — weekend asset
- `secrets/` — **gitignored**; never commit

---

## People

| Role | Name | Contact / notes |
| --- | --- | --- |
| Owner / dentist | Dr. Harry Allen Hart, DDS | Practice owner |
| Corporate Secretary / OM | Lindsay Hawkins | (760) 365-6595 · fax (760) 365-7203 |
| Lead follow-up (both desks) | **Wendy Delgado** | All web leads / callbacks |
| Tech | Ryan Blakeslee | (951) 515-6246 |
| Website (mentioned) | Mason | Coordinate with Ryan |

### Locations (public)

**Yucca Valley** — 56728 Twentynine Palms Highway, Yucca Valley, CA 92284 · (760) 365-6595  
Hours: Mon–Thu 8:00 AM–4:30 PM · Fri 9:00 AM–2:00 PM · Sat/Sun Closed  

**Desert Hot Springs** — 11523 Palm Drive, Desert Hot Springs, CA 92240 · (760) 329-6713  
Hours: Mon–Thu 8:00 AM–4:30 PM · Fri 9:00 AM–2:00 PM · Sat/Sun Closed  

---

## Approvals already made

1. Password rotation complete  
2. Saturday & Sunday closed (both offices)  
3. **Weekday Option A both offices**  
4. **Service marketing scope approved**  
5. Wendy Delgado owns lead follow-up for both desks  
6. Financing partners deferred  
7. hfdds.net purchased; **production go-live authorized**  

---

## What’s next (priority order)

1. Finish production deploy + DNS for **hfdds.net**; verify HTTPS and forms.  
2. Confirm Wendy receives a production test lead in the correct Hotmail inbox.  
3. Add analytics — GA4 / GTM IDs in env when available.  
4. **Later** — align hartfamilydds.com, location-domain 301s, GBP/Yelp audits, financing partners, Phase 2 campaigns/ads.

---

## Hard rules (do not skip)

- Never commit passwords, `.env` secrets, or patient data  
- Never store PHI in marketing tools or this repo  
- Teeth straightening = **dentist-supervised only** — no automated diagnosis/approval  
- Do not invent prices, testimonials, providers, or services  
- Do not treat form submits as revenue  
- No significant ad spend until tracking + front-desk follow-up verified  

---

## Resume prompt (paste into a new chat)

> Continue Hart Family Dental Growth OS at `/Volumes/MacMiniPro2TB/Hart Family Dental Marketing OS`. Read `HANDOFF.md`. Repo: github.com/mblv89117/hart-family-dental-growth-os. Hours Option A and services are approved for both desks. Wendy Delgado owns leads. Finish/verify hfdds.net production deploy + Hotmail lead delivery; no need to re-ask hours/services.
