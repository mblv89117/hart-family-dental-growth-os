#!/usr/bin/env node
/**
 * Smoke test for the temporary Azure validation hostname.
 * Does not submit a complete lead and does not change DNS.
 *
 * Usage: node website/scripts/azure-smoke.mjs https://<container-app-fqdn> [--require-hsts]
 */

const base = (process.argv[2] || "").replace(/\/$/, "");
const requireHsts = process.argv.includes("--require-hsts");

if (!base.startsWith("https://")) {
  console.error("Pass the validation origin, for example https://ca-hfd-website.example.westus3.azurecontainerapps.io");
  process.exit(2);
}

const failures = [];

function note(ok, label, detail = "") {
  const line = `${ok ? "PASS" : "FAIL"} ${label}${detail ? ` — ${detail}` : ""}`;
  console.log(line);
  if (!ok) failures.push(label);
}

async function get(path, init = {}) {
  const res = await fetch(`${base}${path}`, { redirect: "manual", ...init });
  const text = await res.text();
  return { res, text };
}

const health = await get("/api/health");
let healthOk = false;
try {
  healthOk = health.res.status === 200 && JSON.parse(health.text).ok === true;
} catch {
  healthOk = false;
}
note(healthOk, "GET /api/health", `status ${health.res.status}`);

const home = await get("/");
note(home.res.status === 200, "GET /", `status ${home.res.status}`);
note(
  /rel="canonical" href="https:\/\/hfdds\.net\/?"/.test(home.text) || home.text.includes("https://hfdds.net"),
  "canonical stays on https://hfdds.net",
);
note(home.text.includes("application/ld+json") && home.text.includes("schema.org"), "structured data present");
note(home.res.headers.get("x-frame-options") === "SAMEORIGIN", "X-Frame-Options");
note(home.res.headers.get("x-content-type-options") === "nosniff", "X-Content-Type-Options");
const hsts = home.res.headers.get("strict-transport-security") || "";
if (requireHsts) {
  note(hsts.includes("max-age="), "Strict-Transport-Security", hsts || "missing");
}

const robots = await get("/robots.txt");
note(robots.res.status === 200 && robots.text.includes("Sitemap: https://hfdds.net/sitemap.xml"), "robots sitemap URL");

const sitemap = await get("/sitemap.xml");
note(
  sitemap.res.status === 200 && sitemap.text.includes("https://hfdds.net/locations/yucca-valley"),
  "sitemap location URL",
);

const redirect = await get("/dental-implants");
const location = redirect.res.headers.get("location") || "";
note(
  redirect.res.status === 301 && location.endsWith("/services/dental-implants"),
  "legacy 301 /dental-implants",
  `${redirect.res.status} ${location}`,
);

const office = await get("/locations/desert-hot-springs");
note(office.res.status === 200 && office.text.includes("Desert Hot Springs"), "location page");

const badLead = await fetch(`${base}/api/leads`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ synthetic: true, note: "TEST - DO NOT CONTACT" }),
});
note(badLead.status === 400, "incomplete lead is rejected", `status ${badLead.status}`);

if (failures.length) {
  console.error(`Smoke failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Smoke passed.");
