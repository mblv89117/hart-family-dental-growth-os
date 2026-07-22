# Campaign Foundation Pack (Launch-Ready / Not Activated)

**Rule:** Do not spend on paid ads until owner approves and tracking IDs + Wendy inbox receipt are verified.

## Shared UTM structure

`utm_source` = google|meta|gbp|email|referral  
`utm_medium` = cpc|organic|social|email  
`utm_campaign` = `{geo}_{offer}` e.g. `yv_implants`, `dhs_aligners`, `both_cashpay`  
`utm_content` = creative id  
Landing always on hfdds.net paths below.

---

## 1) Implants

| Field | Value |
| --- | --- |
| Target | Adults missing teeth / denture dissatisfaction |
| Offer concept | Implant consultation (educational — no invented price) |
| Landing | `/dental-implants` (+ `/full-mouth-dental-implants`) |
| CTA | Request consult / Call office |
| Sample search keywords | dental implants Yucca Valley; implants Desert Hot Springs; full mouth implants near me |
| Negatives | DIY, free implants, cheap implants guarantee, training, jobs |
| Tracking | form_submit_success · phone_click · utm_campaign=*_implants |
| Follow-up | Wendy implant script · Priority SLA |
| Compliance | No guaranteed results; candidacy after exam |
| Success metric | Consults booked / showed (not form fills alone) |

## 2) Clear-aligner kits (dentist-supervised)

| Field | Value |
| --- | --- |
| Target | Adults wanting straighter teeth without DIY brands |
| Offer concept | Preliminary smile assessment → dentist-supervised plan; mail or office pickup when appropriate |
| Landing | `/teeth-straightening` · `/smile-assessment` |
| CTA | Start assessment / Book records visit |
| Keywords | clear aligners Yucca Valley; dentist supervised aligners Desert Hot Springs |
| Negatives | SmileDirect, at-home only, no dentist, guaranteed straight teeth |
| Tracking | form_start/submit smile-assessment |
| Follow-up | Wendy aligner script — emphasize not DIY |
| Compliance | No automated diagnosis/approval |
| Success metric | Assessment → records appointment → dentist review |

## 3) Cash-pay dentistry

| Field | Value |
| --- | --- |
| Target | Uninsured / preferring cash pathways |
| Offer concept | Clear next steps; financing education later when partners approved |
| Landing | `/cash-pay-dentistry` |
| CTA | Request cash-pay consult |
| Keywords | cash pay dentist Yucca Valley; dentist without insurance Desert Hot Springs |
| Negatives | free dental, $49 exam (unless approved offer), Medicaid legal advice |
| Tracking | form_submit · phone_click |
| Follow-up | Cash-pay script |
| Compliance | No fabricated fees |
| Success metric | New patient exams booked |

## 4) Higher-value restorative / cosmetic

| Field | Value |
| --- | --- |
| Target | Crowns, bridges, veneers, smile refresh |
| Landing | `/restorative-dentistry` · `/cosmetic-dentistry` |
| CTA | Request visit |
| Keywords | veneers Desert Hot Springs; crowns Yucca Valley |
| Negatives | Hollywood smile guarantee |
| Tracking | form_submit |
| Follow-up | Standard new-patient + service note |
| Success metric | Treatment presentations accepted |

## 5–6) Geo campaigns

| Geo | Primary landing | Campaign suffix |
| --- | --- | --- |
| Yucca Valley | `/yucca-valley` | `_yv` |
| Desert Hot Springs | `/desert-hot-springs` | `_dhs` |

Use geo landing + service deep link when promoting a specific service.

## Recommended first campaign to launch (after tracking + inbox confirm)

**Yucca Valley + Desert Hot Springs implant consult education** (organic GBP posts + Search — paid only with explicit approval).
