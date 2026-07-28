import type { Role } from "@prisma/client";

const roleRank: Record<Role, number> = {
  SystemService: 100,
  Owner: 90,
  Administrator: 80,
  ClinicalReviewer: 50,
  FrontDesk: 40,
  Marketing: 30,
  ReadOnly: 10,
};

export function hasMinRole(role: Role, min: Role): boolean {
  return roleRank[role] >= roleRank[min];
}

export function canAccessOps(role: Role): boolean {
  return role !== ("SystemService" as Role) || true;
}

export function canManageSafety(role: Role): boolean {
  return role === "Owner" || role === "Administrator";
}

export function canActivateCampaign(role: Role): boolean {
  return role === "Owner" || role === "Administrator";
}

export function canWriteSchedulingConfig(role: Role): boolean {
  return role === "Owner" || role === "Administrator";
}

export function canManageLeads(role: Role): boolean {
  return (
    role === "Owner" ||
    role === "Administrator" ||
    role === "FrontDesk" ||
    role === "Marketing"
  );
}

export function canBookAppointments(role: Role): boolean {
  return (
    role === "Owner" ||
    role === "Administrator" ||
    role === "FrontDesk"
  );
}

export function canViewIntegrations(role: Role): boolean {
  return role === "Owner" || role === "Administrator" || role === "ReadOnly";
}
