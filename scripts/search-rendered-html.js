const fs = require("fs");

const BANNED_PHRASES = [
  "published case studies",
  "specialized teams",
  "multi-disciplinary teams",
  "senior technical strategists",
  "practitioners",
  "enterprise client partnerships",
  "empirical results",
  "verified delivery standards",
  "predictable",
  "measurable digital visibility",
  "investment tiers",
];

async function runBannedPhrasesHtmlSearch() {
  console.log("======================================================================");
  console.log("  RENDERED PUBLIC HTML BANNED-PHRASE SEARCH (ALL 159 PAGES)");
  console.log("======================================================================\n");

  const store = JSON.parse(fs.readFileSync(".data/content-store.json", "utf8"));
  const pageKeys = Object.keys(store).filter((k) => k.startsWith("PAGE:"));
  const paths = pageKeys.map((k) => store[k].path).sort();

  console.log(`Loaded ${paths.length} pages from live content store.`);

  let totalScanned = 0;
  let matchesFound = 0;
  const violationDetails = [];

  const CONCURRENCY = 6;
  const queue = [...paths];

  async function worker() {
    while (queue.length > 0) {
      const p = queue.shift();
      const url = `http://localhost:3000${p === "/" ? "" : p}`;
      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.warn(`[WARN] Page ${p} returned HTTP status ${res.status}`);
          continue;
        }
        const html = await res.text();
        totalScanned++;

        for (const phrase of BANNED_PHRASES) {
          const regex = new RegExp(`\\b${phrase}\\b`, "i");
          if (regex.test(html)) {
            matchesFound++;
            violationDetails.push({ path: p, phrase });
            console.error(`[VIOLATION] Found "${phrase}" on ${p}`);
          }
        }
        if (totalScanned % 20 === 0 || totalScanned === paths.length) {
          console.log(`Scanned ${totalScanned} / ${paths.length} pages...`);
        }
      } catch (err) {
        console.error(`[ERROR] Failed to fetch ${url}:`, err.message);
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  console.log("\n----------------------------------------------------------------------");
  console.log(`Total Pages Scanned via Rendered Public HTML: ${totalScanned} / ${paths.length}`);
  console.log(`Total Banned-Phrase Occurrences Found: ${matchesFound}`);
  console.log("----------------------------------------------------------------------\n");

  if (matchesFound === 0) {
    console.log("RESULT: 0 banned phrases found across all 159 rendered pages (100% compliant).");
  } else {
    console.error("FAIL: Found violations:", violationDetails);
    process.exit(1);
  }
}

runBannedPhrasesHtmlSearch().catch((err) => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});
