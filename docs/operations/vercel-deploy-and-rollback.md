# Vercel deploy and rollback

Checked 2026-10-09 against the GitHub Deployments API for `mblv89117/hart-family-dental-growth-os` and against the HTML those deployment URLs still serve. Nothing in this file was executed: no rollback, no promote, no new production deploy.

## Git integration already deploys preview and production

This repository has no `.github/workflows`. Deploys come from the Vercel Git integration. `website/vercel.json` sets the Next.js framework, `next build`, and `npm install`. The project root directory is `website` (`docs/KNOWN_LIMITATIONS.md`, `docs/PR1_DEPENDENCY_SECURITY_GATE.md`).

Two Vercel projects are connected to this repo:

| Project | What GitHub records |
| --- | --- |
| `hart-family-dental` | The public site. Preview on non-`main` pushes. Production when a commit lands on `main`. |
| `hart-family-dental-growth-os-staging` | A second project on the same repo. It receives its own Preview and Production events. Rolling back one project does not change the other. |

Evidence from GitHub deployment events:

| When (UTC) | Environment | Commit | GitHub deployment |
| --- | --- | --- | --- |
| 2026-07-28T15:05:46Z | Production | `b70c233` | `5642283799` |
| 2026-08-03T02:11:15Z | Production – hart-family-dental | `08868b6` | `5719851573` |
| 2026-08-03T02:51:14Z | Production – hart-family-dental | `33aed91` | `5720130263` |
| 2026-08-17T18:15:47Z | Preview – hart-family-dental | `af4defb` | `5948778953` |
| 2026-10-08T22:27:22Z | Preview – hart-family-dental | `1365048` | `6948227972` |

A push that is not on `main` creates a Preview deployment. A commit that reaches `main` creates a Production deployment. That has been true since the Git connection was restored at the PR #1 merge on 2026-07-28. Before that reconnect, the project had no Git link (`docs/KNOWN_LIMITATIONS.md`).

The Git integration does not, by itself, keep the production domains on the latest `main` build. Assigning a domain to an older or out-of-band deployment is a separate Vercel action. After an instant rollback, Vercel also turns off automatic assignment of production domains until someone promotes a deployment again ([Instant Rollback](https://vercel.com/docs/instant-rollback)).

## What is serving the unsigned implant prices

`origin/main` and this pull request do not contain the `$999` implant offer. A search of both trees finds that price only in documentation. The offer source is commit `af4defbe784eb674453ede410cdda8419ee2f376` (2026-08-17 11:14:48 -0700, “Add $999 implant offer disclosures and office-aware routing”) on `feature/implant-offer-disclosures`. That commit is not an ancestor of `main` or of this branch.

Checked 2026-10-09, these hosts all serve the same deployment, and the implants page title is `Dental Implants | $999 Implant + PMMA Flex Crown | Hart Family Dental`:

| Host | HTML deployment id |
| --- | --- |
| `https://hfdds.net` | `dpl_BTQza7SdDCqpzToPxQSUdzSNtbZF` |
| `https://www.hfdds.net` | `dpl_BTQza7SdDCqpzToPxQSUdzSNtbZF` |
| `https://hart-family-dental.vercel.app` | `dpl_BTQza7SdDCqpzToPxQSUdzSNtbZF` |

That deployment id is not in the GitHub deployment list. The last GitHub Production event for `hart-family-dental` is still 2026-08-03. The only Git-recorded deployment whose HTML contains the `$999` title is the Preview of `af4defb`:

| Field | Value |
| --- | --- |
| GitHub deployment | `5948778953` |
| Created | 2026-08-17T18:15:47Z |
| URL | `https://hart-family-dental-dw9i95r0o-high-value-capital-group.vercel.app` |
| HTML deployment id | `dpl_8KCUq8At4DdFqp5eV8m3XhVzppXd` |
| GA measurement id in that HTML | absent |

The live HTML includes GA measurement id `G-VPNLPP3BMV` and a different deployment id, so the domains are not serving that preview URL. They are serving a separate build of the same unsigned offer. This note does not claim which dashboard click or CLI command created `dpl_BTQza7SdDCqpzToPxQSUdzSNtbZF`.

## Deployment to promote when the owner wants the prices off

The last Git-recorded Production deployment of `hart-family-dental` does not include the offer. Checked 2026-10-09, its implants title is `Dental Implants | Hart Family Dental`.

| Field | Value |
| --- | --- |
| GitHub deployment | `5720130263` |
| Created | 2026-08-03T02:51:14Z |
| Commit | `33aed919f4750a3ffdf6173147d29d81ba6028a3` |
| URL | `https://hart-family-dental-1n9471pok-high-value-capital-group.vercel.app` |
| HTML deployment id | `dpl_D1yUCANkg8GvAhcTFxb7SjsgFtJM` |
| Team / project | High Value Capital Group / `hart-family-dental` |

Promoting that deployment removes the unsigned prices from the production domains. It does not contain the analytics privacy fix or the signed lead webhook in this pull request. Those land only when a later `main` build is deployed. Do not promote the 2026-08-17 preview (`dpl_8KCUq8At4DdFqp5eV8m3XhVzppXd`); that preview is the offer.

An earlier same-day Production deployment, `5719851573` (`08868b6`, `https://hart-family-dental-4xt442n92-high-value-capital-group.vercel.app`, `dpl_5yQ1KkkEq42QQwRHDN7mtoeQ7ygx`), also has no `$999`. The 02:51 UTC deployment above is the newer of the two and is the one to promote.

## Rollback procedure

Use this only when the owner decides to move production traffic. Do not run it as part of review.

Instant rollback points the production domains at an existing deployment. It does not rebuild, and it does not change Git. Environment variables stay as they were when that deployment was built. On the Hobby plan, `vercel rollback` can target only the immediately previous production deployment. On Pro and Enterprise, it can target an older production deployment by URL or id. Preview deployments that were never assigned to a production domain are not eligible for instant rollback; promoting one asks for confirmation and creates a new production deployment ([`vercel rollback`](https://vercel.com/docs/cli/rollback), [`vercel promote`](https://vercel.com/docs/cli/promote)).

Dashboard:

1. Vercel → team **High Value Capital Group** → project **hart-family-dental** → Deployments.
2. Open the deployment to restore. For the price removal, that is the 2026-08-03 URL above, not the deployment currently on `hfdds.net`.
3. Use **Instant Rollback** when that deployment is in the eligible production list, or **Promote** when promoting a specific Ready deployment.
4. After an instant rollback, automatic production-domain assignment stays off. The next push to `main` will not replace the rolled-back deployment until someone promotes a deployment and turns that assignment back on.

CLI, from a machine already logged into the team:

```bash
vercel rollback https://hart-family-dental-1n9471pok-high-value-capital-group.vercel.app
vercel rollback status
```

`vercel rollback` with no URL rolls back to the immediately previous production deployment, which is only correct when that previous deployment is the one you intend. To put a chosen deployment on the production domains and re-enable automatic assignment:

```bash
vercel promote https://hart-family-dental-1n9471pok-high-value-capital-group.vercel.app
vercel promote status
```

After the domains move, request `https://hfdds.net/services/dental-implants` and confirm the title no longer contains `$999`, and confirm the HTML deployment id is `dpl_D1yUCANkg8GvAhcTFxb7SjsgFtJM`. Tell Wendy before the change. Log the decision in the approvals log.
