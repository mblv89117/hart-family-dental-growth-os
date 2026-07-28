import { NextRequest, NextResponse } from "next/server";

function notFound() {
  return new NextResponse("Not Found", { status: 404 });
}

function truthy(v: string | undefined) {
  return ["1", "true", "yes", "on"].includes((v || "").toLowerCase());
}

function opsMayExpose(): boolean {
  if (!truthy(process.env.OPS_ENABLED)) return false;

  // Production: local credentials / disabled auth never expose ops — even if
  // AUTH_PRODUCTION_APPROVED is flipped true by mistake.
  if (process.env.NODE_ENV === "production") {
    const mode = (process.env.AUTH_MODE || "local_credentials").toLowerCase();
    if (mode === "local_credentials" || mode === "disabled" || mode === "") {
      return false;
    }
    if (!truthy(process.env.AUTH_PRODUCTION_APPROVED)) {
      return false;
    }
    if (!["oidc", "oauth", "magic_link", "passkey"].includes(mode)) {
      return false;
    }
  }
  return true;
}

/** Host-based redirects for location funnel domains + ops portal isolation. */
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

  const isOpsPath =
    pathname === "/ops" ||
    pathname.startsWith("/ops/") ||
    pathname.startsWith("/api/ops/");

  if (isOpsPath) {
    if (!opsMayExpose()) {
      return notFound();
    }
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("x-hfd-surface", "ops");
    return res;
  }

  const res = NextResponse.next();
  res.headers.set("x-hfd-surface", "public");
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
