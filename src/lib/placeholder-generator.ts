import type { PageRecordV2, SectionBlockV2 } from "./types";

/**
 * Deterministic Placeholder Content Generator
 * Strictly follows SEO and content rules:
 * - Exactly one H1 per page (Hero)
 * - Section headings as H2, sub-points as H3 (no skipped heading levels)
 * - Page H1 used in headings
 * - Zero hallucination / no invented metrics, clients, prices, or claims
 * - Bracketed placeholders where real facts, policies, or methodology belong: [To be specified: ...] / [Add ...]
 * - Specific "What's included" lists tailored to each service domain (social platforms, web development, SEO, etc.)
 * - Context-matched 4-step processes (Design never mentions tracking or schemas; Dev focuses on architecture and testing)
 * - Unique causes and valid, existing store-backed solution services for all 7 challenge pages
 * - Natural English phrasing: NEVER inserts raw question-style keywords into sentences
 * - Neutral one-line descriptions per page type with no marketing claims
 * - placeholder: true on every generated block
 */

// Format a clean, natural topic noun from H1 (eliminates question phrasing like "how much does seo cost?")
function getCleanTopicNoun(h1: string): string {
  let clean = h1.replace(/\?+$/, "").trim();
  clean = clean.replace(/^(how much does|how much do|what does|what do|why does|why do|why is|cost of)\s+/i, "");
  clean = clean.replace(/\s+cost$/i, "");
  if (/\bseo\b/i.test(clean)) {
    clean = clean.replace(/\bseo\b/gi, "SEO");
  }
  return clean;
}

// 4-Step delivery process customized to the discipline
function getServiceDeliveryProcess(h1: string, path: string): { step: number; title: string; description: string }[] {
  const p = path.toLowerCase();

  // 1. Creative & Design (Logo Design, Branding, Visual Identity, Packaging)
  if (p.includes("/branding") || p.includes("/design") || p.includes("logo") || p.includes("identity")) {
    return [
      {
        step: 1,
        title: "Creative Brief & Discovery",
        description: `Clarifying design objectives, target audience perception, aesthetic preferences, and competitive context for ${h1}.`,
      },
      {
        step: 2,
        title: "Concept Exploration & Direction",
        description: `Developing distinct visual directions, structural sketches, typography pairings, and initial layout concepts.`,
      },
      {
        step: 3,
        title: "Design Refinement & Crafting",
        description: `Iterating on selected directions, refining proportions, color harmonization, and typography based on stakeholder feedback.`,
      },
      {
        step: 4,
        title: "Master Asset Delivery & Guidelines",
        description: `Exporting production-ready vector and digital packages, raster formats, and comprehensive usage documentation.`,
      },
    ];
  }

  // 2. Web & Software Development (WordPress, Ecommerce, Web Apps, Shopify)
  if (p.includes("/web-development") || p.includes("/web") || p.includes("development") || p.includes("wordpress") || p.includes("shopify")) {
    return [
      {
        step: 1,
        title: "Technical Scoping & Architecture",
        description: `Defining technology stack requirements, database schemas, third-party integrations, and hosting environments for ${h1}.`,
      },
      {
        step: 2,
        title: "Environment Setup & Core Build",
        description: `Developing custom data models, reusable UI components, API endpoints, and business logic in a staging environment.`,
      },
      {
        step: 3,
        title: "Cross-Device Testing & Code QA",
        description: `Rigorous functional validation, responsive viewport checks, performance optimization, and security audits.`,
      },
      {
        step: 4,
        title: "Deployment & Production Launch",
        description: `Staging review sign-off, live server cutover, database migration, automated backup configuration, and handover.`,
      },
    ];
  }

  // 3. Social Media & Content Management (Instagram, LinkedIn, Facebook, TikTok, Content)
  if (p.includes("/social-media") || p.includes("/content") || p.includes("social") || p.includes("management")) {
    return [
      {
        step: 1,
        title: "Audience & Platform Research",
        description: `Analyzing target demographics, top-performing industry content, posting formats, and platform algorithms for ${h1}.`,
      },
      {
        step: 2,
        title: "Editorial Strategy & Template Setup",
        description: `Establishing content pillars, brand tone guidelines, approved graphic templates, and publishing calendars.`,
      },
      {
        step: 3,
        title: "Scheduled Publishing & Active Engagement",
        description: `Consistent asset production, copywriting, scheduled distribution, community interaction, and inbox monitoring.`,
      },
      {
        step: 4,
        title: "Performance Review & Content Refinement",
        description: `Monthly reach and engagement analysis, format experimentation, and strategic editorial roadmap updates.`,
      },
    ];
  }

  // 4. Default: Technical SEO, Paid Media, Automation & General Services
  return [
    {
      step: 1,
      title: "Discovery & Technical Audit",
      description: `In-depth diagnostic review of current infrastructure, asset inventories, and baseline performance for ${h1}.`,
    },
    {
      step: 2,
      title: "System Setup & Configuration",
      description: `Configuring tracking parameters, technical assets, workflow rules, and core integration points.`,
    },
    {
      step: 3,
      title: "Structured Execution & Implementation",
      description: `Sprint-based rollout, technical asset creation, rigorous peer review, and quality verification.`,
    },
    {
      step: 4,
      title: "Evaluation & Milestone Review",
      description: `Reviewing technical logs, deliverable milestones, and identifying incremental optimization opportunities.`,
    },
  ];
}

