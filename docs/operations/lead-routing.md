# Lead Routing & Response Standards

## Principle

No lead may disappear into an unmonitored inbox. Every lead gets automated confirmation + human follow-up.

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
| Emergency | Location selected | Other office if closed | Immediate call attempt | EMERGENCY |
| Implant consult | Location selected | Clinical coordinator TBD | < 15 min first touch target | PRIORITY |
| Teeth straightening | Location selected | Clinical review queue | < 30 min | PRIORITY |
| New patient general | Location selected | Shared overflow | < 30 min | |
| Financing | Front desk + financing script | | < 30 min | |
| Existing patient | Home office | | Same day | |
| After hours | Auto-ack | Next open location | Next business morning | AFTER-HOURS |

## Location selection rules

1. User-selected office wins when provided  
2. Else phone number / zip / city heuristic  
3. Else “nearest / either office” queue monitored by both desks  
4. Implant or straightening may route to the office with sooner consult capacity (define weekly)

## Required system (Phase 1 minimum)

Until a full CRM is approved, use:

1. Shared mailbox or form destination monitored on-shift  
2. Spreadsheet or simple CRM board: New → Contacted → Booked → Showed → Treatment  
3. Missed-call callback list  
4. Daily end-of-day open-lead review  

Recommended next step: Dental CRM or CallRail/Ring-type tracking + form → SMS alert.

## Response-time standards

| Event | Target |
| --- | --- |
| Web lead auto-confirmation | Immediate |
| Human follow-up (business hours) | As fast as operationally possible; track < 15–30 min |
| Missed call callback | Prompt; same hour when possible |
| Implant leads | Prioritized |
| Emergency | Flagged + immediate |
| Unanswered leads | Multi-touch: call, SMS, email (consented channels) |
| After hours | Acknowledgment + next-business-day follow-up |

## Tracking fields (every lead)

Source · Campaign · Location · Service · Timestamp · First response time · Outcome · Booked appointment datetime · Show / no-show · Consult completed · Treatment presented · Accepted · Cash collected  

Do not treat form submit as revenue.
