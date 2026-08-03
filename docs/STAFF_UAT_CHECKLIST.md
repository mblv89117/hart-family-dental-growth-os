# Staff UAT Checklist (Staging)

Use **staging only**. Banner must read: `STAGING — DO NOT ENTER REAL PATIENT INFORMATION`.  
Do not enter real patient data.

## Wendy (FrontDesk)

| # | Test | Pass/Fail | Notes |
| --- | --- | --- | --- |
| W1 | Secure login (MFA when enabled) | | |
| W2 | Today Dashboard loads | | |
| W3 | Unified Inbox | | |
| W4 | Lead assignment / Lead 360 | | |
| W5 | Patient candidate matching / multi-match | | |
| W6 | Location selection boundaries | | |
| W7 | Appointment availability / pending confirmation | | |
| W8 | Open Dental downtime behavior | | |
| W9 | Task completion / draft response | | |
| W10 | Logout / session expiration | | |

Wendy sign-off: _____________ Date: _______

## Lindsay (Administrator)

| # | Test | Pass/Fail | Notes |
| --- | --- | --- | --- |
| L1 | Secure login (MFA) | | |
| L2 | Location / provider / operatory config | | |
| L3 | Appointment categories & scheduling rules | | |
| L4 | Staff permissions | | |
| L5 | Safety Center / emergency stop | | |
| L6 | Integration health | | |
| L7 | Audit history | | |
| L8 | Template approval | | |

Lindsay sign-off: _____________ Date: _______

## Manny (Owner)

| # | Test | Pass/Fail | Notes |
| --- | --- | --- | --- |
| M1 | Owner access | | |
| M2 | User disablement / session revocation | | |
| M3 | Workflow / feature-flag approval | | |
| M4 | System emergency stop | | |
| M5 | Integration-secret access restrictions | | |
| M6 | Reporting / audit export | | |
| M7 | Rollback process understanding | | |

Manny sign-off: _____________ Date: _______

**Staff UAT is not complete until all three sign-offs exist.**
