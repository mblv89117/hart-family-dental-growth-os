/**
 * Production-grade staff authentication provider registry.
 *
 * Hosted staging/production must use oidc|oauth|magic_link|passkey with MFA.
 * local_credentials remains development/test only.
 *
 * Recommended vendor (see docs/OWNER_PRODUCTION_APPROVALS.md): Auth0 (Okta)
 * with MFA enforced for Owner/Administrator, BAA before ePHI.
 */

import type { AuthMode } from "../env";

export type AuthProviderCapability = {
  mode: AuthMode;
  mfaSupported: boolean;
  sessionRevocationSupported: boolean;
  implemented: boolean;
  notes: string;
};

export const AUTH_PROVIDER_CAPABILITIES: AuthProviderCapability[] = [
  {
    mode: "local_credentials",
    mfaSupported: false,
    sessionRevocationSupported: true,
    implemented: true,
    notes: "Development/test only. Forbidden for hosted staging/production OPS.",
  },
  {
    mode: "oidc",
    mfaSupported: true,
    sessionRevocationSupported: true,
    implemented: false,
    notes: "Preferred. Wire Auth0/OIDC discovery + MFA before staging go-live.",
  },
  {
    mode: "oauth",
    mfaSupported: true,
    sessionRevocationSupported: true,
    implemented: false,
    notes: "Alternate social/enterprise OAuth; MFA via IdP.",
  },
  {
    mode: "magic_link",
    mfaSupported: false,
    sessionRevocationSupported: true,
    implemented: false,
    notes: "Not preferred for privileged staff without step-up MFA.",
  },
  {
    mode: "passkey",
    mfaSupported: true,
    sessionRevocationSupported: true,
    implemented: false,
    notes: "Strong phishing-resistant option once IdP supports WebAuthn.",
  },
  {
    mode: "disabled",
    mfaSupported: false,
    sessionRevocationSupported: false,
    implemented: true,
    notes: "Public marketing / platform-off only.",
  },
];

export function getAuthProviderCapability(mode: AuthMode): AuthProviderCapability {
  return (
    AUTH_PROVIDER_CAPABILITIES.find((c) => c.mode === mode) || {
      mode,
      mfaSupported: false,
      sessionRevocationSupported: false,
      implemented: false,
      notes: "Unknown mode",
    }
  );
}

/** Hosted environments require an MFA-capable production auth mode that is implemented. */
export function assertHostedAuthReady(mode: AuthMode): void {
  const cap = getAuthProviderCapability(mode);
  if (!cap.implemented || !cap.mfaSupported) {
    throw new Error(
      `Hosted staff authentication is not ready for AUTH_MODE=${mode}. Configure OIDC with MFA (Auth0 recommended) before enabling OPS in staging/production.`,
    );
  }
}