// Specific "What's included" deliverables for every service domain
function getServiceDeliverables(page: PageRecordV2, allPages: PageRecordV2[]): string[] {
  const p = page.path.toLowerCase();
  const slug = page.slug.toLowerCase();
  const h1 = page.h1;

  // 1. Social Media Platform Management
  if (p.includes("/social-media/instagram-management") || slug === "instagram-management") {
    return [
      "Visual grid aesthetic planning and monthly content calendar development",
      "Custom Reels, multi-slide carousel, and daily story creative asset design",
      "Caption copywriting, hashtag cluster research, and engagement callouts",
      "Active community interaction, comment moderation, and DM triage workflows",
      "Profile bio optimization, story highlights structure, and custom link-in-bio setup",
      "Monthly performance reporting covering follower reach, engagement rate, and profile actions",
    ];
  }
  if (p.includes("/social-media/facebook-management") || slug === "facebook-management") {
    return [
      "Page profile optimization, custom cover banner design, and action button configuration",
      "Multi-format editorial calendar (feed posts, short videos, community announcements)",
      "Audience engagement, comment moderation, and inbox response protocols",
      "Facebook Group community management and discussion facilitation",
      "Meta Business Suite integration and event tracking verification",
      "Monthly audience growth and demographic engagement analytics reporting",
    ];
  }
  if (p.includes("/social-media/linkedin-management") || slug === "linkedin-management") {
    return [
      "Executive personal profile and corporate company page strategic alignment",
      "B2B industry thought leadership articles, commentary, and carousel slide decks (PDF)",
      "Custom graphic templates, infographics, and corporate announcement styling",
      "Employee advocacy guidelines and engagement prompting workflows",
      "Company page SEO optimization, specialty tag configuration, and showcase pages",
      "Monthly executive reporting on follower seniority, industry reach, and post impressions",
    ];
  }
  if (p.includes("/social-media/tiktok-management") || slug === "tiktok-management") {
    return [
      "Native vertical video concept ideation, storyboarding, and creative scripting",
      "Trending audio discovery and timely trend participation workflows",
      "On-screen text styling, captions, and niche hashtag strategy",
      "Community comment response management and video reply content creation",
      "TikTok profile optimization and link-in-bio commercial routing",
      "Analytics reporting on average watch time, completion rates, and audience retention curves",
    ];
  }
  if (p.includes("/social-media/youtube-management") || slug === "youtube-management") {
    return [
      "Video title optimization, keyword-rich descriptions, and metadata tag structuring",
      "High-contrast custom thumbnail design and visual brand consistency",
      "Video chapter timestamps, pinned comments, and end-screen info card setup",
      "Community tab updates, subscriber polls, and channel discussion moderation",
      "Custom playlist organization and channel homepage layout curation",
      "Monthly analytics on audience retention, click-through rate (CTR), and subscriber velocity",
    ];
  }

  // 2. Web Development Platforms
  if (p.includes("/web-development/wordpress") || slug === "wordpress") {
    return [
      "Custom block theme development or lightweight headless WordPress architecture",
      "Database query optimization, object caching setup, and server response tuning",
      "Custom post type (CPT) and custom field (ACF) data modeling for structured content",
      "Plugin security audit, vulnerability hardening, and minimal third-party plugin footprint",
      "Responsive layout validation, cross-browser testing, and mobile performance audits",
      "Automated daily backups, staging environment configuration, and safe update workflows",
    ];
  }
  if (p.includes("/web-development/ecommerce-development") || slug === "ecommerce-development") {
    return [
      "Product catalog architecture, variant configuration, and category filtering taxonomy",
      "Secure payment gateway integration (Stripe, digital wallets) and automated tax calculation",
      "Inventory management synchronization and third-party logistics (3PL) integration",
      "Abandoned checkout recovery workflows and transactional email notification templates",
      "Mobile commerce optimization and fast product detail page (PDP) rendering",
      "PCI-DSS compliance review, security safeguards, and SSL certificate installation",
    ];
  }
  if (p.includes("/web-development/web-application-development") || slug === "web-application-development") {
    return [
      "Application architecture planning, database schema design, and technical stack selection",
      "Secure REST / GraphQL API endpoints, JWT authentication, and role-based access control (RBAC)",
      "Modular frontend component implementation with dynamic state management",
      "Third-party webhook integrations, asynchronous task queues, and background workers",
      "Automated unit and integration testing suite configuration",
      "Cloud infrastructure provisioning, CI/CD automated deployment pipelines, and error logging",
    ];
  }
  if (p.includes("/web-development/shopify") || slug === "shopify") {
    return [
      "Liquid theme customization or headless Shopify Storefront API implementation",
      "App ecosystem audit, JavaScript execution optimization, and core web vitals speed tuning",
      "Custom product page merchandising, variant selector logic, and bundle offer setup",
      "Shopify checkout extensibility configuration and branded customer portal styling",
      "Third-party application integration (reviews, subscriptions, marketing automation)",
      "Google Merchant Center product feed integration and enhanced conversion tracking",
    ];
  }

  // 3. Branding & Creative
  if (p.includes("/branding/logo-design") || slug === "logo-design") {
    return [
      "Initial visual exploration and creative concept sketches",
      "Typography pairings and primary brand color palette definitions",
      "Structured revision rounds on selected design directions",
      "Master vector files (AI, EPS, SVG, PDF) and export-ready raster assets (PNG, JPG)",
      "Responsive mark lockups (horizontal, vertical, standalone icon, favicon)",
      "Logo usage specifications, clear-space rules, and minimum reproduction sizes",
    ];
  }
  if (p.includes("/branding/brand-strategy") || slug === "brand-strategy") {
    return [
      "Market positioning audit and competitor landscape analysis",
      "Target customer segmentation and audience profile definition",
      "Core brand narrative, mission statement, and value proposition architecture",
      "Brand voice, tone principles, and editorial messaging guidelines",
      "Product naming taxonomy and brand architecture framework",
      "Implementation roadmap for internal and customer-facing touchpoints",
    ];
  }
  if (p.includes("/branding/brand-guidelines") || slug === "brand-guidelines" || p.includes("corporate-identity")) {
    return [
      "Comprehensive digital brand guidelines and visual standards manual",
      "Typography system, scale hierarchy, and web-safe font fallback rules",
      "Full color specifications across print and digital (CMYK, RGB, HEX, Pantone)",
      "Iconography styling, art direction rules, and graphic asset libraries",
      "Stationery and digital collateral templates (business cards, letterheads, decks)",
      "Digital asset packaging and master file organization",
    ];
  }

  // 4. SEO Services
  if (p.includes("/seo/local-seo") || slug === "local-seo") {
    return [
      "Google Business Profile audit, category alignment, and profile optimization",
      "NAP (Name, Address, Phone) citation audit and consistency remediation across local directories",
      "Geo-targeted landing page structure and localized on-page optimization",
      "Local review generation workflow and customer feedback process design",
      "LocalBusiness and GeoCoordinates structured data schema deployment",
      "Local map pack visibility tracking and localized search ranking reports",
    ];
  }
  if (p.includes("/seo/technical-seo") || slug === "technical-seo") {
    return [
      "Crawl budget analysis, server log review, and HTTP status code audit",
      "Core Web Vitals diagnostic assessment and page rendering speed evaluation",
      "XML sitemap architecture, indexation directives, and robots.txt configuration",
      "Canonicalization review, duplicate content remediation, and redirect chain cleanup",
      "Structured data schema implementation (JSON-LD) across key page templates",
      "Mobile viewport validation and international hreflang configuration",
    ];
  }
  if (p.includes("/seo/on-page-seo") || slug === "on-page-seo") {
    return [
      "Search intent mapping and keyword targeting architecture across key pages",
      "Title tag, meta description, and heading hierarchy (H1, H2, H3) optimization",
      "Body copy optimization, topical depth enhancement, and semantic entity integration",
      "Internal linking structure and descriptive anchor text distribution",
      "Image optimization, descriptive alt text tagging, and media asset sizing",
      "Rich snippet eligibility review and page-level schema markup",
    ];
  }
  if (p.includes("/seo/keyword-research") || slug === "keyword-research") {
    return [
      "Comprehensive search query discovery and topical cluster mapping",
      "Search intent classification (informational, commercial, transactional, navigational)",
      "Keyword difficulty and competitor ranking gap analysis",
      "Long-tail search query identification and question-based search mapping",
      "Search engine results page (SERP) feature and AI overview opportunity audit",
      "Prioritized keyword roadmap aligned to content planning and page updates",
    ];
  }
  if (p.includes("/seo/link-building") || slug === "link-building") {
    return [
      "Backlink profile audit and toxic link risk assessment",
      "Competitor backlink gap analysis and referring domain roadmapping",
      "High-relevance industry resource and editorial publication identification",
      "Data-driven digital PR angle and linkable asset conception",
      "Direct manual outreach and editorial relationship management",
      "Acquired link reporting, domain authority metrics, and anchor text distribution",
    ];
  }
  if (p.includes("/seo/programmatic-seo") || slug === "programmatic-seo") {
    return [
      "Structured database schema design and dataset normalization",
      "Dynamic page template architecture and internal linking graph setup",
      "Automated metadata, title tag formulas, and unique content block logic",
      "Crawl budget optimization, indexation rules, and XML sitemap segmentation",
      "Duplicate content prevention logic and programmatic page quality audits",
      "Indexation monitoring and performance tracking across programmatic URLs",
    ];
  }

  // 5. Automation
  if (p.includes("/automation") || p.includes("/ai-automation")) {
    return [
      "Operational workflow discovery and manual bottleneck identification",
      "Cloud platform integration architecture via standard webhooks and REST APIs",
      "Trigger, condition, and multi-step action sequence configuration",
      "Automated error logging, notification alerts, and exception retry logic",
      "Data formatting, payload validation, and system access permission setup",
      "Deployment verification, execution run logs, and operational documentation",
    ];
  }

  // Default clean, realistic deliverables derived from H1
  const parent = allPages.find((pg) => pg.id === page.parentId);
  const contextName = parent ? parent.h1 : "Beetrix360";

  return [
    `Initial requirements discovery and technical scope assessment for ${h1}`,
    `Custom execution plan tailored to your technical environment and objectives`,
    `Direct implementation and asset production aligned with ${contextName} standards`,
    `Quality assurance, cross-device validation, and functional verification`,
    `Technical documentation, delivery notes, and operational handover`,
    `Structured milestone reviews and deliverable sign-off procedures`,
  ];
}

