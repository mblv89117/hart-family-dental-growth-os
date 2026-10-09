# Analytics & Attribution Setup

**Production check, 2026-10-08:** `https://www.hfdds.net` loads GA4 measurement id `G-VPNLPP3BMV`. GTM, Clarity, Meta Pixel, and the CallRail swap script were not in the HTML. The published phone numbers are the CallRail tracking numbers themselves. The same measurement id was still on `https://hfdds.net` on 2026-10-09. What that property may already have stored, and the owner steps to redact and delete it, are in `docs/analytics/ga4-historical-disclosure.md`.

Analytics events must not include form contents (name, phone, email, message) or clinical service text. Page views drop those query keys before they are sent. See `website/src/lib/analytics-privacy.ts`. That behavior is in this branch. The deployment on the production domains does not include it yet.

## Implemented in repo (no fabricated IDs)

| Capability | Status |
| --- | --- |
| GA4 / GTM script loader | Ready — loads only when env IDs set |
| UTM + gclid/fbclid + referrer capture | `AttributionCapture` + sessionStorage |
| Events: form_start, form_submit_success, form_submit_error | Wired in forms |
| Events: phone_click, email_click, appointment_link_click | Wired globally |
| Event: location_selection | Wired on office select |
| Attribution fields on lead payload | API stores utm_* / referrer / pagePath |
| Sitemap / robots / canonical host | https://hfdds.net |

## Owner action checklist (IDs required)

1. Create GA4 property for Hart Family Dental → copy Measurement ID (`G-********`).  
2. Optional: create GTM container → copy Container ID (`GTM-******`).  
3. Add to Vercel project env (Production + Preview if desired):  
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID`  
   - `NEXT_PUBLIC_GTM_ID` (optional)  
4. Redeploy production.  
5. Google Search Console → add `https://hfdds.net` → verify DNS/HTML → submit `https://hfdds.net/sitemap.xml`.

## Verification process (after IDs live)

1. Open site with `?utm_source=test&utm_medium=qa&utm_campaign=analytics-verify`.  
2. Click a `tel:` link → confirm `phone_click` in GA4 DebugView / GTM preview.  
3. Focus a form → `form_start`.  
4. Submit a **TEST LEAD** → `form_submit_success`.  
5. Confirm realtime hits in GA4 within 60 seconds.

GA4 is already measuring on production under `G-VPNLPP3BMV`. GTM, Clarity, Meta Pixel, and Google Ads stay unloaded until their env ids are set.
