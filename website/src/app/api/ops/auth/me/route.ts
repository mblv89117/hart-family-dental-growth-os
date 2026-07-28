import { NextResponse } from "next/server";
import { AuthError, requireAuthUser } from "@/server/auth/session";
import { isOpsEnabled } from "@/server/env";

export const runtime = "nodejs";

export async function GET() {
  if (!isOpsEnabled()) {
    return new NextResponse("Not Found", { status: 404 });
  }
  try {
    const user = await requireAuthUser();
    return NextResponse.json({ ok: true, user });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 401 });
    }
    throw err;
  }
}
