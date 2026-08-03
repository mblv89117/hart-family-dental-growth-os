# Hart Offices data update — conflicts & notes

Source of truth for this pass: `src/lib/locations.ts`, `src/lib/services.ts`, `src/lib/site.ts`
(derived from `Hart Offices.docx`). This file documents conflicts between the source material
and the pre-existing site content, and how each was resolved. No facts were invented to fill
gaps — see the TODO below for the one open item.

## 1. Phone numbers & hours (old "Option A" copy vs. authoritative data)

The site previously used a single generic phone pair — **(760) 365-6595** and **(760) 329-6713**
— on marketing pages (homepage CTAs, `AppointmentForm`, `privacy`, `accessibility`) along with a
generic "Mon–Thu 8:00 AM–4:30 PM, Fri 9:00 AM–2:00 PM" hours line on the thank-you page.

Authoritative data in `locations.ts` gives each office its own number and its own (much more
limited) hours:

- **Desert Hot Springs** — (760) 314-4160 — open **Wednesday only**, 8:00 AM–4:00 PM, last
  patient 3:30 PM.
- **Yucca Valley** — (760) 389-7707 — open **Monday & Tuesday only**, 8:00 AM–4:00 PM, last
  patient 3:30 PM.

All marketing copy, forms, and legal pages now pull phone numbers and hours from
`locations.ts`/`loc.hoursNote` instead of hardcoding the old numbers or a shared hours string.

## 2. Emergency appointments differ by office

The old copy implied a single emergency message. Per authoritative data, **emergency
appointments are only available at Yucca Valley (subject to availability/clinical evaluation)
and are not currently offered at Desert Hot Springs.** Each location has its own
`emergencyNote` string, and `LocationPage`/FAQ copy renders the location-specific note rather
than a shared emergency message. The homepage and thank-you page avoid claiming emergency care
at both offices.

## 3. Insurance is not accepted

Some legacy pages (e.g. `new-patients`) referenced "insurance card if applicable" / "insurance
participation." Per authoritative data, **Hart Family Dental does not currently accept dental
insurance** at either office. Patients pay cash, credit, or debit, with CareCredit financing
available for qualified applicants; Cherry, Sunbit, and a membership plan are in development
("coming soon" only — not to be presented as currently available). Pages referencing insurance
now use `insurancePublicNote` from `locations.ts` and never claim insurance is accepted or that
financing approval is guaranteed.

## 4. Cosmetic dentistry — listed in location summary, absent from service taxonomy

The original Hart Offices location summary briefly mentions cosmetic dentistry, but the
detailed, authoritative service taxonomy (`serviceCategories` / `services` in `services.ts`)
has **no cosmetic dentistry category or service**. Per instructions, we did **not** recreate a
cosmetic dentistry page. The legacy `/cosmetic-dentistry` route 301-redirects to
`/services/general-dentistry` (see `legacyRedirects` in `services.ts`), and no nav/footer link
references cosmetic dentistry.

## 5. Teeth straightening & smile assessment — redirected away

`/teeth-straightening` and `/smile-assessment` are not part of the current service taxonomy and
redirect to `/services/general-dentistry` and `/contact#request` respectively. All nav, footer,
FAQ, and marketing copy referencing "teeth straightening," "smile assessment," or "cosmetic
dentistry" were removed (previously present in `SiteHeader` nav, `faq`, and `new-patients`
copy). `SmileAssessmentForm.tsx` is left in place but unused, per instructions, since its page
was deleted.

## 6. Yucca Valley Google Business Profile — supplied for release

Yucca Valley GBP URL confirmed for production polish release:
`https://share.google/VVNz381E66m6FcbUP`
(Added to `locations.ts` and `data/locations.json`.)

## 7. Obsolete thin marketing pages

Old standalone pages for redirected routes (`/dental-implants`, `/full-mouth-dental-implants`,
`/restorative-dentistry`, `/emergency-dentistry`, `/cosmetic-dentistry`, `/teeth-straightening`,
`/smile-assessment`, `/yucca-valley`, `/desert-hot-springs`) were deleted so the 301 redirects in
`next.config.ts` (sourced from `legacyRedirects`) take effect. `/cash-pay-dentistry` also has a
redirect to `/financing`; because Next.js evaluates `redirects()` before filesystem routes, the
redirect fires regardless of whether a `page.tsx` remains at that path.

## 8. Lead pipeline untouched

`api/leads`, `lead-delivery.ts`, the ops portal, Prisma models, and env-driven config were not
modified. The appointment form's new optional "preferred day/time" field is folded into the
existing `message` field on submit so the public lead payload shape (`name`, `phone`, `email`,
`location`, `service`, `followUp`, `message`, `smsConsent`, `emailConsent`, `formType`) is
unchanged.

## Open item

- None for GBP — Yucca Valley URL added 2026-08-02 for production release.
