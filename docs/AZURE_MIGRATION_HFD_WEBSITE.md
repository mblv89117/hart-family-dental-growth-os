# Hart Family Dental website — Azure Container Apps preparation

Preparation only. This change does not edit GoDaddy, does not modify the live Vercel project, does not deploy production, and does not commit secret values.

The site in `website/` is Next.js 15.5.22 and React 19.1. It serves **https://hfdds.net** from Vercel (`A @` → `76.76.21.21`, project alias `hart-family-dental`). `vercel.json` only sets the framework, install, and build commands. There is no `@vercel/*` dependency. `output: "standalone"` is ignored by Vercel’s builder, so the current host keeps its own build.

DNS cutover steps are in [AZURE_DNS_CUTOVER_ROLLBACK.md](./AZURE_DNS_CUTOVER_ROLLBACK.md). Do not run them from this pull request.

## Audit

### Routes

Marketing pages (static unless noted): `/`, `/about`, `/accessibility`, `/contact`, `/disclaimer`, `/faq`, `/financing`, `/new-patients`, `/privacy`, `/providers`, `/reviews`, `/services`, `/services/[slug]`, `/locations/yucca-valley`, `/locations/desert-hot-springs`, `/terms`, `/thank-you`.

Ops UI (`/ops`, inbox, lead detail, login, safety, scheduling) and `/api/ops/*` return 404 unless `OPS_ENABLED` is on and, in production, `AUTH_MODE` is `oidc`, `oauth`, `magic_link`, or `passkey` with `AUTH_PRODUCTION_APPROVED=true`. The Azure template leaves ops off.

| Method | Path | Role |
| --- | --- | --- |
| POST | `/api/leads` | Appointment and smile-assessment intake. Node runtime. |
| GET | `/api/knowledge` | Public NAP and services JSON. `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`. |
| GET | `/api/health` | Container probe. No database. `{ ok: true, service: "hfd-website" }`. |
| * | `/api/ops/auth/login`, `logout`, `me` | Ops session. |
| * | `/api/ops/dashboard`, `inbox`, `leads/[id]`, `safety`, `scheduling`, `tasks/[id]` | Ops data. Require the platform database. |

`/robots.txt` allows `/` and disallows `/ops`, `/api/`, and `/thank-you`. Sitemap URL is `${NEXT_PUBLIC_SITE_URL}/sitemap.xml`, defaulting to `https://hfdds.net/sitemap.xml`.

### Middleware

`website/src/middleware.ts`:

- `hartfamilyyv.com` and `www.hartfamilyyv.com` → `301` `https://hfdds.net/locations/yucca-valley…`
- `hartfamilydhs.com` and `www.hartfamilydhs.com` → `301` `https://hfdds.net/locations/desert-hot-springs…`
- Ops paths hidden as above, with `X-Robots-Tag: noindex, nofollow` and `x-hfd-surface: ops`
- Other requests get `x-hfd-surface: public`. `/thank-you` is `noindex`

Those location domains do not resolve today, so the host redirects never run. The code is unchanged. The matcher skips `/_next/static`, `/_next/image`, `favicon.ico`, and any path containing a dot, so `/robots.txt` and `/sitemap.xml` do not pass through middleware. Their headers still come from `next.config.ts`.

### Redirects, headers, canonical, structured data

Legacy paths are permanent **301** (not 308) from `legacyRedirects` in `website/src/lib/services.ts`:

| From | To |
| --- | --- |
| `/yucca-valley` | `/locations/yucca-valley` |
| `/desert-hot-springs` | `/locations/desert-hot-springs` |
| `/dental-implants` | `/services/dental-implants` |
| `/full-mouth-dental-implants` | `/services/full-arch-implants` |
| `/restorative-dentistry` | `/services/restorative-dentistry` |
| `/emergency-dentistry` | `/services/tooth-pain-broken-teeth` |
| `/cosmetic-dentistry` | `/services/general-dentistry` |
| `/teeth-straightening` | `/services/general-dentistry` |
| `/smile-assessment` | `/contact#request` |
| `/cash-pay-dentistry` | `/financing` |

Every response from `next.config.ts` still sends `X-DNS-Prefetch-Control`, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, and the existing Content-Security-Policy. `/brand/*` and `/og/*` stay `Cache-Control: public, max-age=31536000, immutable`. `poweredByHeader` stays off.

