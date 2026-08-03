# Hart Family Dental — Final Production Release Report

**Classification: RELEASE COMPLETE WITH NON-BLOCKING ITEMS**

| Field | Value |
|---|---|
| Release status | Live on production |
| Commit SHA | `58748dc4fea7e72fb084bc1b4d267570a3117d9a` |
| Branch | `release/production-polish` |
| Pull request | https://github.com/mblv89117/hart-family-dental-growth-os/pull/4 |
| Deployment ID | `dpl_6NCuTrqRgoVqhtjFn1Zd9WSoGgQ6` |
| Deployment URL | https://hart-family-dental-b02lf5ryw-high-value-capital-group.vercel.app |
| Production URL | https://hfdds.net (also https://www.hfdds.net) |
| Vercel team | `high-value-capital-group` |
| Vercel project | `hart-family-dental` |
| Deployed at | 2026-08-02 19:03:01 PDT |
| Prior stable deployment | `dpl_EPyyjXLnw1WSzPRHSSMrirMZriYc` |

---

## Blockers resolved before release

1. **Yucca Valley GBP** — added verified URL `https://share.google/VVNz381E66m6FcbUP`
2. **Parking** — neutral copy only: “Contact the office if you need assistance locating the entrance or planning your visit.”
3. **CallRail phones** — public site uses only `(760) 314-4160` / `tel:+17603144160` and `(760) 389-7707` / `tel:+17603897707`
4. **Hours** — DHS Wednesday 8:00 AM–4:00 PM (last 3:30 PM); YV Monday–Tuesday 8:00 AM–4:00 PM (last 3:30 PM)
5. **Lead routing** — server-side only; hotmail addresses not shown as public mailto UI

---

## Checks completed

| Check | Result |
|---|---|
| `npm ci` | PASS |
| Typecheck | PASS |
| Lint | PASS |
| Unit tests | **18/18 PASS** |
| Integration tests | **SKIPPED / BLOCKED** — Docker/Postgres unavailable on release host |
| Production build | PASS |
| Local route smoke | PASS |
| Redirect validation | PASS |
| Metadata / sitemap / robots | PASS |
| `/api/knowledge` + `/llms.txt` | PASS |
| Vercel env audit (names only) | PASS — no vars deleted; lead/email vars present |
| Live production smoke | PASS |
| Synthetic lead routing | PASS (`emailDelivered: true`) |

---

## Lighthouse (pre-release mobile averages)

Performance **97** · Accessibility **100** · Best Practices **100** · SEO **100**

Artifacts: `website/docs/audits/lighthouse/` · QA write-up: `website/docs/audits/production-qa-report.md`

---

## Live routes tested (hfdds.net)

All returned **200**: `/`, `/about`, `/contact`, `/financing`, `/faq`, `/locations/desert-hot-springs`, `/locations/yucca-valley`, `/services`, `/services/general-dentistry`, `/services/dental-implants`, `/services/dental-crowns`, `/thank-you`, `/api/knowledge`, `/llms.txt`, `/sitemap.xml`, `/robots.txt`, brand logo/favicon assets.

SSL valid. Canonical `https://hfdds.net`. `www.hfdds.net` resolves 200.

---

## Redirects tested (301)

| From | To |
|---|---|
| `/yucca-valley` | `/locations/yucca-valley` |
| `/desert-hot-springs` | `/locations/desert-hot-springs` |
| `/dental-implants` | `/services/dental-implants` |
| `/cash-pay-dentistry` | `/financing` |
| `/smile-assessment` | `/contact#request` |
| `/emergency-dentistry` | `/services/tooth-pain-broken-teeth` |

---

## Lead-routing test results

Synthetic leads labeled `Release QA … 20260803T020441Z` (explicitly non-booking):

| Location | Lead ID | notifyInbox | emailDelivered |
|---|---|---|---|
| Desert Hot Springs | `lead_1785722691633_cxq7xm` | `hartdental02@hotmail.com` | **true** |
| Yucca Valley | `lead_1785722693060_u9d1qs` | `hartdentalyv@hotmail.com` | **true** |

DHS response also listed configured CC recipients (existing `LEAD_CC_EMAILS` / dual-notify behavior). Primary office inbox matched expectations.

---

## Environment audit summary (names only; values not printed)

**Team:** high-value-capital-group · **Project:** hart-family-dental · **Domain:** hfdds.net

Production variables present (encrypted):  
`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `LEAD_PRIMARY_EMAIL`, `LEAD_CC_EMAILS`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `GROWTH_OS_PLATFORM_ENABLED`, `OPS_ENABLED`, `AUTH_MODE`, `AUTH_PRODUCTION_APPROVED`, `OPEN_DENTAL_MODE`, `OPEN_DENTAL_WRITES_ENABLED`, `OUTBOUND_COMMUNICATIONS_ENABLED`, `AI_ENABLED`, `AI_PHI_ALLOWED`, `VOICE_AUTOMATION_ENABLED`, `CALL_RECORDING_ENABLED`, `TREATMENT_PLAN_FOLLOWUP_ENABLED`, `PATIENT_REACTIVATION_ENABLED`, `REVIEW_REQUESTS_ENABLED`.

No production env vars were added, deleted, or overwritten during this release. No new analytics IDs installed.

---

## Rollback details

| Item | Value |
|---|---|
| Prior deployment ID | `dpl_EPyyjXLnw1WSzPRHSSMrirMZriYc` |
| Prior aliases | hfdds.net / www.hfdds.net (before this release) |
| Rollback command | `vercel rollback dpl_EPyyjXLnw1WSzPRHSSMrirMZriYc --scope high-value-capital-group` |
| DB migrations | **Not required** for this marketing release |
| Env restoration | None expected — vars were not modified |

---

## Known limitations / recommended post-launch work

1. SVG / vector master logo for retina crispness on light backgrounds  
2. Enable **CDN-level HSTS** (intentionally omitted from app headers)  
3. Distributed edge rate limiting (in-memory limiter is process-local)  
4. Install approved analytics IDs when marketing approves  
5. Provider geographic schema enrichment  
6. Re-run Growth OS **integration tests** when Docker/Postgres is available  
7. Replace neutral parking language once office confirms lot/entrance details  

---

## Post-launch checklist (ops)

- [x] Homepage 200  
- [x] Both location pages 200  
- [x] Services + sample service pages 200  
- [x] Legacy 301s  
- [x] Logos load  
- [x] Correct CallRail numbers  
- [x] Correct hours + emergency language  
- [x] Maps present  
- [x] Forms accept + route leads  
- [x] Thank-you route live  
- [x] Sitemap / robots / knowledge / llms  
- [x] SSL + canonical hfdds.net  
- [ ] Manual browser pass of mobile hamburger + sticky CTA (code shipped; visual confirm recommended)  
