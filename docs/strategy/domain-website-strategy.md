# Domain & Website Strategy

## Decision

| Domain | Role | Status |
| --- | --- | --- |
| **hartfamilydds.com** | Long-term SEO / brand authority (planned canonical) | Parked GoDaddy lander |
| **hfdds.net** | **Interim deploy / short domain** (purchased GoDaddy 2026-07-21) | Parked; use for first live move when ready |
| hartfamilyyv.com | YV funnel → location page | No DNS / deferred with cutover |
| hartfamilydhs.com | DHS funnel → location page | No DNS / deferred with cutover |

### Working plan (local-first)

1. **Finish the site and Growth OS locally** in this repo.  
2. When ready to move: deploy the Next.js app to hosting and point **`hfdds.net`** first (shorter, newly purchased, easier test cutover).  
3. Later: point **`hartfamilydds.com`** at the same app (or 301 → hfdds.net temporarily), then choose one **canonical** host for Search Console / GBP to avoid duplicate content.  
4. Location domains 301 → `/yucca-valley` and `/desert-hot-springs` on the canonical host.

**Do not run two full competing websites** on hartfamilydds.com and hfdds.net with different content.

Until cutover is scheduled: leave all domains on park/DNS as-is; develop against `localhost`.

## Why not two full websites

- Duplicate content splits ranking signals  
- Double maintenance cost  
- Confusing reviews / NAP if pages diverge  
- Ads and GBP should land on dedicated, fast location or service pages on one domain

## When a separate landing domain is justified

Only if A/B testing paid traffic where an ultra-lean campaign LP outperforms — still `noindex` or canonicalize carefully, and never compete for organic “dentist Yucca Valley” queries with a second full site.

## Information architecture (Phase 1)

```
/                         Homepage
/yucca-valley             Location
/desert-hot-springs       Location
/dental-implants          Service
/full-mouth-dental-implants
/teeth-straightening      Dentist-supervised program
/smile-assessment         Preliminary assessment (not a diagnosis)
/cosmetic-dentistry
/restorative-dentistry
/emergency-dentistry
/financing
/new-patients
/about
/providers
/reviews
/faq
/contact
/thank-you
/privacy
/terms
/disclaimer
/accessibility
```

## Technical requirements at launch

- Mobile-first, Core Web Vitals green targets  
- Click-to-call with location-aware phone numbers  
- Appointment request forms with location + service routing  
- GA4 + Google Tag Manager  
- LocalBusiness / Dentist / FAQ / Breadcrumb schema  
- Unique title/meta per page; no doorway keyword stuffing  
- HTTPS, privacy/SMS/email consent language  
- Accessibility statement + WCAG-minded forms/contrast  

## DNS cutover checklist (requires approval — deferred)

See `docs/approvals/dns-cutover-runbook.md`. Preferred first host: **hfdds.net**, then hartfamilydds.com alignment.

## Current state (2026-07-21)

- hartfamilydds.com → GoDaddy parkweb lander  
- **hfdds.net → GoDaddy parkweb lander (purchased; same parking IPs)**  
- Location domains → incomplete DNS; deferred  
- Website builder contact: Ryan Blakeslee; Mason referenced by Harry Hart  
- Lead follow-up owner: Wendy Delgado (both desks)