`Strict-Transport-Security` was intentionally absent so local HTTP QA would not pin Chrome to HTTPS. Vercel’s edge supplies it for hfdds.net today. Container Apps ingress does not add response headers (`allowInsecure: false` only redirects HTTP to HTTPS). The production image is built with `HFD_ENABLE_HSTS=true`, which adds `Strict-Transport-Security: max-age=63072000; includeSubDomains` in `next.config.ts`. Local `next dev` and a Vercel build that does not set that variable keep the previous header set.

Canonical host is `NEXT_PUBLIC_SITE_URL` or `https://hfdds.net` (`website/src/lib/site.ts`). The Docker build arg is `https://hfdds.net`, so the validation hostname still emits production canonicals, Open Graph URLs, sitemap URLs, and JSON-LD `@id`s. Do not point `NEXT_PUBLIC_SITE_URL` at the Azure hostname.

JSON-LD (`JsonLd`, `website/src/lib/schema.ts`) covers Organization, WebSite, Dentist/LocalBusiness, BreadcrumbList, FAQPage, and Service. It is unchanged.

Pages that do not set their own canonical (`/providers`, `/reviews`, `/disclaimer`, `/terms`) still inherit the root layout canonical `/`. That behavior is preserved.

### Images, caching, data

`next/image` serves AVIF and WebP (`BrandLogo`, `PageHero`). `sharp` is pinned to 0.35.3. Device sizes and a 30-day `minimumCacheTTL` are unchanged. Standalone output traces `sharp` into the image; the container does not use Vercel’s image optimizer.

There is no `revalidate`, `unstable_cache`, or ISR export. Marketing pages are the default static build. Ops pages are `force-dynamic`. The public form rate limit is in-memory (`website/src/server/rate-limit.ts`): 8 requests per minute per `x-forwarded-for` address, per replica. It is not a substitute for a WAF.

Prisma targets PostgreSQL (`DATABASE_URL`, `DIRECT_URL`) and is used only when `GROWTH_OS_PLATFORM_ENABLED` or `OPS_ENABLED` is true. Both default to false, which is how hfdds.net runs today. The container sets both to false and does not receive a database URL. The worker (`website/scripts/worker.ts`) is a separate process and is not started in this container. One migration exists: `20260728062357_phase1_growth_os_foundation`.

Lead JSONL is written to `data/leads/leads.jsonl` next to the process working directory (`/data/leads` in the image). That disk is ephemeral. Email and the signed webhook are the durable paths.

`next/font` downloads Fraunces and Outfit at image build time. The build needs outbound network access to Google fonts.

### Environment variable names

Public, inlined at build:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_GTM_ID`
- `NEXT_PUBLIC_CLARITY_ID`
- `NEXT_PUBLIC_META_PIXEL_ID`
- `NEXT_PUBLIC_GOOGLE_ADS_ID`
- `NEXT_PUBLIC_CALLRAIL_SWAP_SCRIPT_URL`

Lead delivery:

- `LEAD_WEBHOOK_URL` — optional override. Empty uses `https://api.360growthsolution.com/api/webhooks/hfd-website-lead`
- `HFD_WEBSITE_LEAD_WEBHOOK_SECRET`
- `LEAD_CC_EMAILS` (code default `hartdental@gmail.com`)
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

Platform, all default off for this container:

- `GROWTH_OS_PLATFORM_ENABLED`, `OPS_ENABLED`
- `DATABASE_URL`, `DIRECT_URL`, `DATABASE_URL_TEST`, `PRISMA_LOG`
- `AUTH_MODE`, `AUTH_PRODUCTION_APPROVED`, `AUTH_SECRET`, `SESSION_TTL_HOURS`
- `ALLOW_PRODUCTION_SEED`, `DEV_SEED_*_PASSWORD` (seed only; never set in Azure)
- `AUTOMATION_MODE`, `OUTBOUND_COMMUNICATIONS_ENABLED`, `OUTBOUND_ALLOWLIST`
- `OPEN_DENTAL_MODE`, `OPEN_DENTAL_WRITES_ENABLED`, `OPEN_DENTAL_BASE_URL`, `OPEN_DENTAL_DEVELOPER_KEY`, `OPEN_DENTAL_CUSTOMER_KEY`, `OPEN_DENTAL_CONNECTIONS_JSON`, `OPEN_DENTAL_WEBHOOK_TOKEN`, `OPEN_DENTAL_REQUEST_TIMEOUT_MS`, `OPEN_DENTAL_SYNC_ENABLED`
- `AI_ENABLED`, `AI_PHI_ALLOWED`, `VOICE_AUTOMATION_ENABLED`, `CALL_RECORDING_ENABLED`, `TREATMENT_PLAN_FOLLOWUP_ENABLED`, `PATIENT_REACTIVATION_ENABLED`, `REVIEW_REQUESTS_ENABLED`
- `WORKER_EXECUTION_MODE`, `WORKER_ID`, `WORKER_LEASE_SECONDS`, `WORKER_POLL_MS`
- `HFD_ENABLE_HSTS` — build-time switch for the header above

