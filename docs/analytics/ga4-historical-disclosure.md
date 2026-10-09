# GA4 historical disclosure — patient-entered fields

Checked 2026-10-09 from repository history and from the HTML of retained Vercel deployments. This is an owner checklist. No deletion request was submitted, and no GA4 setting was changed.

Measurement id on the live site and on the retained production deployments below: `G-VPNLPP3BMV`.

The privacy fix on this pull request (thank-you URL carries the office id only; event parameters are allowlisted; page views drop sensitive query keys) is not what production is running. Production still collects the values described here until a deployment that contains the fix is promoted.

## What the code could send

Two paths could put a patient-selected service name into GA4. Name, phone, email, and the free-text message were not on either path.

### 1. `page_location` on the thank-you page

From commit `0b30c68` (2026-07-21 17:06:42 -0700) through the code that production is still running, a successful appointment form did:

`/thank-you?location=<office id>&service=<selected service>`

GA4 was configured with `send_page_view: true` (and, on the 2026-07-28 production build, `gtag('config', id)` with the default, which also sends the page view). The automatic page view sends the full browser URL as `page_location`, so the `service` query value is in that hit.

`location` in that query is the office id (`yucca-valley` or `desert-hot-springs`), not a clinical note.

The site did not put `name`, `phone`, `email`, `message`, `preferredDayTime`, `smsConsent`, or `emailConsent` into that URL. Those fields were posted to `POST /api/leads` only. A `phone_click` event sent the `tel:` href of the control the visitor clicked. That href is a published CallRail office number, not the number the visitor typed into the form.

### 2. Event parameter `service` on `form_submit_success`

From commit `e75334a` (2026-07-21 19:54:03 -0700) onward, `trackEvent("form_submit_success", …)` included `formType`, `location`, and `service`. `gtag('event', …)` forwards that object when the GA script is loaded. The same three fields would also go to a Meta pixel if `fbq` were present. Production HTML checked on 2026-10-08 and 2026-10-09 did not include a Meta pixel, GTM, or Clarity.

`0b30c68` built the thank-you URL and did not call `trackEvent` on success.

## Service strings that could appear

Appointment dropdown, `e75334a` through the 2026-08-02 refresh (`58748dc`), including the 2026-07-28 production deployment:

- New patient visit
- Dental implants
- Full-mouth implants
- Teeth straightening assessment
- Emergency / tooth pain
- Cosmetic dentistry
- Restorative dentistry
- Cash-pay consult
- Financing information
- Other

From `58748dc` (2026-08-02 19:01:38 -0700) through current production, the dropdown is:

- New patient visit
- Tooth pain / broken tooth
- General dentistry
- Restorative dentistry
- Dental crowns or bridges
- Dentures or denture repair
- Dental implants
- Implant consultation
- Technology / imaging question
- Financing information
- Other

Service pages also preselect `defaultService` with that page’s service title, so a thank-you hit can carry the title of the page the visitor submitted from, not only a dropdown label. “Other” does not put the typed message into GA. The message stays on the lead post.

### Smile assessment, July 28 production only

`website/src/app/smile-assessment/page.tsx` existed from `0b30c68` and was removed from routing in `58748dc`. The July 28 production deployment still serves that page. The August 3 production deployment and the live site redirect `/smile-assessment` to `/contact#request`.

While that page was the live route, a successful submit sent service `Teeth straightening assessment` both in the thank-you query and, after `e75334a`, on `form_submit_success`. The form also collected `goals`, `priorOrtho`, `dentalVisit`, and `concerns`. Those four fields were in the lead post. They were not event parameters and they were not added to the thank-you URL.

## Since when GA4 could have received it

The GA script is rendered only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set at build time. The production release record dated 2026-07-21 lists that variable as not set. The earliest retained production HTML that includes `G-VPNLPP3BMV` is:

| Field | Value |
| --- | --- |
| GitHub deployment | `5642283799` |
| Created | 2026-07-28T15:05:46Z |
| Commit | `b70c233` |
| URL | `https://hart-family-dental-2s1lvqn1v-high-value-capital-group.vercel.app` |
| HTML deployment id | `dpl_FeWyfiKd2vr1h3xTcjGZXvifQMRD` |
| `/smile-assessment` on 2026-10-09 | HTTP 200, title “Preliminary Smile Assessment” |

A later same-day production deployment (`5643434417`, `55e89fb`, `https://hart-family-dental-jmxl5b9pt-high-value-capital-group.vercel.app`, `dpl_EPyyjXLnw1WSzPRHSSMrirMZriYc`) also includes the measurement id.

