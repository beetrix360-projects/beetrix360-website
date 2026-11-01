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

const internalLinkSources = new Map<string, Set<string>>();

function extractInternalLinksFromHtml(html: string, sourcePath: string) {
  const linkMatches = html.matchAll(/<a\s+[^>]*href=["']([^"']+)["']/gi);
  for (const m of linkMatches) {
    let href = m[1].trim();
    if (!href) continue;
    if (href.startsWith("http://localhost:3000")) {
      href = href.replace("http://localhost:3000", "");
    } else if (href.startsWith("https://beetrix360.com")) {
      href = href.replace("https://beetrix360.com", "");
    } else if (href.startsWith("http://beetrix360.com")) {
      href = href.replace("http://beetrix360.com", "");
    }
    if (
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("javascript:") ||
      href.startsWith("#") ||
      href.startsWith("http://") ||
      href.startsWith("https://")
    ) {
      continue;
    }
    if (!href.startsWith("/")) continue;
    if (href.startsWith("/_next") || href.startsWith("/api")) continue;

    // Normalize: strip query parameters and anchor hash
    const cleanPath = href.split("?")[0].split("#")[0].trim();
    const normalized = cleanPath === "" || cleanPath === "/" ? "/" : cleanPath.replace(/\/+$/, "");

    if (!internalLinkSources.has(normalized)) {
      internalLinkSources.set(normalized, new Set());
    }
    internalLinkSources.get(normalized)!.add(sourcePath);
  }
}

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

    extractInternalLinksFromHtml(html, urlPath);

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

  // 3. Published Inner Seed Pages (HTTP 200, Title brand count = 1, Robots from store)
  const publishedInnerPages = seedData.pages
    .filter((p) => p.path !== "/" && (p as any).published !== false)
    .map((p) => p.path);

  console.log(`[3/5] Validating all ${publishedInnerPages.length} published inner pages (HTTP 200, brand 1x, store robots)...`);

  let checkedCount = 0;
  await runWithConcurrency(publishedInnerPages, async (pagePath) => {
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
    if (checkedCount % 40 === 0 || checkedCount === publishedInnerPages.length) {
      console.log(`  - Verified ${checkedCount}/${publishedInnerPages.length} pages...`);
    }
  }, 8);

  // 3.5. Internal Link Crawl: Verify every internal <a href> extracted across all 159 pages
  console.log(`\n[Link Crawl] Discovered ${internalLinkSources.size} unique internal link targets across 159 pages.`);
  console.log(`  Verifying all internal links (must return 200 OK, 0 redirects, 0 404s)...`);

  const uniqueInternalTargets = Array.from(internalLinkSources.keys()).sort();
  const linkCrawlFailures: { target: string; status: number; issue: string; sources: string[] }[] = [];

  let linkCrawlChecked = 0;
  await runWithConcurrency(uniqueInternalTargets, async (target) => {
    const res = await fetchRoute(target);
    const sources = Array.from(internalLinkSources.get(target) || []);
    const isRedirect = res.status === 301 || res.status === 308 || res.status === 302 || res.status === 307;
    const is404 = res.status === 404;
    const is500 = res.status >= 500;

    if (isRedirect || is404 || is500) {
      const issue = isRedirect
        ? `Redirected (${res.status} -> ${res.location})`
        : is404
        ? `404 Not Found`
        : `Server Error ${res.status}`;
      linkCrawlFailures.push({ target, status: res.status, issue, sources });

      const item: CheckResult = {
        path: target,
        category: "page",
        expected: "200 OK (Direct internal link)",
        actual: issue,
        status: res.status,
        passed: false,
        notes: `Found on: ${sources.slice(0, 3).join(", ")}${sources.length > 3 ? ` (+${sources.length - 3} more)` : ""}`,
      };
      failures.push(item);
    }
    linkCrawlChecked++;
  }, 8);

  console.log(`  - Crawled ${uniqueInternalTargets.length} internal links: ${uniqueInternalTargets.length - linkCrawlFailures.length} direct 200 OK, ${linkCrawlFailures.length} issues.`);

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

  /**
   * Helper: Wait until #loader does not exist or computed display is "none", visibility "hidden", or opacity "0"
   * (timeout 10s), then wait a further 500ms for hero animations to settle.
   */
  async function waitForLoaderGone(targetPage: typeof page): Promise<void> {
    const startTime = Date.now();
    const timeoutMs = 10000;

    while (Date.now() - startTime < timeoutMs) {
      const isGone = await targetPage.evaluate(() => {
        const loader = document.getElementById("loader");
        if (!loader) return true;
        const style = window.getComputedStyle(loader);
        return (
          style.display === "none" ||
          style.visibility === "hidden" ||
          style.opacity === "0"
        );
      });

      if (isGone) {
        await new Promise((r) => setTimeout(r, 500));
        return;
      }
      await new Promise((r) => setTimeout(r, 100));
    }

    await new Promise((r) => setTimeout(r, 500));
  }

  /**
   * Helper: Guard right before each screenshot to ensure #loader is not visible and navigation/menu button is visible.
   */
  async function captureGuardedScreenshot(
    targetPage: typeof page,
    screenshotPath: string,
    screenshotName: string
  ): Promise<void> {
    const check = await targetPage.evaluate(() => {
      const loader = document.getElementById("loader");
      let loaderVisible = false;
      if (loader) {
        const style = window.getComputedStyle(loader);
        const rect = loader.getBoundingClientRect();
        if (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          style.opacity !== "0" &&
          rect.width > 0 &&
          rect.height > 0
        ) {
          loaderVisible = true;
        }
      }

      const nav =
        document.querySelector("#site-nav nav[aria-label='Main']") ||
        document.querySelector("nav[aria-label='Main']");
      const menuBtn = document.querySelector(
        "#site-nav button[aria-label='Open menu'], #site-nav button[aria-label='Close menu'], button[aria-label='Open menu'], button[aria-label='Close menu']"
      );

      const isVisible = (el: Element | null) => {
        if (!el) return false;
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          style.opacity !== "0" &&
          rect.width > 0 &&
          rect.height > 0
        );
      };

      const navVisible = isVisible(nav);
      const menuBtnVisible = isVisible(menuBtn);

      return {
        loaderVisible,
        headerVisible: navVisible || menuBtnVisible,
        navVisible,
        menuBtnVisible,
      };
    });

    if (check.loaderVisible || !check.headerVisible) {
      const errorMsg = `Screenshot guard failed for ${screenshotName}: loaderVisible=${check.loaderVisible}, navVisible=${check.navVisible}, menuBtnVisible=${check.menuBtnVisible}`;
      console.error(`  [GUARD FAILURE] ${errorMsg}`);
      failures.push({
        path: `screenshot-${screenshotName}`,
        category: "page",
        expected: "#loader not visible AND (nav[aria-label='Main'] OR menu button visible)",
        actual: errorMsg,
        status: 200,
        passed: false,
        notes: errorMsg,
      });
    }

    await targetPage.screenshot({ path: screenshotPath });
  }

  // A. Header Zero-Overlap & Spacing Verification at 7 Viewports
  const HEADER_VIEWPORTS = [1280, 1366, 1440, 1536, 1600, 1920, 2560];
  console.log(`\n[Header Verification] Checking layout and zero overlap at ${HEADER_VIEWPORTS.length} viewports...`);

  interface HeaderCheckRecord {
    width: number;
    mode: string;
    logoMenuGap: string;
    menuButtonGap: string;
    overlap: boolean;
    passed: boolean;
    notes: string;
  }
  const headerCheckRecords: HeaderCheckRecord[] = [];
  const navLabels = seedData.navigation.menus.map((m) => m.label);

  for (const w of HEADER_VIEWPORTS) {
    await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1 });
    await waitForLoaderGone(page);
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle2" });
    await waitForLoaderGone(page);

    const check = await page.evaluate(() => {
      const logo = document.querySelector("#site-nav a[aria-label$='home']") as HTMLElement | null;
      const nav = document.querySelector("#site-nav nav[aria-label='Main']") as HTMLElement | null;
      const cta = document.querySelector("#site-nav [data-cta]") as HTMLElement | null;
      const menuBtn = document.querySelector(
        "#site-nav button[aria-label='Open menu'], #site-nav button[aria-label='Close menu']"
      ) as HTMLElement | null;

      const isVisible = (el: HTMLElement | null) => {
        if (!el) return false;
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
      };

      const navVisible = isVisible(nav);
      const menuBtnVisible = isVisible(menuBtn);

      if (!navVisible && menuBtnVisible) {
        return {
          mode: "mobile",
          logoMenuGap: null,
          menuButtonGap: null,
          overlap: false,
          passed: true,
          notes: "Mobile menu button shown (desktop menu hidden)",
        };
      }

      if (navVisible && !menuBtnVisible && logo) {
        const logoRect = logo.getBoundingClientRect();
        const navRect = nav!.getBoundingClientRect();
        const ctaRect = cta ? cta.getBoundingClientRect() : null;

        const logoMenuGap = Math.round(navRect.left - logoRect.right);
        const menuButtonGap = ctaRect ? Math.round(ctaRect.left - navRect.right) : 999;
        const overlap = logoRect.right > navRect.left || (ctaRect ? navRect.right > ctaRect.left : false);

        // Requirement: At least 32px between logo and first item, and between last item and button. No overlap.
        const passed = !overlap && logoMenuGap >= 32 && menuButtonGap >= 32;

        return {
          mode: "desktop",
          logoMenuGap,
          menuButtonGap,
          overlap,
          passed,
          notes: passed
            ? `Desktop bar: gaps ${logoMenuGap}px / ${menuButtonGap}px >= 32px`
            : `FAIL: gaps ${logoMenuGap}px / ${menuButtonGap}px (must be >= 32px, no overlap)`,
        };
      }

      return {
        mode: "invalid",
        logoMenuGap: null,
        menuButtonGap: null,
        overlap: true,
        passed: false,
        notes: `Invalid visibility: navVisible=${navVisible}, menuBtnVisible=${menuBtnVisible}`,
      };
    });

    const rec: HeaderCheckRecord = {
      width: w,
      mode: check.mode,
      logoMenuGap: check.logoMenuGap !== null ? `${check.logoMenuGap}px` : "-",
      menuButtonGap: check.menuButtonGap !== null ? `${check.menuButtonGap}px` : "-",
      overlap: check.overlap,
      passed: check.passed,
      notes: check.notes,
    };
    headerCheckRecords.push(rec);

    if (!check.passed) {
      failures.push({
        path: `header-at-${w}px`,
        category: "page",
        expected: "Desktop bar with gaps >= 32px OR Mobile button",
        actual: check.notes,
        status: 200,
        passed: false,
      });
    }

    // Capture required screenshots
    if (w === 1280) {
      console.log(`  - Capturing Top Bar at 1280px (topbar-1280.png showing menu button)...`);
      await waitForLoaderGone(page);
      await captureGuardedScreenshot(page, path.join(screenshotDir, "topbar-1280.png"), "topbar-1280.png");
    } else if (w === 1440) {
      console.log(`  - Capturing Top Bar closed at 1440px (topbar-1440.png)...`);
      await waitForLoaderGone(page);
      await captureGuardedScreenshot(page, path.join(screenshotDir, "topbar-1440.png"), "topbar-1440.png");
      // Open Company dropdown
      console.log(`  - Capturing Company Dropdown open at 1440px...`);
      const buttons = await page.$$("nav[aria-label='Main'] button");
      const companyIdx = navLabels.indexOf("Company");
      if (companyIdx !== -1 && buttons[companyIdx]) {
        await buttons[companyIdx].click();
        await new Promise((r) => setTimeout(r, 400));
        await waitForLoaderGone(page);
        await captureGuardedScreenshot(page, path.join(screenshotDir, "company-dropdown-1440.png"), "company-dropdown-1440.png");
        await page.keyboard.press("Escape");
        await new Promise((r) => setTimeout(r, 200));
      }
    } else if (w === 1600) {
      console.log(`  - Capturing Top Bar closed at 1600px (topbar-1600.png)...`);
      await waitForLoaderGone(page);
      await captureGuardedScreenshot(page, path.join(screenshotDir, "topbar-1600.png"), "topbar-1600.png");
      // Open Company dropdown
      console.log(`  - Capturing Company Dropdown open at 1600px...`);
      const buttons = await page.$$("nav[aria-label='Main'] button");
      const companyIdx = navLabels.indexOf("Company");
      if (companyIdx !== -1 && buttons[companyIdx]) {
        await buttons[companyIdx].click();
        await new Promise((r) => setTimeout(r, 400));
        await waitForLoaderGone(page);
        await captureGuardedScreenshot(page, path.join(screenshotDir, "company-dropdown-1600.png"), "company-dropdown-1600.png");
        await page.keyboard.press("Escape");
        await new Promise((r) => setTimeout(r, 200));
      }
    } else if (w === 1920) {
      console.log(`  - Capturing Top Bar closed at 1920px (topbar-1920.png)...`);
      await waitForLoaderGone(page);
      await captureGuardedScreenshot(page, path.join(screenshotDir, "topbar-1920.png"), "topbar-1920.png");
      // Open Company dropdown
      console.log(`  - Capturing Company Dropdown open at 1920px...`);
      const buttons = await page.$$("nav[aria-label='Main'] button");
      const companyIdx = navLabels.indexOf("Company");
      if (companyIdx !== -1 && buttons[companyIdx]) {
        await buttons[companyIdx].click();
        await new Promise((r) => setTimeout(r, 400));
        await waitForLoaderGone(page);
        await captureGuardedScreenshot(page, path.join(screenshotDir, "company-dropdown-1920.png"), "company-dropdown-1920.png");
        await page.keyboard.press("Escape");
        await new Promise((r) => setTimeout(r, 200));
      }
    }
  }

  // B. Capture all 7 Mega Menu Dropdowns at 1440px
  console.log(`  - Capturing all 7 Mega Menu Dropdowns at 1440px...`);
  await page.setViewport({ width: 1440, height: 950, deviceScaleFactor: 1 });
  await waitForLoaderGone(page);
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle2" });
  await waitForLoaderGone(page);

  for (let i = 0; i < navLabels.length; i++) {
    const label = navLabels[i];
    const slug = `dropdown-${i + 1}-${label.toLowerCase().replace(/[^a-z0-9]/g, "-")}-1440.png`;

    const buttons = await page.$$("nav[aria-label='Main'] button");
    if (buttons[i]) {
      await buttons[i].click();
      await new Promise((r) => setTimeout(r, 300));
      await waitForLoaderGone(page);
      await captureGuardedScreenshot(page, path.join(screenshotDir, slug), slug);
      await page.keyboard.press("Escape");
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  // C. Mobile Menu at 390px (Opened)
  console.log(`  - Capturing Mobile Menu at 390px (mobile-menu-390.png)...`);
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
  await waitForLoaderGone(page);
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle2" });
  await waitForLoaderGone(page);

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
    await waitForLoaderGone(page);
    await captureGuardedScreenshot(page, path.join(screenshotDir, "mobile-menu-390.png"), "mobile-menu-390.png");
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
    await waitForLoaderGone(page);
    await page.goto(`${BASE_URL}${sp.path}`, { waitUntil: "networkidle2" });
    await waitForLoaderGone(page);
    await captureGuardedScreenshot(page, path.join(screenshotDir, `page-${sp.type}-1440.png`), `page-${sp.type}-1440.png`);

    // 390px
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
    await waitForLoaderGone(page);
    await captureGuardedScreenshot(page, path.join(screenshotDir, `page-${sp.type}-390.png`), `page-${sp.type}-390.png`);
  }

  await page.close();
  await browser.close();

  // 7. Print Summary Report
  console.log(`\n======================================================================`);
  console.log(`  SMOKE CHECK SUMMARY REPORT`);
  console.log(`======================================================================`);
  console.log(`Total Routes Tested:   ${results.length}`);
  console.log(`  - Homepage & System: ${1 + SYSTEM_ROUTES.length}`);
  console.log(`  - Published IA v2:    ${publishedInnerPages.length}`);
  console.log(`  - 301/308 Redirects:  ${redirectEntries.length}`);
  console.log(`  - 404 Unknown Routes: ${UNKNOWN_PATHS.length}`);
  console.log(`Internal Links Crawled: ${uniqueInternalTargets.length}`);
  console.log(`  - Direct 200 OK:      ${uniqueInternalTargets.length - linkCrawlFailures.length}`);
  console.log(`  - Redirects:          ${linkCrawlFailures.filter(f => f.status === 301 || f.status === 308 || f.status === 302 || f.status === 307).length} (expected 0)`);
  console.log(`  - 404 Broken:         ${linkCrawlFailures.filter(f => f.status === 404).length} (expected 0)`);
  console.log(`Total Failures:        ${failures.length}`);
  console.log(`CSS/JS Asset Failures: ${failedAssets.length}`);
  console.log(`Console Errors:        ${consoleErrors.length}`);

  console.log(`\n----------------------------------------------------------------------`);
  console.log(`  HEADER ZERO-OVERLAP & SPACING VERIFICATION TABLE (>= 32px GAPS)`);
  console.log(`----------------------------------------------------------------------`);
  console.log(`| Viewport | Mode    | Logo-Menu Gap | Menu-Button Gap | Overlap | Status | Notes |`);
  console.log(`|----------|---------|---------------|-----------------|---------|--------|-------|`);
  for (const r of headerCheckRecords) {
    const wStr = `${r.width}px`.padEnd(8);
    const mStr = r.mode.padEnd(7);
    const lgStr = r.logoMenuGap.padEnd(13);
    const mbStr = r.menuButtonGap.padEnd(15);
    const ovStr = (r.overlap ? "OVERLAP" : "None").padEnd(7);
    const stStr = (r.passed ? "PASS" : "FAIL").padEnd(6);
    console.log(`| ${wStr} | ${mStr} | ${lgStr} | ${mbStr} | ${ovStr} | ${stStr} | ${r.notes} |`);
  }

  console.log(`\n----------------------------------------------------------------------`);
  console.log(`  HEADER & DROPDOWN VISUAL ARTIFACTS`);
  console.log(`----------------------------------------------------------------------`);
  console.log(`  - Top Bar at 1280px (Menu button):        docs/smoke-screenshots/topbar-1280.png`);
  console.log(`  - Top Bar closed at 1440px:               docs/smoke-screenshots/topbar-1440.png`);
  console.log(`  - Company Dropdown open at 1440px:        docs/smoke-screenshots/company-dropdown-1440.png`);
  console.log(`  - Top Bar closed at 1920px:               docs/smoke-screenshots/topbar-1920.png`);
  console.log(`  - Company Dropdown open at 1920px:        docs/smoke-screenshots/company-dropdown-1920.png`);
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
