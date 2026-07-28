import { createHash, randomBytes, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { Role, User } from "@prisma/client";
import { prisma } from "../db";
import { getEnv, hashToken } from "../env";
import { writeAudit } from "../audit";
import { canManageLeads } from "../authz/roles";

export const SESSION_COOKIE = "hfd_ops_session";
export const CSRF_COOKIE = "hfd_ops_csrf";

export type AuthUser = {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  role: Role;
  locationIds: string[];
};

const MAX_FAILURES = 5;
const LOCK_MINUTES = 15;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function sessionExpiry(): Date {
  const hours = getEnv().sessionTtlHours;
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export async function loginWithCredentials(input: {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<{ ok: true; user: AuthUser; sessionToken: string; csrfToken: string } | { ok: false; error: string }> {
  const env = getEnv();
  if (!env.opsEnabled) {
    return { ok: false, error: "Operations portal is disabled." };
  }
  if (env.authMode !== "local_credentials") {
    return { ok: false, error: "Unsupported auth mode." };
  }

  const email = input.email.trim().toLowerCase();
  const user = await prisma.user.findFirst({
    where: { email, active: true },
    include: { locationAccess: true },
  });

  const fail = async (reason: string) => {
    await prisma.loginAttempt.create({
      data: {
        organizationId: user?.organizationId,
        email,
        ipAddress: input.ipAddress,
        success: false,
        reason,
      },
    });
    return { ok: false as const, error: "Invalid email or password." };
  };

  if (!user) return fail("unknown_user");

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    await prisma.loginAttempt.create({
      data: {
        organizationId: user.organizationId,
        email,
        ipAddress: input.ipAddress,
        success: false,
        reason: "locked",
      },
    });
    return { ok: false, error: "Account temporarily locked. Try again later." };
  }

  const recentWindow = new Date(Date.now() - 15 * 60 * 1000);
  const recentFails = await prisma.loginAttempt.count({
    where: {
      email,
      success: false,
      createdAt: { gte: recentWindow },
      OR: [{ ipAddress: input.ipAddress || undefined }, { ipAddress: null }],
    },
  });
  if (recentFails >= 20) {
    return { ok: false, error: "Too many attempts. Try again later." };
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    const failedLoginCount = user.failedLoginCount + 1;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount,
        lockedUntil: failedLoginCount >= MAX_FAILURES ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000) : null,
      },
    });
    return fail("bad_password");
  }

  const sessionToken = randomBytes(32).toString("hex");
  const csrfToken = randomBytes(24).toString("hex");
  const expiresAt = sessionExpiry();

  await prisma.$transaction([
    prisma.session.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        tokenHash: hashToken(sessionToken),
        csrfToken,
        expiresAt,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent?.slice(0, 200),
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
    }),
    prisma.loginAttempt.create({
      data: {
        organizationId: user.organizationId,
        email,
        ipAddress: input.ipAddress,
        success: true,
        reason: "ok",
      },
    }),
  ]);

  await writeAudit({
    organizationId: user.organizationId,
    actorUserId: user.id,
    actorRole: user.role,
    actorType: "human",
    action: "auth.login",
    resourceType: "Session",
    resourceId: user.id,
    result: "success",
  });

  return {
    ok: true,
    user: toAuthUser(user),
    sessionToken,
    csrfToken,
  };
}

function toAuthUser(
  user: User & { locationAccess: { locationId: string }[] },
): AuthUser {
  return {
    id: user.id,
    organizationId: user.organizationId,
    email: user.email,
    name: user.name,
    role: user.role,
    locationIds: user.locationAccess.map((l) => l.locationId),
  };
}

export async function revokeSession(sessionToken: string) {
  const tokenHash = hashToken(sessionToken);
  const session = await prisma.session.findUnique({ where: { tokenHash } });
  if (!session) return;
  await prisma.session.update({
    where: { id: session.id },
    data: { revokedAt: new Date() },
  });
  await writeAudit({
    organizationId: session.organizationId,
    actorUserId: session.userId,
    actorType: "human",
    action: "auth.logout",
    resourceType: "Session",
    resourceId: session.id,
    result: "success",
  });
}

export async function getSessionUser(sessionToken?: string | null): Promise<AuthUser | null> {
  if (!sessionToken) return null;
  const env = getEnv();
  if (!env.opsEnabled) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(sessionToken) },
    include: { user: { include: { locationAccess: true } } },
  });
  if (!session || session.revokedAt || session.expiresAt < new Date()) return null;
  if (!session.user.active) return null;

  await prisma.session.update({
    where: { id: session.id },
    data: { lastSeenAt: new Date() },
  });

  return toAuthUser(session.user);
}

export async function requireAuthUser(): Promise<AuthUser> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const user = await getSessionUser(token);
  if (!user) {
    throw new AuthError("UNAUTHORIZED", "Authentication required.");
  }
  return user;
}

export async function requireCsrf(requestCsrf: string | null | undefined) {
  const jar = await cookies();
  const cookieCsrf = jar.get(CSRF_COOKIE)?.value;
  if (!cookieCsrf || !requestCsrf) {
    throw new AuthError("CSRF", "CSRF token missing.");
  }
  const a = Buffer.from(cookieCsrf);
  const b = Buffer.from(requestCsrf);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new AuthError("CSRF", "CSRF token invalid.");
  }
}

export class AuthError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export function assertLocationAccess(user: AuthUser, locationId: string) {
  if (user.role === "Owner" || user.role === "Administrator") return;
  if (!user.locationIds.includes(locationId)) {
    throw new AuthError("FORBIDDEN", "No access to this location.");
  }
}

export function assertCanManageLeads(user: AuthUser) {
  if (!canManageLeads(user.role)) {
    throw new AuthError("FORBIDDEN", "Insufficient role for lead management.");
  }
}

export function passwordFingerprint(password: string): string {
  return createHash("sha256").update(password).digest("hex").slice(0, 8);
}
