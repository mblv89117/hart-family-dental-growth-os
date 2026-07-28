# Data Flow and PHI Map

**Honest framing:** After Phase 0–4, Growth OS stores **lead and contact PII** in PostgreSQL. When patient links / appointment mirrors connect to Open Dental identifiers, data should be treated as **PHI** under HIPAA for production planning. Mock OD data is synthetic.

## Systems

| System | PHI class today | Notes |
| --- | --- | --- |
| Public marketing site | Transient form input | Posted to `/api/leads` |
| PostgreSQL (Growth OS) | **PII → potential PHI** | Leads, contacts, messages, patient links, appointment mirrors |
| Legacy `data/leads/leads.jsonl` | PII if written | Pre-platform local append may still occur via existing delivery path |
| Lead email adapters (SMTP/Resend/FormSubmit) | PII in email body | Existing marketing notify path |
| Mock Open Dental | Synthetic | In-process memory |
| Remote Open Dental | PHI (when enabled) | Not credentialed yet |
| Mock messaging providers | Synthetic | Worker staff notify / outbound stubs |
| Analytics (GA4/GTM) | Must stay non-PHI | IDs unset; do not send clinical fields |
| Ops portal | Displays PII | Staff-authenticated |

## Primary flows

### 1. Public lead ingest

```
Browser form
  → POST /api/leads
  → ingestPublicLead (validate, honeypot, SMS consent required)
  → Postgres transaction:
       Contact, Conversation, Lead, LeadAttribution,
       OutboxEvent(lead.created), DomainEvent, FrontDeskTask,
       inbound Message preview
  → ConsentRecord (sms / optional email)
  → AuditLog(lead.created)
  → Existing notify adapters (email/webhook) — parallel marketing path
  → Worker: outbox → Job(lead.notify_staff) → mock staff notify
```

**Fields commonly stored:** name, phone, email, location, service interest, message, UTM/click IDs, consent flags, IP (on consent), user agent.

### 2. Ops review (Lead 360)

```
Staff session → /ops/inbox → /ops/leads/[id]
  → Lead + tasks + conversation + consents + links (as implemented in UI)
```

### 3. Patient matching (staff / system)

```
Lead → OpenDentalGateway.findPatientCandidates
  → PatientLink state machine (UNLINKED / MANUAL_REVIEW / LINKED / …)
```

Name-only matches **do not** auto-link.

### 4. Supervised mock booking

```
Staff → listEligibleSlots → OfferedSlot rows
  → bookOfferedSlot → AppointmentOperation
  → gateway.createAppointment (mock)
  → AppointmentMirror
  → confirmation Message (draft unless outbound enabled)
  → Lead status booked + nurtureStopped
```

### 5. Outbound (gated; mostly inactive)

```
Job(outbound.message)
  → assertAutomationMayRun
  → checkOutboundAllowed (suppressions)
  → mock sms/email provider
```

Default env prevents real external patient messaging.

## Data stores (Prisma) — sensitivity

| Model | Sensitivity | Contains |
| --- | --- | --- |
| Lead / LeadAttribution | High | Identity + marketing attribution |
| Contact | High | Name, email, phone |
| ConsentRecord / SuppressionRecord | High | Channel consent / opt-out |
| Message | High | Preview / hashes; bodies minimized |
| FrontDeskTask | Medium–High | Titles/descriptions may include names |
| PatientLink | PHI when linked | PatNum, candidates JSON |
| AppointmentMirror / OfferedSlot / AppointmentOperation | PHI when linked | Times, external AptNum |
| Session / User | Medium | Auth material (hashes only for passwords/tokens) |
| AuditLog | Medium | Actions; must stay “safe” payloads |
| Job / OutboxEvent / DomainEvent | Medium–High | Payload may include lead IDs |

## What must never happen

- Sending chart notes or diagnoses into GA4/GTM or ad pixels.  
- Committing `.env` with real OD keys or patient dumps.  
- Logging raw `Authorization: ODFHIR …` or SMS bodies.  
- Telling a patient they are booked when status is `pending_confirmation` or `ambiguous`.

## Retention (policy TBD)

Engineering defaults do not auto-purge. Admin must set retention before production; track in `ADMIN_INFORMATION_REQUEST.md` and `PRODUCTION_COMPLIANCE_CHECKLIST.md`.
