# Local build handoff — finish here, move later

## Domains

| Domain | Use now |
| --- | --- |
| localhost | Develop & QA |
| **hfdds.net** | Preferred **first** public host when you cut over |
| hartfamilydds.com | Align / canonical later (currently parked) |
| hartfamilyyv.com / hartfamilydhs.com | 301 funnels later |

## Run locally

```bash
cd "/Volumes/MacMiniPro2TB/Hart Family Dental Marketing OS"
npm run dev
```

Open http://localhost:3000

## What’s included locally

- Full marketing IA (locations, implants, straightening, assessment, financing, legal)
- Lead API → `data/leads/leads.jsonl` (gitignored) + optional `LEAD_WEBHOOK_URL`
- Thank-you confirmation page
- Wendy Delgado named as follow-up owner (both desks)
- Weekend closed hours published; weekday = call to confirm

## Before first move to hfdds.net

1. Confirm weekday hours  
2. Complete service verification checklist  
3. Wire `LEAD_WEBHOOK_URL` or inbox Wendy monitors  
4. Add GA4/GTM IDs  
5. Follow `docs/approvals/dns-cutover-runbook.md` Phase B  

## Do not

- Point DNS until leadership schedules cutover  
- Publish financing partner names until approved  
- Advertise unverified clinical services  
