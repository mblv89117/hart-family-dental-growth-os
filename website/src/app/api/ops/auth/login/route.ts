import { NextRequest, NextResponse } from "next/server";
import {
  CSRF_COOKIE,
  SESSION_COOKIE,
  loginWithCredentials,
} from "@/server/auth/session";
import { getEnv, isOpsEnabled } from "@/server/env";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!isOpsEnabled()) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Email and password required." }, { status: 400 });
  }

  const result = await loginWithCredentials({
    email,
    password,
    ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
    userAgent: req.headers.get("user-agent") || undefined,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 401 });
  }

  const res = NextResponse.json({
    ok: true,
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
    },
  });

  const secure = process.env.NODE_ENV === "production";
  res.cookies.set(SESSION_COOKIE, result.sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    expires: new Date(Date.now() + getEnv().sessionTtlHours * 3600_000),
  });
  res.cookies.set(CSRF_COOKIE, result.csrfToken, {
    httpOnly: false,
    sameSite: "lax",
    secure,
    path: "/",
    expires: new Date(Date.now() + getEnv().sessionTtlHours * 3600_000),
  });
  return res;
}
