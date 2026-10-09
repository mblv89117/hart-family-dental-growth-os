# Production audit — 2026-10-08

**Live site checked:** `https://www.hfdds.net` and `https://hfdds.net`  
**Repo:** `main` at the time of the audit, plus unmerged `feature/implant-offer-disclosures` (`af4defb`) which is what the implants URL is serving  
**Production deployment id in the homepage HTML:** `dpl_BTQza7SdDCqpzToPxQSUdzSNtbZF`  
**This branch does not merge that price branch and does not change production safety flags.**

## Critical

1. **Unknown office defaulted to Yucca Valley.** `officeInbox()` in `website/src/app/api/leads/route.ts` used `hartdentalyv@hotmail.com` whenever `location` was non-empty but not a known id. A submission of “both”, “either”, or a typo would email Yucca Valley. Fixed on this branch: HTTP 400, no email, no webhook.
2. **Analytics could collect clinical query strings and service text.** Production loads GA4 `G-VPNLPP3BMV` with `send_page_view: true`, so the full URL is collected. The form then redirected to `/thank-you?location=…&service=Tooth%20pain%20/%20broken%20tooth`, and `form_submit_success` sent that service string to `dataLayer` / `gtag` (and would send it to Meta if a pixel is added). Fixed: thank-you URL is office id only; event params are allowlisted; page views drop sensitive query keys; form fields are marked `data-clarity-mask` for the day Clarity is turned on.
3. **FormSubmit posted lead contents to a third party whenever SMTP and Resend were absent.** Prior diagnosis (`docs/operations/lead-email-delivery-diagnosis.md`) already showed FormSubmit was not delivering to Hotmail, while still receiving the name, phone, email, and message. Fixed: FormSubmit runs only if `LEAD_FORMSUBMIT_FALLBACK=true`.

## High

4. **Mobile “Call” on non-Yucca pages dialed Desert Hot Springs.** `StickyCtaBar` used `locations[0]`, which is Desert Hot Springs. The live bar’s primary button was `tel:+17603144160` even on the Yucca Valley page. Fixed: a location URL calls that office; home, contact, and service pages show both CallRail numbers and do not pick a default.
5. **`www` and apex both returned HTTP 200.** Canonicals, sitemap, and robots already say `https://hfdds.net`. `https://www.hfdds.net/locations/yucca-valley` was 200 with the same document. Fixed in middleware with a 301 to the apex. Preview hosts are not redirected.
6. **Lead email still may not reach the office inboxes.** The July diagnosis found no `RESEND_API_KEY` / SMTP in production, and FormSubmit activation never completed. This branch does not invent credentials. Owner action is required before a real test email is sent. Unit tests cover routing with delivery mocked.
7. **Production implants page publishes prices that are not in the verified fact list.** Live title and H1: “$999 Implant + PMMA Flex Crown”, plus a $1,100 permanent crown, a $100 exam + CT, and extraction / bone-graft fees. That copy is commit `af4defb` on `feature/implant-offer-disclosures`. It is not on `origin/main` and it is not in this pull request (the price string appears in documentation only). `docs/approvals/offers-for-approval.md` still says offers need Harry Hart / Lindsay Hawkins’ signature. Rechecked 2026-10-09: `hfdds.net`, `www.hfdds.net`, and `hart-family-dental.vercel.app` serve `dpl_BTQza7SdDCqpzToPxQSUdzSNtbZF`, which is not the last GitHub Production deployment. The deployment to promote to take the prices down is recorded in `docs/operations/vercel-deploy-and-rollback.md`. This branch does not promote it.

## Medium

