# Domain & Website Strategy

## Decision

Use **hartfamilydds.com** as the single authoritative website.  
Use **hartfamilyyv.com** and **hartfamilydhs.com** as location funnel domains with **301 redirects** to canonical location pages.

| Domain | Role | Canonical target |
| --- | --- | --- |
| hartfamilydds.com | Brand + SEO authority | Self |
| hartfamilyyv.com | YV campaign / Maps link helper | https://hartfamilydds.com/yucca-valley |
| hartfamilydhs.com | DHS campaign / Maps link helper | https://hartfamilydds.com/desert-hot-springs |

## Why not two full websites

- Duplicate content splits ranking signals  
- Double maintenance cost  
- Confusing reviews / NAP if pages diverge  
- Ads and GBP should land on dedicated, fast location or service pages on one domain

## When a separate landing domain is justified

Only if A/B testing paid traffic where a ultra-lean campaign LP outperforms — still `noindex` or canonicalize carefully, and never compete for organic “dentist Yucca Valley” queries with a second full site.

## Information architecture (Phase 1)

```
/                         Homepage
/yucca-valley             Location
/desert-hot-springs       Location
/dental-implants          Service
/full-mouth-dental-implants
/teeth-straightening      Dentist-supervised program
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

## DNS cutover checklist (requires approval)

1. Backup current GoDaddy DNS screenshots  
2. Provision hosting (Vercel / Netlify / approved host)  
3. Point hartfamilydds.com A/CNAME to host; remove park lander  
4. Add 301s for location domains  
5. Update GBP website URLs to location pages  
6. Submit sitemap in Search Console  
7. Verify call tracking numbers if used (display NAP consistency plan)

## Current state (2026-07-21)

- hartfamilydds.com → GoDaddy `parkweb` lander  
- Location domains → no A records observed  
- Website builder contact: Ryan Blakeslee; Mason referenced by Harry Hart
