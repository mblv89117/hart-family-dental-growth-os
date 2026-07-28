# Open Dental Integration

**Status after Phases 0–4:** Mock gateway **implemented and tested**. Remote gateway **scaffolded** (HTTP client, write gate, retries, circuit breaker) but **not production-credentialed** and not validated against a live office.

## Goals for this slice

- One `OpenDentalGateway` interface for clinics, providers, operatories, patients, slots, appointments.
- Prefer **mock** for local development and CI.
- Keep **writes fail-closed** unless `OPEN_DENTAL_WRITES_ENABLED=true`.
- Support both **shared-clinics** and **separate-DB** connection records in schema/seed.

## Code map

| File | Role |
| --- | --- |
| `website/src/server/opendental/types.ts` | Zod schemas + `OpenDentalGateway` interface |
| `website/src/server/opendental/mockGateway.ts` | In-memory stores per connection key |
| `website/src/server/opendental/remoteGateway.ts` | Remote HTTP client (`ODFHIR` auth header pattern) |
| `website/src/server/opendental/index.ts` | Factory: mock vs remote from connection + env |
| Prisma models | `OpenDentalConnection`, clinic/provider/operatory mappings, `CapabilityMatrix`, `IntegrationHealth`, `SyncCursor`, `PatientLink`, appointment mirrors/ops |

## Environment

```
OPEN_DENTAL_MODE=mock          # or remote
OPEN_DENTAL_WRITES_ENABLED=false
OPEN_DENTAL_BASE_URL=
OPEN_DENTAL_DEVELOPER_KEY=
OPEN_DENTAL_CUSTOMER_KEY=
OPEN_DENTAL_CONNECTIONS_JSON=  # reserved / unused in Phase 0–4 runtime path
OPEN_DENTAL_WEBHOOK_TOKEN=
OPEN_DENTAL_REQUEST_TIMEOUT_MS=15000
OPEN_DENTAL_SYNC_ENABLED=false
```

## Gateway capabilities

| Method | Mock | Remote scaffold |
| --- | --- | --- |
| `healthCheck` | Yes | Yes |
| `getClinics` / `getProviders` / `getOperatories` | Yes | Yes |
| `getAppointments` / `getAppointment` | Yes | Yes |
| `getAvailableSlots` | Synthetic slots | Yes (schema-validated) |
| `findPatientCandidates` / `getPatient` | Yes | Yes |
| `getSchedules` / `getRecalls` / `getCommLogs` | Stub / empty | Scaffolded |
| `createAppointment` / `update` / `confirm` / `addNote` | Yes (local store) | Gated by `OPEN_DENTAL_WRITES_ENABLED` |

Remote write calls throw when writes are disabled. Mock create is used for **supervised booking** in ops regardless of the writes flag (writes apply to remote).

## Connection seeding

Seed creates:

- `shared-clinics` — shared connection with YV/DHS clinic mappings + healthy `IntegrationHealth` + capability matrix (mock).
- `yv-separate` / `dhs-separate` — separate connection keys with isolated mock stores (unit-tested isolation).

## Patient linking (honest)

`matchPatientForLead` in `website/src/server/patients/linking.ts`:

- **Never auto-links on name alone** → `MANUAL_REVIEW` + front-desk task.
- Strong matches use phone / email / DOB.
- Multiple strong matches → manual review.
- Used by supervised booking path; not a full PMS sync engine.

**Label:** Partially implemented — match + link states exist; no continuous patient sync (`OPEN_DENTAL_SYNC_ENABLED=false`).

## Supervised mock booking

Implemented in `website/src/server/scheduling/booking.ts`:

1. Staff lists eligible slots (rules + gateway availability + day/window filters).
2. Offered slots expire (~5 minutes).
3. Book path: location ACL, idempotency key, health check, revalidate slot, consume lock, create appointment, mirror row, confirmation **Message** only after success (`draft` if outbound disabled).
4. OD unavailable → `AppointmentRequest` + task; **no** patient confirmation claiming booked.
5. Timeout / ambiguous → task; requery helpers to avoid duplicate appointments.

**Label:** Mock only — not live OD booking.

## Webhooks

`recordWebhookOnce` dedupes by `(organizationId, source, externalEventId)`. No live OD webhook ingress UI or production handler beyond the helper.

## What is not claimed

- Live API certification against Hart’s Open Dental version  
- Production credentials stored or tested  
- Bi-directional sync / recall automation  
- Autonomous booking (`autoBook` remains false)  
- Clinical chart write-backs  

See also: `OPEN_DENTAL_VENDOR_REQUEST.md`, `KNOWN_LIMITATIONS.md`.
