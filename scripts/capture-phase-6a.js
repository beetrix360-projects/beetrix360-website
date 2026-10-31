const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { SignJWT } = require("jose");

const AUTH_SECRET = "7c8f9b2d4e1a6c8e3f0b5d9a2c4e7f1b9a8c3d5e2f4a6b8c1d9e0f2a4b6c8e1";
const JWT_SECRET = new TextEncoder().encode(AUTH_SECRET);
const ARTIFACT_DIR = "C:/Users/anees/.gemini/antigravity/brain/d4188237-15fe-4379-9c5e-2d7457de7ba0";
const SMOKE_DIR = path.join(__dirname, "../docs/smoke-screenshots");

async function makeToken(role = "admin", name = "Master Administrator", email = "admin@beetrix360.com") {
  return await new SignJWT({
    id: "usr_initial_admin",
    email,
    name,
    role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(JWT_SECRET);
}

async function capture() {
  console.log("Launching Chrome for Phase 6A visual captures...");
  const profileDir = path.join(os.tmpdir(), "chrome-capture-profile-" + Date.now());
  fs.mkdirSync(profileDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    userDataDir: profileDir,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Set Auth Cookie
  const token = await makeToken();
  await page.setCookie({
    name: "bx_admin_token",
    value: token,
    domain: "localhost",
    path: "/",
    httpOnly: true,
  });

  console.log("Navigating to http://localhost:3000/admin/pages...");
  await page.goto("http://localhost:3000/admin/pages", { waitUntil: "networkidle0" });
  await page.waitForSelector("h1", { timeout: 15000 });
  await new Promise((r) => setTimeout(r, 1000));

  // 1. Capture Page Tree & Editor overview (admin-pages-tree.png)
  console.log("Capturing 1: Page Tree (admin-pages-tree.png)...");
  const treePath = path.join(SMOKE_DIR, "admin-pages-tree.png");
  await page.screenshot({ path: treePath, fullPage: false });
  fs.copyFileSync(treePath, path.join(ARTIFACT_DIR, "admin-pages-tree.png"));

  // 2. Capture Content & Structure tab with section blocks (admin-page-editor.png)
  console.log("Capturing 2: Content & Structure (admin-page-editor.png)...");
  const editorPath = path.join(SMOKE_DIR, "admin-page-editor.png");
  await page.screenshot({ path: editorPath, fullPage: true });
  fs.copyFileSync(editorPath, path.join(ARTIFACT_DIR, "admin-page-editor.png"));

  // 3. Switch to SEO Tab
  console.log("Switching to SEO Tab...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const seoBtn = buttons.find((b) => b.textContent && b.textContent.includes("SEO, Meta"));
    if (seoBtn) seoBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  console.log("Capturing 3: SEO Tab with Previews & Checklist (admin-seo-tab.png)...");
  const seoPath = path.join(SMOKE_DIR, "admin-seo-tab.png");
  await page.screenshot({ path: seoPath, fullPage: true });
  fs.copyFileSync(seoPath, path.join(ARTIFACT_DIR, "admin-seo-tab.png"));

  // 4. Capture /admin/seo inspector page
  console.log("Navigating to http://localhost:3000/admin/seo inspector...");
  await page.goto("http://localhost:3000/admin/seo", { waitUntil: "networkidle0" });
  await page.waitForSelector("table", { timeout: 15000 });
  await new Promise((r) => setTimeout(r, 1000));

  console.log("Capturing 4: SEO Inspector Table (admin-seo-inspector.png)...");
  const inspectorPath = path.join(SMOKE_DIR, "admin-seo-inspector.png");
  await page.screenshot({ path: inspectorPath, fullPage: false });
  fs.copyFileSync(inspectorPath, path.join(ARTIFACT_DIR, "admin-seo-inspector.png"));

  await browser.close();
  try {
    fs.rmSync(profileDir, { recursive: true, force: true });
  } catch {}
  console.log("All Phase 6A screenshots captured successfully!");
}

capture().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
