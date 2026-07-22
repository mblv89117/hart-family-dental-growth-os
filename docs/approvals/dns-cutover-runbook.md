# DNS Cutover Runbook

**Status:** **AUTHORIZED** for hfdds.net (2026-07-21 owner direction)  
**Preferred first live domain:** **hfdds.net**  
**Long-term SEO domain:** hartfamilydds.com (align after hfdds.net is stable)

## Current / target state

| Host | Observation |
| --- | --- |
| hfdds.net | Purchased; was GoDaddy parking — point to production host |
| www.hfdds.net | Same as apex |
| hartfamilydds.com | Still parked — align later |
| hartfamilyyv.com / hartfamilydhs.com | 301 later |

## Sequence

### Phase A — Local complete ✓
Build/QA on localhost; Option A hours + approved services applied.

### Phase B — First move: hfdds.net (now)
1. Deploy Next.js (`website/`) to host (Vercel preferred)  
2. Set env `NEXT_PUBLIC_SITE_URL=https://hfdds.net`  
3. Point `hfdds.net` + `www` to host; remove park lander  
4. Verify HTTPS, pages, `/api/leads`, thank-you flow  
5. Notify **Wendy Delgado** that live forms are active  
6. Confirm test lead arrives in office Hotmail  

### Phase C — Brand domain alignment (later)
1. Point `hartfamilydds.com` + `www` to same host **or** 301 → `https://hfdds.net`  
2. One canonical for GBP / Search Console  
3. Location domains → 301 to location paths  
4. Submit sitemap; monitor 48h  

## Rollback

Restore previous DNS records from screenshots; park lander returns until fixed permanently.
