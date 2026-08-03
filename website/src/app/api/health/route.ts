import { NextResponse } from "next/server";
import { isOpsEnabled, isPlatformEnabled } from "@/server/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public liveness — no secrets, no database, no PHI.
 * Safe for load balancers and uptime monitors.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "hart-family-dental",
    appEnv: process.env.APP_ENV || process.env.NODE_ENV || "unknown",
    platformEnabled: isPlatformEnabled(),
    opsEnabled: isOpsEnabled(),
    timestamp: new Date().toISOString(),
  });
}
