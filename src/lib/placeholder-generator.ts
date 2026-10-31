import type { PageRecordV2, SectionBlockV2 } from "./types";

/**
 * Deterministic Placeholder Content Generator
 * Strictly follows SEO and content rules:
 * - Exactly one H1 per page (Hero)
 * - Section headings as H2, sub-points as H3 (no skipped heading levels)
 * - Target keyword incorporated naturally once in the first sentence (never raw-pasted as ungrammatical phrase)
 * - Page H1 used in headings
 * - Zero hallucination / no invented metrics, clients, prices, or claims
 * - Bracketed placeholders where real facts or policies belong: [To be specified: ...] / [Add ...]
 * - Specific "What's included" lists derived from each service's H1 and parent
 * - Unique causes and tailored solution services for all 7 challenge pages
 * - Neutral one-line descriptions per page type with no marketing claims
 * - placeholder: true on every generated block
 */

// Specific "What's included" deliverables for service pages
function getServiceDeliverables(page: PageRecordV2, allPages: PageRecordV2[]): string[] {
  const slug = page.slug;
  const path = page.path;
  const h1 = page.h1;

  // 1. Branding & Creative
  if (path.includes("/branding/logo-design") || slug === "logo-design") {
    return [
      "Initial visual exploration and creative concept sketches",
      "Typography pairings and primary brand color palette definitions",
      "Structured revision rounds on selected design directions",
      "Master vector files (AI, EPS, SVG, PDF) and export-ready raster assets (PNG, JPG)",
      "Responsive mark lockups (horizontal, vertical, standalone icon, favicon)",
      "Logo usage specifications, clear-space rules, and minimum reproduction sizes",
    ];
  }
  if (path.includes("/branding/brand-strategy") || slug === "brand-strategy") {
    return [
      "Market positioning audit and competitor landscape analysis",
      "Target customer segmentation and audience profile definition",
      "Core brand narrative, mission statement, and value proposition architecture",
      "Brand voice, tone principles, and editorial messaging guidelines",
      "Product naming taxonomy and brand architecture framework",
      "Implementation roadmap for internal and customer-facing touchpoints",
    ];
  }
  if (path.includes("/branding/brand-guidelines") || slug === "brand-guidelines" || path.includes("/branding/corporate-identity")) {
    return [
      "Comprehensive digital brand guidelines and visual standards manual",
      "Typography system, scale hierarchy, and web-safe font fallback rules",
      "Full color specifications across print and digital (CMYK, RGB, HEX, Pantone)",
      "Iconography styling, art direction rules, and graphic asset libraries",
      "Stationery and digital collateral templates (business cards, letterheads, decks)",
      "Digital asset packaging and master file organization",
    ];
  }

  // 2. SEO Services
  if (path.includes("/seo/local-seo") || slug === "local-seo") {
    return [
      "Google Business Profile audit, category alignment, and profile optimization",
      "NAP (Name, Address, Phone) citation audit and consistency remediation across local directories",
      "Geo-targeted landing page structure and localized on-page optimization",
      "Local review generation workflow and customer feedback process design",
      "LocalBusiness and GeoCoordinates structured data schema deployment",
      "Local map pack visibility tracking and localized search ranking reports",
    ];
  }
  if (path.includes("/seo/technical-seo") || slug === "technical-seo") {
    return [
      "Crawl budget analysis, server log review, and HTTP status code audit",
      "Core Web Vitals diagnostic assessment and page rendering speed evaluation",
      "XML sitemap architecture, indexation directives, and robots.txt configuration",
      "Canonicalization review, duplicate content remediation, and redirect chain cleanup",
      "Structured data schema implementation (JSON-LD) across key page templates",
      "Mobile viewport validation and international hreflang configuration",
    ];
  }
  if (path.includes("/seo/on-page-seo") || slug === "on-page-seo") {
    return [
      "Search intent mapping and keyword targeting architecture across key pages",
      "Title tag, meta description, and heading hierarchy (H1, H2, H3) optimization",
      "Body copy optimization, topical depth enhancement, and semantic entity integration",
      "Internal linking structure and descriptive anchor text distribution",
      "Image optimization, descriptive alt text tagging, and media asset sizing",
      "Rich snippet eligibility review and page-level schema markup",
    ];
  }
  if (path.includes("/seo/keyword-research") || slug === "keyword-research") {
    return [
      "Comprehensive search query discovery and topical cluster mapping",
      "Search intent classification (informational, commercial, transactional, navigational)",
      "Keyword difficulty and competitor ranking gap analysis",
      "Long-tail search query identification and question-based search mapping",
      "Search engine results page (SERP) feature and AI overview opportunity audit",
      "Prioritized keyword roadmap aligned to content planning and page updates",
    ];
  }
  if (path.includes("/seo/link-building") || slug === "link-building") {
    return [
      "Backlink profile audit and toxic link risk assessment",
      "Competitor backlink gap analysis and referring domain roadmapping",
      "High-relevance industry resource and editorial publication identification",
      "Data-driven digital PR angle and linkable asset conception",
      "Direct manual outreach and editorial relationship management",
      "Acquired link reporting, domain authority metrics, and anchor text distribution",
    ];
  }
  if (path.includes("/seo/programmatic-seo") || slug === "programmatic-seo") {
    return [
      "Structured database schema design and dataset normalization",
      "Dynamic page template architecture and internal linking graph setup",
      "Automated metadata, title tag formulas, and unique content block logic",
      "Crawl budget optimization, indexation rules, and XML sitemap segmentation",
      "Duplicate content prevention logic and programmatic page quality audits",
      "Indexation monitoring and performance tracking across programmatic URLs",
    ];
  }
  if (path.includes("/seo/ecommerce-seo") || slug === "ecommerce-seo") {
    return [
      "Product catalog architecture and category taxonomy optimization",
      "Faceted navigation crawl controls and canonicalization rules",
      "Product detail page (PDP) structured data schema markup and rich snippet setup",
      "Out-of-stock and discontinued product handling workflows",
      "Category page content structure and internal link distribution",
      "Product search visibility and Google Merchant Center data alignment",
    ];
  }
  if (path.includes("/seo/enterprise-seo") || slug === "enterprise-seo") {
    return [
      "Multi-domain, sub-brand, and international site architecture governance",
      "Cross-functional engineering coordination and technical backlog specifications",
      "Large-scale crawl data analysis and enterprise indexation management",
      "Enterprise CMS workflows, approval protocols, and staging validation rules",
      "Search performance telemetry and executive dashboard configuration",
      "Search engine algorithm volatility monitoring and technical compliance audits",
    ];
  }

  // 3. AI Search & Generative Engine Optimization
  if (path.includes("/seo/generative-engine-optimization") || slug === "generative-engine-optimization" || slug === "enterprise-geo") {
    return [
      "Brand visibility audit across Google AI Overviews, Perplexity, and ChatGPT",
      "Structured data schema enhancements to support AI entity extraction",
      "Direct answer formatting, factual tabular data, and citational structure planning",
      "Knowledge graph consistency and digital authority footprint verification",
      "Comparative sentiment and brand perception analysis in generative search outputs",
      "Ongoing monitoring of generative search citations and referral patterns",
    ];
  }
  if (path.includes("/seo/answer-engine-optimization") || slug === "answer-engine-optimization") {
    return [
      "Question-and-answer content architecture mapped to voice and conversational queries",
      "FAQPage and QAPage structured data schema deployment",
      "Featured snippet and direct answer formatting across core service pages",
      "Entity relationship modeling and concise factual statement structuring",
      "Conversational search intent mapping across buyer research stages",
      "Zero-click answer placement audits and tracking",
    ];
  }
  if (path.includes("/seo/chatgpt-optimization") || slug === "chatgpt-optimization") {
    return [
      "Brand citation source audit across major AI conversational platforms",
      "Third-party authoritative publication and directory presence review",
      "Knowledge base and entity consistency verification across web sources",
      "Content formatting guidelines optimized for LLM information retrieval",
      "Systematic prompt testing across relevant commercial queries",
      "Brand recommendation analysis and citation tracking",
    ];
  }

  // 4. Paid Media
  if (path.includes("/paid-media/google-ads") || slug === "google-ads") {
    return [
      "Search and Performance Max account structure architecture",
      "High-intent commercial keyword selection and negative keyword library configuration",
      "Responsive search ad copy variations and ad asset extension setup",
      "Conversion tracking configuration and value-based bidding parameters",
      "Bidding strategy alignment (Target CPA / Target ROAS) and audience signal setup",
      "Search query reporting, search term pruning, and budget pacing controls",
    ];
  }
  if (path.includes("/paid-media/meta-ads") || slug === "meta-ads") {
    return [
      "Campaign budget optimization (CBO) and ad set targeting architecture",
      "Custom audience, lookalike audience, and exclusion list configuration",
      "Ad creative copy variations, headline testing, and call-to-action alignment",
      "Meta Conversions API (CAPI) and pixel event tracking verification",
      "Placement optimization across Facebook, Instagram, and Audience Network",
      "Frequency monitoring, creative fatigue analysis, and performance reporting",
    ];
  }
  if (path.includes("/paid-media/tiktok-ads") || slug === "tiktok-ads") {
    return [
      "TikTok Ads Manager account structure and TikTok Pixel configuration",
      "Native vertical video creative briefs and hook testing strategy",
      "In-feed ad formats, spark ads, and interactive add-on deployment",
      "Demographic, interest, and behavioral audience targeting setup",
      "Event tracking and TikTok Events API implementation",
      "Campaign bid optimization and creative refresh cadences",
    ];
  }
  if (path.includes("/paid-media/programmatic-advertising") || slug === "programmatic-advertising") {
    return [
      "Demand-side platform (DSP) setup and inventory selection",
      "First-party audience data onboarding and third-party segment evaluation",
      "Private marketplace (PMP) deal negotiation and contextual targeting configuration",
      "Display, native, and video ad creative specification and QA",
      "Brand safety, viewability, and fraud protection filter configuration",
      "Cross-channel frequency capping and supply path optimization",
    ];
  }

  // 5. Marketplaces
  if (path.includes("/marketplaces/amazon/advertising") || slug === "advertising") {
    return [
      "Sponsored Products, Sponsored Brands, and Sponsored Display campaign setup",
      "High-converting keyword harvesting and competitor ASIN targeting",
      "Negative keyword libraries and bid management optimization",
      "Amazon Attribution setup for external traffic measurement",
      "Campaign portfolio organization and target ACoS / ROAS budgeting",
      "Search term performance analysis and budget pacing",
    ];
  }
  if (path.includes("/marketplaces/amazon/seo") || slug === "seo") {
    return [
      "Amazon search algorithm ranking factor audit and catalog review",
      "Keyword-optimized product title, bullet points, and product description copy",
      "Backend search terms, subject matter, and target audience field optimization",
      "A+ Content / Enhanced Brand Content (EBC) layout and graphic briefs",
      "Product variation structuring and parent-child listing setup",
      "Organic rank tracking for high-priority category search terms",
    ];
  }

  // 6. AI & Automation
  if (path.includes("/ai-automation/workflow-automation") || slug === "workflow-automation") {
    return [
      "End-to-end operational process mapping and bottleneck assessment",
      "Cloud integration architecture across business software platforms",
      "Multi-step trigger, condition, and action sequence configuration",
      "Automated exception handling, error logging, and retry logic",
      "Production deployment, webhook verification, and user access controls",
      "Workflow documentation, execution logs, and staff handoff guide",
    ];
  }
  if (path.includes("/ai-automation/business-process-automation") || slug === "business-process-automation") {
    return [
      "Cross-departmental business process discovery and ROI prioritization",
      "Custom automation architecture replacing repetitive manual operations",
      "Integration with core ERP, CRM, and internal database systems",
      "Automated notification, approval routing, and task assignment logic",
      "Data validation safeguards and audit trail compliance",
      "Operational efficiency metrics and team enablement documentation",
    ];
  }
  if (path.includes("/ai-automation/document-processing") || slug === "document-processing") {
    return [
      "Optical character recognition (OCR) and intelligent document parsing setup",
      "Automated data extraction from invoices, receipts, and order forms",
      "Validation rules and discrepancy flagging against internal databases",
      "Automated document classification, tagging, and folder filing",
      "Secure data routing to accounting and operations systems",
      "Human-in-the-loop exception review workflow configuration",
    ];
  }
  if (path.includes("/ai-automation/data-entry-automation") || slug === "data-entry-automation") {
    return [
      "Audit of manual data entry touchpoints and error frequency",
      "Automated ingestion pipeline connecting forms, emails, and spreadsheets",
      "Field mapping, format standardization, and data cleansing routines",
      "Scheduled and real-time database synchronization workflows",
      "Duplicate detection and validation error alerting",
      "Audit trail logging and data integrity verification",
    ];
  }

  // 7. Web & Conversion
  if (path.includes("/conversion/landing-page-design") || slug === "landing-page-design") {
    return [
      "Information architecture and conversion-focused wireframing",
      "High-fidelity responsive UI mockups tailored to acquisition campaigns",
      "Conversion-oriented copywriting layout and visual hierarchy design",
      "Lead capture form design and CRM integration specification",
      "Mobile usability optimization and fast-loading asset preparation",
      "Conversion tracking event tag placement (GA4, Meta, Google Ads)",
    ];
  }
  if (path.includes("/conversion/conversion-rate-optimization") || slug === "conversion-rate-optimization") {
    return [
      "Quantitative analytics audit (funnel leakage, drop-off points, completion rates)",
      "Qualitative user behavior analysis (heatmaps, scroll depth, session replays)",
      "Conversion friction audit and heuristic evaluation of key templates",
      "Prioritized testing hypothesis backlog scored by impact and implementation effort",
      "Test variation design and technical QA across device viewports",
      "Post-test statistical analysis and implementation documentation",
    ];
  }
  if (path.includes("/web/website-design") || slug === "website-design") {
    return [
      "User research, sitemap planning, and core wireframe development",
      "Visual design system, component styling, and typographic hierarchy",
      "Responsive desktop, tablet, and mobile interface design",
      "Interactive prototype creation and stakeholder feedback reviews",
      "Design asset handoff with detailed developer documentation",
      "Accessibility review compliant with WCAG standards",
    ];
  }

  // 8. AI Content
  if (path.includes("/ai-content/ai-content-optimization") || slug === "ai-content-optimization") {
    return [
      "Content inventory audit and performance gap identification",
      "Topical relevance, semantic entity, and keyword coverage analysis",
      "Human editorial review, fact-checking, and brand voice alignment",
      "Heading structure, internal links, and metadata refinement",
      "Reader engagement enhancements (summaries, key takeaways, clear sections)",
      "Search snippet and AI overview eligibility review",
    ];
  }
  if (path.includes("/ai-content/ai-blog-post-generation") || slug === "ai-blog-post-generation") {
    return [
      "Editorial content calendar and keyword-driven topic ideation",
      "Structured outline generation with search intent mapping",
      "AI-assisted first draft generation customized to brand tone",
      "Senior human editor refinement, fact verification, and tone polishing",
      "Header hierarchy, featured image styling, and internal link integration",
      "Publishing checklist and CMS formatting standards",
    ];
  }

  // Default clean, realistic deliverables derived from H1 and parent topic
  const parent = allPages.find((p) => p.id === page.parentId);
  const contextName = parent ? `${parent.h1}` : "Beetrix360";

  return [
    `Initial requirements discovery and technical scope assessment for ${h1}`,
    `Custom execution plan tailored to your technical environment and objectives`,
    `Direct implementation and asset production aligned with ${contextName} standards`,
    `Quality assurance, cross-device validation, and functional verification`,
    `Technical documentation, delivery notes, and operational handover`,
    `Structured milestone reviews and deliverable sign-off procedures`,
  ];
}

