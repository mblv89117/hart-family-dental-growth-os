# Test Lead Matrix

**Rule:** All rows are **TEST LEAD — DO NOT CONTACT**.  
**Submitted:** 2026-07-22 UTC via production API `https://hfdds.net/api/leads`

| Lead ID | Form / page (intended) | Location | Service | Device | Source / UTM | API result | notifyInbox | Inbox confirmed? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| lead_1784688498165_xq4pwp | appointment / dental-implants | yucca-valley | Dental implants | desktop | utm_source=qa&utm_campaign=production-qa | ok | hartdentalyv@hotmail.com | **Pending Wendy/owner** |
| lead_1784688498457_tsoyx4 | appointment / emergency-dentistry | desert-hot-springs | Emergency / tooth pain | desktop | production-qa | ok | hartdental02@hotmail.com | **Pending** |
| lead_1784688498726_anqjta | smile-assessment | yucca-valley | Teeth straightening assessment | desktop | production-qa | ok | hartdentalyv@hotmail.com | **Pending** |
| lead_1784688499035_k6epmo | appointment / contact | desert-hot-springs | New patient visit | desktop | production-qa | ok | hartdental02@hotmail.com | **Pending** |
| lead_1784688499276_ab2d3w | appointment / full-mouth | yucca-valley | Full-mouth implants | mobile-sim | production-qa | ok | hartdentalyv@hotmail.com | **Pending** |

## Validation cases

| Case | Expected | Result |
| --- | --- | --- |
| Empty body | 400 required fields | Pass |
| smsConsent not yes | 400 SMS consent | Pass |

## Patient-facing confirmation

Successful submits redirect to `/thank-you` with location + service query params (form UI path). API returns `{ ok: true, id, notifyInbox }` without secrets.
