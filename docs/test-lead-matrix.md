# Test Lead Matrix

**Rule:** All rows are **TEST LEAD — DO NOT CONTACT**.

## Email delivery investigation (2026-07-22)

| Check | Result |
| --- | --- |
| Production env has RESEND_API_KEY / SMTP_* | **No** — only SITE_URL + LEAD_CC_EMAILS |
| FormSubmit probe (browser-like Origin) | `success:false` — needs Activation email |
| FormSubmit from Vercel serverless | Cloudflare **403** challenge page |
| Prior API bug | Treated HTTP 200 as email success |
| Fix deployed | commit `bb0a3fb` — response includes `emailDelivered` |

### Post-fix production probes (honest status)

| Lead ID | Location | emailDelivered | Blockers shown |
| --- | --- | --- | --- |
| lead_1784690567374_ic4iab | yucca-valley | **false** | SMTP not configured; Resend not set; FormSubmit 403 |
| lead_1784690567886_p9krpm | desert-hot-springs | **false** | same |

**Hotmail inbox receipt remains unverified until SMTP or Resend credentials are added.**  
See `docs/operations/lead-email-delivery-diagnosis.md`.

## Earlier API-accepted leads (email NOT received)

| Lead ID | Location | notifyInbox claimed | Inbox confirmed? |
| --- | --- | --- | --- |
| lead_1784688498165_xq4pwp | yucca-valley | hartdentalyv@hotmail.com | **No** |
| lead_1784688498457_tsoyx4 | desert-hot-springs | hartdental02@hotmail.com | **No** |
| lead_1784688498726_anqjta | yucca-valley | hartdentalyv@hotmail.com | **No** |
| lead_1784688499035_k6epmo | desert-hot-springs | hartdental02@hotmail.com | **No** |
| lead_1784688499276_ab2d3w | yucca-valley | hartdentalyv@hotmail.com | **No** |
