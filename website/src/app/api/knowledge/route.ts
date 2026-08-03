import { NextResponse } from "next/server";
import { publicKnowledgeGraph } from "@/lib/schema";

/**
 * Public, machine-readable knowledge graph for AI marketing agents.
 * Contains only public NAP, services, and practice facts — no secrets or PHI.
 */
export async function GET() {
  const body = publicKnowledgeGraph();
  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-Robots-Tag": "noindex",
    },
  });
}
