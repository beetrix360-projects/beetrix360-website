import fs from "fs";
import path from "path";
import {
  exportAllDbRecords,
  getAllPages,
  putDbItem,
} from "../src/lib/db";
import type { PageRecordV2, SectionBlockV2 } from "../src/lib/types";
import {
  generateMetaDescription,
  generatePlaceholderSections,
  LOCKED_PATHS,
  LOCKED_REASONS,
} from "../src/lib/placeholder-generator";

// Banned phrases per strict editorial standard
const BANNED_PATTERNS: { name: string; regex: RegExp }[] = [
  { name: "published case studies", regex: /\bpublished case studies\b/gi },
  { name: "specialized teams", regex: /\bspecialized teams\b/gi },
  { name: "multi-disciplinary teams", regex: /\bmulti-disciplinary teams\b/gi },
  { name: "senior technical strategists", regex: /\bsenior technical strategists\b/gi },
  { name: "practitioners", regex: /\bpractitioners\b/gi },
  { name: "enterprise client partnerships", regex: /\benterprise client partnerships\b/gi },
  { name: "empirical results", regex: /\bempirical results\b/gi },
  { name: "verified delivery standards", regex: /\bverified delivery standards\b/gi },
  { name: "predictable", regex: /\bpredictable\b/gi },
  { name: "measurable digital visibility", regex: /\bmeasurable digital visibility\b/gi },
  { name: "investment tiers", regex: /\binvestment tiers\b/gi },
  { name: "fixed-scope sprint", regex: /\bfixed-scope sprint\b/gi },
  { name: "percentage (%)", regex: /%/g },
  { name: "currency with numbers", regex: /[$£€]\s*\d+/gi },
  { name: "guarantee", regex: /\b(guarantee|guarantees|guaranteed)\b/gi },
  { name: "testimonial", regex: /\b(testimonial|testimonials)\b/gi },
  { name: "award", regex: /\b(award|awards)\b/gi },
  { name: "certified/certification", regex: /\b(certified|certification)\b/gi },
  { name: "years of experience", regex: /\byears of experience\b/gi },
  { name: "numbers + clients/projects/days/weeks", regex: /\b\d+\s+(clients|projects|days|weeks)\b/gi },
];

/**
 * Extracts visible public text from sections (excluding bracketed notices)
 */
function extractVisiblePublicText(sections: SectionBlockV2[], h1: string): string {
  const parts: string[] = [h1];

  for (const s of sections) {
    if (!s || !s.content) continue;

    if (s.title && !s.title.includes("[") && !s.title.includes("]")) {
      parts.push(s.title);
    }

    switch (s.type) {
      case "hero": {
        const tagline = s.content.tagline || s.content.description;
        if (tagline && !tagline.includes("[")) parts.push(tagline);
        break;
      }

      case "richText":
      case "intro": {
        const paragraphs: string[] = s.content.paragraphs || (s.content.body ? [s.content.body] : []);
        for (const p of paragraphs) {
          if (typeof p === "string" && !p.includes("[")) parts.push(p);
        }
        break;
      }

      case "bulletList": {
        const items: string[] = s.content.items || [];
        for (const it of items) {
          if (typeof it === "string" && !it.includes("[")) parts.push(it);
        }
        break;
      }

      case "process": {
        const steps = s.content.steps || [];
        for (const st of steps) {
          if (st.title && !st.title.includes("[")) parts.push(st.title);
          if (st.description && !st.description.includes("[")) parts.push(st.description);
        }
        break;
      }

      case "faq": {
        const items = s.content.items || [];
        for (const it of items) {
          if (it.question && !it.question.includes("[")) parts.push(it.question);
          if (it.answer && !it.answer.includes("[")) parts.push(it.answer);
        }
        break;
      }

      case "childCards": {
        if (s.content.subtitle && !s.content.subtitle.includes("[")) parts.push(s.content.subtitle);
        const cards = s.content.cards || [];
        for (const c of cards) {
          if (c.name && !c.name.includes("[")) parts.push(c.name);
        }
        break;
      }

      case "proofPlaceholder": {
        if (s.content.text && !s.content.text.includes("[")) {
          parts.push(s.content.text);
        }
        break;
      }

      case "cta": {
        if (s.content.text && !s.content.text.includes("[")) parts.push(s.content.text);
        if (s.content.buttonLabel && !s.content.buttonLabel.includes("[")) parts.push(s.content.buttonLabel);
        break;
      }

      case "relatedLinks": {
        const links = s.content.links || [];
        for (const l of links) {
          if (l.name && !l.name.includes("[")) parts.push(l.name);
        }
        break;
      }
    }
  }

  return parts.join(" ");
}

