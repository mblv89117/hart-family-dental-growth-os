# Organic marketing workflow — Hart Family Dental

**Mission:** HFD-AUTONOMOUS-MARKETING-PRODUCTION-2026  
**Owner:** Manuel Barela, High Value Capital Group  
**Clinical approver:** Dr. Harry Allen Hart, DDS  
**Status:** Planning only. Nothing in this file is approved to publish, post, or advertise.

Every educational paragraph, Google Business Profile post, and review request below is a draft. Dr. Hart must approve the clinical wording before it goes on the website, GBP, Facebook, or Yelp. Do not invent reviews, testimonials, before-and-after photos, guarantees, prices, or credentials.

## Facts this workflow is allowed to use

| Office | Address | Hours | Last appointment | Phone (CallRail) | Lead email |
| --- | --- | --- | --- | --- | --- |
| Yucca Valley | 56728 Twentynine Palms Highway, Yucca Valley, CA 92284 | Monday and Tuesday, 8:00 AM–4:00 PM | 3:30 PM | (760) 389-7707 | hartdentalyv@hotmail.com |
| Desert Hot Springs | 11523 Palm Drive, Desert Hot Springs, CA 92240 | Wednesday, 8:00 AM–4:00 PM | 3:30 PM | (760) 314-4160 | hartdental02@hotmail.com |

Services the owner listed for this mission: general/family dentistry, emergency care, restorative care, dentures and repair, implants, CBCT 3D imaging, digital impressions.

Already on the site and consistent with those facts: both location pages, general dentistry, restorative dentistry, dentures (including repair), implants, and the technology page for CBCT and digital impressions. Emergency visits are described as possibly available in Yucca Valley and not available in Desert Hot Springs. That distinction must stay.

The site also lists more specific procedures (bridges, extractions, inlays, onlays, full-mouth reconstruction, bone grafting, immediate and implant-supported dentures, and similar). Those pages cite the internal Hart Offices document. They were not restated in this mission’s verified list. Leave them up, and have Dr. Hart confirm they are still offered before any new article features them.

Do not add orthodontics, clear aligners, or a smile-assessment offer. `/teeth-straightening` and `/smile-assessment` already redirect away from that topic. An unused `SmileAssessmentForm` component remains in the repo and is not on a public page.

Payment language already on the site: cash, credit, debit, and CareCredit for qualified applicants. Cherry, Sunbit, and a membership plan are described as not yet available. Insurance is described as not accepted. Do not publish a new financing or insurance claim. Dr. Hart should confirm CareCredit is still active; if it is not, the financing page needs a follow-up edit.

The live implants page on production currently shows a “$999 Implant + PMMA Flex Crown” fee (and related fees) from the unmerged branch `feature/implant-offer-disclosures`. That price is not in the verified fact list for this mission, and `docs/approvals/offers-for-approval.md` still says offers need a signature. `main` and this branch do not contain that copy. The deployment that is serving it, and the 2026-08-03 production deployment that does not, are in `docs/operations/vercel-deploy-and-rollback.md`.

## Local SEO plan

Work in this order. Each step uses the NAP and hours above. Do not create extra city doorway pages.

1. **Google Business Profile, one profile per office.** Confirm the name, address, phone, and hours match the table. Yucca Valley is closed Wednesday through Sunday. Desert Hot Springs is open Wednesday only. Use the CallRail numbers, not the older (760) 365-6595 / (760) 329-6713 numbers.
2. **Website as the website field.** Canonical host is `https://hfdds.net`. Location URLs:
   - `https://hfdds.net/locations/yucca-valley`
   - `https://hfdds.net/locations/desert-hot-springs`
   `www.hfdds.net` should 301 to the apex after this branch is deployed. Do not list both as separate websites.
3. **Categories.** Primary category should stay Dentist unless Dr. Hart chooses a more specific primary category he actually practices. Do not add Orthodontist.
4. **Services on GBP.** Add only services Dr. Hart confirms. Start from the mission list. Do not paste the unapproved $999 fee into GBP services or posts.
5. **Photos.** Exterior, interior, and team photos taken at that office. No patient photos and no before-and-after photos without a written authorization already on file. This workflow does not supply those photos.
6. **Citations.** When a directory is claimed, make the name, address, phone, and hours match the table. Facebook pages already linked from the footer: `hartfamilydentalyv` and `hartfamilydentaldhs`. Yelp URLs are already on the location pages.
7. **Search Console.** Property `https://hfdds.net`, sitemap `https://hfdds.net/sitemap.xml`. Inspect both location URLs after the next production deploy.
8. **On-site.** Location pages already expose Dentist / LocalBusiness schema with the address, CallRail phone, and the open days only. Keep internal links from each location page to the service categories, and from service pages back to both offices.

