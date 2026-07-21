# Website Audit — hartfamilydds.com

**Audit date:** 2026-07-21  
**URL tested:** https://www.hartfamilydds.com

## Summary

**Fail — no production website.** Domain resolves to a GoDaddy parking / CAF lander (`lander_type=parkweb`). There is no patient-facing content, schema, tracking, or conversion path.

## Technical observations

| Check | Result |
| --- | --- |
| HTTP response | 200 with redirect script to `/lander` |
| Production content | None |
| SSL | Present on host response |
| DNS A | 3.33.130.190, 15.197.148.33 (typical GoDaddy parking) |
| Location domains | hartfamilyyv.com / hartfamilydhs.com — no A records observed |
| Mobile usability | N/A (lander) |
| Core Web Vitals | N/A |
| Forms / phones / schema | Missing |
| Privacy / HIPAA notices | Missing |
| Analytics | Missing |

## Required pages (build status)

Tracked in `website/` — see IA in `docs/strategy/domain-website-strategy.md`.

## Priority fixes

1. Replace park page with Growth OS website (this repo)  
2. Confirm NAP + hours before launch  
3. Install GA4/GTM + conversion events  
4. Wire forms to monitored lead routing  
5. Add LocalBusiness schema per location  
6. 301 location domains after DNS  
7. Search Console + sitemap  

## Approval needed

DNS cutover and go-live with Ryan Blakeslee / Mason / Lindsay Hawkins.
