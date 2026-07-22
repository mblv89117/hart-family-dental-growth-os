# Lead Routing & Response Standards

## Principle

No lead may disappear into an unmonitored inbox. Every lead gets automated confirmation + human follow-up.

## Primary follow-up owner (approved 2026-07-21)

| Role | Name | Scope |
| --- | --- | --- |
| Web-lead / phone follow-up owner | **Wendy Delgado** | **Both** Yucca Valley and Desert Hot Springs desks |

Wendy is the accountable human for responding to new web leads, missed-call callbacks during coverage, and daily open-lead review across both locations. Escalate clinical or capacity questions to Lindsay Hawkins / Dr. Hart as needed.

## Hotmail delivery (approved pattern)

| Preferred office | Notify inbox (public identity) |
| --- | --- |
| Yucca Valley | `hartdentalyv@hotmail.com` |
| Desert Hot Springs | `hartdental02@hotmail.com` |
| Optional CC | `hartdental@gmail.com` via `LEAD_CC_EMAILS` |

Implementation (`website/src/app/api/leads/route.ts`):

1. Append to `data/leads/leads.jsonl` (local / server filesystem; gitignored)  
2. Email primary Hotmail via FormSubmit ajax (no password stored in repo)  
3. Optional Resend email when `RESEND_API_KEY` is set on the host  
4. Optional `LEAD_WEBHOOK_URL` for CRM  

**Never commit Hotmail passwords.** Prefer vaulted host env vars for Resend / SMTP.

## Channels in scope

- Website forms (appointment, implant, straightening assessment, financing, contact)  
- Click-to-call  
- Missed calls  
- Facebook/Instagram lead forms (Phase 2)  
- GBP messages  
- Email / SMS replies  

## Routing matrix

| Lead type | Primary owner | Secondary | SLA (business hours) | Flag |
| --- | --- | --- | --- | --- |
| Emergency | Wendy Delgado (selected location) | Other office if closed | Immediate call attempt | EMERGENCY |
| Implant consult | Wendy Delgado | Lindsay / clinical as needed | < 15 min first touch target | PRIORITY |
| Teeth straightening | Wendy Delgado | Clinical review queue | < 30 min | PRIORITY |
| New patient general | Wendy Delgado | Shared overflow | < 30 min | |
| Financing | Wendy Delgado + financing script | Lindsay | < 30 min | |
| Existing patient | Home office / Wendy | | Same day | |
| After hours | Auto-ack | Wendy next business morning | Next business morning | AFTER-HOURS |

## Location selection rules

1. User-selected office wins when provided  
2. Else phone number / zip / city heuristic  
3. Else “nearest / either office” queue — Wendy monitors both  
4. Implant or straightening may route to the office with sooner consult capacity (define weekly)

## Response-time standards

| Event | Target |
| --- | --- |
| Web lead auto-confirmation | Immediate thank-you page |
| Human follow-up (business hours) | As fast as operationally possible; track < 15–30 min |
| Missed call callback | Prompt; same hour when possible |
| Implant leads | Prioritized |
| Emergency | Flagged + immediate |
| Unanswered leads | Multi-touch: call, SMS, email (consented channels) |
| After hours | Acknowledgment + next-business-day follow-up |

## Tracking fields (every lead)

Source · Campaign · Location · Service · Timestamp · First response time · Owner (Wendy) · Outcome · Booked appointment datetime · Show / no-show · Consult completed · Treatment presented · Accepted · Cash collected  

Do not treat form submit as revenue.

## Hours context for routing

Both offices (Option A approved):

- Monday–Thursday: 8:00 AM – 4:30 PM  
- Friday: 9:00 AM – 2:00 PM  
- Saturday & Sunday: Closed  

After-hours and weekend inquiries → thank-you ack + Wendy follow-up next business day.
