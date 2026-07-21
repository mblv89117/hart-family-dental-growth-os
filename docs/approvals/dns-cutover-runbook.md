# DNS Cutover Runbook (Approval Required)

**Do not execute without Lindsay Hawkins / Harry Hart / Ryan Blakeslee approval.**

## Current state (2026-07-21)

| Host | Observation |
| --- | --- |
| hartfamilydds.com | A records → GoDaddy parking (parkweb lander) |
| hartfamilyyv.com | No A records observed |
| hartfamilydhs.com | No A records observed |

## Target

1. Host Next.js site (`website/`) on approved host (e.g. Vercel)  
2. Point `hartfamilydds.com` + `www` to host  
3. Configure `hartfamilyyv.com` + `www` → **301** `https://hartfamilydds.com/yucca-valley`  
4. Configure `hartfamilydhs.com` + `www` → **301** `https://hartfamilydds.com/desert-hot-springs`  

## Steps

1. Screenshot all GoDaddy DNS panels (backup)  
2. Create hosting project; note required A/CNAME values  
3. Add domains in host dashboard  
4. Update DNS TTL lower (300s) a day before if possible  
5. Apply DNS changes during low-traffic window  
6. Verify HTTPS, homepage, both location pages, form submit path  
7. Update GBP website URLs to location pages  
8. Submit sitemap in Google Search Console  
9. Monitor 48h for email/DNS/SSL issues  

## Rollback

Restore previous DNS records from screenshots; park lander will return until fixed permanently.
