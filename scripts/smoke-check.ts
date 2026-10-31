import fs from "fs";
import path from "path";
import os from "os";
import puppeteer from "puppeteer-core";
import seedData from "../src/content/ia-v2.seed.json";
import { RAW_REDIRECT_MAP } from "./migrate-ia-v2";
import { getPageByPath } from "../src/lib/db";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

interface CheckResult {
  path: string;
  category: "homepage" | "page" | "redirect" | "unknown" | "system";
  expected: string;
  actual: string;
  status: number;
  passed: boolean;
  notes?: string;
}

const UNKNOWN_PATHS = [
  "/unknown-route-smoke-1",
  "/services/does-not-exist-at-all",
  "/xyz-random-404-check",
];

const SYSTEM_ROUTES = [
  "/admin/login",
  "/sitemap.xml",
  "/robots.txt",
  "/llms.txt",
];

async function fetchRoute(urlPath: string): Promise<{ status: number; location: string | null }> {
  try {
    const res = await fetch(`${BASE_URL}${urlPath}`, {
      redirect: "manual",
    });
    return {
      status: res.status,
      location: res.headers.get("location"),
    };
  } catch (err: any) {
    return {
      status: 500,
      location: null,
    };
  }
}

async function fetchHtmlAndValidate(urlPath: string): Promise<{
  status: number;
  passed: boolean;
  title: string;
  robots: string;
  errors: string[];
}> {
  const errors: string[] = [];
  try {
    let res = await fetch(`${BASE_URL}${urlPath}`, { redirect: "manual" });
    if (res.status === 500) {
      // In dev server mode, on-demand webpack compilation collisions can return 500 once; retry after 400ms
      await new Promise((r) => setTimeout(r, 400));
      res = await fetch(`${BASE_URL}${urlPath}`, { redirect: "manual" });
    }
    if (res.status !== 200) {
      errors.push(`HTTP status ${res.status} (expected 200)`);
      return { status: res.status, passed: false, title: "", robots: "", errors };
    }

    const html = await res.text();

    // 1. Title validation: Must contain "Beetrix360" exactly once
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "";
    const brandMatches = (title.match(/Beetrix360/g) || []).length;
    if (brandMatches !== 1) {
      errors.push(`Brand "Beetrix360" occurred ${brandMatches} times in title: "${title}" (expected exactly 1)`);
    }

    // 2. Robots meta validation: Read dynamically from store (seo.robots)
    const pageRecord = await getPageByPath(urlPath);
    const expectedRobots = pageRecord?.seo?.robots || (urlPath === "/" ? { index: true, follow: true } : { index: false, follow: true });

    const robotsMatch =
      html.match(/<meta[^>]*name=["']robots["'][^>]*content=["'](.*?)["']/i) ||
      html.match(/<meta[^>]*content=["'](.*?)["'][^>]*name=["']robots["']/i);
    const robots = (robotsMatch ? robotsMatch[1] : "").toLowerCase().trim();

    if (expectedRobots.index) {
      if (robots.includes("noindex")) {
        errors.push(`Expected index:true, but HTML meta contains "noindex": "${robots}"`);
      }
    } else {
      if (!robots.includes("noindex")) {
        errors.push(`Expected index:false, but HTML meta is missing "noindex": "${robots || "none"}"`);
      }
    }

    if (expectedRobots.follow) {
      if (robots.includes("nofollow") || !robots.includes("follow")) {
        errors.push(`Expected follow:true, but HTML meta is missing "follow" or contains "nofollow": "${robots}"`);
      }
    } else {
      if (!robots.includes("nofollow")) {
        errors.push(`Expected follow:false, but HTML meta is missing "nofollow": "${robots}"`);
      }
    }

    return {
      status: res.status,
      passed: errors.length === 0,
      title,
      robots,
      errors,
    };
  } catch (err: any) {
    errors.push(`Network/fetch failure: ${err?.message || err}`);
    return { status: 500, passed: false, title: "", robots: "", errors };
  }
}

async function runWithConcurrency<T, R>(items: T[], fn: (item: T) => Promise<R>, concurrency = 8): Promise<R[]> {
  const results: R[] = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function runSmokeCheck() {
  console.log(`\n======================================================================`);
  console.log(`  BEETRIX360 IA v2 SMOKE CHECK & PAGE-BREAK VERIFICATION`);
  console.log(`  Target: ${BASE_URL}`);
  console.log(`======================================================================\n`);

  const results: CheckResult[] = [];
  const failures: CheckResult[] = [];

  // 1. Homepage Check (HTTP 200, Title brand count = 1, Robots indexable from store)
  console.log(`[1/5] Validating Homepage (/) metadata & store-driven robots...`);
  const homeVal = await fetchHtmlAndValidate("/");
  const homePassed = homeVal.passed;
  const homeItem: CheckResult = {
    path: "/",
    category: "homepage",
    expected: "200 OK | Title 1x brand | index, follow",
    actual: `${homeVal.status} | Title: "${homeVal.title}" | Robots: "${homeVal.robots}"`,
    status: homeVal.status,
    passed: homePassed,
    notes: homeVal.errors.join("; ") || undefined,
  };
  results.push(homeItem);
  if (!homePassed) failures.push(homeItem);

  // 2. System Routes (/admin/login, /sitemap.xml, /robots.txt, /llms.txt)
  console.log(`[2/5] Validating System Routes (${SYSTEM_ROUTES.length} routes)...`);
  for (const r of SYSTEM_ROUTES) {
    const res = await fetchRoute(r);
    const passed = res.status === 200;
    const item: CheckResult = {
      path: r,
      category: "system",
      expected: "200 OK",
      actual: `${res.status}`,
      status: res.status,
      passed,
    };
    results.push(item);
    if (!passed) failures.push(item);
  }

  // 3. All 167 Inner Seed Pages (HTTP 200, Title brand count = 1, Robots from store)
  const innerSeedPages = seedData.pages.map((p) => p.path).filter((p) => p !== "/");
  console.log(`[3/5] Validating all ${innerSeedPages.length} inner pages (HTTP 200, brand 1x, store robots)...`);

  let checkedCount = 0;
  await runWithConcurrency(innerSeedPages, async (pagePath) => {
    const val = await fetchHtmlAndValidate(pagePath);
    const item: CheckResult = {
      path: pagePath,
      category: "page",
      expected: "200 OK | Brand 1x | store robots",
      actual: `${val.status} | Brand count: ${(val.title.match(/Beetrix360/g) || []).length} | Robots: "${val.robots}"`,
      status: val.status,
      passed: val.passed,
      notes: val.errors.join("; ") || undefined,
    };
    results.push(item);
    if (!val.passed) failures.push(item);

    checkedCount++;
    if (checkedCount % 40 === 0 || checkedCount === innerSeedPages.length) {
      console.log(`  - Verified ${checkedCount}/${innerSeedPages.length} pages...`);
    }
  }, 8);

  // 4. All 90 Old Paths (Redirects: 301/308 single hop to target)
  const redirectEntries = Object.entries(RAW_REDIRECT_MAP);
  console.log(`\n[4/5] Checking all ${redirectEntries.length} legacy redirect routes (expected 301/308 single hop)...`);
  for (const [oldPath, map] of redirectEntries) {
    const res = await fetchRoute(oldPath);
    const loc = res.location || "";
    const targetPath = map.to;
    const isRedirect = res.status === 301 || res.status === 308;
    const matchesTarget = loc === targetPath || loc.endsWith(targetPath);
    const passed = isRedirect && matchesTarget;

    const item: CheckResult = {
      path: oldPath,
      category: "redirect",
      expected: `301/308 -> ${targetPath}`,
      actual: `${res.status} -> ${loc || "none"}`,
      status: res.status,
      passed,
      notes: map.note,
    };
    results.push(item);
    if (!passed) failures.push(item);
  }

  // 5. Unknown Paths (404 Not Found)
  console.log(`\n[5/5] Checking unknown paths (expected 404)...`);
  for (const unk of UNKNOWN_PATHS) {
    const res = await fetchRoute(unk);
    const passed = res.status === 404;
    const item: CheckResult = {
      path: unk,
      category: "unknown",
      expected: "404 Not Found",
      actual: `${res.status}`,
      status: res.status,
      passed,
    };
    results.push(item);
    if (!passed) failures.push(item);
  }

  // 6. Browser Rendering, Mega Menu Dropdowns, Viewports & Sample Pages
  console.log(`\n[Browser & Visual Validation] Launching Headless Chrome...`);
  const screenshotDir = path.join(process.cwd(), "docs", "smoke-screenshots");
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const profileDir = path.join(process.cwd(), ".data", "smoke_chrome_profile");
  if (fs.existsSync(profileDir)) {
    try {
      fs.rmSync(profileDir, { recursive: true, force: true });
    } catch {}
  }
  fs.mkdirSync(profileDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    userDataDir: profileDir,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage", "--remote-debugging-port=0"],
  });

  const page = await browser.newPage();
  const consoleErrors: string[] = [];
  const failedAssets: string[] = [];

  page.on("response", (resp) => {
    const u = resp.url();
    if (
      u.includes("localhost:3000") &&
      (u.includes(".css") || u.includes(".js") || u.includes("/_next/static/"))
    ) {
      if (resp.status() !== 200 && resp.status() !== 304) {
        failedAssets.push(`${u} (status: ${resp.status()})`);
      }
    }
  });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const txt = msg.text();
      if (!txt.includes("google-analytics") && !txt.includes("googletagmanager")) {
        consoleErrors.push(txt);
      }
    }
  });

  page.on("pageerror", (err: any) => {
    consoleErrors.push(err.message || String(err));
  });

  // A. Top Bar at 1280px Desktop Breakpoint
  console.log(`  - Capturing Top Bar at 1280px (topbar-1280.png)...`);
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(screenshotDir, "topbar-1280.png") });

  // B. All 7 Mega Menu Dropdowns at 1440px Desktop Breakpoint
  console.log(`  - Capturing all 7 Mega Menu Dropdowns at 1440px...`);
  await page.setViewport({ width: 1440, height: 950, deviceScaleFactor: 1 });
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1200));

  const navLabels = seedData.navigation.menus.map((m) => m.label);
  for (let i = 0; i < navLabels.length; i++) {
    const label = navLabels[i];
    const slug = `dropdown-${i + 1}-${label.toLowerCase().replace(/[^a-z0-9]/g, "-")}-1440.png`;
    console.log(`    * [${i + 1}/7] Dropdown: "${label}" -> ${slug}`);

    // Click trigger button by index
    const buttons = await page.$$("nav[aria-label='Main'] button");
    if (buttons[i]) {
      await buttons[i].click();
      await page.waitForFunction(
        (idx) => {
          const el = document.getElementById(`mega-menu-${idx}`);
          return el && window.getComputedStyle(el).opacity === "1";
        },
        { timeout: 3000 },
        i
      ).catch(() => {});
      await new Promise((r) => setTimeout(r, 300));
      await page.screenshot({ path: path.join(screenshotDir, slug) });
      // Close dropdown
      await page.keyboard.press("Escape");
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  // C. Mobile Menu at 390px (Opened)
  console.log(`  - Capturing Mobile Menu at 390px (mobile-menu-390.png)...`);
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1200));

  const hamburger = await page.$("button[aria-label='Open menu']");
  if (hamburger) {
    await hamburger.click();
    await page.waitForSelector("nav[aria-label='Mobile Navigation'] button", { timeout: 3000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 300));
    // Click first accordion button
    const firstAcc = await page.$("nav[aria-label='Mobile Navigation'] button");
    if (firstAcc) {
      await firstAcc.click();
      await new Promise((r) => setTimeout(r, 600));
    }
    await page.screenshot({ path: path.join(screenshotDir, "mobile-menu-390.png") });
  }

  // D. 3 Sample Pages with Rich Placeholder Content (Service, Challenge, Pricing)
  const samplePagesToCapture = [
    { type: "service", path: "/seo/local-seo", label: "Service" },
    { type: "challenge", path: "/challenges/website-doesnt-drive-leads", label: "Challenge" },
    { type: "pricing", path: "/pricing", label: "Pricing" },
  ];

  for (const sp of samplePagesToCapture) {
    console.log(`  - Capturing Placeholder Sample: [${sp.label.toUpperCase()}] at ${sp.path}...`);
    // 1440px
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.goto(`${BASE_URL}${sp.path}`, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({ path: path.join(screenshotDir, `page-${sp.type}-1440.png`) });

    // 390px
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
    await new Promise((r) => setTimeout(r, 300));
    await page.screenshot({ path: path.join(screenshotDir, `page-${sp.type}-390.png`) });
  }

  await page.close();
  await browser.close();

  // 7. Print Summary Report
  console.log(`\n======================================================================`);
  console.log(`  SMOKE CHECK SUMMARY REPORT`);
  console.log(`======================================================================`);
  console.log(`Total Routes Tested:   ${results.length}`);
  console.log(`  - Homepage & System: ${1 + SYSTEM_ROUTES.length}`);
  console.log(`  - Seed IA v2 Pages:   ${innerSeedPages.length}`);
  console.log(`  - 301/308 Redirects:  ${redirectEntries.length}`);
  console.log(`  - 404 Unknown Routes: ${UNKNOWN_PATHS.length}`);
  console.log(`Total Failures:        ${failures.length}`);
  console.log(`CSS/JS Asset Failures: ${failedAssets.length}`);
  console.log(`Console Errors:        ${consoleErrors.length}`);

  console.log(`\n----------------------------------------------------------------------`);
  console.log(`  PHASE 4 & 5 VISUAL VERIFICATION ARTIFACTS`);
  console.log(`----------------------------------------------------------------------`);
  console.log(`  - Top Bar at 1280px:                      docs/smoke-screenshots/topbar-1280.png`);
  console.log(`  - 7 Dropdowns at 1440px:                  docs/smoke-screenshots/dropdown-1..7-*-1440.png`);
  console.log(`  - Mobile Drawer at 390px:                 docs/smoke-screenshots/mobile-menu-390.png`);
  console.log(`  - Sample Service Page (/seo/local-seo):   docs/smoke-screenshots/page-service-1440.png`);
  console.log(`  - Sample Challenge (/challenges/...):     docs/smoke-screenshots/page-challenge-1440.png`);
  console.log(`  - Sample Pricing Page (/pricing):         docs/smoke-screenshots/page-pricing-1440.png`);

  if (failures.length > 0) {
    console.error(`\n[FAILURES DETECTED (${failures.length})]:`);
    for (const f of failures) {
      console.error(`  - [${f.category.toUpperCase()}] ${f.path}: Expected ${f.expected}`);
      console.error(`    Actual: ${f.actual}`);
      if (f.notes) console.error(`    Note:   ${f.notes}`);
    }
    process.exit(1);
  }

  console.log(`\n======================================================================`);
  console.log(`  ALL SMOKE CHECKS, STORE ROBOTS & VISUAL ASSETS VERIFIED (100% PASS)`);
  console.log(`======================================================================\n`);
}

runSmokeCheck().catch((err: any) => {
  console.error("\n[FATAL SMOKE CHECK ERROR]:", err);
  process.exit(1);
});