### How the form submits and notifies

`AppointmentForm` and `SmileAssessmentForm` POST JSON to `/api/leads` (honeypot field `companyWebsite`, required SMS consent, office `<select>` with an empty placeholder). With the platform flag off, the handler does not open Prisma.

Office must be the slug `yucca-valley` or `desert-hot-springs`. Any other value, including a display name or “either”, returns 400. The old fallback that emailed `hartdentalyv@hotmail.com` for an unknown office is gone.

Authorized email still runs:

1. SMTP to the office inbox (`hartdentalyv@hotmail.com` or `hartdental02@hotmail.com`) plus `LEAD_CC_EMAILS`
2. Resend only if SMTP did not accept the message

If both fail, the handler logs `smtp_and_resend_not_delivered` with the office slug and does not call another email vendor. **formsubmit.co is removed.** Patient inquiry bodies are not sent there.

The signed 360 Growth POST runs in addition to email, not instead of it. A webhook failure does not drop an email that succeeded.

## 360 Growth lead contract

`website-lead-intake.md` is in the private 360 Growth repository and is not readable from this workspace. Probes against production revision `4e8b1e4839b45999c9b3ff143e75e774b6116742` on 2026-10-28:

| Request | Result |
| --- | --- |
| POST `/api/webhooks/hfd-website-lead` with no signature, a bad signature, a unix timestamp, or an ISO timestamp | **401** `{"error":"invalid_website_lead_auth"}` |
| GET that path | 405 |
| POST `/api/webhooks/hart-website-lead` | **404** |

The live route is `hfd-website-lead`. `hart-website-lead` is not registered on this revision. `LEAD_WEBHOOK_URL` can override the URL if the route is renamed. The default is `https://api.360growthsolution.com/api/webhooks/hfd-website-lead`. Non-HTTPS overrides are refused.

The API returns the same 401 for every bad signature, so it does not reveal whether the verifier wants unix seconds or ISO-8601. This client implements the contract from the readiness audit:

- `X-HFD-Lead-Contract: hfd-website-lead-1`
- `X-HFD-Timestamp`: unix seconds
- `X-HFD-Signature`: `sha256=<hex>` where the hex is HMAC-SHA256 of the UTF-8 string `${timestamp}.${rawBody}` and the key is `HFD_WEBSITE_LEAD_WEBHOOK_SECRET`
- Body is a fixed allowlist (`office`, contact fields, consent, attribution). `notifyInbox`, `deliveries`, `owner`, `userAgent`, and `location` are not sent. `office` is only `yucca-valley` or `desert-hot-springs`.

If the secret is unset, the site does not POST an unsigned body. Email can still proceed. An admin should confirm this byte string against `website-lead-intake.md` before treating intake as certified. Unit tests in `website/tests/unit/hfd-lead-webhook.test.ts` use synthetic data only.

## Container image

`website/Dockerfile` is a three-stage build: `npm ci`, `next build` (webpack standalone, not Turbopack), then a non-root `nextjs` user (uid 1001) running `node server.js` on port 3000. The image healthcheck and the Container App liveness/readiness probes call `GET /api/health`. Build-time `DATABASE_URL` is a dummy used only so `prisma generate` can run. It is not copied into the runtime stage.

## Azure layout and cost

Templates: `infra/azure/hfd-website/`. They create a **new** resource group and, inside it only:

- Log Analytics workspace `log-hfd-website` (30-day retention)
- User-assigned identity `id-hfd-website`
- Basic ACR (admin user disabled)
- Key Vault with RBAC (no secret values in the template)
- Consumption Container Apps environment `cae-hfd-website`
- Container App `ca-hfd-website` only when `deployContainerApp` is true

The identity may pull from this ACR and read secrets from this vault. It is not granted access to any other client vault, including `kvgs360pmwlemljo`. An admin copies the webhook secret value into this vault out of band so the value matches 360 Growth without sharing that vault.

Key Vault secret **names** referenced by the app:

- `hfd-website-lead-webhook-secret` → `HFD_WEBSITE_LEAD_WEBHOOK_SECRET`
- `resend-api-key` → `RESEND_API_KEY`
- `smtp-user` → `SMTP_USER`
- `smtp-pass` → `SMTP_PASS`

Create those four versions before setting `deployContainerApp=true`. The app revision will not start if a referenced secret is missing.