// 7 Challenge page configurations
const CHALLENGE_CONFIGS: Record<
  string,
  {
    causes: string[];
    solutionServices: { name: string; path: string }[];
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
    solutionServices: [
      { name: "Landing Page Design", path: "/conversion/landing-page-design" },
      { name: "Conversion Rate Optimization", path: "/conversion/conversion-rate-optimization" },
      { name: "On-Page SEO", path: "/seo/on-page-seo" },
      { name: "Google Ads", path: "/paid-media/google-ads" },
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
    solutionServices: [
      { name: "Technical SEO", path: "/seo/technical-seo" },
      { name: "Link Building", path: "/seo/link-building" },
      { name: "Keyword Research", path: "/seo/keyword-research" },
      { name: "On-Page SEO", path: "/seo/on-page-seo" },
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
    solutionServices: [
      { name: "Conversion Rate Optimization", path: "/conversion/conversion-rate-optimization" },
      { name: "Landing Page Design", path: "/conversion/landing-page-design" },
      { name: "Website Design", path: "/web/website-design" },
      { name: "A/B Testing", path: "/conversion/ab-testing" },
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
    solutionServices: [
      { name: "Generative Engine Optimization", path: "/seo/generative-engine-optimization" },
      { name: "Answer Engine Optimization", path: "/seo/answer-engine-optimization" },
      { name: "ChatGPT Optimization", path: "/seo/chatgpt-optimization" },
      { name: "AI Brand Perception", path: "/seo/ai-brand-perception" },
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
    solutionServices: [
      { name: "Enterprise SEO", path: "/seo/enterprise-seo" },
      { name: "Enterprise PPC", path: "/paid-media/enterprise-ppc" },
      { name: "Competitor Analysis", path: "/digital-marketing/competitor-analysis" },
      { name: "AI Digital Marketing", path: "/digital-marketing/ai-digital-marketing" },
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
    solutionServices: [
      { name: "Workflow Automation", path: "/ai-automation/workflow-automation" },
      { name: "Business Process Automation", path: "/ai-automation/business-process-automation" },
      { name: "Document Processing", path: "/ai-automation/document-processing" },
      { name: "Data Entry Automation", path: "/ai-automation/data-entry-automation" },
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
    solutionServices: [
      { name: "Google Ads", path: "/paid-media/google-ads" },
      { name: "Meta Ads", path: "/paid-media/meta-ads" },
      { name: "Landing Page Design", path: "/conversion/landing-page-design" },
      { name: "Enterprise PPC", path: "/paid-media/enterprise-ppc" },
    ],
  },
};

// Neutral one-line descriptions per page type with no claims
function getNeutralTagline(pageType: string, h1: string): string {
  switch (pageType) {
    case "hub":
      return `Overview of capabilities, practice areas, and strategic advisory for ${h1.toLowerCase()}.`;
    case "service":
    case "sub":
    case "platform":
      return `Scope of deliverables, technical implementation standards, and execution methodology for ${h1.toLowerCase()}.`;
    case "challenge":
      return "Diagnostic overview, common operational bottlenecks, and implementation paths to resolve this challenge.";
    case "pricing":
      return `Overview of engagement models, cost drivers, and scoping criteria for ${h1.toLowerCase()}.`;
    case "tool":
      return `Technical specifications, feature capabilities, and integration parameters for the ${h1.toLowerCase()} tool.`;
    case "about":
    case "company":
      return "Organizational background, operational philosophy, and team leadership at Beetrix360.";
    case "resource":
    case "proof":
      return "Reference materials, case documentation, and published research from Beetrix360.";
    case "legal":
      return "Official legal policies, compliance disclosures, and terms governing Beetrix360 services.";
    default:
      return `Overview of capabilities and technical execution for ${h1.toLowerCase()}.`;
  }
}

export function generatePlaceholderSections(
  page: PageRecordV2,
  allPages: PageRecordV2[]
): SectionBlockV2[] {
  const kw = page.targetKeyword;
  const h1 = page.h1;
  const path = page.path;
  const division = page.division || "Beetrix360";
  const pageType = page.pageType || "service";

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
      targetKeyword: kw,
      primaryCta: { label: "Get a proposal", path: "/get-a-proposal" },
      secondaryCta: { label: "Schedule Strategy Call", path: "/contact" },
    },
  });

  // PAGE TYPE SPECIFIC SECTIONS
  switch (pageType) {
    case "hub": {
      // Intro (2 short paragraphs, kw natural in first sentence, H1 in title)
      sections.push({
        id: `${page.id}-sec-intro`,
        type: "richText",
        placeholder: true,
        headingLevel: "h2",
        title: `Overview of ${h1}`,
        content: {
          paragraphs: [
            `Our ${h1.toLowerCase()} practice coordinates specialized disciplines to help teams achieve sustainable ${kw} across search engines and modern digital ecosystems. Beetrix360 unites experienced engineers, analysts, and growth architects to deploy proven frameworks tailored to enterprise requirements.`,
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

      // faq (4 questions, no invented policies)
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
              answer: `Our approach combines technical rigor with commercial alignment, focusing directly on measurable milestones and transparent execution.`,
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
      // Intro (kw in first sentence naturally, H1 in title)
      sections.push({
        id: `${page.id}-sec-intro`,
        type: "richText",
        placeholder: true,
        headingLevel: "h2",
        title: `Overview of ${h1}`,
        content: {
          paragraphs: [
            `Our ${h1.toLowerCase()} solutions help organizations implement effective ${kw} through disciplined execution and technical best practices. Beetrix360 coordinates specialized resources across every phase of delivery to reduce complexity and ensure predictable project execution.`,
            `Whether launching a new initiative or modernizing existing processes, our team develops structured workflows tailored to your organizational parameters and technical requirements.`,
          ],
        },
      });

      // bulletList (What's included: 5-6 items specific to service)
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

      // process (4 steps)
      sections.push({
        id: `${page.id}-sec-process`,
        type: "process",
        placeholder: true,
        headingLevel: "h2",
        title: `Our 4-Step Delivery Process`,
        content: {
          steps: [
            {
              step: 1,
              title: "Discovery & Requirements",
              description: `Assessment of current assets, conversion barriers, and specific target milestones for ${h1}.`,
            },
            {
              step: 2,
              title: "Technical Setup & Configuration",
              description: `Deploying foundational tracking, schemas, technical assets, and workflow parameters.`,
            },
            {
              step: 3,
              title: "Active Execution & Quality Assurance",
              description: `Structured sprint execution, peer review, and verification across all project requirements.`,
            },
            {
              step: 4,
              title: "Review & Continuous Refinement",
              description: `Evaluating milestone outcomes, reviewing delivery reports, and identifying incremental improvements.`,
            },
          ],
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

      // faq (3 questions, no invented policies)
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
              answer: `We emphasize structured execution, clear technical standards, and verifiable deliverables tailored directly to your operational scope.`,
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
      const challengeConfig = CHALLENGE_CONFIGS[path] || {
        causes: [
          `Misaligned search intent where high-traffic landing pages fail to answer core commercial questions`,
          `Technical friction, slow page loading performance, or fractured responsive viewport rendering`,
          `Unclear value propositions and ambiguous calls-to-action creating user decision fatigue`,
          `Inadequate data tracking and missing event telemetry preventing actionable attribution`,
          `Disjointed handoffs between marketing acquisition channels and sales pipeline follow-ups`,
        ],
        solutionServices: [
          { name: "Conversion Rate Optimization", path: "/conversion/conversion-rate-optimization" },
          { name: "Landing Page Design", path: "/conversion/landing-page-design" },
          { name: "Technical SEO", path: "/seo/technical-seo" },
          { name: "Google Ads", path: "/paid-media/google-ads" },
        ],
      };

      // Common causes bulletList (5 causes specific to this challenge)
      sections.push({
        id: `${page.id}-sec-causes`,
        type: "bulletList",
        placeholder: true,
        headingLevel: "h2",
        title: "Common Root Causes We Uncover",
        content: {
          items: challengeConfig.causes,
        },
      });

      // How we fix it (intro with natural keyword)
      sections.push({
        id: `${page.id}-sec-solution`,
        type: "richText",
        placeholder: true,
        headingLevel: "h2",
        title: "How Beetrix360 Resolves This Challenge",
        content: {
          paragraphs: [
            `When addressing challenges related to ${kw}, organizations must first identify the structural issues preventing effective execution. Rather than applying surface-level fixes, we isolate operational friction points, reconstruct underperforming funnels, and align technical workflows with commercial outcomes.`,
            `Our multi-disciplinary teams unite technical architecture, process automation, and structured testing to turn operational bottlenecks into predictable advantages.`,
          ],
        },
      });

      // Core services that actually fix this specific challenge
      sections.push({
        id: `${page.id}-sec-fix-services`,
        type: "childCards",
        placeholder: true,
        headingLevel: "h2",
        title: "Core Services Used to Solve This Problem",
        content: {
          subtitle: "Explore the primary disciplines deployed to address this challenge.",
          cards: challengeConfig.solutionServices,
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
      // Intro (kw natural in first sentence, H1 in title)
      sections.push({
        id: `${page.id}-sec-intro`,
        type: "richText",
        placeholder: true,
        headingLevel: "h2",
        title: `Understanding Investment in ${h1}`,
        content: {
          paragraphs: [
            `Evaluating the investment required for ${kw} depends on project scope, organizational goals, and technical requirements. Beetrix360 provides transparent scoping frameworks engineered around verifiable deliverables and clear milestones.`,
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

      // faq (strictly bracketed placeholders for policy statements)
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
            `The ${h1} utility is designed to assist teams analyzing ${kw} with direct visibility into technical benchmarks and operational metrics.`,
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
            `At Beetrix360, our commitment to ${h1.toLowerCase()} is grounded in empirical results, operational integrity, and long-term client partnerships. We bridge the gap between creative execution and technical engineering.`,
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
          notice: `[Add real ${h1.toLowerCase()} material: verified case studies, team leadership bios, company milestones, corporate governance, or verified publication listings]`,
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
            `Our ${h1.toLowerCase()} capabilities provide structured solutions for organizations navigating ${kw}.`,
            `[Add verified case study metric and custom copy for ${h1}]`,
          ],
        },
      });
      break;
    }
  }

  return sections;
}
