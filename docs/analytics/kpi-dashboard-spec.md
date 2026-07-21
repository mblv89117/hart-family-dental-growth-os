# KPI Dashboard Specification

## Funnel stages (never conflate)

1. **Leads** — form, call, chat, assessment  
2. **Appointments booked**  
3. **Consultations / visits completed**  
4. **Treatment accepted**  
5. **Cash collected / revenue**

A form submission is **not** revenue.

## Metrics

| Metric | Definition | Slice by |
| --- | --- | --- |
| Sessions / users | GA4 | Source, page, location page |
| Calls / missed calls | Call tracking | Location, campaign |
| Form submits | GTM events | Form type, location, service |
| Smile assessments | Form | Location |
| Implant leads | Tagged | Location, campaign |
| Straightening leads | Tagged | Location |
| Booked appointments | PMS / CRM | Location, service, source |
| Completed consults | PMS | |
| Treatment presented / accepted | PMS | |
| Cash collected | PMS / accounting | |
| CPL / cost per booked / per consult / per accepted case | Ads + CRM | Campaign |
| ROAS | Revenue ÷ ad spend | Campaign |
| Maps rank | Manual / tool | Keyword, location |
| Review count & rating | GBP/Yelp | Location |
| Lead response time | CRM timestamps | Location, source |
| Front-desk conversion % | Leads→booked | Location, script |

## Executive view

Weekly one-pager: leads, booked, showed, accepted, collected, spend, CPA, top issues (response time, missed calls, ranking).

## Implementation plan

Phase 1: GA4 + GTM + spreadsheet CRM  
Phase 2: Call tracking + ad platforms  
Phase 3: Looker Studio / dashboard connected to PMS exports
