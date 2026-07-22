# Lead Data Dictionary

| Field | Required | Allowed values / notes |
| --- | --- | --- |
| id | Yes | Unique ID (e.g. date + sequence or lead_ API id) |
| received_at | Yes | ISO datetime |
| source | Yes | website · hotmail · phone · walk-in · other |
| channel | No | form · smile-assessment · call · in-person · email |
| utm_campaign | No | From website attribution when present |
| location | Yes | yucca-valley · desert-hot-springs |
| service | Yes | Free text matching site interests |
| patient_name | Yes | Contact name only |
| phone | Yes | |
| email | Preferred | |
| status | Yes | New · Contact Attempted · Contacted · Appointment Scheduled · Follow-Up Required · No Answer · Won · Lost · Spam/Test |
| assigned_to | Yes | Default Wendy Delgado |
| last_contact | No | Datetime of last human touch |
| next_follow_up | No | Date; required if status needs follow-up |
| appointment_date | No | When scheduled |
| outcome | No | Booked · Showed · Accepted treatment · etc. |
| lost_reason | No | Timing · Price · Competitor · Not candidate · Other |
| notes | No | No PHI / diagnoses |
| duplicate_of | No | id of original row if duplicate |

**Privacy:** Marketing tools and this workbook must not store charts, SSNs, or detailed clinical notes.
