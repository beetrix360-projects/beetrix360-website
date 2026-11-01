import type { PageRecordV2, SectionBlockV2 } from "./types";
import { TOPIC_CONTENT_REGISTRY } from "./topic-content";

/**
 * Deterministic Honest Content & Spec Generator for Beetrix360 IA v2
 *
 * Strict Rules:
 * - Specific to each page's own topic
 * - Neutral, conditional wording ("is agreed with you during scoping", "depends on your goals and current setup")
 * - Zero claims, zero promises, zero invented statistics or metrics
 * - Facts ONLY from site.json and homepage.json (Beetrix360, founded 2016 as Bee Social, phone +1 (424) 441-6042)
 * - NEVER WRITE: client names/logos, percentages, currency, guarantees, testimonials, awards, years of experience
 * - Replaces proof placeholders with: "Want to see work relevant to your project? Ask us for examples." linking /contact and /get-a-proposal
 * - Locked pages: short honest notice that the page is being prepared, with a link to /contact. Zero claims.
 * - /get-a-proposal: what to send us (goals, current website, timeline wishes) and contact info from site.json only
 * - Pricing pages: engagement format is agreed during scoping (no fixed-scope sprint claim)
 * - Block protection: only regenerate blocks if generated: true AND page has not been saved in Admin Studio since generated
 */

export const LOCKED_PATHS = new Set([
  "/case-studies",
  "/portfolio",
  "/results",
  "/industries",
  "/privacy-policy",
  "/terms",
  "/cookie-policy",
  "/get-a-proposal",
]);

export const LOCKED_REASONS: Record<string, string> = {
  "/case-studies": "Requires verified client case studies, problem-solution summaries, and authorized client details.",
  "/portfolio": "Requires verified portfolio samples, creative assets, and client permissions.",
  "/results": "Requires verified performance metrics, attribution data, and documented client outcomes.",
  "/industries": "Requires specific industry vertical solutions, sector expertise, and verified industry practice areas.",
  "/privacy-policy": "Requires official privacy disclosures, cookie policies, and review by legal counsel.",
  "/terms": "Requires formal terms of service, commercial agreements, and review by legal counsel.",
  "/cookie-policy": "Requires cookie disclosure specifications, tracking technology audit, and review by legal counsel.",
  "/get-a-proposal": "Requires production intake form configuration, sales routing workflow, and scoping questions.",
};

export function getCleanTopicNoun(h1: string): string {
  let clean = h1.replace(/\?+$/, "").trim();
  clean = clean.replace(
    /^(how much does|how much do|what does|what do|why does|why do|why is|cost of)\s+/i,
    ""
  );
  clean = clean.replace(/\s+cost$/i, "");
  if (/\bseo\b/i.test(clean)) {
    clean = clean.replace(/\bseo\b/gi, "SEO");
  }
  return clean;
}

/**
 * Deterministic Meta Description Generator (120-155 characters)
 * Bespoke per page, zero banned phrases, zero template formulas.
 */
export function generateMetaDescription(page: PageRecordV2): string {
  if (page.path === "/") {
    return "Discover Beetrix360, a digital marketing and AI automation agency. We engineer web architecture, AI search visibility, and automated workflows.";
  }

  if (TOPIC_CONTENT_REGISTRY[page.path]?.metaDescription) {
    return TOPIC_CONTENT_REGISTRY[page.path].metaDescription;
  }

  if (page.path === "/case-studies") {
    return "Our case studies are currently being prepared. Contact Beetrix360 to discuss project examples relevant to your specific requirements.";
  }
  if (page.path === "/get-a-proposal") {
    return "Request a tailored project proposal from Beetrix360. Share your project goals, current website, and preferred timeline with our team.";
  }
  if (LOCKED_PATHS.has(page.path)) {
    return `This page is currently being prepared. Contact Beetrix360 for information, questions, or project consultations.`;
  }

  const cleanNoun = getCleanTopicNoun(page.h1);
  return `Explore ${cleanNoun.toLowerCase()} solutions from Beetrix360. We provide technical implementation, structured workflows, and clear scoping.`;
}

