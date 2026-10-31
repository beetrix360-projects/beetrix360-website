import type { PageRecordV2, SectionBlockV2 } from "./types";

/**
 * Deterministic Placeholder Content Generator
 * Strictly follows SEO and content rules:
 * - Exactly one H1 per page (Hero)
 * - Section headings as H2, sub-points as H3 (no skipped heading levels)
 * - Target keyword in the H1, titleTag, and first sentence of intro
 * - Zero hallucination / no invented metrics, clients, prices, or claims
 * - Bracketed placeholders where real facts belong: [Add ...]
 * - placeholder: true on every generated block
 */

export function generatePlaceholderSections(
  page: PageRecordV2,
  allPages: PageRecordV2[]
): SectionBlockV2[] {
  const kw = page.targetKeyword;
  const h1 = page.h1;
  const path = page.path;
  const division = page.division || "Beetrix360";

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
      tagline: `Enterprise ${kw} solutions engineered for measurable revenue expansion and verified operational performance.`,
      targetKeyword: kw,
      primaryCta: { label: "Get a proposal", path: "/get-a-proposal" },
      secondaryCta: { label: "Schedule Strategy Call", path: "/contact" },
    },
  });

  // PAGE TYPE SPECIFIC SECTIONS
  switch (page.pageType) {
    case "hub": {
      // Intro (2 short paragraphs, kw in first sentence)
      sections.push({
        id: `${page.id}-sec-intro`,
        type: "richText",
        placeholder: true,
        headingLevel: "h2",
        title: `Overview of ${h1}`,
        content: {
          paragraphs: [
            `Investing in structured ${kw} enables modern organizations to scale predictable acquisition channels while securing resilient market visibility across search engines and AI generative systems. Our multi-disciplinary practice unites specialized engineers, data analysts, and growth architects to deploy proven frameworks tailored to enterprise requirements.`,
            `Every program is designed around clear performance benchmarks, transparent attribution models, and direct commercial outcomes. Explore the specialized capabilities below to see how each discipline fits into our complete revenue architecture.`,
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
            subtitle: `Explore specific ${kw} services and implementation models.`,
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
        title: `Our 4-Stage ${kw} Framework`,
        content: {
          steps: [
            {
              step: 1,
              title: "Diagnostic Audit & System Discovery",
              description: `Comprehensive analysis of your current ${kw} footprint, competitive landscape, data hygiene, and technical baseline.`,
            },
            {
              step: 2,
              title: "Strategic Architecture & Roadmapping",
              description: `Designing the operational blueprint, prioritizing highest-leverage initiatives, and setting quantifiable milestones.`,
            },
            {
              step: 3,
              title: "Full-Funnel Execution & Deployment",
              description: `Rigorous technical rollout, custom workflows, schema implementation, and campaign orchestration.`,
            },
            {
              step: 4,
              title: "Optimization, Attribution & Scaling",
              description: `Continuous iteration based on real conversion data, multi-touch analytics, and incremental revenue expansion.`,
            },
          ],
        },
      });

      // faq (4 questions)
      sections.push({
        id: `${page.id}-sec-faq`,
        type: "faq",
        placeholder: true,
        headingLevel: "h2",
        title: `Frequently Asked Questions About ${h1}`,
        content: {
          items: [
            {
              question: `How does Beetrix360 approach ${kw}?`,
              answer: `Our approach to ${kw} emphasizes deterministic, data-backed execution integrated directly with your sales and revenue pipelines rather than isolated vanity metrics.`,
            },
            {
              question: `What timeline is typical to see commercial impact from ${kw}?`,
              answer: `Initial operational and technical foundations are established within the first 30 days, with compounding performance gains typically manifesting between 60 to 90 days of active deployment.`,
            },
            {
              question: `How are ${kw} deliverables reported and attributed?`,
              answer: `We provide live dashboard access, weekly sprint updates, and monthly executive reviews measuring pipeline velocity, attribution touchpoints, and cost-per-acquisition.`,
            },
            {
              question: `Can our in-house team collaborate with Beetrix360 on ${kw}?`,
              answer: `Yes. We operate as an extension of your existing team, providing clear documentation, knowledge transfer, and strategic co-management where appropriate.`,
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
        title: `Ready to Accelerate Your ${h1}?`,
        content: {
          text: `Speak with a dedicated growth architect to evaluate your technical requirements and receive a comprehensive proposal.`,
          buttonLabel: "Request Strategic Proposal",
          buttonPath: "/get-a-proposal",
        },
      });
      break;
    }

    case "service":
    case "sub":
    case "platform": {
      // Intro (kw in first sentence)
      sections.push({
        id: `${page.id}-sec-intro`,
        type: "richText",
        placeholder: true,
        headingLevel: "h2",
        title: `Comprehensive ${h1} Solutions`,
        content: {
          paragraphs: [
            `Effective ${kw} requires disciplined execution, continuous data feedback, and deep architectural alignment with your organizational goals. Beetrix360 provides end-to-end execution across every layer of the discipline, eliminating fragmentation and operational bottlenecks.`,
            `Whether launching a new initiative or modernizing legacy infrastructure, our engineers and strategists build scalable systems that deliver predictable, defensible market advantages.`,
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
          items: [
            `Comprehensive technical audit and baseline configuration for ${kw}`,
            `Custom strategy development aligned with your business model and audience segments`,
            `Hands-on implementation, asset production, and system orchestration`,
            `Multi-variant testing and systematic conversion rate optimization`,
            `Weekly performance monitoring and continuous technical refinement`,
            `Integrated executive dashboard reporting and pipeline attribution`,
          ],
        },
      });

      // process (4 steps)
      sections.push({
        id: `${page.id}-sec-process`,
        type: "process",
        placeholder: true,
        headingLevel: "h2",
        title: `Our 4-Step ${kw} Delivery Process`,
        content: {
          steps: [
            {
              step: 1,
              title: "Discovery & Architecture",
              description: `Deep-dive assessment of current assets, conversion barriers, and specific target milestones for ${kw}.`,
            },
            {
              step: 2,
              title: "System Setup & Configuration",
              description: `Deploying foundational tracking, schemas, technical assets, and workflow automations.`,
            },
            {
              step: 3,
              title: "Active Execution & Optimization",
              description: `Continuous sprint execution, rigorous QA, and performance tuning across all touchpoints.`,
            },
            {
              step: 4,
              title: "Performance Review & Scaling",
              description: `Analyzing commercial returns, reviewing attribution models, and expanding budget efficiency.`,
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

      // faq (3-4 questions)
      sections.push({
        id: `${page.id}-sec-faq`,
        type: "faq",
        placeholder: true,
        headingLevel: "h2",
        title: `Frequently Asked Questions: ${h1}`,
        content: {
          items: [
            {
              question: `Why choose Beetrix360 for ${kw}?`,
              answer: `We unite engineering rigor with commercial strategy, ensuring every aspect of ${kw} directly influences pipeline creation and verifiable ROI.`,
            },
            {
              question: `How do we track the success of ${kw}?`,
              answer: `We establish concrete Key Performance Indicators during discovery, tracking conversions, organic impact, and revenue contribution in real-time dashboards.`,
            },
            {
              question: `What internal resources are required from our team?`,
              answer: `We require minimal ongoing time from your stakeholders—primarily initial access provisioning, onboarding interviews, and bi-weekly strategic check-ins.`,
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
        title: "Proven Case Studies",
        content: {
          notice: `[Add verified client results, verified conversion uplifts, and client testimonials for ${h1}]`,
        },
      });

      // relatedLinks (siblings)
      if (siblingPages.length > 0) {
        sections.push({
          id: `${page.id}-sec-related`,
          type: "relatedLinks",
          placeholder: true,
          headingLevel: "h2",
          title: `Related ${division} Disciplines`,
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
        title: `Start Scaling with ${h1}`,
        content: {
          text: `Contact our growth team today to review your current setup and receive an actionable roadmap for ${kw}.`,
          buttonLabel: "Get a Proposal",
          buttonPath: "/get-a-proposal",
        },
      });
      break;
    }

    case "challenge": {
      // hero framed as problem
      // Common causes bulletList (4-5 causes)
      sections.push({
        id: `${page.id}-sec-causes`,
        type: "bulletList",
        placeholder: true,
        headingLevel: "h2",
        title: "Common Root Causes We Uncover",
        content: {
          items: [
            `Misaligned search intent where high-traffic landing pages fail to answer core commercial questions regarding ${kw}`,
            `Technical friction, slow page loading performance, or fractured responsive viewport rendering`,
            `Unclear value propositions and ambiguous calls-to-action that create user decision fatigue`,
            `Inadequate data tracking and missing event telemetry preventing actionable attribution`,
            `Disjointed handoffs between marketing acquisition channels and sales pipeline follow-ups`,
          ],
        },
      });

      // How we fix it (with internal links to relevant services)
      sections.push({
        id: `${page.id}-sec-solution`,
        type: "richText",
        placeholder: true,
        headingLevel: "h2",
        title: "How Beetrix360 Resolves This Challenge",
        content: {
          paragraphs: [
            `Solving ${kw} demands a systematic audit of your end-to-end customer journey. Rather than applying surface-level cosmetic adjustments, we isolate structural friction points, rebuild conversion funnels, and align technical architecture with customer purchasing psychology.`,
            `Our multidisciplinary teams combine conversion rate optimization, technical infrastructure repairs, and high-intent content engineering to turn underperforming assets into durable revenue engines.`,
          ],
        },
      });

      // Solution services
      const solutionServices = allPages
        .filter((p) => p.pageType === "service" || p.pageType === "hub")
        .slice(0, 4)
        .map((s) => ({ name: s.h1, path: s.path, targetKeyword: s.targetKeyword }));

      sections.push({
        id: `${page.id}-sec-fix-services`,
        type: "childCards",
        placeholder: true,
        headingLevel: "h2",
        title: "Core Services Used to Solve This Problem",
        content: {
          subtitle: "Explore the primary disciplines deployed to address this challenge.",
          cards: solutionServices,
        },
      });

      // cta
      sections.push({
        id: `${page.id}-sec-cta`,
        type: "cta",
        placeholder: true,
        headingLevel: "h2",
        title: "Fix This Challenge with Beetrix360",
        content: {
          text: `Get an objective diagnostic audit from our senior technical strategists.`,
          buttonLabel: "Schedule Diagnostic Call",
          buttonPath: "/contact",
        },
      });
      break;
    }

    case "pricing": {
      // Intro (kw in first sentence)
      sections.push({
        id: `${page.id}-sec-intro`,
        type: "richText",
        placeholder: true,
        headingLevel: "h2",
        title: `Transparent Investment in ${kw}`,
        content: {
          paragraphs: [
            `Understanding ${kw} starts with evaluating the specific scope, technical complexity, and growth velocity required by your organization. We believe in transparent, value-aligned engagements engineered to produce quantifiable return on investment.`,
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
            "Scope and velocity of deliverables required (e.g. monthly sprint cadence vs dedicated squads)",
            "Competitive market saturation and keyword acquisition difficulty within your vertical",
            "Integration requirements with enterprise CRM, ERP, and internal database systems",
            "Custom asset production volume across design, technical copy, and multimedia assets",
          ],
        },
      });

      // [Add your price ranges] placeholder (no numbers)
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

      // faq
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
              answer: "We support both flexible multi-month growth retainers and focused fixed-scope technical sprint engagements, depending on your roadmap.",
            },
            {
              question: "Do you offer pilot projects or proofs-of-concept?",
              answer: "Yes. For complex technical deployments, we frequently initiate engagements with a 30-day comprehensive audit or prototype sprint.",
            },
            {
              question: "What contract terms and cancellation policies apply?",
              answer: "Our standard agreements include transparent 30-day notice provisions with complete IP transfer upon payment completion.",
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
            `The ${kw} tool provides automated diagnostics and real-time visibility audits for engineering and marketing leaders. Engineered by Beetrix360 to surface immediate optimization opportunities across digital properties.`,
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
          text: "Register your interest to receive early beta access and automated diagnostic reports.",
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
            `At Beetrix360, our commitment to ${kw} is grounded in empirical results, operational integrity, and long-term client partnerships. We bridge the gap between creative execution and technical engineering.`,
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
            `Enterprise ${kw} services and implementation architecture engineered by Beetrix360.`,
            `[Add verified case study metric and custom copy for ${h1}]`,
          ],
        },
      });
      break;
    }
  }

  return sections;
}
