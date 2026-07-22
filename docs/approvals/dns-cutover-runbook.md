# DNS Cutover Runbook

**Status:** **COMPLETE for hfdds.net** (2026-07-21)  
**Preferred first live domain:** **https://hfdds.net**  
**Long-term SEO domain:** hartfamilydds.com (align later)

## Live now

| Host | Status |
| --- | --- |
| https://hfdds.net | **LIVE** — HTTPS cert issued |
| https://www.hfdds.net | **LIVE** — CNAME → apex; HTTPS cert issued |
| https://hart-family-dental.vercel.app | Production alias |

## DNS that worked

| Type | Name | Value | Notes |
| --- | --- | --- | --- |
| A | `@` | `76.76.21.21` | Set in GoDaddy |
| CNAME | `www` | `hfdds.net` | **Keep existing** — do not add a second A for `www` (conflicts) |

## Do not do

Do not add a new **A** record for `www` while a **CNAME** for `www` already exists. Cancel that add in GoDaddy.

## Sequence status

### Phase A — Local complete ✓
### Phase B — First move: hfdds.net ✓
1. Deploy Next.js to Vercel ✓ (`hart-family-dental`)  
2. `NEXT_PUBLIC_SITE_URL=https://hfdds.net` ✓  
3. DNS A `@` → 76.76.21.21 ✓  
4. HTTPS verified on apex + www ✓  
5. Lead API live (`notifyInbox` Hotmail routing) ✓  

### Phase C — Brand domain alignment (later)
hartfamilydds.com + location 301s after ops settle.
