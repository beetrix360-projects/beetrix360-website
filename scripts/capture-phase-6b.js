const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { SignJWT } = require("jose");

// Load .env.local into process.env if not set
if (!process.env.AUTH_SECRET) {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const match = line.trim().match(/^AUTH_SECRET\s*=\s*["']?([^"'\r\n]+)["']?/);
      if (match) {
        process.env.AUTH_SECRET = match[1];
        break;
      }
    }
  }
}

const AUTH_SECRET = process.env.AUTH_SECRET;
if (!AUTH_SECRET) {
  throw new Error("AUTH_SECRET must be set in process.env or .env.local");
}

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
  console.log("Launching Chrome for Phase 6B visual captures...");
  const profileDir = path.join(os.tmpdir(), "chrome-capture-nav-" + Date.now());
  fs.mkdirSync(profileDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    userDataDir: profileDir,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  // Set Auth Cookie
  const token = await makeToken();
  await page.setCookie({
    name: "auth_token",
    value: token,
    domain: "localhost",
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
  });

  console.log("1. Capturing Navigation Menu Editor...");
  await page.goto("http://localhost:3000/admin/navigation", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1200));

  const p1 = path.join(ARTIFACT_DIR, "admin-nav-editor.png");
  const s1 = path.join(SMOKE_DIR, "admin-nav-editor.png");
  await page.screenshot({ path: p1, fullPage: false });
  fs.copyFileSync(p1, s1);
  console.log("   Saved admin-nav-editor.png");

  console.log("2. Capturing Live Desktop Preview (1440px)...");
  // Click on "Desktop 1440px" tab
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const btn = buttons.find((b) => b.textContent && b.textContent.includes("Desktop 1440px"));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  const p2 = path.join(ARTIFACT_DIR, "admin-nav-preview.png");
  const s2 = path.join(SMOKE_DIR, "admin-nav-preview.png");
  await page.screenshot({ path: p2, fullPage: false });
  fs.copyFileSync(p2, s2);
  console.log("   Saved admin-nav-preview.png");

  console.log("3. Capturing Live Validation Error State...");
  // Switch back to Editor tab
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const btn = buttons.find((b) => b.textContent && b.textContent.trim().startsWith("Editor"));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // Click "+ Add Group" to create a 6th track, which triggers a 6 / 5 tracks error live!
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const btn = buttons.find((b) => b.textContent && b.textContent.includes("Add Group"));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  const p3 = path.join(ARTIFACT_DIR, "admin-nav-error.png");
  const s3 = path.join(SMOKE_DIR, "admin-nav-error.png");
  await page.screenshot({ path: p3, fullPage: false });
  fs.copyFileSync(p3, s3);
  console.log("   Saved admin-nav-error.png");

  await browser.close();
  console.log("Phase 6B visual captures complete!\n");
}

capture().catch((err) => {
  console.error("Capture error:", err);
  process.exit(1);
});
