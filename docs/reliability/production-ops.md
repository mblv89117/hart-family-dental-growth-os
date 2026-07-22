# Reliability, Security & Incident Basics

## Uptime monitoring (recommended free)

- UptimeRobot or Better Stack HTTP check every 5 min on `https://hfdds.net/` and `https://hfdds.net/api/leads` (HEAD/GET).  
- Alert email: Ryan + Lindsay (Wendy optional).

## Error / form failure alerts

- Vercel → Project → Logs / Runtime logs for `/api/leads` 5xx.  
- Optional: set `LEAD_WEBHOOK_URL` to a Zapier/Make “on failure” path later.  
- Form UI already shows patient-safe error + phone numbers (no stack traces).

## Domain renewal

| Domain | Registrar | Reminder |
| --- | --- | --- |
| hfdds.net | GoDaddy | Calendar 60/30/7 days before expiry |
| hartfamilydds.com | GoDaddy | Same |
| hartfamilyyv.com / hartfamilydhs.com | GoDaddy | Same |

## Backup / restore

| Asset | Backup | Restore |
| --- | --- | --- |
| Site code | GitHub `main` + release tags | Redeploy tag from Vercel / `git checkout` |
| Lead workbook | Weekly CSV export (Wendy) | Re-import to Sheets/Excel |
| Vercel env | Screenshot names only in release record | Re-add values from password manager |

## Secrets

- Never commit `.env`, Hotmail passwords, or lead JSONL with real patients.  
- `secrets/` is gitignored.  
- Rotate if exposed (see `SECURITY.md`).

## Spam / rate controls

- Honeypot `companyWebsite` on forms.  
- SMS consent required.  
- Consider Vercel WAF / bot protection if abuse appears.

## Least privilege

- Wendy: Hotmail + workbook only.  
- Ryan: Vercel + GitHub.  
- Lindsay: GoDaddy + GBP as needed.

## Production incident checklist

1. Confirm outage (hfdds.net vs Vercel.app).  
2. Check Vercel status + latest deployment.  
3. Rollback deployment if bad release.  
4. If DNS, verify A `@` = `76.76.21.21` and www CNAME.  
5. Notify Wendy (forms down) + Lindsay.  
6. Log in `docs/approvals/approvals-log.md`.  
7. After restore, submit one TEST LEAD and confirm API ok.