/**
 * Strips page entities (h1, menuLabel, breadcrumbLabel, targetKeyword) case-insensitively
 */
function stripPageEntities(text: string, page: PageRecordV2): string {
  const entities = [
    page.h1,
    page.menuLabel,
    (page as any).breadcrumbLabel,
    page.targetKeyword,
  ]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  let cleaned = text;
  for (const ent of entities) {
    if (!ent || !ent.trim()) continue;
    const escaped = ent.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    cleaned = cleaned.replace(new RegExp(escaped, "gi"), " ");
  }
  return cleaned;
}

/**
 * Extracts sentences with 6+ words from sections for uniqueness comparison,
 * ignoring shared proofPlaceholder and cta blocks.
 */
function extractSentencesForUniqueness(sections: SectionBlockV2[], page: PageRecordV2): string[] {
  const parts: string[] = [];

  for (const s of sections) {
    if (!s || !s.content) continue;
    // Ignore shared proof block and final CTA block
    if (s.type === "proofPlaceholder" || s.type === "cta") continue;

    if (s.title && !s.title.includes("[")) parts.push(s.title);

    switch (s.type) {
      case "hero": {
        const tagline = s.content.tagline || s.content.description;
        if (tagline && !tagline.includes("[")) parts.push(tagline);
        break;
      }
      case "richText":
      case "intro": {
        const paragraphs = s.content.paragraphs || (s.content.body ? [s.content.body] : []);
        for (const p of paragraphs) {
          if (typeof p === "string" && !p.includes("[")) parts.push(p);
        }
        break;
      }
      case "bulletList": {
        const items = s.content.items || [];
        for (const it of items) {
          if (typeof it === "string" && !it.includes("[")) parts.push(it);
        }
        break;
      }
      case "process": {
        const steps = s.content.steps || [];
        for (const st of steps) {
          if (st.title && !st.title.includes("[")) parts.push(st.title);
          if (st.description && !st.description.includes("[")) parts.push(st.description);
        }
        break;
      }
      case "faq": {
        const items = s.content.items || [];
        for (const it of items) {
          if (it.question && !it.question.includes("[")) parts.push(it.question);
          if (it.answer && !it.answer.includes("[")) parts.push(it.answer);
        }
        break;
      }
      case "childCards": {
        if (s.content.subtitle && !s.content.subtitle.includes("[")) parts.push(s.content.subtitle);
        break;
      }
    }
  }

  const combinedText = parts.join(" ");
  const stripped = stripPageEntities(combinedText, page);

  // Split on punctuation (. ! ?) followed by whitespace
  const rawSentences = stripped.split(/[.!?]+[\s\r\n]+/);
  const result: string[] = [];

  for (const raw of rawSentences) {
    const norm = raw.replace(/\s+/g, " ").trim().toLowerCase();
    const words = norm.split(/\s+/).filter(Boolean);
    if (words.length >= 6) {
      result.push(norm);
    }
  }

  return result;
}

interface PageCheckResult {
  path: string;
  pageType: string;
  status: "PASS" | "FAIL" | "LOCKED";
  wordCount: number;
  sharedSentencePct: number;
  indexStatus: "index, follow" | "noindex, follow";
  issues: string[];
}

