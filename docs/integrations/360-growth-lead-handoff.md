# Website → 360 Growth lead handoff

**Contract version:** `hfd-website-lead-1`  
**Website:** Hart Family Dental public site (`hart-family-dental` on Vercel, canonical `https://hfdds.net`)  
**Command center:** 360 Growth (`mblv89117/360-growth-solution`). This repository does not implement that backend.

360 Growth already receives CallRail call events at `api.360growthsolution.com`. This website does not receive CallRail webhooks, does not store call recordings, and does not replace that intake. Form leads are a separate channel.

## What the website sends

After a valid public form post to `POST /api/leads`, and only when `LEAD_WEBHOOK_URL` is set on the Vercel project, the site `POST`s JSON to that URL.

Header: `X-HFD-Lead-Contract: hfd-website-lead-1`  
Content-Type: `application/json`

```json
{
  "contractVersion": "hfd-website-lead-1",
  "source": "hfdds-website",
  "id": "lead_<timestamp>_<suffix>",
  "receivedAt": "2026-10-08T00:00:00.000Z",
  "owner": "Wendy Delgado",
  "formType": "appointment",
  "name": "TEST LEAD — DO NOT CONTACT",
  "phone": "7605550199",
  "email": "test-lead@example.test",
  "location": "yucca-valley",
  "service": "New patient visit",
  "followUp": "phone",
  "message": "TEST LEAD — DO NOT CONTACT",
  "smsConsent": true,
  "emailConsent": false,
  "pagePath": "/contact",
  "utm_source": "",
  "utm_medium": "",
  "utm_campaign": "",
  "utm_content": "",
  "utm_term": "",
  "gclid": "",
  "gbraid": "",
  "wbraid": "",
  "fbclid": "",
  "referrer": "https://www.google.com/",
  "userAgent": "",
  "notifyInbox": "hartdentalyv@hotmail.com",
  "deliveries": [{ "channel": "smtp", "ok": false, "detail": "SMTP_HOST/USER/PASS not fully configured" }]
}
```

`location` is only `yucca-valley` or `desert-hot-springs`. The webhook is not called for any other value.

| `location` | Office inbox (`notifyInbox`) | CallRail number on the site |
| --- | --- | --- |
| `yucca-valley` | `hartdentalyv@hotmail.com` | (760) 389-7707 |
| `desert-hot-springs` | `hartdental02@hotmail.com` | (760) 314-4160 |

`service` and `message` may describe why the person called. Treat the body as lead content for the practice. Do not copy it into analytics, ads pixels, or a public page.

Synthetic tests use the name and message `TEST LEAD — DO NOT CONTACT`. Those are not patients. Do not call or email them.

## What the website does not send to 360

- CallRail call events, recordings, or transcripts. Those stay on the existing 360 CallRail integration.
- An office guess. Blank, “either”, “both”, or a city name is HTTP 400. Nothing is emailed and nothing is webhooks.
- Analytics payloads. GA4 events are limited to `formType`, office id, and path. Form fields and the `service` query are stripped before `page_view`.

## Email path (unchanged ownership)

1. SMTP if `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` are set.
2. Else Resend if `RESEND_API_KEY` is set.
3. FormSubmit is off unless `LEAD_FORMSUBMIT_FALLBACK=true`. It posts the full lead to a third party and is not a 360 integration.
4. Optional CC: `LEAD_CC_EMAILS`. If that variable is unset, the code still CCs `hartdental@gmail.com`. Confirm that inbox before relying on it.

Production previously had no working SMTP/Resend path (see `docs/operations/lead-email-delivery-diagnosis.md`). Until one of those is set, `emailDelivered` can be false even though the thank-you page still shows. The webhook is the reliable handoff once 360 publishes an intake URL.

## Owner setup

1. Ask the 360 Growth agent for the HTTPS intake URL it will accept for `hfd-website-lead-1`. Do not invent a path on `api.360growthsolution.com`.
2. Vercel → team **High Value Capital Group** → project **hart-family-dental** → Settings → Environment Variables.
3. Add `LEAD_WEBHOOK_URL` for Production and Preview. Paste only the URL the 360 agent provides.
4. Leave `GROWTH_OS_PLATFORM_ENABLED=false` and `OPS_ENABLED=false`.
5. Redeploy the deployment that contains this contract (preview first).
6. Send one labelled test per office from the preview, then confirm 360 stored `location` and `notifyInbox` and did not create a patient record. Do not send those tests until email delivery is pointed somewhere that will not page the front desk, or warn Wendy first.

## Website acceptance already covered here

- Yucca Valley and Desert Hot Springs each resolve to their own inbox.
- An ambiguous office fails closed.
- Call tracking numbers on the pages are the CallRail numbers above. Dynamic number swap is not installed; calls to those numbers are CallRail’s to forward into 360.
