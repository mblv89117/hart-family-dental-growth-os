# hfdds.net DNS cutover and rollback

**Do not run this runbook as part of the Azure preparation pull request.**  
DNS stays on Vercel (`A @` → `76.76.21.21`, `CNAME www` → `hfdds.net`) until an admin completes the checks below. The Vercel project is not modified by the preparation PR.

The previous cutover onto Vercel is recorded in `docs/approvals/dns-cutover-runbook.md`. This document is the later move from Vercel to the dedicated Hart Family Dental Container App.

## What must already be true

1. `infra/azure/hfd-website` is deployed in its own resource group (`rg-hfd-website`).
2. The validation workflow (`.github/workflows/hfd-website-azure-validate.yml`) has gone green against the `*.azurecontainerapps.io` hostname.
3. Smoke checks passed: `/api/health`, homepage canonical `https://hfdds.net`, sitemap, robots, `/dental-implants` 301, location page, HSTS, and a rejected incomplete lead.
4. A synthetic signed lead to 360 Growth was accepted on a non-production test, or the office has agreed to watch the first real submission. SMTP or Resend is configured in Key Vault so email still works if the webhook is down.
5. GoDaddy access for hfdds.net is available. Nobody else is editing the zone.

## Record these values before changing anything

| Item | Where |
| --- | --- |
| Current apex A | `76.76.21.21` (Vercel) |
| Current www | CNAME `www` → `hfdds.net` |
| Container App FQDN | `az containerapp show -n ca-hfd-website -g rg-hfd-website --query properties.configuration.ingress.fqdn -o tsv` |
| Environment static IP | Container Apps environment `cae-hfd-website`, property `staticIp` |
| Domain verification id | Same environment, property `customDomainVerificationId` |
| Vercel deployment | The production deployment that is serving hfdds.net today |

Save the four values in the change ticket. They are the rollback inputs.

## Verification records (no traffic change)

Add these in GoDaddy **before** changing the apex A record. They prove control of the domain to Azure. They do not move the website.

| Type | Name | Value |
| --- | --- | --- |
| TXT | `asuid` | `<customDomainVerificationId>` |
| TXT | `asuid.www` | `<customDomainVerificationId>` |

Wait until `dig TXT asuid.hfdds.net` and `dig TXT asuid.www.hfdds.net` show the value.

Then run **HFD website bind production domain** (`.github/workflows/hfd-website-azure-bind-domain.yml`) with confirmation `BIND_HFDDS_NET`. That workflow only adds hostnames and requests managed certificates on the Container App. If bind fails, stop. Public DNS is still on Vercel, which is the safe state.

Confirm the Container App shows both hostnames and a succeeded certificate before the next section. Browse the `*.azurecontainerapps.io` hostname again and confirm canonical tags still say `https://hfdds.net`.

## Cutover

Pick a low-traffic window. Tell Wendy that form mail might pause for a few minutes.

1. Lower the GoDaddy TTL on `@` and `www` to 600 seconds at least an hour ahead, if the registrar allows it.
2. Change only the apex:
   - Type `A`, name `@`, value = the Container Apps environment **static IP** (not `76.76.21.21`).
3. Change www, replacing the CNAME. Do not also create an A record for www.
   - Type `CNAME`, name `www`, value = the Container App FQDN (the `*.azurecontainerapps.io` name).
4. Wait for `dig A hfdds.net` and `dig CNAME www.hfdds.net` to match. Then check:
   - `https://hfdds.net/api/health` returns `{"ok":true,"service":"hfd-website"}`
   - `https://hfdds.net/` canonical is `https://hfdds.net`
   - `https://hfdds.net/robots.txt` sitemap is `https://hfdds.net/sitemap.xml`
   - `https://hfdds.net/dental-implants` is a 301 to `/services/dental-implants`
   - `https://www.hfdds.net/` redirects or serves the same site over HTTPS
   - Response includes `Strict-Transport-Security`
   - Submit one lead with the message `TEST LEAD — DO NOT CONTACT`, office Yucca Valley, using a staff address. Confirm the signed webhook or the office inbox, then mark it Spam/Test.
5. Leave Vercel deployed and untouched for at least a day so rollback is a DNS change only.

Location domains `hartfamilyyv.com` and `hartfamilydhs.com` are not part of this cutover. They still have no DNS. Middleware 301s for those hosts stay in the app for when those zones are delegated later.

## Rollback

Trigger: health check fails, certificate error, forms do not notify, or canonical host is wrong after the TTL window.

1. In GoDaddy, set `A @` back to `76.76.21.21`.
2. Set `CNAME www` back to `hfdds.net`. Remove any A record that was added for www.
3. Wait for resolvers. `dig A hfdds.net` should show `76.76.21.21`.
4. Confirm `https://hfdds.net/api/health` or the homepage responds from Vercel (`server: Vercel` or `x-vercel-id`).
5. Tell Wendy forms are back on the previous host. Do not submit another test until the inbox path is confirmed.
6. Leave the Container App running on its Azure hostname so the failure can be inspected. Do not delete the resource group during rollback.
7. The `asuid` TXT records can stay. They do not send traffic to Azure.

If Vercel was removed before this rollback, redeploy the last known good Vercel deployment first, then restore DNS. That is why this runbook does not delete the Vercel project.

## After a stable day

- Raise TTL back to the previous value.
- Keep the Vercel project for one more billing period, then an admin can pause it. That decision is separate from this preparation.
- `hartfamilydds.com` is still the long-term SEO domain and is not moved here.
