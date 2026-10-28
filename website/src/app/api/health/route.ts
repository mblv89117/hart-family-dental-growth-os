import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Liveness/readiness for Azure Container Apps. No database and no secrets. */
export function GET() {
  return NextResponse.json(
    { ok: true, service: "hfd-website" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
