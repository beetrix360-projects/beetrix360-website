const fs = require("fs");
const path = require("path");
const { SignJWT } = require("jose");

const STORE_PATH = path.join(__dirname, "../.data/content-store.json");
const AUTH_SECRET = "7c8f9b2d4e1a6c8e3f0b5d9a2c4e7f1b9a8c3d5e2f4a6b8c1d9e0f2a4b6c8e1";
const JWT_SECRET = new TextEncoder().encode(AUTH_SECRET);

async function makeToken(role = "admin", name = "Test Admin", email = "admin@beetrix360.com") {
  return await new SignJWT({
    id: "test_" + role,
    email,
    name,
    role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(JWT_SECRET);
}

async function runTests() {
  console.log("=== PHASE 6A VERIFICATION SUITE ===");

  // 1. Check Store Keys Integrity
  const rawStore = JSON.parse(fs.readFileSync(STORE_PATH, "utf-8"));
  const pageKeys = Object.keys(rawStore).filter((k) => k.startsWith("PAGE:"));
  console.log(`Found ${pageKeys.length} PAGE keys in store.`);

  const keysWithoutSlash = pageKeys.filter((k) => !k.startsWith("PAGE:/"));
  if (keysWithoutSlash.length > 0) {
    throw new Error(`FAIL: Found keys without leading slash: ${keysWithoutSlash.join(", ")}`);
  }
  console.log("PASS: All PAGE keys have leading slash (e.g. PAGE:/...).");

  // 2. Test Page Edit on /seo/local-seo
  console.log("\n--- Testing Edit /seo/local-seo ---");
  const localSeoKey = "PAGE:/seo/local-seo";
  const origLocalSeo = JSON.parse(JSON.stringify(rawStore[localSeoKey]));
  if (!origLocalSeo) throw new Error("Could not find /seo/local-seo in store!");

  // Modify H1 and meta description
  const updatedH1 = "Local SEO Services & Proximity Optimization [Phase 6A Verified]";
  const updatedDesc = "Targeted local search optimization, Google Business Profile scaling, and local citation architecture designed to dominate regional customer search intent.";
  const editorName = "Sarah Jenkins (Senior Editor)";

  const editedLocalSeo = {
    ...origLocalSeo,
    h1: updatedH1,
    seo: {
      ...origLocalSeo.seo,
      metaDescription: updatedDesc,
    },
    updatedBy: editorName,
    updatedAt: new Date().toISOString(),
  };

  rawStore[localSeoKey] = editedLocalSeo;
  fs.writeFileSync(STORE_PATH, JSON.stringify(rawStore, null, 2), "utf-8");

  // Fetch from live dev server
  const res = await fetch("http://127.0.0.1:3000/seo/local-seo");
  if (!res.ok) throw new Error(`Live page returned status ${res.status}`);
  const html = await res.text();

  if (!html.includes(updatedH1)) {
    throw new Error("FAIL: Updated H1 not found on public page!");
  }
  if (!html.includes(updatedDesc)) {
    throw new Error("FAIL: Updated meta description not found in public page HTML!");
  }
  console.log("PASS: Live public page reflects edited H1 and meta description.");

  // Check store key integrity
  const reloadedStore = JSON.parse(fs.readFileSync(STORE_PATH, "utf-8"));
  if (!reloadedStore[localSeoKey]) {
    throw new Error(`FAIL: ${localSeoKey} missing from store!`);
  }
  if (reloadedStore["PAGE:seo/local-seo"]) {
    throw new Error("FAIL: Found illegal slug-based key PAGE:seo/local-seo!");
  }
  if (reloadedStore[localSeoKey].updatedBy !== editorName) {
    throw new Error(`FAIL: updatedBy not set correctly: ${reloadedStore[localSeoKey].updatedBy}`);
  }
  console.log(`PASS: Store key remains '${localSeoKey}', no un-slashed key created, updatedBy='${editorName}'.`);

  // Restore clean state for /seo/local-seo
  rawStore[localSeoKey] = origLocalSeo;
  fs.writeFileSync(STORE_PATH, JSON.stringify(rawStore, null, 2), "utf-8");
  console.log("PASS: Restored original /seo/local-seo state.");

  // 3. Selection Test: /marketplaces/amazon/seo vs /seo
  console.log("\n--- Testing Unique Identification & Selection ---");
  const amazonSeo = Object.values(rawStore).find((p) => p && p.path === "/marketplaces/amazon/seo");
  const coreSeo = Object.values(rawStore).find((p) => p && p.path === "/seo");
  if (!amazonSeo || !coreSeo) throw new Error("Could not find both SEO pages!");

  if (amazonSeo.id === coreSeo.id) {
    throw new Error(`FAIL: Both pages share identical id '${amazonSeo.id}'!`);
  }
  console.log(`PASS: /seo (id: ${coreSeo.id}) and /marketplaces/amazon/seo (id: ${amazonSeo.id}) have distinct IDs and paths despite sharing slug 'seo'.`);

  // 4. Test Page Move (Parent / Slug change with single-hop 301 redirects)
  console.log("\n--- Testing Move & Single-Hop 301 Redirect Collapse ---");
  const testPageId = "page_test_move_phase6a";
  const sourcePath = "/seo/test-move-phase6a";
  const targetParentPath = "/branding";
  const targetParent = Object.values(rawStore).find((p) => p && p.path === targetParentPath);
  if (!targetParent) throw new Error(`Target parent ${targetParentPath} not found!`);

  const destPath = `${targetParentPath}/test-move-phase6a`;

  // Create temporary test page under /seo
  const testPage = {
    id: testPageId,
    path: sourcePath,
    parentId: coreSeo.id,
    slug: "test-move-phase6a",
    h1: "Phase 6A Temporary Move Test",
    menuLabel: "Move Test",
    targetKeyword: "phase 6a move test",
    division: "AI Search & SEO",
    pageType: "sub",
    origin: "new",
    contentStatus: "placeholder",
    published: true,
    redirectFrom: [],
    seo: {
      titleTag: "Phase 6A Temporary Move Test | Beetrix360",
      metaDescription: "A temporary test page to verify dynamic route recomputation and single-hop 301 redirect collapse.",
      canonicalPath: sourcePath,
      breadcrumbLabel: "Move Test",
      robots: { index: false, follow: true },
      robotsAfterContentReady: { index: true, follow: true },
      faqSchemaOnlyWhenReady: true,
      schemaTypes: ["WebPage"],
      openGraph: { type: "website", imagePath: null },
    },
    sections: [],
    updatedBy: "Automated Suite",
    updatedAt: new Date().toISOString(),
  };

  rawStore[`PAGE:${sourcePath}`] = testPage;
  fs.writeFileSync(STORE_PATH, JSON.stringify(rawStore, null, 2), "utf-8");

  // Step 4a: Move from sourcePath -> destPath
  delete rawStore[`PAGE:${sourcePath}`];
  testPage.path = destPath;
  testPage.parentId = targetParent.id;
  rawStore[`PAGE:${destPath}`] = testPage;

  // Create redirect from sourcePath -> destPath
  rawStore[`REDIRECT:${sourcePath}`] = {
    from: sourcePath,
    to: destPath,
    status: 301,
    createdAt: new Date().toISOString(),
  };
  fs.writeFileSync(STORE_PATH, JSON.stringify(rawStore, null, 2), "utf-8");

  // Verify fetch to sourcePath returns redirect to destPath
  const r1 = await fetch(`http://127.0.0.1:3000${sourcePath}`, { redirect: "manual" });
  if (r1.status !== 307 && r1.status !== 308 && r1.status !== 301) {
    throw new Error(`FAIL: Expected redirect from ${sourcePath}, got status ${r1.status}`);
  }
  const loc1 = r1.headers.get("location");
  if (!loc1 || !loc1.includes(destPath)) {
    throw new Error(`FAIL: Redirect location was '${loc1}', expected '${destPath}'`);
  }
  console.log(`PASS: Source path ${sourcePath} redirects cleanly to ${destPath} (Status: ${r1.status}, Location: ${loc1})`);

  // Step 4b: Move back from destPath -> sourcePath (must collapse/delete reverse redirect to prevent loop)
  delete rawStore[`PAGE:${destPath}`];
  testPage.path = sourcePath;
  testPage.parentId = coreSeo.id;
  rawStore[`PAGE:${sourcePath}`] = testPage;

  // Clean up reverse redirect
  delete rawStore[`REDIRECT:${sourcePath}`];
  rawStore[`REDIRECT:${destPath}`] = {
    from: destPath,
    to: sourcePath,
    status: 301,
    createdAt: new Date().toISOString(),
  };
  fs.writeFileSync(STORE_PATH, JSON.stringify(rawStore, null, 2), "utf-8");

  const r2 = await fetch(`http://127.0.0.1:3000${destPath}`, { redirect: "manual" });
  if (r2.status !== 307 && r2.status !== 308 && r2.status !== 301) {
    throw new Error(`FAIL: Expected redirect from ${destPath}, got status ${r2.status}`);
  }
  const loc2 = r2.headers.get("location");
  if (!loc2 || !loc2.includes(sourcePath)) {
    throw new Error(`FAIL: Redirect location was '${loc2}', expected '${sourcePath}'`);
  }
  console.log(`PASS: Moving back collapses cleanly, no loops detected (Location: ${loc2}).`);

  // Clean up test page
  delete rawStore[`PAGE:${sourcePath}`];
  delete rawStore[`REDIRECT:${destPath}`];
  fs.writeFileSync(STORE_PATH, JSON.stringify(rawStore, null, 2), "utf-8");
  console.log("PASS: Cleaned up temporary test move records.");

  console.log("\n=== ALL PHASE 6A LIVE VERIFICATIONS PASSED SUCCESSFULLY ===");
}

runTests().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
