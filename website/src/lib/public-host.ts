/**
 * Live canonical tags, sitemap, and robots already use https://hfdds.net.
 * www.hfdds.net currently returns 200 with the same HTML, which splits signals.
 */
export function canonicalRedirectUrl(host: string, pathname: string, search: string): string | null {
  const hostname = host.toLowerCase().split(":")[0] || "";
  if (hostname !== "www.hfdds.net") return null;
  return `https://hfdds.net${pathname}${search || ""}`;
}
