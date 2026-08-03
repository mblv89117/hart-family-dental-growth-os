#!/usr/bin/env node
/**
 * Production validation for homepage header/logo spacing release.
 * Outputs JSON + screenshots under this directory.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = __dirname;
const BASE = process.env.PROD_URL || "https://hfdds.net";

const BREAKPOINTS = [
  { w: 390, h: 844 },
  { w: 430, h: 932 },
  { w: 768, h: 1024 },
  { w: 1024, h: 768 },
  { w: 1440, h: 900 },
  { w: 1920, h: 1080 },
];

function gapHeaderToH1(page) {
  return page.evaluate(() => {
    const header = document.querySelector("header");
    const h1 = document.querySelector("h1");
    if (!header || !h1) return null;
    const hb = header.getBoundingClientRect();
    const h1b = h1.getBoundingClientRect();
    return Math.round(h1b.top - hb.bottom);
  });
}

async function analyzeViewport(page, { w, h }) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await page.goto(BASE + "/", { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 800));

  const data = await page.evaluate(() => {
    const header = document.querySelector("header");
    const h1 = document.querySelector("h1");
    const imgs = [...document.querySelectorAll("header img, .site-header img, [data-brand-logo] img, a[href='/'] img")];
    // Prefer header logos
    const headerImgs = [...(header?.querySelectorAll("img") || [])];
    const logo = headerImgs[0] || imgs[0];
    const logoSrc = logo?.currentSrc || logo?.src || "";
    const logoRect = logo ? logo.getBoundingClientRect() : null;
    const parent = logo?.closest("a, div, span");
    const parentStyle = parent ? getComputedStyle(parent) : null;
    const hasBlackPlate =
      !!parentStyle &&
      (parentStyle.backgroundColor.includes("0, 0, 0") ||
        parentStyle.backgroundColor === "rgb(0, 0, 0)" ||
        (parent?.className || "").toString().includes("bg-black") ||
        (parent?.className || "").toString().includes("bg-neutral-950"));

    // Logos above H1 (duplicate hero logo check)
    const h1Top = h1?.getBoundingClientRect().top ?? Infinity;
    const logosAboveH1 = [...document.querySelectorAll("img")].filter((img) => {
      const src = img.currentSrc || img.src || "";
      if (!/logo|brand/i.test(src) && !/Hart Family Dental/i.test(img.alt || "")) return false;
      const r = img.getBoundingClientRect();
      return r.bottom > 0 && r.top < h1Top - 4 && !header?.contains(img);
    }).length;

    const phones = [...document.querySelectorAll('a[href^="tel:"]')].map((a) => a.getAttribute("href"));
    const uniquePhones = [...new Set(phones)];

    const requestBtn = [...document.querySelectorAll("a")].find((a) =>
      /Request Appointment/i.test(a.textContent || "")
    );
    const sticky = [...document.querySelectorAll("a")].filter((a) => {
      const t = (a.textContent || "").trim();
      return /Schedule appointment|Call now/i.test(t);
    }).map((a) => ({ text: (a.textContent || "").trim(), href: a.getAttribute("href") }));

    const canonical =
      document.querySelector('link[rel="canonical"]')?.getAttribute("href") || null;

    const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;

    const navLinks = [...document.querySelectorAll("header nav a, header a")].map((a) =>
      (a.textContent || "").trim()
    ).filter(Boolean);

    return {
      logoSrc,
      logoSize: logoRect ? { w: Math.round(logoRect.width), h: Math.round(logoRect.height) } : null,
      hasBlackPlate,
      logosAboveH1,
      phones: uniquePhones,
      requestHref: requestBtn?.getAttribute("href") || null,
      stickyCtas: sticky.slice(0, 4),
      canonical,
      overflow,
      navSample: navLinks.slice(0, 12),
      title: document.title,
    };
  });

  data.gap = await gapHeaderToH1(page);

  // Mobile menu open/close at narrow widths
  let mobileMenu = null;
  if (w <= 768) {
    mobileMenu = await page.evaluate(async () => {
      const btn =
        document.querySelector('button[aria-label*="menu" i], button[aria-controls*="menu" i], header button') ||
        [...document.querySelectorAll("header button")].find((b) =>
          /menu|open/i.test(b.getAttribute("aria-label") || b.textContent || "")
        );
      if (!btn) return { found: false };
      const before = btn.getAttribute("aria-expanded");
      btn.click();
      await new Promise((r) => setTimeout(r, 400));
      const afterOpen = btn.getAttribute("aria-expanded");
      const menuVisible = !!document.querySelector('[role="dialog"], nav[data-open], [data-state="open"], header [class*="menu"]');
      // phones in open menu
      const menuPhones = [...document.querySelectorAll('a[href^="tel:"]')].map((a) => a.href);
      btn.click();
      await new Promise((r) => setTimeout(r, 300));
      const afterClose = btn.getAttribute("aria-expanded");
      return {
        found: true,
        before,
        afterOpen,
        afterClose,
        menuPhones: [...new Set(menuPhones)],
        menuVisibleHint: menuVisible,
      };
    });
  }

  const shot = path.join(OUT, `home-${w}x${h}.png`);
  await page.screenshot({ path: shot, fullPage: false });

  // Console errors collected externally
  return { breakpoint: `${w}x${h}`, ...data, mobileMenu, screenshot: shot };
}

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  const consoleErrors = [];
  const failedRequests = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));
  page.on("requestfailed", (req) => {
    const url = req.url();
    if (/logo|brand/i.test(url)) failedRequests.push({ url, err: req.failure()?.errorText });
  });
  page.on("response", (res) => {
    const url = res.url();
    if (/logo|brand/i.test(url) && res.status() >= 400) {
      failedRequests.push({ url, status: res.status() });
    }
  });

  const results = [];
  for (const bp of BREAKPOINTS) {
    results.push(await analyzeViewport(page, bp));
  }

  // Desktop Request Appointment navigation check (no form submit)
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE + "/", { waitUntil: "networkidle2" });
  const clicked = await page.evaluate(() => {
    const a = [...document.querySelectorAll("a")].find((el) =>
      /Request Appointment/i.test(el.textContent || "")
    );
    if (!a) return null;
    return a.getAttribute("href");
  });
  if (clicked) {
    await page.goto(new URL(clicked, BASE).toString(), { waitUntil: "networkidle2" });
  }
  const afterNav = { href: clicked, url: page.url() };

  // Inner page header regression sample
  await page.goto(BASE + "/about", { waitUntil: "networkidle2" });
  const aboutHeader = await page.evaluate(() => {
    const logo = document.querySelector("header img");
    return {
      logoSrc: logo?.currentSrc || logo?.src || null,
      light: /horizontal-light/.test(logo?.currentSrc || logo?.src || ""),
    };
  });

  await browser.close();

  const report = {
    base: BASE,
    timestamp: new Date().toISOString(),
    breakpoints: results,
    requestAppointment: afterNav,
    aboutHeader,
    consoleErrors: [...new Set(consoleErrors)].slice(0, 30),
    failedLogoRequests: failedRequests,
  };

  fs.writeFileSync(path.join(OUT, "production-validation.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
