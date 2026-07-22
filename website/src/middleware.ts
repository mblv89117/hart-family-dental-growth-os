import { NextRequest, NextResponse } from "next/server";

/** Host-based redirects for location funnel domains (activate when DNS points here). */
export function middleware(req: NextRequest) {
  const host = req.headers.get("host")?.toLowerCase().replace(/:\d+$/, "") || "";
  const { pathname, search } = req.nextUrl;

  if (host === "hartfamilyyv.com" || host === "www.hartfamilyyv.com") {
    const url = new URL(`https://hfdds.net/yucca-valley${pathname === "/" ? "" : pathname}${search}`);
    return NextResponse.redirect(url, 301);
  }
  if (host === "hartfamilydhs.com" || host === "www.hartfamilydhs.com") {
    const url = new URL(`https://hfdds.net/desert-hot-springs${pathname === "/" ? "" : pathname}${search}`);
    return NextResponse.redirect(url, 301);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
