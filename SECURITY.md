# Security & Credential Protocol

## Immediate action required

On 2026-07-21, platform credentials were found in a plaintext email PDF (`Advertising.pdf` from Harry Hart / Lindsay Hawkins dated 2026-06-25). That file has been moved to a local quarantine folder that is **gitignored** and must never be committed, shared in chat, or pasted into code.

**Do this before any live platform work:**

1. **Rotate all passwords** listed in that email (Google, Yelp YV, Yelp DHS, Facebook, Gmail, Hotmail accounts).
2. Store new credentials only in an approved password manager (1Password / Bitwarden business vault).
3. Enable 2FA on every account that supports it.
4. Remove credentials from email threads, shared drives, and local Desktop copies when possible.
5. Use least-privilege admin seats; do not share one login across vendors.

## Rules for this repository

- Never commit passwords, API keys, tokens, or `.env` files with secrets.
- Never put credentials in source code, markdown examples, or issue comments.
- Track **account inventory** (who/what/where) in `docs/audits/access-inventory.md` — without secrets.
- Patient health information (PHI) must never enter marketing tools, this repo, or analytics exports.
- Do not make unauthorized changes to live GBP, ads, DNS, or email until Lindsay Hawkins (or Harry Hart) approves.

## Incident contacts

| Role | Name | Phone |
| --- | --- | --- |
| Corporate Secretary / Office Manager | Lindsay Hawkins | (760) 365-6595 |
| Tech contact | Ryan Blakeslee | (951) 515-6246 |

## If credentials were exposed further

Assume compromise until rotated. Review recent login activity on Google, Meta Business Suite, Yelp, GoDaddy, and email after rotation.
