# Local lead QA log

**Date:** 2026-07-21  
**Environment:** `npm run dev` → http://localhost:3000  
**Follow-up owner (approved):** Wendy Delgado — both desks

## Results

| Check | Result |
| --- | --- |
| `POST /api/leads` valid payload | **Pass** |
| Append to `data/leads/leads.jsonl` | **Pass** — owner = Wendy Delgado |
| Validation rejects incomplete body | **Pass** |
| Home / contact / YV / DHS / smile pages | **Pass** — HTTP 200 |
| Hotmail routing targets | YV → `hartdentalyv@hotmail.com` · DHS → `hartdental02@hotmail.com` |
| FormSubmit / Resend delivery | Wired in API; production verify after deploy |

## Production verification checklist

- [ ] Live POST `/api/leads` returns `{ ok: true }`  
- [ ] Wendy / desk receives email in correct Hotmail inbox  
- [ ] Confirm FormSubmit activation link if first-time prompt appears  
- [ ] Optional Resend path when `RESEND_API_KEY` set on host  
