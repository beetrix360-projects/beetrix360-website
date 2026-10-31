import type { PageRecordV2 } from "./types";

export interface SeoCheckItem {
  id: string;
  label: string;
  passed: boolean;
  severity: "error" | "warning";
  message: string;
}

export interface SeoEvaluation {
  passedCount: number;
  totalCount: number;
  hasErrors: boolean;
  items: SeoCheckItem[];
}

/**
 * Evaluates real-time SEO health according to Phase 6 specifications.
 * Checks:
 * 1. Title <= 60 characters
 * 2. Meta description between 120 and 155 characters
 * 3. Target keyword present in H1
 * 4. Target keyword present in Title tag
 * 5. Target keyword present in first paragraph/intro
 * 6. Exactly 1 H1 heading on page
 * 7. Heading level hierarchy (no skipped heading levels like h1 -> h3)
 * 8. All images have descriptive alt text
 * 9. Internal links present
 * 10. customJsonLd is valid JSON (if populated)
 * 11. Target keyword is unique across all pages
 */
export function evaluatePageSeo(
  page: PageRecordV2,
  allPages: PageRecordV2[] = []
): SeoEvaluation {
  const items: SeoCheckItem[] = [];
  const keyword = (page.targetKeyword || "").trim().toLowerCase();

  // 1. Title Tag length
  const title = (page.seo?.titleTag || "").trim();
  const titleLen = title.length;
  const titleOk = titleLen >= 30 && titleLen <= 60;
  items.push({
    id: "title-length",
    label: "Title Tag Length (30–60 chars)",
    passed: titleOk,
    severity: "warning",
    message: titleLen === 0
      ? "Title tag is missing."
      : titleLen > 60
      ? `Title tag is ${titleLen} characters (over 60 limit; may be truncated).`
      : titleLen < 30
      ? `Title tag is ${titleLen} characters (under recommended 30 characters).`
      : `Optimal length: ${titleLen} characters.`,
  });

  // 2. Meta Description length (120–155 chars)
  const desc = (page.seo?.metaDescription || "").trim();
  const descLen = desc.length;
  const descOk = descLen >= 120 && descLen <= 155;
  items.push({
    id: "description-length",
    label: "Meta Description Length (120–155 chars)",
    passed: descOk,
    severity: "warning",
    message: descLen === 0
      ? "Meta description is missing."
      : descLen > 155
      ? `Description is ${descLen} characters (exceeds 155 limit).`
      : descLen < 120
      ? `Description is ${descLen} characters (under 120 limit).`
      : `Optimal length: ${descLen} characters.`,
  });

  // 3. Keyword in H1
  const h1 = (page.h1 || "").trim().toLowerCase();
  const kwInH1 = !keyword || h1.includes(keyword);
  items.push({
    id: "keyword-h1",
    label: "Target Keyword in H1",
    passed: kwInH1,
    severity: "warning",
    message: kwInH1
      ? "Target keyword appears in the main H1."
      : `Target keyword '${page.targetKeyword}' is missing from the H1 heading.`,
  });

  // 4. Keyword in Title Tag
  const kwInTitle = !keyword || title.toLowerCase().includes(keyword);
  items.push({
    id: "keyword-title",
    label: "Target Keyword in Title Tag",
    passed: kwInTitle,
    severity: "warning",
    message: kwInTitle
      ? "Target keyword appears in the title tag."
      : `Target keyword '${page.targetKeyword}' is missing from the title tag.`,
  });

  // 5. Keyword in First Paragraph / Intro
  const introSec = page.sections?.find((s) => s.type === "intro" || s.type === "hero" || s.type === "richText");
  const firstText = (
    introSec?.content?.text ||
    introSec?.content?.tagline ||
    introSec?.content?.description ||
    (Array.isArray(introSec?.content?.paragraphs) ? introSec.content.paragraphs[0] : "") ||
    ""
  ).toLowerCase();
  const kwInFirstPara = !keyword || firstText.includes(keyword);
  items.push({
    id: "keyword-first-paragraph",
    label: "Target Keyword in First Paragraph",
    passed: kwInFirstPara,
    severity: "warning",
    message: kwInFirstPara
      ? "Target keyword is present in early page content."
      : `Target keyword '${page.targetKeyword}' was not found in the opening paragraph.`,
  });

  // 6. Exactly 1 H1 Heading
  let h1Count = 1; // The page H1
  if (page.sections) {
    for (const sec of page.sections) {
      if (sec.headingLevel === "h1") h1Count++;
    }
  }
  const exactlyOneH1 = h1Count === 1;
  items.push({
    id: "single-h1",
    label: "Exactly One H1 Heading",
    passed: exactlyOneH1,
    severity: "error",
    message: exactlyOneH1
      ? "Page has exactly one H1 heading."
      : `Page contains ${h1Count} H1 headings (should have exactly 1).`,
  });

  // 7. Heading Level Order (no skipped levels, e.g. H1 -> H3)
  let prevLevel = 1;
  let orderOk = true;
  let skippedDetail = "";
  if (page.sections) {
    for (const sec of page.sections) {
      if (sec.headingLevel) {
        const curLevel = parseInt(sec.headingLevel.replace("h", ""), 10);
        if (curLevel > prevLevel + 1) {
          orderOk = false;
          skippedDetail = `Skipped from H${prevLevel} to H${curLevel} in section '${sec.title || sec.type}'.`;
          break;
        }
        prevLevel = curLevel;
      }
    }
  }
  items.push({
    id: "heading-order",
    label: "Heading Level Hierarchy",
    passed: orderOk,
    severity: "warning",
    message: orderOk
      ? "Headings follow logical order without skipped levels."
      : skippedDetail,
  });

  // 8. Images have Alt Text
  let allAltsPresent = true;
  let missingAltCount = 0;
  if (page.sections) {
    for (const sec of page.sections) {
      if (sec.images) {
        for (const img of sec.images) {
          if (!img.alt || img.alt.trim() === "") {
            allAltsPresent = false;
            missingAltCount++;
          }
        }
      }
    }
  }
  items.push({
    id: "image-alt-tags",
    label: "Images Descriptive Alt Text",
    passed: allAltsPresent,
    severity: "warning",
    message: allAltsPresent
      ? "All embedded images have alt text."
      : `${missingAltCount} image(s) missing descriptive alt text.`,
  });

  // 9. Internal Links Present
  let hasLinks = false;
  if (page.sections) {
    for (const sec of page.sections) {
      if (sec.type === "relatedLinks" || sec.type === "childCards") {
        hasLinks = true;
        break;
      }
      if (sec.content?.primaryCta?.href?.startsWith("/") || sec.content?.buttonHref?.startsWith("/")) {
        hasLinks = true;
        break;
      }
    }
  }
  // Pages under parent or with child pages inherently have internal navigation links
  if (page.parentId || allPages.some((p) => p.parentId === page.id)) {
    hasLinks = true;
  }
  items.push({
    id: "internal-links",
    label: "Internal Links Present",
    passed: hasLinks,
    severity: "warning",
    message: hasLinks
      ? "Page contains internal links to related content."
      : "No internal navigation links found in page content.",
  });

  // 10. customJsonLd is Valid JSON
  let jsonLdValid = true;
  let jsonError = "";
  if (page.seo?.customJsonLd?.trim()) {
    try {
      JSON.parse(page.seo.customJsonLd.trim());
    } catch (e: any) {
      jsonLdValid = false;
      jsonError = e.message;
    }
  }
  items.push({
    id: "valid-json-ld",
    label: "Custom JSON-LD Syntax",
    passed: jsonLdValid,
    severity: "error",
    message: jsonLdValid
      ? "Custom JSON-LD is valid syntax."
      : `Invalid JSON syntax in custom JSON-LD: ${jsonError}`,
  });

  // 11. Target Keyword Uniqueness
  let kwUnique = true;
  let duplicateWith = "";
  if (keyword) {
    const dupe = allPages.find(
      (p) => p.id !== page.id && (p.targetKeyword || "").trim().toLowerCase() === keyword
    );
    if (dupe) {
      kwUnique = false;
      duplicateWith = dupe.path;
    }
  }
  items.push({
    id: "unique-keyword",
    label: "Unique Target Keyword",
    passed: kwUnique,
    severity: "warning",
    message: kwUnique
      ? "Target keyword is unique across the site."
      : `Duplicate target keyword shared with '${duplicateWith}'.`,
  });

  const passedCount = items.filter((it) => it.passed).length;
  const hasErrors = items.some((it) => !it.passed && it.severity === "error");

  return {
    passedCount,
    totalCount: items.length,
    hasErrors,
    items,
  };
}

