const path = require("path");
const fs = require("fs");
const createJiti = require("jiti");

// 1. Load .env.local into process.env if not set (never hardcode secrets)
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

if (!process.env.AUTH_SECRET) {
  console.error("FAIL: AUTH_SECRET must be set in process.env or .env.local");
  process.exit(1);
}

const jiti = createJiti(path.resolve(__dirname, "smoke-runner.js"), {
  alias: {
    "server-only": path.resolve(__dirname, "empty.js"),
    "@": path.resolve(__dirname, "../src"),
  },
});

const { getDbItem, getPageByPath, savePage, deleteRedirect } = jiti("../src/lib/db");
const { createSessionToken, setCliSessionToken } = jiti("../src/lib/auth");
const {
  savePageV2Action,
  createPageV2Action,
  movePageV2Action,
  deletePageV2Action,
} = jiti("../src/app/admin/actions");

const STORE_PATH = path.resolve(__dirname, "../.data/content-store.json");
const BACKUP_PATH = path.resolve(__dirname, "../.data/backups/backup-2026-10-31T12-51-13-749Z.json");

async function runLivePhase6aSuite() {
  console.log("======================================================================");
  console.log("  PHASE 6A LIVE VERIFICATION SUITE (SERVER ACTIONS & REAL SESSION)");
  console.log("======================================================================\n");

  // 1. Snapshot store before test
  const beforeRaw = fs.readFileSync(STORE_PATH, "utf-8");
  const beforeStore = JSON.parse(beforeRaw);

  const initialUpdatedByPages = Object.entries(beforeStore)
    .filter(([k, v]) => k.startsWith("PAGE:") && v && v.updatedBy)
    .map(([k, v]) => [k, v.updatedBy]);

  if (initialUpdatedByPages.length > 0) {
    throw new Error(`Pre-condition failed: Found pages with updatedBy before test: ${JSON.stringify(initialUpdatedByPages)}`);
  }
  console.log("Pre-condition verified: 0 pages have updatedBy in content store.\n");

  // 2. Load existing admin user from database (no invented accounts)
  const existingAdmin = await getDbItem("USER", "usr_initial_admin");
  if (!existingAdmin) {
    throw new Error("FAIL: Existing admin account 'usr_initial_admin' not found in store!");
  }
  console.log(`Using real admin account: ${existingAdmin.name} (${existingAdmin.email}, role: ${existingAdmin.role})`);

  // Sign real JWT token for existing admin and attach session
  const adminToken = await createSessionToken(existingAdmin);
  setCliSessionToken(adminToken);
  console.log("Authenticated session token active for server actions.\n");

  // 3. Test 1: Edit /seo/local-seo via savePageV2Action
  console.log("[Test 1] Editing /seo/local-seo via savePageV2Action()...");
  const currentLocalSeo = await getPageByPath("/seo/local-seo");
  if (!currentLocalSeo) throw new Error("Could not load /seo/local-seo via db.ts!");

  const testH1 = "Local SEO Services & Map Pack Domination";
  const testDesc = "Enterprise local SEO programs engineered to capture local search market share, local citations, and Google Maps visibility.";

  const draftToSave = JSON.parse(JSON.stringify(currentLocalSeo));
  draftToSave.h1 = testH1;
  draftToSave.seo.metaDescription = testDesc;

  // Execute real server action
  const saveRes = await savePageV2Action(draftToSave);
  if (!saveRes.success) throw new Error("savePageV2Action returned unsuccessful!");

  // Verify in content store
  const savedInStore = await getPageByPath("/seo/local-seo");
  if (savedInStore.h1 !== testH1) {
    throw new Error(`FAIL: Store H1 was '${savedInStore.h1}', expected '${testH1}'`);
  }
  if (savedInStore.updatedBy !== existingAdmin.name) {
    throw new Error(`FAIL: updatedBy was '${savedInStore.updatedBy}', expected '${existingAdmin.name}'`);
  }
  console.log(`  - Store updated: H1='${savedInStore.h1}'`);
  console.log(`  - Audit trail verified: updatedBy='${savedInStore.updatedBy}' (${existingAdmin.name})`);

  // Verify store key is path-based (PAGE:/seo/local-seo) and no unslashed key exists
  const currentStoreDisk = JSON.parse(fs.readFileSync(STORE_PATH, "utf-8"));
  if (!currentStoreDisk["PAGE:/seo/local-seo"]) {
    throw new Error("FAIL: PAGE:/seo/local-seo missing from store!");
  }
  if (currentStoreDisk["PAGE:seo/local-seo"]) {
    throw new Error("FAIL: Illegal un-slashed key PAGE:seo/local-seo found!");
  }
  console.log("  - Store key confirmed: PAGE:/seo/local-seo (no un-slashed key).");

  // Probe live Next.js dev server over HTTP
  const liveRes = await fetch("http://localhost:3000/seo/local-seo");
  if (!liveRes.ok) throw new Error(`Live page returned HTTP ${liveRes.status}`);
  const liveHtml = await liveRes.text();
  if (!liveHtml.includes(testH1)) {
    throw new Error("FAIL: Live public page does not contain updated H1!");
  }
  if (!liveHtml.includes(testDesc)) {
    throw new Error("FAIL: Live public page does not contain updated meta description!");
  }
  console.log("  - Live public page rendered updated H1 and meta description.");
  console.log("PASS: savePageV2Action verified on public page and store with audit trail.\n");

  // 4. Test 2: Unique identification & selection
  console.log("[Test 2] Verifying distinct identification (/seo vs /marketplaces/amazon/seo)...");
  const seoPage = await getPageByPath("/seo");
  const amazonSeoPage = await getPageByPath("/marketplaces/amazon/seo");
  if (!seoPage || !amazonSeoPage) throw new Error("Could not load both SEO pages!");

  if (seoPage.id === amazonSeoPage.id) {
    throw new Error(`FAIL: Both pages share identical id '${seoPage.id}'!`);
  }
  console.log(`  - /seo: id='${seoPage.id}', path='${seoPage.path}', slug='${seoPage.slug}'`);
  console.log(`  - /marketplaces/amazon/seo: id='${amazonSeoPage.id}', path='${amazonSeoPage.path}', slug='${amazonSeoPage.slug}'`);
  console.log("PASS: Both pages are uniquely identified and cannot collide in tree selection.\n");

  // 5. Test 3: Temporary Page Move & Single-hop 301 Redirect Collapse
  console.log("[Test 3] Testing movePageV2Action() and deletePageV2Action()...");
  const tempSlug = "test-move-subpage";
  const tempSourcePath = `/seo/${tempSlug}`;
  const tempDestPath = `/branding/${tempSlug}`;

  // Create temporary page under /seo via real server action
  const createRes = await createPageV2Action({
    h1: "Phase 6A Temp Move Subpage",
    slug: tempSlug,
    parentId: seoPage.id,
    pageType: "sub",
    division: "AI Search & SEO",
    targetKeyword: "temporary move subpage test",
  });
  if (!createRes.success || !createRes.page) {
    throw new Error("createPageV2Action failed!");
  }
  const tempPageId = createRes.page.id;
  console.log(`  - Created temporary test page: ${tempSourcePath} (id: ${tempPageId})`);

  // Move /seo/test-move-subpage -> /branding/test-move-subpage via real server action
  const brandingPage = await getPageByPath("/branding");
  if (!brandingPage) throw new Error("/branding parent page not found!");

  const moveRes = await movePageV2Action(tempPageId, brandingPage.id, tempSlug);
  if (!moveRes.success) throw new Error("movePageV2Action failed!");
  console.log(`  - Moved page to ${moveRes.newPath} via movePageV2Action()`);

  // Probe live dev server for redirect from old path
  const r1 = await fetch(`http://localhost:3000${tempSourcePath}`, { redirect: "manual" });
  if (r1.status !== 307 && r1.status !== 308 && r1.status !== 301) {
    throw new Error(`FAIL: Expected redirect from ${tempSourcePath}, got ${r1.status}`);
  }
  const loc1 = r1.headers.get("location");
  if (!loc1 || !loc1.includes(tempDestPath)) {
    throw new Error(`FAIL: Redirect location was '${loc1}', expected '${tempDestPath}'`);
  }
  console.log(`  - Live redirect verified: ${tempSourcePath} -> ${loc1} (status: ${r1.status})`);

  // Move back /branding/test-move-subpage -> /seo/test-move-subpage via real server action
  const moveBackRes = await movePageV2Action(tempPageId, seoPage.id, tempSlug);
  if (!moveBackRes.success) throw new Error("movePageV2Action move back failed!");
  console.log(`  - Moved back to ${moveBackRes.newPath} via movePageV2Action()`);

  const r2 = await fetch(`http://localhost:3000${tempDestPath}`, { redirect: "manual" });
  if (r2.status !== 307 && r2.status !== 308 && r2.status !== 301) {
    throw new Error(`FAIL: Expected redirect from ${tempDestPath}, got ${r2.status}`);
  }
  const loc2 = r2.headers.get("location");
  if (!loc2 || !loc2.includes(tempSourcePath)) {
    throw new Error(`FAIL: Redirect location was '${loc2}', expected '${tempSourcePath}'`);
  }
  console.log(`  - Clean collapse verified: ${tempDestPath} -> ${loc2} (status: ${r2.status}, 0 loops)`);

  // Delete temporary test page via real server action
  const delRes = await deletePageV2Action(tempSourcePath);
  if (!delRes.success) throw new Error("deletePageV2Action failed!");
  console.log(`  - Deleted temporary page ${tempSourcePath} via deletePageV2Action()`);

  // Clean up test redirect records created during temporary move
  await deleteRedirect(tempSourcePath);
  await deleteRedirect(tempDestPath);
  console.log("PASS: Move and single-hop redirect collapse verified via real server actions.\n");

  // 6. Restore /seo/local-seo to exact baseline from backup
  console.log("[Restoring Baseline] Restoring /seo/local-seo from backup...");
  const backupData = JSON.parse(fs.readFileSync(BACKUP_PATH, "utf-8"));
  const backupLocalSeo = backupData["PAGE:/seo/local-seo"];
  if (!backupLocalSeo) throw new Error("Could not find /seo/local-seo in backup!");

  // Delete updatedBy to match original seed baseline
  delete backupLocalSeo.updatedBy;
  // Restore via db.ts savePage
  await savePage(backupLocalSeo);

  const restored = await getPageByPath("/seo/local-seo");
  console.log(`  - Restored H1: '${restored.h1}'`);
  console.log(`  - Restored metaDescription: ${restored.seo.metaDescription}`);
  console.log(`  - Restored updatedBy: ${restored.updatedBy}`);

  // 7. Verify store is identical before and after (except updatedAt)
  console.log("\n[Store Equality Verification]");
  const afterRaw = fs.readFileSync(STORE_PATH, "utf-8");
  const afterStore = JSON.parse(afterRaw);

  const beforeKeys = Object.keys(beforeStore).sort();
  const afterKeys = Object.keys(afterStore).sort();

  if (beforeKeys.length !== afterKeys.length) {
    throw new Error(`FAIL: Key count mismatch! Before: ${beforeKeys.length}, After: ${afterKeys.length}`);
  }

  for (let i = 0; i < beforeKeys.length; i++) {
    if (beforeKeys[i] !== afterKeys[i]) {
      throw new Error(`FAIL: Key mismatch at ${i}: '${beforeKeys[i]}' vs '${afterKeys[i]}'`);
    }
    const key = beforeKeys[i];
    const itemBefore = JSON.parse(JSON.stringify(beforeStore[key]));
    const itemAfter = JSON.parse(JSON.stringify(afterStore[key]));

    // Ignore only updatedAt timestamp difference
    if (itemBefore && typeof itemBefore === "object") delete itemBefore.updatedAt;
    if (itemAfter && typeof itemAfter === "object") delete itemAfter.updatedAt;

    if (JSON.stringify(itemBefore) !== JSON.stringify(itemAfter)) {
      throw new Error(`FAIL: Mismatch in store content for key '${key}'!`);
    }
  }

  // Confirm NO page has updatedBy
  const finalUpdatedByPages = Object.entries(afterStore)
    .filter(([k, v]) => k.startsWith("PAGE:") && v && v.updatedBy)
    .map(([k, v]) => [k, v.updatedBy]);

  if (finalUpdatedByPages.length > 0) {
    throw new Error(`FAIL: Found pages with updatedBy: ${JSON.stringify(finalUpdatedByPages)}`);
  }

  console.log("SUCCESS: Content store is 100% identical before and after (except updatedAt).");
  console.log("SUCCESS: Confirmed zero pages have updatedBy in content store.");
  console.log("\n=== ALL TEST CRITERIA MET WITH REAL SERVER ACTIONS & SESSIONS ===");
}

runLivePhase6aSuite().catch((err) => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
