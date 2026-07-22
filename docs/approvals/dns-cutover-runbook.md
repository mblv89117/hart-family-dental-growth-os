# DNS Cutover Runbook (Approval Required)

**Status:** **DEFERRED** — finish local build first; move later.  
**Preferred first live domain:** **hfdds.net** (purchased GoDaddy 2026-07-21).  
**Long-term SEO domain:** hartfamilydds.com (align/canonical after hfdds.net is stable).  
**Do not execute until Lindsay Hawkins / Harry Hart / Ryan Blakeslee schedule cutover.**

## Current state (2026-07-21)

| Host | Observation |
| --- | --- |
| hfdds.net | Purchased; currently GoDaddy parking (same A pattern as primary) |
| www.hfdds.net | Resolves via park |
| hartfamilydds.com | GoDaddy parking (parkweb lander) |
| hartfamilyyv.com | No useful A records observed earlier |
| hartfamilydhs.com | No useful A records observed earlier |

## Recommended sequence (when approved)

### Phase A — Local complete ✓ (in progress)
Build and QA on `localhost` only.

### Phase B — First move: hfdds.net
1. Screenshot GoDaddy DNS for **hfdds.net**  
2. Deploy Next.js (`website/`) to approved host (e.g. Vercel)  
3. Set env `NEXT_PUBLIC_SITE_URL=https://hfdds.net`  
4. Point `hfdds.net` + `www` to host; remove park lander  
5. Verify HTTPS, all pages, `/api/leads`, thank-you flow  
6. Notify **Wendy Delgado** that live forms are active  
7. Optional: temporary `noindex` if still in soft launch  

### Phase C — Brand domain alignment
1. Point `hartfamilydds.com` + `www` to same host **or** 301 → `https://hfdds.net`  
2. Pick **one canonical** URL for GBP, Search Console, ads  
3. Location domains → 301 to `/yucca-valley` and `/desert-hot-springs` on canonical host  
4. Submit sitemap; monitor 48h  

## Rollback

Restore previous DNS records from screenshots; park lander will return until fixed permanently.
