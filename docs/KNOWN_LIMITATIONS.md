# Known Limitations

Honest inventory after **Phases 0–4**. Do not treat these as bugs to silently ignore in production planning.

## Platform

| Limitation | Detail |
| --- | --- |
| Not production-ready for PHI + live OD | Blockers: Postgres vendor, worker hosting, OD credentials, BAA, auth method, outbound vendors |
| SQLite unsupported | PostgreSQL required |
| Vercel alone insufficient for jobs | Worker must be a durable separate process |
| Ops off by default | `OPS_ENABLED=false` in `.env.example` |

## Auth

| Limitation | Detail |
| --- | --- |
| Local credentials only | Synthetic `@local.test` users; not the production auth plan |
| No MFA / SSO | — |
| Auth.js Credentials not used for production | Custom session auth implemented instead |
| Production fail-closed | Ops requires `AUTH_PRODUCTION_APPROVED` |

## Open Dental

| Limitation | Detail |
| --- | --- |
| Mock by default | `OPEN_DENTAL_MODE=mock` |
| Remote unvalidated | No live keys; endpoints may need adjustment per office version |
| Writes disabled | `OPEN_DENTAL_WRITES_ENABLED=false` |
| No continuous sync | `OPEN_DENTAL_SYNC_ENABLED=false`; SyncCursor model exists unused in slice |
| Webhooks | Dedup helper only; no production ingress |
| Topology undecided | Both shared and separate connections seeded |

## Automation & messaging

| Limitation | Detail |
| --- | --- |
| Draft mode default | No auto-send |
| Outbound off | Mock providers only in worker |
| AI / voice / reactivation / reviews | Flags false; features not built |
| Templates | Seed draft SMS template only |

## Product / UX

| Limitation | Detail |
| --- | --- |
| Ops UI is basic | Functional Today / Inbox / Lead 360 / Safety / Scheduling — not polished design system |
| Public booking widget | Not patient self-serve; staff supervised mock only |
| Categories inactive | Most appointment categories `active=false`; supervised rules for `new_patient_exam` |
| `autoBook` always false in seed | No autonomous booking |
| Dual lead paths | DB CRM + legacy email/jsonl notify adapters coexist |

## Testing / ops maturity

| Limitation | Detail |
| --- | --- |
| No production monitoring pack | Alerts/SIEM not wired |
| Retention jobs | Not implemented |
| Penetration test | Not done |
| Multi-region HA | Not designed |

## Phases explicitly not done

Phases **5–8** (see `NEXT_PHASE_BACKLOG.md`): richer conversations, real outbound, live OD read sync, campaigns, AI, voice, reactivation, treatment-plan follow-up, etc.