Measure monthly: GBP calls, website clicks, direction requests, form leads by `location`, and booked visits reported by the front desk. A form submit is not a booked visit.

## Educational topics

These are topics only. Do not publish the sentences below as finished clinical articles. Dr. Hart edits or rejects each one. None of them states a price, a guarantee, or a result.

| Draft id | Topic | Office note | Where it could live after approval |
| --- | --- | --- | --- |
| EDU-01 | What to expect at a new-patient visit | Both offices. Mention the open days. | `/new-patients` or a future article |
| EDU-02 | What to do the day a tooth breaks or hurts | Call the open office. Yucca Valley may see emergencies; Desert Hot Springs does not schedule emergency visits. Call 911 for a medical emergency. | `/services/tooth-pain-broken-teeth` |
| EDU-03 | How a crown or bridge is evaluated | Restorative page. No lifespan promise. | `/services/restorative-dentistry` |
| EDU-04 | Denture adjustment and repair | Both offices. A repair visit is still an exam, not a same-day promise. | `/services/dentures` |
| EDU-05 | What an implant consultation decides | Candidacy after an exam. No success rate. | `/services/dental-implants` |
| EDU-06 | Why a 3D CBCT scan is sometimes used | Technology page. Not every visit includes one. | `/services/technology` |
| EDU-07 | What a digital impression is | Scanner instead of a traditional tray for some restorations. Dr. Hart confirms when it is used. | `/services/digital-impressions` |
| EDU-08 | How payment works here | Cash, card, debit. CareCredit only if he confirms it is still offered. No insurance claim. | `/financing` |

Do not draft topics on braces, aligners, whitening packages, or sedation unless Dr. Hart adds them to the confirmed service list.

## Google Business Profile post drafts

Post from the Google Business Profile manager for that office, not from this repo. One office per post so the hours and phone are not mixed. Dr. Hart approves the text first. Suggested cadence is twice a month per office, only while that office is open that week. Do not boost these as ads from this document.

**YV-POST-01 (draft)**  
Hart Family Dental in Yucca Valley is open Monday and Tuesday, 8:00 AM to 4:00 PM. The last appointment is typically 3:30 PM. Call (760) 389-7707 or request a visit at hfdds.net/locations/yucca-valley. New patients are welcome. Requesting a visit online does not confirm a time.

**YV-POST-02 (draft)**  
Lost a crown or have a broken tooth? Call our Yucca Valley office at (760) 389-7707 on Monday or Tuesday. We will help you find the soonest appropriate visit. Emergency visits depend on the schedule and an evaluation. For a life-threatening emergency, call 911.

**DHS-POST-01 (draft)**  
Hart Family Dental in Desert Hot Springs is open Wednesday, 8:00 AM to 4:00 PM, at 11523 Palm Drive. The last appointment is typically 3:30 PM. Call (760) 314-4160. We are closed the other days of the week.

**DHS-POST-02 (draft)**  
Questions about dentures or an implant consultation can start with a visit to our Desert Hot Springs office on Wednesday. Call (760) 314-4160. Treatment recommendations come after an exam. This post is not a diagnosis.

Do not attach a price, a star rating, or a patient quote to these posts.

## Review requests

The site does not display testimonials. Location pages and `/reviews` link to the Google and Yelp profiles already stored for each office. Those links are shortcuts, not reviews written by us.

Staff process, after Dr. Hart agrees:

1. Ask only after a completed visit, in person or with a follow-up the patient already consented to.
2. Ask every patient you would ask, not only people who seemed pleased.
3. Hand them the Google link for the office they visited. Do not offer a discount, gift card, or contest entry.
4. Do not write the review, stand over the patient while they write it, or ask them to mention a diagnosis.
5. If someone is unhappy, invite them to call the office. Do not pressure them to change a public review.
6. Replies on Google, if the office posts them, thank the person without confirming that they are a patient and without clinical detail.

Wendy Delgado is the current follow-up owner named on the site for both desks. She can own the weekly check for new reviews. Dr. Hart still approves any reply that mentions care.

## What this workflow does not authorize

- Merging to production, DNS changes, or edits inside Google, Yelp, or Facebook accounts.
- Turning on Growth OS, the ops portal, Open Dental, or outbound texting.
- Publishing the $999 implant fee, Cherry, Sunbit, or an insurance participation claim.
- Generating sample reviews “for layout.”
