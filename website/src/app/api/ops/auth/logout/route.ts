import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CSRF_COOKIE, SESSION_COOKIE, requireCsrf, revokeSession } from "@/server/auth/session";
import { isOpsEnabled } from "@/server/env";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!isOpsEnabled()) {
    return new NextResponse("Not Found", { status: 404 });
  }
  const csrf = req.headers.get("x-csrf-token");
  try {
    await requireCsrf(csrf);
  } catch {
    return NextResponse.json({ ok: false, error: "CSRF failed" }, { status: 403 });
  }
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await revokeSession(token);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  res.cookies.set(CSRF_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
