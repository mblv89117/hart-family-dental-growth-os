# DNS Cutover Runbook

**Status:** **IN PROGRESS** — Vercel production live; GoDaddy DNS A records still need cutover  
**Preferred first live domain:** **hfdds.net**  
**Long-term SEO domain:** hartfamilydds.com (align after hfdds.net is stable)

## Live now

| Host | Status |
| --- | --- |
| https://hart-family-dental.vercel.app | **Production READY** (Option A hours + lead API verified) |
| hfdds.net / www.hfdds.net | Added in Vercel; **DNS still on GoDaddy park** until A records updated |

## Required GoDaddy DNS (do this once)

In GoDaddy DNS for **hfdds.net**, replace parking records with:

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | `76.76.21.21` |
| A | `www` | `76.76.21.21` |

(Or CNAME `www` → `cname.vercel-dns.com` if GoDaddy prefers CNAME for www.)

Remove park/lander forwarding after save. Propagation usually minutes; HTTPS issues on Vercel after DNS verifies.

## Sequence status

### Phase A — Local complete ✓
### Phase B — First move: hfdds.net
1. ~~Deploy Next.js to Vercel~~ ✓ (`hart-family-dental`)  
2. ~~Set `NEXT_PUBLIC_SITE_URL=https://hfdds.net`~~ ✓  
3. **Point DNS** — owner action above  
4. Verify HTTPS on hfdds.net + `/api/leads`  
5. Notify Wendy that live forms are active  
6. Confirm test lead in Hotmail  

### Phase C — Brand domain alignment (later)
hartfamilydds.com + location 301s after hfdds.net stable.