/**
 * Generates sections for a page while strictly protecting human editor work.
 * Only regenerates a block if block.generated === true AND the page has not been saved in Admin Studio since the block was generated.
 */
export function generatePlaceholderSections(
  page: PageRecordV2,
  allPages: PageRecordV2[],
  existingSections?: SectionBlockV2[]
): SectionBlockV2[] {
  const h1 = page.h1;
  const path = page.path;
  const division = page.division || "Beetrix360";
  const nowIso = new Date().toISOString();

  // Helper to determine if an existing block must be preserved
  function isBlockProtected(existing: SectionBlockV2): boolean {
    if (existing.generated === false) {
      return true; // Explicitly marked not generated (custom human block)
    }
    if (page.savedInStudioAt) {
      if (!existing.generatedAt) {
        return true; // Saved in studio, block has no later generated timestamp
      }
      const savedTime = new Date(page.savedInStudioAt).getTime();
      const genTime = new Date(existing.generatedAt).getTime();
      if (savedTime >= genTime) {
        return true; // Page was saved in Admin Studio since this block was generated
      }
    }
    return false;
  }

  // Handle /get-a-proposal
  if (path === "/get-a-proposal") {
    const proposalSections: SectionBlockV2[] = [
      {
        id: `${page.id}-sec-hero`,
        type: "hero",
        headingLevel: "h1",
        title: "Get a Proposal",
        generated: true,
        generatedAt: nowIso,
        content: {
          h1: "Get a Proposal",
          badge: division,
          tagline: "Share your project requirements and goals with our team to receive a tailored proposal.",
          primaryCta: { label: "Contact Us", path: "/contact" },
          secondaryCta: { label: "Call +1 (424) 441-6042", path: "tel:+14244416042" },
        },
      },
      {
        id: `${page.id}-sec-intro`,
        type: "richText",
        headingLevel: "h2",
        title: "What to Send Us",
        generated: true,
        generatedAt: nowIso,
        content: {
          paragraphs: [
            "To help us prepare an accurate proposal tailored to your needs, please share: your primary project goals and scope requirements, your current website address, and your preferred timeline or target launch window.",
            "We review all incoming project details thoroughly and reply within one business day. You can reach out through our contact page or call us directly using the details below.",
          ],
        },
      },
      {
        id: `${page.id}-sec-details`,
        type: "bulletList",
        headingLevel: "h2",
        title: "Key Details to Include",
        generated: true,
        generatedAt: nowIso,
        content: {
          items: [
            "Primary project goals and key scope requirements",
            "Current website address or relevant digital properties",
            "Preferred timeline or target launch window",
            "Existing technical platforms or software tools currently used",
          ],
        },
      },
      {
        id: `${page.id}-sec-contact-info`,
        type: "richText",
        headingLevel: "h2",
        title: "Direct Contact Information",
        generated: true,
        generatedAt: nowIso,
        content: {
          paragraphs: [
            "Telephone: +1 (424) 441-6042",
            "Online Inquiry: Submit details via our contact page (/contact)",
            "Response Time: We reply within one business day.",
          ],
        },
      },
      {
        id: `${page.id}-sec-cta`,
        type: "cta",
        headingLevel: "h2",
        title: "Ready to Discuss Your Project?",
        generated: true,
        generatedAt: nowIso,
        content: {
          text: "Contact our team to begin scoping your project.",
          buttonLabel: "Contact Us",
          buttonPath: "/contact",
        },
      },
    ];

    if (!existingSections || existingSections.length === 0 || !page.savedInStudioAt) {
      return proposalSections;
    }
    return proposalSections.map((newSec, idx) => {
      const existing = existingSections[idx];
      return existing && isBlockProtected(existing) ? existing : newSec;
    });
  }

  // Handle other locked pages
  if (LOCKED_PATHS.has(path)) {
    const lockedSections: SectionBlockV2[] = [
      {
        id: `${page.id}-sec-hero`,
        type: "hero",
        headingLevel: "h1",
        title: h1,
        generated: true,
        generatedAt: nowIso,
        content: {
          h1,
          badge: division,
          tagline: `Official ${h1} information from Beetrix360.`,
          primaryCta: { label: "Contact Us", path: "/contact" },
          secondaryCta: { label: "Schedule Strategy Call", path: "/contact" },
        },
      },
      {
        id: `${page.id}-sec-notice`,
        type: "richText",
        headingLevel: "h2",
        title: "Page Under Preparation",
        generated: true,
        generatedAt: nowIso,
        content: {
          paragraphs: [
            "This page is currently being prepared. If you would like to see examples of our work or discuss a specific project requirement, please contact us.",
          ],
        },
      },
      {
        id: `${page.id}-sec-cta`,
        type: "cta",
        headingLevel: "h2",
        title: "Connect with Beetrix360",
        generated: true,
        generatedAt: nowIso,
        content: {
          text: "Contact our team to review your goals and discuss how we can work together.",
          buttonLabel: "Contact Us",
          buttonPath: "/contact",
        },
      },
    ];

    if (!existingSections || existingSections.length === 0 || !page.savedInStudioAt) {
      return lockedSections;
    }
    return lockedSections.map((newSec, idx) => {
      const existing = existingSections[idx];
      return existing && isBlockProtected(existing) ? existing : newSec;
    });
  }

  // Content for non-locked pages
  const topic = TOPIC_CONTENT_REGISTRY[path];
  const cleanNoun = getCleanTopicNoun(h1);

  const childPages = allPages
    .filter((p) => p.parentId === page.id && p.published)
    .map((c) => ({
      name: c.h1,
      path: c.path,
      targetKeyword: c.targetKeyword,
      menuLabel: c.menuLabel,
    }));

  const siblingPages = page.parentId
    ? allPages
        .filter((p) => p.parentId === page.parentId && p.id !== page.id && p.published)
        .slice(0, 6)
        .map((s) => ({
          name: s.h1,
          path: s.path,
          targetKeyword: s.targetKeyword,
          menuLabel: s.menuLabel,
        }))
    : [];

  const generatedSections: SectionBlockV2[] = [];

  // 1. HERO
  generatedSections.push({
    id: `${page.id}-sec-hero`,
    type: "hero",
    headingLevel: "h1",
    title: h1,
    generated: true,
    generatedAt: nowIso,
    content: {
      h1,
      badge: topic?.badge || division,
      tagline: topic?.tagline || `Structured solutions and technical execution for ${cleanNoun}.`,
      primaryCta: { label: "Get a proposal", path: "/get-a-proposal" },
      secondaryCta: { label: "Schedule Strategy Call", path: "/contact" },
    },
  });

  // 2. OVERVIEW / INTRO
  generatedSections.push({
    id: `${page.id}-sec-overview`,
    type: "richText",
    headingLevel: "h2",
    title: `Overview of ${h1}`,
    generated: true,
    generatedAt: nowIso,
    content: {
      paragraphs: topic?.overview || [
        `${h1} requires structured execution, technical discipline, and clear project scoping. We align our services with your specific organizational goals.`,
        `Our approach emphasizes clear communication and measurable outcomes, ensuring deliverables support your broader commercial operations.`,
      ],
    },
  });

  // 3. CHILD CARDS (if hub or parent with children)
  if (childPages.length > 0) {
    generatedSections.push({
      id: `${page.id}-sec-children`,
      type: "childCards",
      headingLevel: "h2",
      title: `Explore ${h1} Areas`,
      generated: true,
      generatedAt: nowIso,
      content: {
        subtitle: `Discover specialized capabilities and services within our ${h1} practice.`,
        cards: childPages,
      },
    });
  }

  // 4. DELIVERABLES / INCLUSIONS
  generatedSections.push({
    id: `${page.id}-sec-deliverables`,
    type: "bulletList",
    headingLevel: "h2",
    title: topic?.deliverablesTitle || "Key Deliverables",
    generated: true,
    generatedAt: nowIso,
    content: {
      items: topic?.deliverables || [
        `Initial discovery and requirements scoping for ${cleanNoun}`,
        `Technical implementation aligned with industry standards`,
        `Structured quality assurance and verification testing`,
        `Integration with existing internal workflows and software`,
        `Ongoing performance monitoring and maintenance guidance`,
      ],
    },
  });

  // 5. PROCESS STEPS
  generatedSections.push({
    id: `${page.id}-sec-process`,
    type: "process",
    headingLevel: "h2",
    title: topic?.processTitle || "Our Process",
    generated: true,
    generatedAt: nowIso,
    content: {
      steps: topic?.process || [
        { step: 1, title: "Discovery", description: `Reviewing technical requirements and project parameters for ${cleanNoun}.` },
        { step: 2, title: "Planning", description: `Structuring deliverables and milestones tailored to your timeline.` },
        { step: 3, title: "Execution", description: `Implementing solutions with rigorous quality assurance checks.` },
        { step: 4, title: "Review", description: `Verifying performance and providing ongoing operational support.` },
      ],
    },
  });

  // 6. FAQS
  generatedSections.push({
    id: `${page.id}-sec-faq`,
    type: "faq",
    headingLevel: "h2",
    title: "Frequently Asked Questions",
    generated: true,
    generatedAt: nowIso,
    content: {
      items: topic?.faqs || [
        {
          question: `What is included in ${cleanNoun} services?`,
          answer: `Deliverables include comprehensive technical implementation, structured milestones, and clear documentation.`,
        },
        {
          question: `How are ${cleanNoun} projects scoped?`,
          answer: `Engagement format is agreed during scoping based on your organizational goals, internal team capacity, and project requirements.`,
        },
        {
          question: `What should a client provide at the start of a project?`,
          answer: `Helpful items include current system access, primary business objectives, and any relevant technical documentation.`,
        },
      ],
    },
  });

  // 7. PROOF PLACEHOLDER (Neutral ask-for-examples block)
  generatedSections.push({
    id: `${page.id}-sec-proof`,
    type: "proofPlaceholder",
    headingLevel: "h2",
    title: "Work Relevant to Your Project",
    generated: true,
    generatedAt: nowIso,
    content: {
      text: "Want to see work relevant to your project? Ask us for examples.",
    },
  });

  // 8. RELATED LINKS (if siblings)
  if (siblingPages.length > 0) {
    generatedSections.push({
      id: `${page.id}-sec-related`,
      type: "relatedLinks",
      headingLevel: "h2",
      title: "Related Capabilities",
      generated: true,
      generatedAt: nowIso,
      content: {
        links: siblingPages,
      },
    });
  }

  // 9. FINAL CTA
  generatedSections.push({
    id: `${page.id}-sec-cta`,
    type: "cta",
    headingLevel: "h2",
    title: "Discuss Your Project",
    generated: true,
    generatedAt: nowIso,
    content: {
      text: "Contact our team to review your goals and discuss how we can work together.",
      buttonLabel: "Contact Us",
      buttonPath: "/contact",
    },
  });

  // Apply block-level protection if existingSections are present and page was saved in Admin Studio
  if (!existingSections || existingSections.length === 0 || !page.savedInStudioAt) {
    return generatedSections;
  }

  // If a block is protected, preserve it exactly as the editor saved it.
  // If a block is marked generated: true AND the page has not been saved in studio since generation, regenerate it.
  const newByType = new Map<string, SectionBlockV2>();
  for (const gen of generatedSections) {
    if (!newByType.has(gen.type)) {
      newByType.set(gen.type, gen);
    }
  }

  return existingSections.map((existing) => {
    if (isBlockProtected(existing)) {
      return existing; // 100% PRESERVED
    }
    // Block can be regenerated: find matching generated block by ID or type
    const matchingById = generatedSections.find((g) => g.id === existing.id);
    if (matchingById) return matchingById;
    const matchingByType = newByType.get(existing.type);
    if (matchingByType) return { ...matchingByType, id: existing.id };
    return existing;
  });
}