### Replica trade-off

`minReplicas` defaults to **1** (0.5 vCPU, 1 GiB, max 3). A warm replica answers Googlebot and ad clicks without a cold start. Consumption scale-from-zero often adds several seconds to tens of seconds before the process listens, which shows up as poor TTFB on the first hit. Set `minReplicas` to 0 only for a validation environment that can accept that delay. The parameter allows 0.

### Expected monthly cost

List prices below are the published Consumption rates (about $0.000024 per active vCPU-second, $0.000003 per idle vCPU-second, $0.000003 per GiB-second active or idle) as quoted for East US on 2026-10-28. Confirm West US 3 in the [pricing calculator](https://azure.microsoft.com/pricing/calculator/) before budgeting. A month is 730 hours (2,628,000 seconds). The subscription free grant (180,000 vCPU-seconds, 360,000 GiB-seconds, 2 million requests) is shared by every Container App in the subscription. The 360 Growth API already runs on Container Apps, so this estimate **does not assume the grant is still available**.

| Piece | minReplicas 1, mostly idle | minReplicas 0 |
| --- | --- | --- |
| Compute, 0.5 vCPU + 1 GiB, idle rates | about **$12** (0.5 × 2,628,000 × $0.000003 + 1 × 2,628,000 × $0.000003) | **$0** while scaled to zero |
| Same shape with roughly 10% of the month active | about **$15** | a few dollars on the days it runs |
| ACR Basic | about **$5** | about **$5** |
| Log Analytics, Key Vault, egress under the free tiers | about **$0–6** | about **$0–6** |
| **Planning total** | **about $18–30 / month** | **about $6–12 / month** |

No Front Door, no dedicated workload profile, and no private endpoint are in the template. Those would each add a fixed charge.

## GitHub Actions

Validation (manual, not on push): `.github/workflows/hfd-website-azure-validate.yml`

- OIDC via `azure/login@v2` and repository **variables** `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`
- Also requires variables `AZURE_RESOURCE_GROUP`, `AZURE_ACR_NAME`, `AZURE_CONTAINER_APP_NAME` (the ACR name is generated; copy it from the deployment output)
- Builds in that ACR with `NEXT_PUBLIC_SITE_URL=https://hfdds.net` and `HFD_ENABLE_HSTS=true`
- Updates the Container App image only. It does not add a custom domain.
- Runs `website/scripts/azure-smoke.mjs` against the `*.azurecontainerapps.io` hostname

Production hostnames: `.github/workflows/hfd-website-azure-bind-domain.yml`

- `workflow_dispatch` only, and only if the input is exactly `BIND_HFDDS_NET`
- Uses GitHub environment `hfd-website-production` so an admin can require a reviewer
- Binds `hfdds.net` and `www.hfdds.net` and requests managed certificates
- Does not change GoDaddy. Do not run it until the cutover runbook says the `asuid` TXT records exist.

## What an Azure admin has to do

1. Apply `infra/azure/hfd-website/main.bicep` with `deployContainerApp=false` into a subscription that is allowed to create a resource group. Use `main.example.bicepparam`. Do not target another client’s resource group.
2. Create an Entra app registration for GitHub OIDC. Federated credentials:
   - `repo:mblv89117/hart-family-dental-growth-os:environment:hfd-website-validation`
   - `repo:mblv89117/hart-family-dental-growth-os:environment:hfd-website-production`
3. Re-apply the template with `githubActionsPrincipalId` set to that app’s object id, or assign the same roles by hand and only on these resources:
   - AcrPush on this ACR
   - Container Apps Contributor on `rg-hfd-website`
   - Do not assign Contributor on the subscription and do not grant this app Key Vault Secrets Officer on the 360 Growth vault
4. Create GitHub environments `hfd-website-validation` and `hfd-website-production` (production should require a reviewer).
5. Set the repository variables listed above. Do not put the webhook secret in GitHub.
6. Create the four Key Vault secrets by name. Copy the webhook secret from the password manager so it matches 360 Growth. Put SMTP and Resend values in the other three. Empty SMTP or Resend means that channel is skipped; the app still needs the secret objects to exist because the revision references them.
7. Run the validation workflow once so an image exists, then set `deployContainerApp=true` and `containerImage` to `<acr>.azurecr.io/hfd-website:<sha>` and apply again. Later workflow runs only update the image.
8. Confirm `website-lead-intake.md` matches the signature string above.
9. Leave DNS and Vercel alone until [AZURE_DNS_CUTOVER_ROLLBACK.md](./AZURE_DNS_CUTOVER_ROLLBACK.md).