8. **CallRail swap script is not installed.** HTML contains the tracking numbers `(760) 389-7707` and `(760) 314-4160` and no `callrail` script. Calls to those numbers can still be tracked inside CallRail. Dynamic source numbers will not swap until `NEXT_PUBLIC_CALLRAIL_SWAP_SCRIPT_URL` is set. CSP previously would have blocked `cdn.callrail.com`. This branch allows CallRail script and connect hosts.
9. **No functional site search, but schema advertised one.** `SearchAction` pointed at `/services?q=`, which is not a search results page. Removed.
10. **`priceRange: "$$"`** was on each Dentist entity without a verified price. Removed. (The $999 block is a separate production deploy; see item 7.)
11. **`docs/operations/lead-routing.md` still told staff both offices were open Monday–Thursday 8:00–4:30 and Friday 9:00–2:00.** Location pages and schema already had the correct split week. The doc is updated.
12. **`/reviews` said Google and Yelp links were not published yet**, while location pages and the footer already link the same profiles. The reviews page now uses those existing links and still does not quote reviews.
13. **Security headers on production are largely in place.** Observed: CSP, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and `Strict-Transport-Security: max-age=63072000` (set at Vercel, not in `next.config.ts`). HSTS on the apex response did not include `includeSubDomains`. CSP still allows `'unsafe-inline'` and `'unsafe-eval'` because the GA snippet and Next runtime need them. `/ops` returns 404 while the ops flag is off. An earlier production validation log shows GA4 also posting to `https://www.google.com/g/collect`, which the old `connect-src` blocked. This branch allows that host so measurement can complete. Page views still drop clinical query keys before they are sent.
14. **Draft PR #3** (`cursor/production-readiness-4c45`) is Growth OS staging scaffolding: remote-readonly Open Dental, ops setup pages, outbound gates, worker templates. It does not fix the public contact path. It stays unmerged. None of its platform code was copied here, and production flags were not changed.

## Consistent with the verified facts

- Yucca Valley NAP, Monday/Tuesday 8:00 AM–4:00 PM, last appointment 3:30 PM, phone `(760) 389-7707`, schema email `hartdentalyv@hotmail.com`.
- Desert Hot Springs NAP, Wednesday 8:00 AM–4:00 PM, last appointment 3:30 PM, phone `(760) 314-4160`.
- Homepage and location pages do not claim orthodontics. Legacy straightening and cosmetic URLs 301 away.
- Insurance copy says the offices do not accept dental insurance. Cherry and Sunbit are “coming soon,” not current.
- Robots.txt allows `/`, disallows `/ops`, `/api/`, and `/thank-you`, and points at `https://hfdds.net/sitemap.xml`. Both location URLs are in the sitemap. Location canonicals are correct.
- Click-to-call `tel:` values on the location pages match the CallRail numbers. Header and footer show both, which is correct for shared chrome.

## Services to confirm before new marketing

Present on the site beyond the short mission list: bridges, extractions, inlays, onlays, full-mouth reconstruction, bone grafting, immediate dentures, implant-supported dentures, lost-crown visits, second opinions. Source comment in `website/src/lib/services.ts` points at Hart Offices.docx. Do not delete them in this pass. Do not feature them in new posts until Dr. Hart confirms.

## Core Web Vitals

A fresh PageSpeed Insights call on 2026-10-08 returned HTTP quota exceeded (`pagespeedonline.googleapis.com`, daily quota 0 for this environment). Headless Chrome in this environment did not finish a new Lighthouse run.

The newest saved production mobile run is still the homepage header check from 2026-08-03 (`website/docs/audits/homepage-header-fix/production/lighthouse-home-mobile.report.json`):

| URL | Performance | Accessibility | Best practices | SEO | LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- |
| `https://hfdds.net/` mobile | 82 | 100 | 100 | 100 | 4.2 s | 0 |

That LCP element was the header logo (about 150×44 CSS pixels). About 74% of the time was render delay, not download. The image is already preloaded and not lazy-loaded. Local lab runs the same day, against `127.0.0.1`, scored 96–97 with LCP about 2.7–2.8 s on the homepage, both location pages, and contact. No logo or layout change was made in this branch; the August header fix stays as shipped. A new lab run is an owner or CI follow-up once Chrome or PageSpeed quota is available.
