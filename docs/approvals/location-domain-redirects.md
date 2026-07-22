# Location Domain Redirects

## Targets

| Funnel domain | 301 destination |
| --- | --- |
| hartfamilyyv.com / www | https://hfdds.net/yucca-valley |
| hartfamilydhs.com / www | https://hfdds.net/desert-hot-springs |

Query strings and UTMs are preserved by middleware (`website/src/middleware.ts`).

## App readiness

Middleware is deployed with the Next.js app. It activates when those hosts resolve to the Vercel deployment.

## Owner DNS actions (GoDaddy)

For **each** of `hartfamilyyv.com` and `hartfamilydhs.com`:

1. Add domain to Vercel project `hart-family-dental` (or point A `@` → `76.76.21.21` and www CNAME → apex / cname.vercel-dns.com).  
2. Remove parking landers.  
3. Verify:  
   - `https://hartfamilyyv.com/?utm_campaign=test` → lands on YV page with UTM intact  
   - `https://hartfamilydhs.com/?utm_campaign=test` → lands on DHS page with UTM intact  

## Verification log

| Check | Result |
| --- | --- |
| Middleware code present | Yes |
| DNS pointed | **Queued — owner action** |
| HTTPS on funnel domains | Pending DNS |
| UTM preserved | Pending live DNS test |