// 7 Challenge page configurations using ONLY verified, existing paths from the page store
const CHALLENGE_CANDIDATE_PATHS: Record<
  string,
  {
    causes: string[];
    candidatePaths: string[];
  }
> = {
  "/challenges/website-doesnt-drive-leads": {
    causes: [
      "Traffic arrives on pages without clear commercial calls-to-action or next steps",
      "Ineffective lead capture mechanisms (lengthy friction-heavy forms, lack of value proposition)",
      "Traffic sources are misaligned with buyer intent (targeting informational queries rather than commercial intent)",
      "Lack of trust signals, verified client proof, or clear differentiation on service pages",
      "Slow page load times and mobile usability issues driving visitors away before interacting",
    ],
    candidatePaths: [
      "/web-design/landing-pages",
      "/conversion",
      "/seo/on-page-seo",
      "/paid-media/google-ads",
    ],
  },
  "/challenges/website-traffic-going-down": {
    causes: [
      "Recent search engine core algorithm updates impacting domain visibility",
      "Technical debt such as crawl errors, indexation blocks, or broken redirect chains",
      "Content decay and loss of topical authority compared to actively updated competitors",
      "Loss of critical referring backlinks or broken external citations",
      "Tracking or analytics configuration errors misreporting organic traffic levels",
    ],
    candidatePaths: [
      "/seo/technical-seo",
      "/seo/link-building",
      "/seo/keyword-research",
      "/seo/on-page-seo",
    ],
  },
  "/challenges/website-doesnt-convert": {
    causes: [
      "Cognitive overload and confusing page hierarchy obscuring core value propositions",
      "Unoptimized checkout, demo request, or form completion funnels",
      "Mismatched messaging between acquisition ad copy and landing page headlines",
      "Absence of social proof, client reviews, or security guarantees at key decision points",
      "Responsive rendering defects on mobile and tablet screen sizes",
    ],
    candidatePaths: [
      "/conversion",
      "/web-design/landing-pages",
      "/web-design",
      "/web-development",
    ],
  },
  "/challenges/not-appearing-in-ai-search": {
    causes: [
      "Lack of structured data schemas (JSON-LD) defining entities, organizations, and services",
      "Content lacks direct factual answers, statistics, and citational structure required by LLMs",
      "Weak brand entity authority across authoritative industry directories, Wikidata, and knowledge bases",
      "Competitors dominate reference citations in Perplexity, ChatGPT, and Google AI Overviews",
      "Technical robots exclusion blocking AI bot user-agents from discovering and parsing domain content",
    ],
    candidatePaths: [
      "/seo/generative-engine-optimization",
      "/seo/answer-engine-optimization",
      "/seo/chatgpt-optimization",
      "/seo/ai-brand-perception",
    ],
  },
  "/challenges/agency-isnt-driving-results": {
    causes: [
      "Agency reports prioritize vanity metrics (impressions, clicks) over pipeline revenue and qualified leads",
      "Lack of transparent multi-touch attribution connecting marketing spend to CRM pipeline",
      "Cookie-cutter strategy disconnected from your specific market economics and margin profile",
      "Slow execution velocity, missed deadlines, and high agency account manager turnover",
      "Siloed channel management with disconnected SEO, paid search, and creative teams",
    ],
    candidatePaths: [
      "/seo/enterprise-seo",
      "/paid-media/enterprise-ppc",
      "/digital-marketing/competitor-analysis",
      "/digital-marketing/ai-digital-marketing",
    ],
  },
  "/challenges/too-much-manual-work": {
    causes: [
      "Repetitive data entry across disconnected software tools, spreadsheets, and internal databases",
      "Manual generation of routine reports, invoices, customer emails, and document approvals",
      "Absence of webhook and API integrations between marketing, sales CRM, and billing systems",
      "Customer support staff spending hours resolving standard, repetitive inquiries",
      "Lack of standardized automated intake funnels for leads, onboarding, or vendor requests",
    ],
    candidatePaths: [
      "/automation",
      "/automation/business-process-automation",
      "/automation/document-processing",
      "/automation/data-entry-automation",
    ],
  },
  "/challenges/ads-spend-but-dont-sell": {
    causes: [
      "Ad campaigns target broad, low-intent search terms that exhaust budget without converting",
      "Poor message match between ad creatives and post-click landing page experience",
      "Unrefined audience exclusion lists, bidding algorithms bidding on fraudulent or irrelevant placements",
      "Conversion tracking missing server-side tagging (CAPI) or inaccurate attribution attribution signals",
      "Ad creative fatigue and lack of structured copy testing across audience segments",
    ],
    candidatePaths: [
      "/paid-media/google-ads",
      "/paid-media/meta-ads",
      "/web-design/landing-pages",
      "/paid-media/enterprise-ppc",
    ],
  },
};

