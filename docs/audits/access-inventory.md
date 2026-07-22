# Platform Access Inventory

**Status:** Password rotation **confirmed complete** (2026-07-21)  
**Last updated:** 2026-07-21  
**Owner:** Growth OS Agent + Lindsay Hawkins  
**Lead follow-up:** Wendy Delgado (both desks)

> Passwords are intentionally omitted. Use the practice password manager only.

## Security status

| Item | Status |
| --- | --- |
| Credential rotation (from June 2025 email exposure) | **Complete** (leadership confirmed) |
| Store credentials in repo / chat | **Forbidden** |
| 2FA | Required on all accounts — verify enabled during first login audits |
| DNS / live GBP edits | Allowed only with change log; DNS cutover **deferred** |

## Accounts

| Platform | Purpose | Login identity (public) | Admin holder | 2FA | Status |
| --- | --- | --- | --- | --- | --- |
| Google Business Profile (both offices) | Local SEO / Maps | `hartdental@gmail.com` | Lindsay / Harry | Required | Rotation done; audit next |
| Yelp — Yucca Valley | Reviews / listing | `hartdentalyv@hotmail.com` | TBD | Required | Rotation done; audit next |
| Yelp — Desert Hot Springs | Reviews / listing | `hartdental02@hotmail.com` | TBD | Required | Rotation done; audit next |
| Facebook (practice + linked personal) | Social / ads later | `hartdentalyv@hotmail.com` | TBD | Required | Rotation done; structure TBD |
| Email Gmail | Shared ops | `hartdental@gmail.com` | Lindsay / Harry | Required | Active |
| Email Hotmail YV | Office + social | `hartdentalyv@hotmail.com` | TBD | Required | Active |
| Email Hotmail DHS | Office + social | `hartdental02@hotmail.com` | TBD | Required | Active |
| GoDaddy — hfdds.net | Interim / first deploy domain | TBD | Lindsay / Ryan | Required | Purchased; parked; cutover deferred |
| GoDaddy — hartfamilydds.com | Long-term SEO domain | TBD | Ryan / Mason / Lindsay | Required | Parked lander; cutover deferred |
| GoDaddy — hartfamilyyv.com | YV funnel domain | TBD | TBD | Required | Cutover deferred |
| GoDaddy — hartfamilydhs.com | DHS funnel domain | TBD | TBD | Required | Cutover deferred |
| GitHub `mblv89117/hart-family-dental-growth-os` | Growth OS source | GitHub user | Growth agent | Required | Foundation pushed |
| Instagram | Social (to create) | Use office hotmails per Harry Hart note | TBD | Required | Not created yet |
| Call tracking / analytics | Measurement | TBD | TBD | Required | Not provisioned |
| CRM / lead inbox | Lead routing | TBD | **Wendy Delgado** | Required | Owner named; system TBD |

## New-account rule (from Harry Hart)

If creating Instagram or similar: use the hotmails for the corresponding offices — not personal accounts.

## Live-change gate

Before live GBP, ads, or social publishing:

1. ~~Passwords rotated and vaulted~~ **Done**  
2. Access verified on login (2FA check)  
3. Change log entry in `docs/approvals/`  

DNS cutover remains **deferred** until leadership schedules it.
