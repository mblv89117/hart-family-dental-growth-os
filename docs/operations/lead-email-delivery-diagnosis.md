# Lead Email Delivery Diagnosis

**Date:** 2026-07-22  
**Symptom:** TEST LEAD API returned `ok: true` but neither Hotmail inbox received mail.

## Root cause

1. **No transactional email provider configured in production.**  
   Vercel env only had `NEXT_PUBLIC_SITE_URL` and `LEAD_CC_EMAILS`.  
   `RESEND_API_KEY` / SMTP credentials were **not set**.

2. **FormSubmit was used as the only path and it never activated.**  
   Probed live with Origin `https://hfdds.net`:
   ```json
   {"success":"false","message":"This form needs Activation. We've sent you an email containing an 'Activate Form' link..."}
   ```
   Hotmail often never receives FormSubmit activation mail (Microsoft filtering). Without clicking Activate, **no lead emails are delivered**.

3. **Bug: API treated HTTP 200 as success.**  
   FormSubmit returns HTTP 200 with `success:"false"`. Our code marked `formsubmit-hotmail` as `ok: true` because `res.ok` was true. That made API responses look healthy while email never sent.

## Fix implemented

- New `website/src/lib/lead-delivery.ts`:
  - Prefer **SMTP** (Outlook) then **Resend**
  - FormSubmit only as last resort; requires JSON `success === true`
  - Always include primary Hotmail + `LEAD_CC_EMAILS` (Gmail)
  - API response now includes `emailDelivered` + per-channel `deliveries`
- Env template updated for `SMTP_*` and `RESEND_*`

## Required to actually reach Hotmail

Configure **one** of:

### A — Outlook SMTP app password (fastest for Hotmail)

1. Sign into `hartdentalyv@hotmail.com` at https://account.live.com/  
2. Enable 2-step verification if needed  
3. Create an **App password** named `Hart Leads SMTP`  
4. Tell the agent “SMTP ready” and paste the app password **once** (will be stored only in Vercel env, never committed), **or** set these Vercel Production envs yourself:
   - `SMTP_HOST=smtp-mail.outlook.com`
   - `SMTP_PORT=587`
   - `SMTP_USER=hartdentalyv@hotmail.com`
   - `SMTP_PASS=<app password>`
   - `SMTP_FROM=hartdentalyv@hotmail.com`

### B — Resend + domain DNS

1. Create Resend account / API key  
2. Verify `hfdds.net` (SPF/DKIM records in GoDaddy)  
3. Set `RESEND_API_KEY` + `RESEND_FROM_EMAIL=Hart Family Dental <leads@hfdds.net>` on Vercel  

After either path: redeploy and re-send TEST LEADs for both offices.