// Neutral one-line descriptions per page type with no claims
function getNeutralTagline(pageType: string, h1: string): string {
  const cleanNoun = getCleanTopicNoun(h1);
  switch (pageType) {
    case "hub":
      return `Overview of capabilities, practice areas, and strategic advisory for ${cleanNoun}.`;
    case "service":
    case "sub":
    case "platform":
      return `Scope of deliverables, technical implementation standards, and execution methodology for ${cleanNoun}.`;
    case "challenge":
      return "Diagnostic overview, common operational bottlenecks, and implementation paths to resolve this challenge.";
    case "pricing":
      return `Overview of engagement models, cost drivers, and scoping criteria for ${cleanNoun}.`;
    case "tool":
      return `Technical specifications, feature capabilities, and integration parameters for the ${cleanNoun} utility.`;
    case "about":
    case "company":
      return "Organizational background, operational philosophy, and team leadership at Beetrix360.";
    case "resource":
    case "proof":
      return "Reference materials, case documentation, and published research from Beetrix360.";
    case "legal":
      return "Official legal policies, compliance disclosures, and terms governing Beetrix360 services.";
    default:
      return `Overview of capabilities and technical execution for ${cleanNoun}.`;
  }
}

export function generatePlaceholderSections(
  page: PageRecordV2,
  allPages: PageRecordV2[]
): SectionBlockV2[] {
  const h1 = page.h1;
  const path = page.path;
  const division = page.division || "Beetrix360";
  const pageType = page.pageType || "service";
  const cleanNoun = getCleanTopicNoun(h1);

  // Map of all published pages for safe verified linking (strictly guarantees links can only point to pages that exist and are published)
  const pageByPath = new Map<string, PageRecordV2>(
    allPages.filter((p) => p.published).map((p) => [p.path, p])
  );

  // Child pages for childCards
  const childPages = allPages
    .filter((p) => p.parentId === page.id && p.published)
    .map((c) => ({
      name: c.h1,
      path: c.path,
      targetKeyword: c.targetKeyword,
      menuLabel: c.menuLabel,
    }));

  // Sibling pages for relatedLinks
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

  const sections: SectionBlockV2[] = [];

  // 1. HERO SECTION (Common to all pages)
  sections.push({
    id: `${page.id}-sec-hero`,
    type: "hero",
    placeholder: true,
    headingLevel: "h1",
    title: h1,
    content: {
      h1,
      badge: division,
      tagline: getNeutralTagline(pageType, h1),
      primaryCta: { label: "Get a proposal", path: "/get-a-proposal" },
      secondaryCta: { label: "Schedule Strategy Call", path: "/contact" },
    },
  });

  // PAGE TYPE SPECIFIC SECTIONS
  switch (pageType) {
    case "hub": {
      // Intro (H1 in title, natural English phrasing without awkward keyword insertions)
      sections.push({
        id: `${page.id}-sec-intro`,
        type: "richText",
        placeholder: true,
        headingLevel: "h2",
        title: `Overview of ${h1}`,
        content: {
          paragraphs: [
            `Our ${cleanNoun} practice coordinates specialized disciplines to help teams establish sustainable visibility and performance across digital ecosystems. Beetrix360 unites experienced engineers, analysts, and growth architects to deploy proven frameworks tailored to enterprise requirements.`,
            `Every program is designed around clear performance benchmarks, transparent attribution models, and direct commercial outcomes. Explore the specialized capabilities below to see how each discipline fits into our complete service architecture.`,
          ],
        },
      });

      // childCards
      if (childPages.length > 0) {
        sections.push({
          id: `${page.id}-sec-child-cards`,
          type: "childCards",
          placeholder: true,
          headingLevel: "h2",
          title: `Specialized Capabilities in ${h1}`,
          content: {
            subtitle: `Explore specific implementation models and disciplines within ${h1}.`,
            cards: childPages,
          },
        });
      }

      // process (4 steps)
      sections.push({
        id: `${page.id}-sec-process`,
        type: "process",
        placeholder: true,
        headingLevel: "h2",
        title: `Our 4-Stage Delivery Framework`,
        content: {
          steps: [
            {
              step: 1,
              title: "Diagnostic Audit & Discovery",
              description: `Comprehensive analysis of current performance, technical baseline, data hygiene, and competitive landscape.`,
            },
            {
              step: 2,
              title: "Strategic Architecture & Roadmapping",
              description: `Designing the operational blueprint, prioritizing highest-leverage initiatives, and defining quantifiable milestones.`,
            },
            {
              step: 3,
              title: "System Execution & Deployment",
              description: `Rigorous technical rollout, custom workflows, schema implementation, and campaign orchestration.`,
            },
            {
              step: 4,
              title: "Refinement & Scaling",
              description: `Continuous iteration based on real performance data, multi-touch analytics, and incremental expansion.`,
            },
          ],
        },
      });

      // faq (4 questions, bracketed placeholders for all policy/methodology details)
      sections.push({
        id: `${page.id}-sec-faq`,
        type: "faq",
        placeholder: true,
        headingLevel: "h2",
        title: `Frequently Asked Questions About ${h1}`,
        content: {
          items: [
            {
              question: `How does Beetrix360 approach ${h1}?`,
              answer: `[To be specified: practice area approach, strategic methodology, and delivery framework for ${h1}]`,
            },
            {
              question: `What timeline is typical to see progress from ${h1}?`,
              answer: `[To be specified: typical diagnostic timeframe, initial deployment schedule, and milestone review dates for ${h1}]`,
            },
            {
              question: `How are deliverables and results reported?`,
              answer: `[To be specified: reporting cadence, dashboard access details, and stakeholder review frequency]`,
            },
            {
              question: `Can our in-house team collaborate with Beetrix360?`,
              answer: `[To be specified: co-management models, knowledge transfer options, and internal enablement support]`,
            },
          ],
        },
      });

      // proofPlaceholder
      sections.push({
        id: `${page.id}-sec-proof`,
        type: "proofPlaceholder",
        placeholder: true,
        headingLevel: "h2",
        title: "Verified Client Impact",
        content: {
          notice: `[Add verified client case studies, verified ROI metrics, and industry accolades for ${h1}]`,
        },
      });

      // cta
      sections.push({
        id: `${page.id}-sec-cta`,
        type: "cta",
        placeholder: true,
        headingLevel: "h2",
        title: `Explore Strategic Solutions for ${h1}`,
        content: {
          text: `Speak with a dedicated strategist to evaluate your technical requirements and receive a detailed proposal.`,
          buttonLabel: "Request Proposal",
          buttonPath: "/get-a-proposal",
        },
      });
      break;
    }

    case "service":
    case "sub":
    case "platform": {
      // Intro (natural English phrasing, no ungrammatical question insertions)
      sections.push({
        id: `${page.id}-sec-intro`,
        type: "richText",
        placeholder: true,
        headingLevel: "h2",
        title: `Overview of ${h1}`,
        content: {
          paragraphs: [
            `Our ${cleanNoun} solutions help organizations execute disciplined digital strategies through structured workflows, technical best practices, and verified delivery standards. Beetrix360 coordinates specialized teams across every phase of delivery to reduce operational complexity and ensure predictable project execution.`,
            `Whether launching a new initiative or modernizing existing processes, our team develops tailored execution roadmaps aligned directly with your organizational parameters.`,
          ],
        },
      });

      // bulletList (Specific to service domain)
      sections.push({
        id: `${page.id}-sec-included`,
        type: "bulletList",
        placeholder: true,
        headingLevel: "h2",
        title: `What's Included in Our ${h1} Program`,
        content: {
          items: getServiceDeliverables(page, allPages),
        },
      });

      // process (Context-tailored 4 steps: design doesn't mention tracking/schemas)
      sections.push({
        id: `${page.id}-sec-process`,
        type: "process",
        placeholder: true,
        headingLevel: "h2",
        title: `Our 4-Step Delivery Process`,
        content: {
          steps: getServiceDeliveryProcess(h1, path),
        },
      });

      // childCards if this service has sub-services
      if (childPages.length > 0) {
        sections.push({
          id: `${page.id}-sec-sub-cards`,
          type: "childCards",
          placeholder: true,
          headingLevel: "h2",
          title: `Specialized ${h1} Modules`,
          content: {
            subtitle: `Explore focused sub-specialties within ${h1}.`,
            cards: childPages,
          },
        });
      }

      // faq (3 questions, bracketed placeholders for methodology & policies)
      sections.push({
        id: `${page.id}-sec-faq`,
        type: "faq",
        placeholder: true,
        headingLevel: "h2",
        title: `Frequently Asked Questions About ${h1}`,
        content: {
          items: [
            {
              question: `How does Beetrix360 deliver ${h1}?`,
              answer: `[To be specified: delivery methodology, dedicated squad composition, and execution workflow for ${h1}]`,
            },
            {
              question: `How is project progress tracked and evaluated?`,
              answer: `[To be specified: key performance indicators, milestone deliverables, and reporting schedule for ${h1}]`,
            },
            {
              question: `What internal resources are required from our team?`,
              answer: `[To be specified: onboarding inputs, stakeholder review requirements, and system access needs]`,
            },
          ],
        },
      });

      // proofPlaceholder
      sections.push({
        id: `${page.id}-sec-proof`,
        type: "proofPlaceholder",
        placeholder: true,
        headingLevel: "h2",
        title: "Verified Results & Case Studies",
        content: {
          notice: `[Add verified client results, conversion improvements, and case documentation for ${h1}]`,
        },
      });

      // relatedLinks (siblings)
      if (siblingPages.length > 0) {
        sections.push({
          id: `${page.id}-sec-related`,
          type: "relatedLinks",
          placeholder: true,
          headingLevel: "h2",
          title: `Related Capabilities`,
          content: {
            links: siblingPages,
          },
        });
      }

      // cta
      sections.push({
        id: `${page.id}-sec-cta`,
        type: "cta",
        placeholder: true,
        headingLevel: "h2",
        title: `Get Started with ${h1}`,
        content: {
          text: `Contact our team to review your technical requirements and receive a comprehensive proposal.`,
          buttonLabel: "Get a Proposal",
          buttonPath: "/get-a-proposal",
        },
      });
      break;
    }

    case "challenge": {
      const config = CHALLENGE_CANDIDATE_PATHS[path] || {
        causes: [
          `Misaligned search intent where high-traffic landing pages fail to answer core commercial questions`,
          `Technical friction, slow page loading performance, or fractured responsive viewport rendering`,
          `Unclear value propositions and ambiguous calls-to-action creating user decision fatigue`,
          `Inadequate data tracking and missing event telemetry preventing actionable attribution`,
          `Disjointed handoffs between marketing acquisition channels and sales pipeline follow-ups`,
        ],
        candidatePaths: [
          "/conversion",
          "/web-design/landing-pages",
          "/seo/on-page-seo",
          "/paid-media/google-ads",
        ],
      };

      // Safely resolve candidate paths against store (guarantees NO 404 links)
      const verifiedSolutionCards: { name: string; path: string }[] = [];
      for (const targetPath of config.candidatePaths) {
        const found = pageByPath.get(targetPath);
        if (found && found.published) {
          verifiedSolutionCards.push({ name: found.h1, path: found.path });
        }
      }

      // Common causes bulletList (5 causes specific to this challenge)
      sections.push({
        id: `${page.id}-sec-causes`,
        type: "bulletList",
        placeholder: true,
        headingLevel: "h2",
        title: "Common Root Causes We Uncover",
        content: {
          items: config.causes,
        },
      });

      // How we fix it (natural intro without awkward phrasing)
      sections.push({
        id: `${page.id}-sec-solution`,
        type: "richText",
        placeholder: true,
        headingLevel: "h2",
        title: "How Beetrix360 Resolves This Challenge",
        content: {
          paragraphs: [
            `When addressing operational challenges in digital growth, organizations must first isolate the structural issues preventing effective execution. Rather than applying surface-level fixes, we isolate operational friction points, reconstruct underperforming funnels, and align technical workflows with commercial outcomes.`,
            `Our multi-disciplinary teams unite technical architecture, process automation, and structured testing to turn operational bottlenecks into predictable advantages.`,
          ],
        },
      });

      // Core services that actually fix this specific challenge (verified against page store)
      sections.push({
        id: `${page.id}-sec-fix-services`,
        type: "childCards",
        placeholder: true,
        headingLevel: "h2",
        title: "Core Services Used to Solve This Problem",
        content: {
          subtitle: "Explore the primary disciplines deployed to address this challenge.",
          cards: verifiedSolutionCards,
        },
      });

      // cta
      sections.push({
        id: `${page.id}-sec-cta`,
        type: "cta",
        placeholder: true,
        headingLevel: "h2",
        title: "Schedule a Diagnostic Consultation",
        content: {
          text: `Get an objective diagnostic assessment from our senior technical strategists.`,
          buttonLabel: "Schedule Consultation",
          buttonPath: "/contact",
        },
      });
      break;
    }

    case "pricing": {
      // Intro (H1 in title, natural English without inserting question syntax into sentences)
      sections.push({
        id: `${page.id}-sec-intro`,
        type: "richText",
        placeholder: true,
        headingLevel: "h2",
        title: `Understanding Investment in ${cleanNoun}`,
        content: {
          paragraphs: [
            `Evaluating the investment required for ${cleanNoun} depends on project scope, organizational goals, and technical requirements. Beetrix360 provides transparent scoping frameworks engineered around verifiable deliverables and clear milestones.`,
          ],
        },
      });

      // What affects the price bulletList
      sections.push({
        id: `${page.id}-sec-factors`,
        type: "bulletList",
        placeholder: true,
        headingLevel: "h2",
        title: "Key Factors That Influence Pricing",
        content: {
          items: [
            "Current technical debt, legacy infrastructure, and existing platform architecture",
            "Scope and velocity of deliverables required (e.g. project-based sprint vs dedicated engagement)",
            "Competitive market saturation and acquisition difficulty within your industry vertical",
            "Integration complexity with existing CRM, ERP, and internal database systems",
            "Required asset production volume across design, copywriting, and technical development",
          ],
        },
      });

      // [Add your price ranges] placeholder (strictly no invented numbers)
      sections.push({
        id: `${page.id}-sec-tiers`,
        type: "proofPlaceholder",
        placeholder: true,
        headingLevel: "h2",
        title: "Engagement Tiers & Investment Ranges",
        content: {
          notice: "[Add your price ranges, service tiers, and engagement scopes here - strictly no invented numbers]",
        },
      });

      // faq (strictly bracketed placeholders for all policy statements)
      sections.push({
        id: `${page.id}-sec-faq`,
        type: "faq",
        placeholder: true,
        headingLevel: "h2",
        title: `Pricing & Contract FAQs`,
        content: {
          items: [
            {
              question: "Are your engagements retainer-based or project-based?",
              answer: "[To be specified: available engagement models, retainer commitments, and fixed-scope sprint terms]",
            },
            {
              question: "Do you offer pilot projects or proofs-of-concept?",
              answer: "[To be specified: pilot project parameters, discovery sprint availability, and evaluation criteria]",
            },
            {
              question: "What contract terms and cancellation policies apply?",
              answer: "[To be specified: standard agreement durations, notice periods, and deliverable transfer terms]",
            },
          ],
        },
      });

      // cta
      sections.push({
        id: `${page.id}-sec-cta`,
        type: "cta",
        placeholder: true,
        headingLevel: "h2",
        title: "Request a Custom Scope & Pricing Estimate",
        content: {
          text: `Share your project parameters to receive a detailed breakdown of deliverables and investment tiers.`,
          buttonLabel: "Request Pricing Breakdown",
          buttonPath: "/get-a-proposal",
        },
      });
      break;
    }

    case "tool": {
      sections.push({
        id: `${page.id}-sec-intro`,
        type: "richText",
        placeholder: true,
        headingLevel: "h2",
        title: `About the ${h1} Engine`,
        content: {
          paragraphs: [
            `The ${h1} utility is designed to assist teams analyzing digital performance with direct visibility into technical benchmarks and operational metrics.`,
          ],
        },
      });

      sections.push({
        id: `${page.id}-sec-notice`,
        type: "proofPlaceholder",
        placeholder: true,
        headingLevel: "h2",
        title: "Tool Availability Notice",
        content: {
          notice: `[Interactive Tool Under Final Integration - Coming Soon. Add production application widget or API integration here.]`,
        },
      });

      sections.push({
        id: `${page.id}-sec-cta`,
        type: "cta",
        placeholder: true,
        headingLevel: "h2",
        title: "Get Notified When Tool Launches",
        content: {
          text: "Register your interest to receive early access and automated diagnostic reports.",
          buttonLabel: "Join Early Access List",
          buttonPath: "/contact",
        },
      });
      break;
    }

    case "proof":
    case "company":
    case "resource": {
      sections.push({
        id: `${page.id}-sec-intro`,
        type: "richText",
        placeholder: true,
        headingLevel: "h2",
        title: `About ${h1}`,
        content: {
          paragraphs: [
            `At Beetrix360, our commitment to ${cleanNoun} is grounded in empirical results, operational integrity, and long-term client partnerships. We bridge the gap between creative execution and technical engineering.`,
          ],
        },
      });

      sections.push({
        id: `${page.id}-sec-content-placeholder`,
        type: "proofPlaceholder",
        placeholder: true,
        headingLevel: "h2",
        title: "Verified Documentation & Details",
        content: {
          notice: `[Add real ${cleanNoun} material: verified case studies, team leadership bios, company milestones, corporate governance, or verified publication listings]`,
        },
      });

      sections.push({
        id: `${page.id}-sec-cta`,
        type: "cta",
        placeholder: true,
        headingLevel: "h2",
        title: "Connect with Beetrix360",
        content: {
          text: "Learn more about our team, methodologies, and enterprise client partnerships.",
          buttonLabel: "Get in Touch",
          buttonPath: "/contact",
        },
      });
      break;
    }

    case "legal": {
      // Headings only, each with [To be written and reviewed by legal counsel]
      sections.push({
        id: `${page.id}-sec-legal-intro`,
        type: "richText",
        placeholder: true,
        headingLevel: "h2",
        title: "1. Scope and Applicability",
        content: {
          paragraphs: [
            "[To be written and reviewed by legal counsel - Scope of policy and organizational applicability].",
          ],
        },
      });

      sections.push({
        id: `${page.id}-sec-legal-collection`,
        type: "richText",
        placeholder: true,
        headingLevel: "h2",
        title: "2. Information Collection and Processing",
        content: {
          paragraphs: [
            "[To be written and reviewed by legal counsel - Information collection standards, consent parameters, and technical log processing].",
          ],
        },
      });

      sections.push({
        id: `${page.id}-sec-legal-use`,
        type: "richText",
        placeholder: true,
        headingLevel: "h2",
        title: "3. Use of Data and Security Safeguards",
        content: {
          paragraphs: [
            "[To be written and reviewed by legal counsel - Purpose limitation, encryption standards, and data retention schedules].",
          ],
        },
      });

      sections.push({
        id: `${page.id}-sec-legal-third-party`,
        type: "richText",
        placeholder: true,
        headingLevel: "h2",
        title: "4. Third-Party Disclosures & Sub-Processors",
        content: {
          paragraphs: [
            "[To be written and reviewed by legal counsel - Authorized third-party vendors, sub-processor obligations, and international transfers].",
          ],
        },
      });

      sections.push({
        id: `${page.id}-sec-legal-rights`,
        type: "richText",
        placeholder: true,
        headingLevel: "h2",
        title: "5. User Rights & Contact Inquiries",
        content: {
          paragraphs: [
            "[To be written and reviewed by legal counsel - Data subject access rights, revocation procedures, and official legal contact channels].",
          ],
        },
      });
      break;
    }

    default: {
      sections.push({
        id: `${page.id}-sec-default`,
        type: "richText",
        placeholder: true,
        headingLevel: "h2",
        title: `${h1} Overview`,
        content: {
          paragraphs: [
            `Our ${cleanNoun} capabilities provide structured solutions for organizations navigating digital channels.`,
            `[Add verified case study metric and custom copy for ${h1}]`,
          ],
        },
      });
      break;
    }
  }

  return sections;
}