export async function runIndexReadiness(isApply: boolean = true) {
  console.log(`\n======================================================`);
  console.log(`  BEETRIX360 IA v2 INDEX-READINESS & QUALITY AUDIT`);
  console.log(`  Mode: ${isApply ? "AUDIT & APPLY (through db.ts)" : "DRY RUN AUDIT"}`);
  console.log(`======================================================\n`);

  console.log(`[Safeguard Threshold] Quality Safeguard Rule:`);
  console.log(`  A page FAILS if >30% of its sentences (>= 6 words, page entities stripped) appear on 5 or more other pages,`);
  console.log(`  or if its entity-stripped meta description matches another page.`);
  console.log(`  (Note: This threshold is our own internal safeguard, not a Google rule).\n`);

  // Step 1: Backup store before any modifications
  if (isApply) {
    const backupDir = path.join(process.cwd(), ".data", "backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

    console.log(`[Backup] Creating snapshot of all database records through db.ts...`);
    const allRecords = await exportAllDbRecords();
    fs.writeFileSync(backupFile, JSON.stringify(allRecords, null, 2), "utf8");
    console.log(`[Backup] Snapshot saved successfully to: ${backupFile} (${Object.keys(allRecords).length} items)\n`);
  }

  const allPages = await getAllPages();
  console.log(`[Store] Loaded ${allPages.length} pages from store.\n`);

  // Pass 1: Generate sections & meta descriptions (protecting human editor work)
  const evaluatedPages: {
    page: PageRecordV2;
    sections: SectionBlockV2[];
    metaDesc: string;
    visibleText: string;
    wordCount: number;
    sentences: string[];
    isLocked: boolean;
  }[] = [];

  for (const page of allPages) {
    const isLocked = LOCKED_PATHS.has(page.path);

    // 1. Meta Description
    let metaDesc = page.seo?.metaDescription;
    if (!metaDesc || metaDesc.length < 120 || metaDesc.length > 155 || !page.savedInStudioAt) {
      metaDesc = generateMetaDescription(page);
    }

    // 2. Sections: protected by block-level generator rules
    let sections = generatePlaceholderSections(page, allPages, page.sections);

    // Visible public text
    let visibleText = "";
    if (page.path === "/") {
      try {
        const homePath = path.join(process.cwd(), "src", "content", "homepage.json");
        const homeContent = JSON.parse(fs.readFileSync(homePath, "utf8"));
        function extractHomeStrings(obj: any): string[] {
          let s: string[] = [];
          for (const k in obj) {
            if (k === "_note" || k === "seo") continue;
            if (typeof obj[k] === "string") s.push(obj[k]);
            else if (typeof obj[k] === "object" && obj[k] !== null) s.push(...extractHomeStrings(obj[k]));
          }
          return s;
        }
        visibleText = extractHomeStrings(homeContent).join(" ");
      } catch {
        visibleText = "Beetrix360 digital marketing and ai automation agency web automation ai search revenue systems";
      }
    } else {
      visibleText = extractVisiblePublicText(sections, page.h1);
    }

    const words = visibleText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Sentences for uniqueness analysis
    const sentences = extractSentencesForUniqueness(sections, page);

    evaluatedPages.push({
      page,
      sections,
      metaDesc,
      visibleText,
      wordCount,
      sentences,
      isLocked,
    });
  }

  // Pass 2: Global sentence frequency & meta description registry
  const globalSentencePageSet = new Map<string, Set<string>>(); // sentence -> Set of page paths
  const globalCleanedMetas = new Map<string, string>(); // cleanedMeta -> page path

  for (const ep of evaluatedPages) {
    if (ep.page.path === "/" || ep.isLocked) continue;

    for (const s of ep.sentences) {
      if (!globalSentencePageSet.has(s)) {
        globalSentencePageSet.set(s, new Set());
      }
      globalSentencePageSet.get(s)!.add(ep.page.path);
    }

    const cleanMeta = stripPageEntities(ep.metaDesc, ep.page).replace(/\s+/g, " ").trim().toLowerCase();
    if (!globalCleanedMetas.has(cleanMeta)) {
      globalCleanedMetas.set(cleanMeta, ep.page.path);
    }
  }

  // Pass 3: Detailed evaluation per page
  const preparedPages: { page: PageRecordV2; visibleText: string; result: PageCheckResult }[] = [];
  const metaCollisionCheck = new Map<string, string>();

  for (const ep of evaluatedPages) {
    const { page, sections, metaDesc, visibleText, wordCount, sentences, isLocked } = ep;
    const issues: string[] = [];

    // Calculate shared sentences
    let sharedCount = 0;
    for (const s of sentences) {
      const pageSet = globalSentencePageSet.get(s);
      if (pageSet && pageSet.size - 1 >= 5) {
        sharedCount++;
      }
    }

    const sharedSentencePct = sentences.length > 0 ? (sharedCount / sentences.length) * 100 : 0;

    // Check 1: 8 Locked pages
    if (isLocked) {
      page.seo = {
        ...page.seo,
        metaDescription: metaDesc,
        robots: { index: false, follow: true },
        indexLock: true,
        indexLockReason: LOCKED_REASONS[page.path] || "Requires real facts (index locked)",
        indexedAt: undefined,
      };
      page.sections = sections;

      preparedPages.push({
        page,
        visibleText,
        result: {
          path: page.path,
          pageType: page.pageType || "other",
          status: "LOCKED",
          wordCount,
          sharedSentencePct: 0,
          indexStatus: "noindex, follow",
          issues: [`Locked: ${LOCKED_REASONS[page.path] || "Requires real facts"}`],
        },
      });
      continue;
    }

    // Check 2: Word count (at least 150 words)
    if (page.path !== "/" && wordCount < 150) {
      issues.push(`Insufficient visible text: ${wordCount} words (minimum 150 required)`);
    }

    // Check 3: 0 visible bracketed characters '[' or ']' on public page
    if (visibleText.includes("[") || visibleText.includes("]")) {
      issues.push(`Visible public text contains bracketed placeholder character '[' or ']'`);
    }

    // Check 4: 0 banned words/patterns
    if (page.path !== "/") {
      for (const bp of BANNED_PATTERNS) {
        bp.regex.lastIndex = 0;
        if (bp.regex.test(visibleText)) {
          issues.push(`Contains banned content pattern: ${bp.name}`);
        }
      }
    }

    // Check 5: Meta description (present, 120-155 chars, 0 banned words)
    if (!metaDesc) {
      issues.push(`Missing meta description`);
    } else {
      if (metaDesc.length < 120 || metaDesc.length > 155) {
        issues.push(`Meta description length ${metaDesc.length} outside 120-155 characters`);
      }
      for (const bp of BANNED_PATTERNS) {
        bp.regex.lastIndex = 0;
        if (bp.regex.test(metaDesc)) {
          issues.push(`Meta description contains banned content: ${bp.name}`);
        }
      }

      // Check meta description uniqueness after entity removal
      const cleanMeta = stripPageEntities(metaDesc, page).replace(/\s+/g, " ").trim().toLowerCase();
      if (metaCollisionCheck.has(cleanMeta) && metaCollisionCheck.get(cleanMeta) !== page.path) {
        issues.push(`Duplicate meta description identical to ${metaCollisionCheck.get(cleanMeta)}`);
      } else {
        metaCollisionCheck.set(cleanMeta, page.path);
      }
    }

    // Check 6: Sentence-level uniqueness threshold (>30% fails)
    if (sharedSentencePct > 30) {
      issues.push(`Exceeds shared sentence threshold: ${sharedSentencePct.toFixed(1)}% shared across 5+ pages (>30% limit)`);
    }

    const passed = issues.length === 0;

    // Apply updates to page record
    page.seo = {
      ...page.seo,
      metaDescription: metaDesc,
      robots: passed ? { index: true, follow: true } : { index: false, follow: true },
      indexedAt: passed ? (page.seo.indexedAt || new Date().toISOString()) : undefined, // Cleared if un-indexed
      indexLock: false,
      indexLockReason: undefined,
    };
    page.sections = sections;
    if (page.path !== "/") {
      page.contentStatus = "placeholder";
    }

    preparedPages.push({
      page,
      visibleText,
      result: {
        path: page.path,
        pageType: page.pageType || "other",
        status: passed ? "PASS" : "FAIL",
        wordCount,
        sharedSentencePct,
        indexStatus: passed ? "index, follow" : "noindex, follow",
        issues,
      },
    });
  }

  // Step 2: Save updated pages through db.ts
  if (isApply) {
    console.log(`[Store] Applying updates for ${preparedPages.length} pages via db.ts putDbItem...`);
    const nowIso = new Date().toISOString();
    for (const item of preparedPages) {
      item.page.updatedBy = "Master Administrator";
      item.page.updatedAt = nowIso;
      await putDbItem("PAGE", item.page.path, item.page);
    }
    console.log(`[Store] Successfully applied all page updates to store.\n`);
  }

  // Step 3: Print Index-Readiness Report Table and write docs/index-readiness-report.md
  // Sort pages with "/" first, then alphabetically by path
  preparedPages.sort((a, b) =>
    a.result.path === "/" ? -1 : b.result.path === "/" ? 1 : a.result.path.localeCompare(b.result.path)
  );

  console.log(`--------------------------------------------------------------------------------------------------------------------------------`);
  console.log(`  INDEX-READINESS AUDIT REPORT TABLE`);
  console.log(`--------------------------------------------------------------------------------------------------------------------------------`);
  console.log(
    `| ${"Page Path".padEnd(44)} | ${"Status".padEnd(8)} | ${"Words".padEnd(6)} | ${"Shared %".padEnd(10)} | ${"Robots Index".padEnd(16)} | Notes`
  );
  console.log(`|----------------------------------------------|----------|--------|------------|------------------|--------------------------------`);

  let passCount = 0;
  let failCount = 0;
  let lockedCount = 0;

  const mdLines: string[] = [
    `# Beetrix360 IA v2 Index-Readiness Report`,
    ``,
    `> **Safeguard Threshold**: Quality Safeguard Rule: A page fails if >30% of its sentences ($\\ge$ 6 words, page entities stripped) appear on 5 or more other pages, or if its entity-stripped meta description matches another page. *(Note: This threshold is our own internal safeguard, not a Google rule)*.`,
    ``,
    `| Page Path | Status | Words | Shared % | Robots Index | Notes |`,
    `| :--- | :--- | :--- | :--- | :--- | :--- |`,
  ];

  for (const item of preparedPages) {
    const res = item.result;
    if (res.status === "PASS") passCount++;
    else if (res.status === "FAIL") failCount++;
    else if (res.status === "LOCKED") lockedCount++;

    const statusBadge = res.status === "PASS" ? "PASS" : res.status === "LOCKED" ? "LOCKED" : "FAIL";
    const sharedPctStr = res.status === "LOCKED" ? "-" : `${res.sharedSentencePct.toFixed(1)}%`;
    const note = res.issues.length > 0 ? res.issues[0] : "All checks clean (100% compliant)";
    console.log(
      `| ${res.path.padEnd(44)} | ${statusBadge.padEnd(8)} | ${String(res.wordCount).padEnd(6)} | ${sharedPctStr.padEnd(10)} | ${res.indexStatus.padEnd(16)} | ${note}`
    );

    mdLines.push(
      `| \`${res.path}\` | ${statusBadge} | ${res.wordCount} | ${sharedPctStr} | ${res.indexStatus} | ${note} |`
    );
  }

  mdLines.push(``);
  mdLines.push(`### Summary Totals`);
  mdLines.push(``);
  mdLines.push(`- **Total Pages in Store**: ${preparedPages.length}`);
  mdLines.push(`- **Passing & Indexed (\`index: true, follow: true\`)**: ${passCount}`);
  mdLines.push(`- **Failed Quality Check (\`noindex, follow\`)**: ${failCount}`);
  mdLines.push(`- **Locked Pages (\`indexLock: true, noindex, follow\`)**: ${lockedCount}`);
  mdLines.push(``);

  const reportPath = path.join(process.cwd(), "docs", "index-readiness-report.md");
  fs.writeFileSync(reportPath, mdLines.join("\n"), "utf8");
  console.log(`\n[Report] Index-readiness report written directly to: ${reportPath}`);

  console.log(`--------------------------------------------------------------------------------------------------------------------------------\n`);

  // Step 4: Summary Totals
  console.log(`======================================================`);
  console.log(`  INDEX-READINESS SUMMARY TOTALS`);
  console.log(`======================================================`);
  console.log(`Total Pages in Store: ${preparedPages.length}`);
  console.log(`  - Passing & Indexed (index: true, follow: true):    ${passCount}`);
  console.log(`  - Failed Quality Check (noindex, follow):          ${failCount}`);
  console.log(`  - Locked Pages (indexLock: true, noindex, follow):  ${lockedCount}`);
  console.log(`======================================================\n`);

  return {
    total: preparedPages.length,
    passCount,
    failCount,
    lockedCount,
    preparedPages,
  };
}

// Direct CLI invocation
if (require.main === module || process.argv[1]?.includes("run-index-readiness")) {
  runIndexReadiness(true).catch((err) => {
    console.error("FATAL INDEX-READINESS ERROR:", err);
    process.exit(1);
  });
}
