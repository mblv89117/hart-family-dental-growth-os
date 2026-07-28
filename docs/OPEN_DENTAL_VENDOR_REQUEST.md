# Open Dental Vendor Request

**Purpose:** Checklist for requesting API access, credentials, and contracting from Open Dental / the practice’s IT so Growth OS can move from **mock** to **remote (read-first)**.

**Current state:** No production Open Dental credentials are in this repo. `OPEN_DENTAL_MODE=mock`. Remote client is code-complete as a scaffold only.

## Ask the vendor / practice IT for

### 1. API program enrollment

- [ ] Confirm Hart Family Dental offices are eligible for Open Dental API (FHIR / ODFHIR) access.
- [ ] Identify developer account owner (practice vs corporate).
- [ ] Obtain **Developer Key** issuance process and rotation policy.
- [ ] Obtain per-customer **Customer Key**(s) for each database/connection.

### 2. Topology confirmation (critical)

Hart has two locations. We need an authoritative answer:

| Option | Meaning | Seeded support in code |
| --- | --- | --- |
| A — Shared DB + Clinics | One OD database; ClinicNum distinguishes YV vs DHS | `shared-clinics` |
| B — Separate databases | One connection/credentials per office | `yv-separate`, `dhs-separate` |

- [ ] Document which option is live today.
- [ ] List ClinicNum / office identifiers for each location.
- [ ] List provider and operatory IDs that may be used for new-patient exam booking (later phase).

### 3. Environment & networking

- [ ] Base URL for API (cloud vs eConnector / on-prem proxy).
- [ ] IP allowlisting requirements for our worker + app egress.
- [ ] TLS requirements; mutual TLS if any.
- [ ] Rate limits and Retry-After behavior.
- [ ] Recommended timeout values (we default to 15s).

### 4. Permissions / capability matrix

Request explicit permission for **read** first:

- [ ] Clinics, providers, operatories  
- [ ] Patients (search by name/phone/email/DOB)  
- [ ] Appointments (list/get)  
- [ ] Schedules / available slots (exact endpoint names as shipped)  
- [ ] Recalls / CommLogs (optional later)

Defer write permissions until supervised booking is approved:

- [ ] Create / update / confirm appointment  
- [ ] Appointment notes  

### 5. Versioning & sandbox

- [ ] Exact Open Dental **office version** string(s) for YV and DHS.
- [ ] Availability of a **non-production** sandbox database with synthetic patients.
- [ ] Breaking-change / upgrade notification process.

### 6. Legal / compliance

- [ ] Business Associate Agreement (**BAA**) path with Open Dental and any hosting intermediary.
- [ ] Data processing / logging restrictions.
- [ ] Allowed retention for mirrored appointment/patient identifiers in Growth OS Postgres.

### 7. Webhooks / change feeds (optional Phase 5+)

- [ ] Whether appointment create/update webhooks exist.
- [ ] Auth token for inbound webhooks (`OPEN_DENTAL_WEBHOOK_TOKEN` reserved).
- [ ] Idempotent event ID field names.

## What we will provide back

- Growth OS egress IPs / hosting region once chosen.
- Least-privilege request (read-only initially; writes gated by `OPEN_DENTAL_WRITES_ENABLED`).
- Contact: Ryan Blakeslee (tech) / Lindsay Hawkins (office admin).
- Security posture summary: `SECURITY_AND_PRIVACY.md`, fail-closed write flags.

## Acceptance criteria before enabling `OPEN_DENTAL_MODE=remote`

1. Keys stored only in secret manager / host env — never git.  
2. Smoke health check succeeds against sandbox.  
3. Capability matrix recorded in `CapabilityMatrix` for the connection.  
4. BAA executed (or written risk acceptance by Owner).  
5. `OPEN_DENTAL_WRITES_ENABLED` remains **false** until supervised booking UAT passes.  

## Explicit non-requests (yet)

- Chart notes, imaging, treatment plan mutation  
- Autonomous self-booking for patients  
- Voice / AI agents writing into OD  
