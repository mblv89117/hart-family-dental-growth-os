# Website — hartfamilydds.com

Next.js marketing site for Hart Family Dental.

## Develop

```bash
cd website
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Before go-live

1. Confirm hours, services, providers with Lindsay / Dr. Hart  
2. Wire `AppointmentForm` to a monitored endpoint (Formspree, CRM, or serverless)  
3. Add GA4 + GTM IDs in env  
4. DNS cutover away from GoDaddy park lander (approval required)  
5. 301 `hartfamilyyv.com` → `/yucca-valley` and `hartfamilydhs.com` → `/desert-hot-springs`  

## Notes

- Forms currently log to the browser console as a Phase 1 stub  
- No prices or unverified clinical claims  
- Straightening copy emphasizes dentist supervision  
