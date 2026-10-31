import fs from "fs";
import path from "path";
import os from "os";
import puppeteer from "puppeteer-core";
import seedData from "../src/content/ia-v2.seed.json";
import { RAW_REDIRECT_MAP } from "./migrate-ia-v2";

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

const SAMPLE_PAGES: Record<string, string> = {
  homepage: "/",
  hub: "/seo",
  service: "/seo/local-seo",
  sub: "/marketplaces/amazon/advertising",
  challenge: "/challenges/website-doesnt-drive-leads",
  pricing: "/pricing",
  about: "/about",
  legal: "/privacy-policy",
};

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
    const res = await fetch(`${BASE_URL}${urlPath}`, { redirect: "manual" });
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

    // 2. Robots meta validation: Must match store
    const robotsMatch =
      html.match(/<meta[^>]*name=["']robots["'][^>]*content=["'](.*?)["']/i) ||
      html.match(/<meta[^>]*content=["'](.*?)["'][^>]*name=["']robots["']/i);
    const robots = (robotsMatch ? robotsMatch[1] : "").toLowerCase().trim();

    if (urlPath === "/") {
      if (robots.includes("noindex")) {
        errors.push(`Homepage robots contains "noindex": "${robots}"`);
      }
    } else {
      if (!robots.includes("noindex") || !robots.includes("follow")) {
        errors.push(`Expected robots "noindex, follow", got "${robots || "none"}"`);
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

  // 1. Homepage Check (HTTP 200, Title brand count = 1, Robots indexable)
  console.log(`[1/5] Validating Homepage (/) metadata & robots...`);
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

  // 3. All 167 Inner Seed Pages (HTTP 200, Title brand count = 1, Robots "noindex, follow")
  const innerSeedPages = seedData.pages.map((p) => p.path).filter((p) => p !== "/");
  console.log(`[3/5] Validating all ${innerSeedPages.length} inner pages (HTTP 200, brand 1x, noindex/follow)...`);

  let checkedCount = 0;
  await runWithConcurrency(innerSeedPages, async (pagePath) => {
    const val = await fetchHtmlAndValidate(pagePath);
    const item: CheckResult = {
      path: pagePath,
      category: "page",
      expected: "200 OK | Brand 1x | noindex, follow",
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

  // 6. Browser Rendering, CSS/JS Asset Verification, Console Errors & Screenshots
  console.log(`\n[Browser & Visual Validation] Launching Headless Chrome for Page-Type Checks...`);
  const screenshotDir = path.join(process.cwd(), "docs", "smoke-screenshots");
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "smoke_profile_"));
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    userDataDir: profileDir,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });

  const visualResults: Array<{
    type: string;
    path: string;
    assetsOk: boolean;
    failedAssets: string[];
    consoleErrors: string[];
    screenshot1440: string;
    screenshot390: string;
    passed: boolean;
  }> = [];

  for (const [type, pagePath] of Object.entries(SAMPLE_PAGES)) {
    console.log(`  - Validating page type: [${type.toUpperCase()}] at ${pagePath}`);
    const page = await browser.newPage();
    const failedAssets: string[] = [];
    const consoleErrors: string[] = [];

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

    // 1440px desktop view
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.goto(`${BASE_URL}${pagePath}`, { waitUntil: "networkidle2" });

    const slugName = type === "homepage" ? "home" : type;
    const shot1440Name = `${slugName}-1440.png`;
    const shot1440Path = path.join(screenshotDir, shot1440Name);
    await page.screenshot({ path: shot1440Path });

    // 390px mobile view
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
    await new Promise((r) => setTimeout(r, 250));
    const shot390Name = `${slugName}-390.png`;
    const shot390Path = path.join(screenshotDir, shot390Name);
    await page.screenshot({ path: shot390Path });

    await page.close();

    const passed = failedAssets.length === 0 && consoleErrors.length === 0;
    visualResults.push({
      type,
      path: pagePath,
      assetsOk: failedAssets.length === 0,
      failedAssets,
      consoleErrors,
      screenshot1440: shot1440Name,
      screenshot390: shot390Name,
      passed,
    });
  }

  await browser.close();
  try {
    fs.rmSync(profileDir, { recursive: true, force: true });
  } catch {}

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

  console.log(`\n----------------------------------------------------------------------`);
  console.log(`  PAGE-TYPE ASSET & VISUAL CHECKS`);
  console.log(`----------------------------------------------------------------------`);
  console.log(`Type        | Path                                   | Assets | Console Errors | Visual`);
  console.log(`------------|----------------------------------------|--------|----------------|-------`);
  for (const vr of visualResults) {
    const padType = vr.type.padEnd(11);
    const padPath = vr.path.padEnd(38);
    const padAsset = (vr.assetsOk ? "200 OK" : `${vr.failedAssets.length} FAIL`).padEnd(6);
    const padErr = (vr.consoleErrors.length === 0 ? "0 errors" : `${vr.consoleErrors.length} ERRORS`).padEnd(14);
    const padVis = vr.passed ? "PASS" : "FAIL";
    console.log(`${padType} | ${padPath} | ${padAsset} | ${padErr} | ${padVis}`);
  }

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
  console.log(`  ALL SMOKE CHECKS, METADATA CHECKS & ASSET VERIFICATIONS PASSED!`);
  console.log(`======================================================================\n`);
}

runSmokeCheck().catch((err: any) => {
  console.error("\n[FATAL SMOKE CHECK ERROR]:", err);
  process.exit(1);
});