The id is still in the live HTML (`dpl_BTQza7SdDCqpzToPxQSUdzSNtbZF`), and that deployment’s appointment form still appends `service` to `/thank-you` with `send_page_view: true`. Collection of these values is ongoing. It is not limited to a closed historical window.

Code could build the thank-you URL from 2026-07-21. There is no retained production HTML from before 2026-07-28T15:05:46Z that includes the measurement id, and the July 21 release record says the id was unset. Do not treat 2026-07-21 through 2026-07-28 as a confirmed GA4 collection period.

## Owner checklist

Do this in the GA4 property that owns data stream `G-VPNLPP3BMV`. Editor role is required for a deletion request. No one should schedule the deletion until the preview of its effect is acceptable. This repository cannot see the property timezone, custom-dimension list, or BigQuery link.

### 1. Stop new collection

Promote a production deployment that contains this pull request’s analytics change. Redaction in the next step does not apply to hits already stored, and the deployment on `hfdds.net` today still sends the thank-you query. Promoting the 2026-08-03 deployment documented in `docs/operations/vercel-deploy-and-rollback.md` removes the unsigned implant prices and does not stop this collection.

### 2. Turn on URL query-parameter redaction

This affects hits collected after the setting is saved. It does not delete history.

1. Admin → Data collection and modification → Data streams → the web stream for `G-VPNLPP3BMV`.
2. Events → Redact data.
3. Turn on **URL query parameters**. Add each key, then press Enter. Matching is case-insensitive. Keys cannot contain commas.

   `service`, `name`, `email`, `phone`, `message`, `goals`, `concerns`, `patient`, `transcript`, `treatment`, `appointment`, `preferreddaytime`, `smsconsent`, `emailconsent`, `companywebsite`, `priorortho`, `dentalvisit`

4. Turn on email redaction as well, so an email-shaped value in any event parameter is stripped even when the query key is not in the list.
5. Use **Preview redacted data** with a sample such as `https://hfdds.net/thank-you?location=yucca-valley&service=Tooth%20pain%20%2F%20broken%20tooth&email=patient@example.com` and confirm `service` and `email` are removed before saving.

Source for the control: [GA4 data redaction](https://support.google.com/analytics/answer/13544947).

### 3. Request deletion of the affected values

GA4 data deletion erases parameter text and replaces it with `(data deleted)`. The event remains in totals. Data must be more than 12 days old before deletion finishes. The first 7 days are a grace period during which an Editor can cancel. A request can take 7 to 63 days. Deletion is not reversible once it completes. Source: [Data-deletion requests](https://support.google.com/analytics/answer/9940393).

`page_location` is an automatically collected parameter. The help page says auto-collected parameters can be deleted only with **Delete all parameters on all events**. That option deletes every registered and auto-collected parameter in the date range, not only `page_location`. Do not schedule it unless that blast radius is accepted. There is no documented request type that deletes only `page_location` values containing a query string.

The custom event parameter `service` is narrower, and only if it was registered as a custom dimension. If it was never registered, it will not appear in the selective list, and registering it now does not make the old unregistered values selectable.

Suggested requests, property timezone, start no earlier than 2026-07-28 and end on the date the fixed deployment is actually serving traffic:

1. **Custom parameter, if `service` is registered.** Schedule data deletion request → **Delete selected parameters on selected events** → event `form_submit_success` → parameter `service`. Leave the “contains” box empty so every value of that parameter on that event is removed, including the service names listed above. If the parameter is missing from the list, do not invent a registration to force it; record that the selective request was unavailable.
2. **`page_location`, only with eyes open.** If the owner accepts deletion of all parameter text for the range, schedule **Delete all parameters on all events** for that same start and end. The values that motivated the request are `page_location` strings containing `/thank-you` and the query parameter `service` (both `https://hfdds.net` and `https://www.hfdds.net`, and the `*.vercel.app` hosts that served production). Office id `location` is in the same URL and would be removed with the rest of the parameters. During the 7-day preview, confirm reports still make sense, then let it proceed or cancel it.
3. If a BigQuery export or a roll-up property exists, this request does not clear those copies. A roll-up needs its own request. Subproperties follow the source property.
4. Conversion and attribution reports that use a deleted field can lose the date range covered by the request. Read that section of the help page before scheduling.

Public service URLs such as `/services/dental-implants` are marketing pages, not the form payload. They are not the target of this request.
