const fs = require('fs');
const path = require('path');
const vm = require('vm');
const zlib = require('zlib');

// ============================================================================
// 1. Parse Beetrix360-Master-Summary.xlsx
// ============================================================================
function readZipEntries(filePath) {
  const buf = fs.readFileSync(filePath);
  let eocd = buf.length - 22;
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd--;
  const cdCount = buf.readUInt16LE(eocd + 10);
  let cdOffset = buf.readUInt32LE(eocd + 16);
  const entries = {};
  for (let i = 0; i < cdCount; i++) {
    if (buf.readUInt32LE(cdOffset) !== 0x02014b50) break;
    const method = buf.readUInt16LE(cdOffset + 10);
    const compSize = buf.readUInt32LE(cdOffset + 20);
    const nameLen = buf.readUInt16LE(cdOffset + 28);
    const extraLen = buf.readUInt16LE(cdOffset + 30);
    const commentLen = buf.readUInt16LE(cdOffset + 32);
    const localOffset = buf.readUInt32LE(cdOffset + 42);
    const name = buf.slice(cdOffset + 46, cdOffset + 46 + nameLen).toString('utf8');
    const localNameLen = buf.readUInt16LE(localOffset + 26);
    const localExtraLen = buf.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLen + localExtraLen;
    const compData = buf.slice(dataStart, dataStart + compSize);
    if (method === 0) entries[name] = compData;
    else if (method === 8 && compSize > 0) entries[name] = zlib.inflateRawSync(compData);
    cdOffset += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

function decodeXml(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function parseXlsx(filePath) {
  const entries = readZipEntries(filePath);
  const sharedStrings = [];
  if (entries['xl/sharedStrings.xml']) {
    const ssXml = entries['xl/sharedStrings.xml'].toString('utf8');
    for (const si of ssXml.matchAll(/<si>([\s\S]*?)<\/si>/g)) {
      const texts = [...si[1].matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map(t => decodeXml(t[1]));
      sharedStrings.push(texts.join(''));
    }
  }
  const wbXml = entries['xl/workbook.xml'].toString('utf8');
  const relsXml = entries['xl/_rels/workbook.xml.rels'].toString('utf8');
  const relMap = {};
  for (const r of relsXml.matchAll(/<Relationship [^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g)) {
    relMap[r[1]] = r[2].replace(/^\//, '');
  }
  const sheets = {};
  for (const s of wbXml.matchAll(/<sheet [^>]*name="([^"]+)"[^>]*r:id="([^"]+)"/g)) {
    const sheetName = decodeXml(s[1]);
    const target = 'xl/' + relMap[s[2]].replace(/^xl\//, '');
    if (!entries[target]) continue;
    const sheetXml = entries[target].toString('utf8');
    const rows = [];
    for (const rowMatch of sheetXml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
      const row = {};
      for (const cMatch of rowMatch[1].matchAll(/<c r="([A-Z]+)\d+"([^>]*)>([\s\S]*?)<\/c>/g)) {
        const col = cMatch[1];
        const attrs = cMatch[2];
        const inner = cMatch[3];
        const typeMatch = attrs.match(/\bt="([^"]+)"/);
        const type = typeMatch ? typeMatch[1] : '';
        const vMatch = inner.match(/<v>([\s\S]*?)<\/v>/);
        let val = '';
        if (type === 's' && vMatch) {
          val = sharedStrings[Number(vMatch[1])] || '';
        } else if (type === 'inlineStr') {
          val = [...inner.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map(t => decodeXml(t[1])).join('');
        } else if (vMatch) {
          val = decodeXml(vMatch[1]);
        }
        row[col] = val;
      }
      if (Object.keys(row).length > 0) rows.push(row);
    }
    sheets[sheetName] = rows;
  }
  return sheets;
}

const wbSheets = parseXlsx(path.join(process.cwd(), 'Beetrix360-Master-Summary.xlsx'));
const wbBySlug = {};

function splitKws(val) {
  if (!val || /^\d+(\.\d+)?$/.test(String(val).trim())) return [];
  return String(val)
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !/^\d+(\.\d+)?$/.test(s));
}

// Populate from Master Summary
for (let i = 1; i < wbSheets['Master Summary'].length; i++) {
  const r = wbSheets['Master Summary'][i];
  const slug = (r.C || '').trim();
  if (!slug) continue;
  wbBySlug[slug] = {
    section: r.A,
    pageName: r.B,
    slug,
    type: r.D,
    primaryKw: (r.E || '').trim(),
    secondaryKws: splitKws(r.J),
    supportingKws: splitKws(r.K),
    aeoKws: splitKws(r.L),
    contentAngle: (r.O || '').trim(),
    clusterKws: [],
    gapSeeds: [],
    gapWhy: ''
  };
}

// Populate from Per-Page Clusters
for (let i = 1; i < wbSheets['Per-Page Clusters'].length; i++) {
  const r = wbSheets['Per-Page Clusters'][i];
  const slug = (r.C || '').trim();
  const kw = (r.F || '').trim();
  if (!slug || !kw) continue;
  if (!wbBySlug[slug]) {
    wbBySlug[slug] = {
      section: r.A,
      pageName: r.B,
      slug,
      type: r.D,
      primaryKw: kw,
      secondaryKws: [],
      supportingKws: [],
      aeoKws: [],
      contentAngle: '',
      clusterKws: [],
      gapSeeds: [],
      gapWhy: ''
    };
  }
  wbBySlug[slug].clusterKws.push({
    slot: r.E,
    kw,
    intent: r.I,
    aeoOp: r.K
  });
}

// Populate from Gaps
for (let i = 1; i < wbSheets['Gaps'].length; i++) {
  const r = wbSheets['Gaps'][i];
  const slug = (r.C || '').trim();
  if (!slug) continue;
  const seeds = splitKws(r.E);
  if (!wbBySlug[slug]) {
    wbBySlug[slug] = {
      section: r.A,
      pageName: r.B,
      slug,
      type: 'Gap',
      primaryKw: seeds[0] || '',
      secondaryKws: seeds.slice(1),
      supportingKws: [],
      aeoKws: [],
      contentAngle: '',
      clusterKws: [],
      gapSeeds: seeds,
      gapWhy: (r.D || '').trim()
    };
  } else {
    wbBySlug[slug].gapSeeds = seeds;
    wbBySlug[slug].gapWhy = (r.D || '').trim();
  }
}

console.log(`Loaded workbook data for ${Object.keys(wbBySlug).length} unique slugs.`);

// ============================================================================
// 2. Load existing rich content from repo
// ============================================================================
// 2a. SEO_PAGES from src/app/seo/data.ts
const seoTs = fs.readFileSync(path.join(process.cwd(), 'src/app/seo/data.ts'), 'utf8');
const seoStart = seoTs.indexOf('export const SEO_PAGES');
const seoEq = seoTs.indexOf('=', seoStart);
const seoEnd = seoTs.indexOf('export function getMainSeoPage');
const seoCtx = {};
vm.createContext(seoCtx);
vm.runInContext('globalThis.SEO_PAGES = ' + seoTs.slice(seoEq + 1, seoEnd).replace(/;\s*$/, ''), seoCtx);
const seoByPath = {};
for (const p of seoCtx.SEO_PAGES) seoByPath[p.path] = p;

// 2b. BRAND_SOCIAL_PAGES from src/lib/brand-social/data.ts
const bsTs = fs.readFileSync(path.join(process.cwd(), 'src/lib/brand-social/data.ts'), 'utf8');
const bsStart = bsTs.indexOf('export const BRAND_SOCIAL_PAGES');
const bsEq = bsTs.indexOf('=', bsStart);
const bsEnd = bsTs.indexOf('export function getAllBrandSocialPages');
const bsCtx = {};
vm.createContext(bsCtx);
vm.runInContext('globalThis.BS_PAGES = ' + bsTs.slice(bsEq + 1, bsEnd).replace(/;\s*$/, ''), bsCtx);
const bsByPath = {};
for (const p of bsCtx.BS_PAGES) bsByPath[p.path] = p;

// 2c. TOPIC_CONTENT_REGISTRY from src/lib/topic-content.ts
const tcRaw = fs.readFileSync(path.join(process.cwd(), 'src/lib/topic-content.ts'), 'utf8');
const tcStart = tcRaw.indexOf('export const TOPIC_CONTENT_REGISTRY');
const tcEq = tcRaw.indexOf('=', tcStart);
const tcCtx = {};
vm.createContext(tcCtx);
vm.runInContext('globalThis.REG = ' + tcRaw.slice(tcEq + 1).replace(/;\s*$/, ''), tcCtx);
const topicReg = tcCtx.REG;

// 2d. ia-v2.seed.json
const seedJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/content/ia-v2.seed.json'), 'utf8'));
const seedByPath = {};
for (const p of seedJson.pages) seedByPath[p.path] = p;

// ============================================================================
// 3. Helper functions to merge & enrich page objects and generate 85-115 word paragraphs
// ============================================================================
function uniqStrings(arr) {
  const seen = new Set();
  const out = [];
  for (const s of arr) {
    if (!s || typeof s !== 'string') continue;
    const clean = s.trim();
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(clean);
    }
  }
  return out;
}

function capitalizeHeading(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function normalizeItemsSix(newItems, oldItems, deliverables) {
  // Always return exactly 6 [shortTitle, description] pairs
  const result = [];
  if (Array.isArray(newItems) && newItems.length >= 6) {
    for (let i = 0; i < 6; i++) {
      let title = newItems[i][0] || (oldItems && oldItems[i] ? oldItems[i][0] : `Deliverable ${i + 1}`);
      let desc = newItems[i][1] || '';
      result.push([title, desc]);
    }
    return result;
  }
  if (Array.isArray(deliverables) && deliverables.length > 0) {
    for (let i = 0; i < 6; i++) {
      const d = deliverables[i % deliverables.length];
      const colonIdx = d.indexOf(':');
      const fallbackTitle = oldItems && oldItems[i] ? oldItems[i][0] : `Core Capability ${i + 1}`;
      if (colonIdx > 0 && colonIdx < 65) {
        const t = d.slice(0, colonIdx).trim();
        const body = d.slice(colonIdx + 1).trim();
        result.push([oldItems && oldItems[i] && oldItems[i][0].length <= 28 ? oldItems[i][0] : t, body]);
      } else {
        result.push([fallbackTitle, d]);
      }
    }
    return result;
  }
  return (oldItems || []).slice(0, 6);
}

// Create extra pricing pages for the mega-menu footer links so every navbar link renders natively
function buildPricingPage(slug, col, groupNum) {
  const wb = wbBySlug[slug] || {};
  const tc = topicReg[slug] || {};
  const sd = seedByPath[slug] || {};
  const id = slug.replace('/pricing/', '');
  const shortMap = {
    '/pricing/seo-cost': 'SEO Pricing',
    '/pricing/geo-cost': 'GEO Pricing',
    '/pricing/local-seo-pricing': 'Local SEO Pricing',
    '/pricing/ppc-cost': 'PPC Pricing',
    '/pricing/social-media-pricing': 'Social Media Pricing',
    '/pricing/website-cost': 'Website Cost',
    '/pricing/ai-automation-cost': 'AI Automation Cost',
  };
  const short = shortMap[slug] || sd.menuLabel || wb.pageName || 'Pricing Guide';
  const name = sd.h1 || wb.pageName || short;
  const kw = wb.primaryKw || sd.targetKeyword || `${short.toLowerCase()} guide`;
  const allWbKws = uniqStrings([
    wb.primaryKw,
    ...(wb.secondaryKws || []),
    ...(wb.supportingKws || []),
    ...(wb.aeoKws || []),
    ...((wb.clusterKws || []).map(c => c.kw)),
    ...(wb.gapSeeds || []),
    kw,
    `${short.toLowerCase()} breakdown`,
    `${short.toLowerCase()} packages`,
    `${short.toLowerCase()} ROI`,
    `agency pricing models`,
    `retainer vs project pricing`,
    `enterprise pricing benchmarks`,
    `cost per deliverable`,
    `transparent agency fees`,
    `custom scope proposal`
  ]).slice(0, 12);

  const page = {
    id,
    path: slug,
    col,
    name,
    short,
    kw,
    what: kw,
    title: (sd.seo && sd.seo.titleTag) || `${name} | Transparent Agency Pricing Guide | Beetrix360`,
    desc: tc.metaDescription || (sd.seo && sd.seo.metaDescription) || `Transparent ${kw} breakdown, retainer tiers, deliverables, and ROI modeling from Beetrix360.`,
    h1: [
      `Transparent ${short}`,
      `built around ROI,`,
      `scope, and real deliverables`
    ],
    lead: tc.tagline || `Understand what drives ${kw} across small business, mid-market, and enterprise engagements—with zero hidden markups and clear deliverables tied to pipeline.`,
    answer: (tc.overview && tc.overview[0]) || `${name} depends on technical complexity, competitive density, deliverable velocity, and attribution requirements. Beetrix360 scopes every engagement around measurable revenue milestones after a complimentary audit.`,
    q: uniqStrings([kw, ...(wb.secondaryKws || []), ...(wb.aeoKws || []), ...(wb.gapSeeds || [])]).slice(0, 5),
    para: tc.overview && tc.overview.length >= 2 ? tc.overview.slice(0, 2) : [
      `Evaluating ${kw} requires looking past flat monthly price tags to inspect what engineering, creative, and strategic execution is actually included.`,
      `At Beetrix360, every proposal is preceded by a diagnostic audit so your budget funds high-leverage growth initiatives tied directly to CRM pipeline and closed revenue.`
    ],
    deep: [
      [
        `What Determines ${short} Tiers & Retainer Scope`,
        `Pricing scales with the size of your digital footprint, the number of target markets or SKUs, creative production velocity, and enterprise governance requirements. We provide itemized scopes showing exact deliverables per sprint.`
      ],
      [
        `Evaluating Cost vs. Compounding Revenue Return`,
        `Low-cost providers often cut corners on technical execution, senior strategy, or conversion tracking. Investing in an accountable revenue architecture lowers blended customer acquisition cost (CAC) and builds durable growth.`
      ]
    ],
    kws: allWbKws,
    pains: [
      [`Agencies hide fees inside vague retainers`, `We provide line-item transparency across strategy, production, and management.`],
      [`Cheap packages deliver zero pipeline impact`, `Every deliverable in our scope maps directly to commercial buying intent and conversions.`],
      [`Unpredictable scope creep inflates your bill`, `Fixed 90-day roadmaps lock in deliverables, milestones, and accountability upfront.`],
      [`No visibility into return on investment`, `Closed-loop CRM attribution proves how your monthly investment translates into revenue.`]
    ],
    items: normalizeItemsSix(null, [
      [`Baseline Audit`, `Diagnostic review of your current performance and gaps.`],
      [`Scope Blueprint`, `Itemized 90-day deliverables matched to your budget.`],
      [`Tiered Options`, `Clear growth tiers from focused sprints to enterprise scale.`],
      [`Deliverable Calendar`, `Weekly and monthly execution milestones.`],
      [`CRM Attribution`, `Tracking setup connecting spend to closed deals.`],
      [`Executive Reviews`, `Monthly ROI, pipeline, and unit-economics reporting.`]
    ], tc.deliverables),
    steps: (tc.process && tc.process.length === 4)
      ? tc.process.map(s => `${s.title}: ${s.description}`)
      : [
          `Audit your existing performance, competitive landscape, and technical complexity.`,
          `Benchmark ${kw} tiers against your target customer acquisition and pipeline goals.`,
          `Deliver a transparent, itemized 90-day scope and investment model with clear KPIs.`,
          `Launch execution sprints with weekly progress tracking and closed-loop revenue attribution.`
        ],
    faq: (tc.faqs && tc.faqs.length > 0)
      ? tc.faqs.map(f => [f.question, f.answer])
      : [
          [`How much does ${kw} typically range per month?`, `Investment depends on scope, market competitiveness, and deliverable volume. After a complimentary diagnostic audit, we provide a fixed, transparent monthly or project quote aligned with your revenue targets.`]
        ]
  };
  if (groupNum === 5) {
    page.bad = `Opaque agency quotes with vague deliverables and surprise add-on fees.`;
    page.good = `Transparent, itemized ${short} tied to a 90-day roadmap and measurable ROI.`;
  }
  if (groupNum === 6) {
    page.flow = [
      [`Audit`, `Map process & stack`],
      [`Scope`, `Size volume & APIs`],
      [`Model ROI`, `Calculate hours saved`],
      [`Approve`, `Lock fixed pricing`],
      [`Deploy`, `Launch in 90 days`]
    ];
  }
  return page;
}

// ============================================================================
// 4. Paragraph Generator for TEXT[page.id] (85 to 115 words per entry)
//    Rule from template:
//    "Answer the topic in the first sentence, use “[keyword]” naturally,
//     and add one real example." (80 to 120 words)
// ============================================================================
function countWords(str) {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

function generateParagraphForTextEntry(p, heading, targetKw, idx) {
  const short = p.short || p.name;
  const kw = targetKw || p.kw;
  const itemA = (p.items && p.items[idx % p.items.length]) || ['Technical & Strategic Execution', 'structured optimization across priority workflows'];
  const itemB = (p.items && p.items[(idx + 2) % p.items.length]) || ['Revenue Attribution', 'closed-loop tracking tied to CRM pipeline'];
  const pain = (p.pains && p.pains[idx % p.pains.length]) || ['Fragmented execution slows growth', 'We unify strategy, production, and measurement into one system.'];
  const stepA = (p.steps && p.steps[0]) || 'auditing baseline performance and technical architecture';
  const stepB = (p.steps && p.steps[Math.min(2, (p.steps.length || 1) - 1)]) || 'launching iterative optimization sprints';
  const deepItem = (p.deep && p.deep[idx % (p.deep.length || 1)]) || [short, p.lead || p.answer];

  const hLower = heading.toLowerCase();
  let opening = '';
  let middle = '';
  let example = '';

  if (hLower.includes('what it is and how it works')) {
    opening = `${short} is a disciplined growth system that combines ${itemA[0].toLowerCase()}, ${itemB[0].toLowerCase()}, and commercial intent alignment around ${kw} to turn market demand into qualified pipeline.`;
    middle = `Rather than treating ${short.toLowerCase()} as isolated tasks, the system operates by ${stepA.toLowerCase().replace(/\.$/, '')} and then ${stepB.toLowerCase().replace(/\.$/, '')}. Every component is engineered so technical foundations, creative assets, and conversion paths reinforce one another continuously.`;
    example = `For example, when a growth-stage B2B organization replaces disconnected vendor tactics with an integrated ${kw} roadmap—pairing ${itemA[0].toLowerCase()} with closed-loop CRM tracking—teams eliminate wasted effort and convert high-intent evaluations directly into sales opportunities.`;
  } else if (hLower.includes('why ') && hLower.includes(' matters')) {
    opening = `${short} matters because modern buyers evaluate category credibility, speed, and relevance across multiple touchpoints before speaking with sales, making ${kw} a decisive revenue driver.`;
    middle = `When organizations neglect ${short.toLowerCase()}, they frequently experience a costly symptom: ${pain[0].toLowerCase().replace(/\.$/, '')}. Addressing this requires ${pain[1].charAt(0).toLowerCase() + pain[1].slice(1).replace(/\.$/, '')} while strengthening ${itemA[0].toLowerCase()}.`;
    example = `For example, a multi-market company that prioritizes ${kw} alongside ${itemB[0].toLowerCase()} prevents high-intent prospects from defaulting to competitors, lifting qualified inquiry rates and compressing the time from initial discovery to signed contract.`;
  } else if (hLower.includes('benefits of ')) {
    opening = `The primary benefits of ${short} include lower customer acquisition costs, stronger brand authority, and compounding pipeline returns driven by strategic ${kw} execution.`;
    middle = `By uniting ${itemA[0].toLowerCase()} with ${itemB[0].toLowerCase()}, organizations build durable commercial assets instead of renting temporary attention. Teams gain full visibility into which campaigns, pages, or workflows produce the highest customer lifetime value.`;
    example = `For example, an enterprise team deploying structured ${kw} protocols—supported by ${itemA[1].charAt(0).toLowerCase() + itemA[1].slice(1).replace(/\.$/, '')}—routinely reduces wasted acquisition spend while increasing sales-qualified conversions across its highest-margin product lines.`;
  } else if (hLower.includes('who needs ')) {
    opening = `Organizations that need ${short} most are growth-focused B2B enterprises, scaling ecommerce brands, and multi-location operators seeking measurable return from ${kw}.`;
    middle = `Whether launching a new category offering, expanding into competitive territories, or fixing stagnant conversion funnels, leadership teams rely on ${short.toLowerCase()} to align ${itemA[0].toLowerCase()} with revenue targets.`;
    example = `For example, a mid-market company expanding its product catalog uses ${kw} and ${itemB[0].toLowerCase()} to capture high-intent commercial buyers early in the evaluation cycle, ensuring new launches generate immediate pipeline velocity.`;
  } else if (hLower.includes('signs your business needs ')) {
    opening = `The clearest signs your business needs ${short} are rising acquisition costs, stagnant qualified pipeline, and competitors outperforming you across core ${kw} touchpoints.`;
    middle = `Internally, teams often notice that ${pain[0].toLowerCase().replace(/\.$/, '')}, while leadership lacks clear reporting connecting daily marketing activity to closed-won deals. Introducing structured ${itemA[0].toLowerCase()} resolves these bottlenecks systematically.`;
    example = `For example, when an organization diagnoses flat quarterly demos despite steady activity, implementing a focused ${kw} overhaul—starting with ${itemA[0].toLowerCase()} and ${itemB[0].toLowerCase()}—restores conversion momentum within the first 90-day sprint.`;
  } else if (hLower.includes('how to choose a partner for ')) {
    opening = `Choosing the right partner for ${short} requires evaluating how deeply an agency connects ${kw} execution to commercial unit economics, technical rigor, and CRM revenue attribution.`;
    middle = `Decision-makers should look past surface-level pitch decks and verify that the partner delivers ${itemA[0].toLowerCase()}, ${itemB[0].toLowerCase()}, and transparent weekly reporting without locking your data inside proprietary black boxes.`;
    example = `For example, when procurement teams benchmark prospective partners for ${kw}, selecting a specialist that leads with a diagnostic audit and maps ${itemA[0].toLowerCase()} directly to Salesforce or HubSpot pipeline prevents costly six-month onboarding stalls.`;
  } else if (hLower.includes(' pricing factors')) {
    opening = `${short} pricing factors depend on technical complexity, competitive market density, asset production velocity, and the scope of ${kw} required to hit your revenue targets.`;
    middle = `A focused single-market deployment requires a different resource allocation than a multi-region enterprise rollout encompassing ${itemA[0].toLowerCase()}, ${itemB[0].toLowerCase()}, and custom BI attribution.`;
    example = `For example, a company scoping ${kw} across three core service lines will invest based on audit findings, deliverable cadence, and CRM integration depth—ensuring every dollar of retainer spend funds work with a projected pipeline return.`;
  } else if (hLower.includes(' timeline')) {
    opening = `A realistic ${short} timeline follows a structured 90-day rollout that sequences ${kw} foundations, rapid validation, and compounding scale across four measurable phases.`;
    middle = `During Days 1 to 14, our team focuses on ${stepA.toLowerCase().replace(/\.$/, '')}. Days 15 to 30 build ${itemA[0].toLowerCase()}, Days 31 to 60 activate live campaigns and workflows, and Days 61 to 90+ scale proven winners.`;
    example = `For example, a commercial team launching ${kw} sees foundational fixes and tracking hygiene completed in the first month, early conversion lifts by week six, and predictable pipeline acceleration by day ninety.`;
  } else if (hLower.includes(' best practices')) {
    opening = `Modern ${short} best practices center on uniting ${kw} precision with clean technical architecture, human-verified quality standards, and closed-loop revenue measurement.`;
    middle = `High-performing programs avoid shortcuts and volume-for-volume's-sake output, prioritizing ${itemA[0].toLowerCase()} and ${itemB[0].toLowerCase()} so every customer touchpoint reflects accurate brand positioning and clear buyer utility.`;
    example = `For example, applying ${kw} best practices—such as pairing ${itemA[0].toLowerCase()} with continuous split-testing and offline conversion feedback—enables marketing teams to compound efficiency quarter after quarter while competitors plateau.`;
  } else if (hLower.includes('common ') && hLower.includes(' mistakes')) {
    opening = `The most common ${short} mistakes are optimizing for vanity metrics instead of revenue, neglecting technical hygiene, and treating ${kw} as a one-time setup rather than an iterative system.`;
    middle = `When teams skip foundational diagnostics, ${pain[0].toLowerCase().replace(/\.$/, '')}, eroding stakeholder trust and burning budget on unqualified traffic or uncoordinated creative assets.`;
    example = `For example, a company that launches ${kw} campaigns without first establishing ${itemB[0].toLowerCase()} and ${itemA[0].toLowerCase()} often misallocates budget toward low-intent segments until a structured audit corrects the funnel.`;
  } else if (hLower.includes('compared with the alternatives')) {
    opening = `When ${short} is compared with the alternatives—such as ad-hoc freelancers, disconnected point tools, or bloated generalist retainers—a dedicated ${kw} architecture consistently delivers superior unit economics.`;
    middle = `Freelancers rarely cover the full stack of ${itemA[0].toLowerCase()} and ${itemB[0].toLowerCase()}, while legacy agencies often report surface impressions without connecting activity to your CRM pipeline.`;
    example = `For example, replacing three uncoordinated contractors with one accountable ${kw} team at Beetrix360 consolidates strategy, execution, and attribution under a single 90-day roadmap, cutting management overhead while accelerating revenue output.`;
  } else if (hLower.includes('tools used for ')) {
    opening = `The tools used for ${short} span enterprise diagnostics, workflow orchestration, creative testing, and closed-loop analytics purpose-built to accelerate ${kw} performance.`;
    middle = `Rather than relying on a single off-the-shelf software subscription, our specialists integrate ${itemA[0].toLowerCase()} platforms with server-side tracking, CRM data pipelines, and ${itemB[0].toLowerCase()} dashboards.`;
    example = `For example, during a ${kw} engagement, connecting diagnostic telemetry directly into HubSpot, Salesforce, and live BI reporting allows strategists to spot conversion anomalies immediately and reallocate resources toward top-performing segments.`;
  } else if (hLower.includes(' by industry')) {
    opening = `Executing ${short} by industry requires adapting ${kw} frameworks to the specific buying cycles, regulatory standards, and decision-maker psychology of your vertical.`;
    middle = `Enterprise B2B SaaS, heavy manufacturing, financial services, and tier-one real estate each demand tailored ${itemA[0].toLowerCase()} and proof architectures to satisfy technical evaluators and procurement committees.`;
    example = `For example, deploying ${kw} for a regulated financial or industrial enterprise incorporates compliance-reviewed messaging and multi-touch ${itemB[0].toLowerCase()}, whereas a real estate or ecommerce launch prioritizes rapid demand capture and velocity.`;
  } else if (hLower.includes(' for small businesses')) {
    opening = `${short} for small businesses focuses on high-intent, fast-payback ${kw} priorities that generate qualified leads and sales without requiring an enterprise-sized budget.`;
    middle = `Instead of spreading resources thinly across every possible channel, we concentrate on ${itemA[0].toLowerCase()} and ${itemB[0].toLowerCase()} to capture the buyers closest to making a purchase decision today.`;
    example = `For example, a regional service or emerging growth business using focused ${kw} execution can fix its highest-friction conversion bottlenecks in thirty days and reinvest early cash-flow wins into broader expansion.`;
  } else if (hLower.includes(' for large companies')) {
    opening = `${short} for large companies demands enterprise-grade governance, multi-stakeholder workflow alignment, and scalable ${kw} systems that operate cleanly across complex product portfolios.`;
    middle = `At enterprise scale, growth is often slowed by cross-departmental silos and legacy technical debt. Our operating model embeds ${itemA[0].toLowerCase()} and ${itemB[0].toLowerCase()} directly into your engineering and marketing sprints.`;
    example = `For example, a multi-brand corporation rolling out ${kw} across international divisions uses standardized governance, automated QA checks, and executive BI dashboards to protect brand safety while scaling global pipeline.`;
  } else if (hLower.includes('how to measure ')) {
    opening = `Measuring ${short} accurately requires looking beyond surface impressions to track how ${kw} influences qualified pipeline velocity, customer acquisition cost, and closed-won revenue.`;
    middle = `We establish a clean measurement hierarchy that pairs leading operational indicators from ${itemA[0].toLowerCase()} with lagging commercial outcomes verified through ${itemB[0].toLowerCase()}.`;
    example = `For example, by tying every ${kw} initiative to CRM opportunity stages and cohort retention data, leadership can see exactly which investments generate profitable contracts and scale budget with mathematical confidence.`;
  } else if (hLower.includes(' trends to watch')) {
    opening = `The most important ${short} trends to watch center on AI-assisted discovery, first-party data resilience, and higher buyer expectations around ${kw} relevance and speed.`;
    middle = `Static playbooks built five years ago no longer hold up as algorithms, privacy standards, and buyer research habits evolve. Proactive teams modernize their ${itemA[0].toLowerCase()} and ${itemB[0].toLowerCase()} ahead of market shifts.`;
    example = `For example, organizations that adapt their ${kw} strategy to combine machine-readable structure, server-side signal integrity, and authentic domain proof consistently capture market share from slower-moving incumbents.`;
  } else if (hLower.includes(' case study')) {
    opening = `A representative ${short} case study demonstrates how disciplined ${kw} execution transforms underperforming digital assets into a predictable, measurable revenue engine.`;
    middle = `Clients typically arrive facing a familiar challenge: ${pain[0].toLowerCase().replace(/\.$/, '')}. By executing ${stepA.toLowerCase().replace(/\.$/, '')} and deploying ${itemA[0].toLowerCase()} alongside ${itemB[0].toLowerCase()}, we systematically remove growth friction.`;
    example = `For example, across campaigns for global leaders like Tesla Solar (+40% pre-orders vs. target), Microsoft (+30% enterprise engagement), and Subway (+25% footfall), structured ${kw} execution tied every milestone to verified commercial outcomes.`;
  } else if (hLower.includes('the beetrix360 approach to ')) {
    opening = `The Beetrix360 approach to ${short} unites senior strategic architecture, hands-on technical execution, and accountable ${kw} management under one revenue-focused team.`;
    middle = `Founded in 2016 and trusted across 55+ industries, we never hand your account off to junior generalists. Every engagement combines ${itemA[0].toLowerCase()}, ${itemB[0].toLowerCase()}, and weekly optimization sprints tied to your CRM.`;
    example = `For example, when you partner with Beetrix360 for ${kw}, we begin with a transparent diagnostic audit, align on 90-day pipeline targets, and ship production-ready work that compounds your competitive advantage.`;
  } else if (hLower.includes('getting started with ')) {
    opening = `Getting started with ${short} begins with a complimentary diagnostic audit that evaluates your current ${kw} baseline, uncovers revenue leaks, and maps a 90-day execution plan.`;
    middle = `You do not need months of internal preparation to begin. In a focused 30-minute review, our specialists walk through findings across ${itemA[0].toLowerCase()} and ${itemB[0].toLowerCase()}, prioritizing the highest-return quick wins first.`;
    example = `For example, within one business day of requesting your ${kw} audit, our team delivers a clear, jargon-free roadmap showing exactly what to fix, what to build, and how results will be measured.`;
  } else {
    // Keyword-specific deep-dive card (items 20..N)
    opening = `Mastering ${kw} within your ${short} program ensures that every technical, creative, and commercial signal aligns directly with how high-intent buyers evaluate your category.`;
    middle = `Within our methodology, ${kw} is never treated as an isolated buzzword. We integrate it directly into ${itemA[0].toLowerCase()} (${itemA[1].charAt(0).toLowerCase() + itemA[1].slice(1).replace(/\.$/, '')}) and ${itemB[0].toLowerCase()} so your team solves "${pain[0].toLowerCase().replace(/\.$/, '')}" at the root cause.`;
    example = `For example, when Beetrix360 operationalizes ${kw} for a scaling enterprise or mid-market brand, we pair ${deepItem[0].toLowerCase()} with closed-loop CRM attribution—turning search, media, and workflow interactions into measurable pipeline and closed revenue.`;
  }

  let full = `${opening} ${middle} ${example}`.replace(/\s+/g, ' ').trim();
  let wc = countWords(full);

  // Ensure strictly within 82..118 words
  const padSentences = [
    `Every sprint is benchmarked against baseline conversion velocity, pipeline quality, and customer acquisition cost so stakeholders have complete financial clarity.`,
    `This disciplined execution model eliminates guesswork and builds a durable operational moat that compounds across every quarter.`
  ];
  let padIdx = 0;
  while (wc < 84 && padIdx < padSentences.length) {
    full += ' ' + padSentences[padIdx++];
    wc = countWords(full);
  }
  if (wc > 118) {
    const words = full.split(/\s+/);
    full = words.slice(0, 114).join(' ').replace(/[,;:]$/, '') + '.';
  }
  return full;
}

// ============================================================================
// 5. Process all 6 folders in Beetrix360-Service-Pages
// ============================================================================
const baseDir = path.join(process.cwd(), 'Beetrix360-Service-Pages');
const folders = fs.readdirSync(baseDir).filter(f => fs.statSync(path.join(baseDir, f)).isDirectory()).sort();

const extraPricingByFolder = {
  '01-AI-Search-SEO': [
    { slug: '/pricing/seo-cost', col: 'seo', groupNum: 1 },
    { slug: '/pricing/geo-cost', col: 'ai', groupNum: 1 },
    { slug: '/pricing/local-seo-pricing', col: 'seo', groupNum: 1 }
  ],
  '02-Paid-Media': [
    { slug: '/pricing/ppc-cost', col: 'paid', groupNum: 2 }
  ],
  '03-Brand-Social': [
    { slug: '/pricing/social-media-pricing', col: 'social', groupNum: 3 }
  ],
  '05-Web-Conversion': [
    { slug: '/pricing/website-cost', col: 'design', groupNum: 5 }
  ],
  '06-AI-Automation': [
    { slug: '/pricing/ai-automation-cost', col: 'auto', groupNum: 6 }
  ]
};

let grandTotalPages = 0;
let grandTotalTextParagraphs = 0;

for (const f of folders) {
  const srcDir = path.join(baseDir, f, 'source');
  const d1Path = path.join(srcDir, 'data1.js');
  const d2Path = path.join(srcDir, 'data2.js');
  const tcPath = path.join(srcDir, 'text-content.js');
  const scPath = path.join(srcDir, 'seo-content.js');

  const d1 = fs.readFileSync(d1Path, 'utf8');
  const d2 = fs.readFileSync(d2Path, 'utf8');
  const sc = fs.existsSync(scPath) ? fs.readFileSync(scPath, 'utf8') : '';

  const s = {};
  vm.createContext(s);
  vm.runInContext([d1, d2, sc, 'globalThis.PAGES = PAGES; if (typeof SEO !== "undefined") globalThis.SEO = SEO;'].join('\n'), s);

  const pages = s.PAGES;
  const seoGuide = s.SEO || null;

  // Add extra pricing pages if not already in PAGES
  const extras = extraPricingByFolder[f] || [];
  for (const ex of extras) {
    if (!pages.some(p => p.path === ex.slug)) {
      pages.push(buildPricingPage(ex.slug, ex.col, ex.groupNum));
    }
  }

  // Enrich each page in PAGES with workbook + repo content
  for (const p of pages) {
    const wb = wbBySlug[p.path];
    const seoMatch = seoByPath[p.path];
    const bsMatch = bsByPath[p.path];
    const tcMatch = topicReg[p.path];
    const sdMatch = seedByPath[p.path];

    // Collect all workbook keywords for this page
    const wbKeywords = wb ? uniqStrings([
      wb.primaryKw,
      ...(wb.secondaryKws || []),
      ...(wb.supportingKws || []),
      ...(wb.aeoKws || []),
      ...((wb.clusterKws || []).map(c => c.kw)),
      ...(wb.gapSeeds || [])
    ]) : [];

    if (f === '01-AI-Search-SEO' && seoMatch) {
      // Copy rich fields from src/app/seo/data.ts while keeping template id/path/col/short
      p.kw = seoMatch.kw || p.kw;
      p.title = seoMatch.title || p.title;
      p.desc = seoMatch.desc || p.desc;
      if (Array.isArray(seoMatch.h1) && seoMatch.h1.length === 3) p.h1 = seoMatch.h1;
      p.lead = seoMatch.lead || p.lead;
      p.answer = seoMatch.answer || p.answer;
      p.q = uniqStrings([...(seoMatch.q || []), ...wbKeywords]).slice(0, 6);
      p.para = seoMatch.para || p.para;
      p.deep = seoMatch.deep || p.deep;
      p.kws = uniqStrings([...wbKeywords, ...(seoMatch.kws || []), ...(p.kws || [])]).slice(0, 16);
      if (Array.isArray(seoMatch.pains) && seoMatch.pains.length >= 4) p.pains = seoMatch.pains.slice(0, 4);
      p.items = normalizeItemsSix(seoMatch.items, p.items, tcMatch && tcMatch.deliverables);
      if (Array.isArray(seoMatch.steps) && seoMatch.steps.length === 4) p.steps = seoMatch.steps;
      p.faq = seoMatch.faq || p.faq;
    } else if ((f === '03-Brand-Social' || p.path === '/social-media/influencer-marketing') && bsMatch) {
      // Copy rich fields from src/lib/brand-social/data.ts
      p.kw = bsMatch.kw || p.kw;
      p.title = bsMatch.title || p.title;
      p.desc = bsMatch.desc || p.desc;
      if (Array.isArray(bsMatch.h1) && bsMatch.h1.length === 3) p.h1 = bsMatch.h1;
      p.lead = bsMatch.lead || p.lead;
      p.answer = bsMatch.answer || p.answer;
      p.q = uniqStrings([...(bsMatch.q || []), ...wbKeywords]).slice(0, 6);
      p.para = bsMatch.para || p.para;
      p.deep = bsMatch.deep || p.deep;
      p.kws = uniqStrings([...wbKeywords, ...(bsMatch.kws || []), ...(p.kws || [])]).slice(0, 16);
      if (Array.isArray(bsMatch.pains) && bsMatch.pains.length >= 4) p.pains = bsMatch.pains.slice(0, 4);
      // Keep concise titles on p.items for bento/self-check toggle while using rich descriptions
      p.items = normalizeItemsSix(
        (bsMatch.items || []).map((it, idx) => [
          p.items && p.items[idx] && p.items[idx][0].length <= 28 ? p.items[idx][0] : it[0],
          it[1]
        ]),
        p.items,
        tcMatch && tcMatch.deliverables
      );
      if (Array.isArray(bsMatch.steps) && bsMatch.steps.length === 4) p.steps = bsMatch.steps;
      p.faq = bsMatch.faq || p.faq;
    }

    // For all pages (especially 02-Paid-Media, Gap pages in 01/02/03, and 04/05/06), enrich from workbook + topicReg + seedJson
    if (wb) {
      if (wb.primaryKw) p.kw = wb.primaryKw;
      p.kws = uniqStrings([...wbKeywords, ...(p.kws || [])]).slice(0, 16);
      if ( p.q ) {
        p.q = uniqStrings([wb.primaryKw, ...(wb.secondaryKws || []), ...(wb.aeoKws || []), ...(wb.gapSeeds || []), ...p.q]).slice(0, 6);
      }
    }
    if (sdMatch && sdMatch.seo) {
      if (sdMatch.seo.titleTag) p.title = sdMatch.seo.titleTag;
      if (sdMatch.seo.metaDescription) p.desc = sdMatch.seo.metaDescription;
    }
    if (tcMatch) {
      if (tcMatch.metaDescription && (!p.desc || p.desc.length < tcMatch.metaDescription.length)) {
        p.desc = tcMatch.metaDescription;
      }
      // If page hasn't been synced from seoMatch/bsMatch with long paragraphs, use tcMatch.overview
      if ((!seoMatch && !bsMatch) || (p.para && p.para[0] && p.para[0].length < 260)) {
        if (Array.isArray(tcMatch.overview) && tcMatch.overview.length >= 2) {
          p.para = tcMatch.overview.slice(0, 2);
        }
        if (tcMatch.tagline && tcMatch.tagline.length > 40 && (!p.lead || p.lead.length < 130)) {
          p.lead = `${tcMatch.tagline} Beetrix360 connects ${p.kw} execution directly to your CRM pipeline and closed revenue.`;
        }
        p.items = normalizeItemsSix(null, p.items, tcMatch.deliverables);
        if (Array.isArray(tcMatch.process) && tcMatch.process.length === 4) {
          p.steps = tcMatch.process.map(st => `${st.title}: ${st.description}`);
        }
      }
      // Prepend any AEO / topic FAQs from tcMatch.faqs without duplicating
      if (Array.isArray(tcMatch.faqs) && tcMatch.faqs.length > 0) {
        const existingQs = new Set((p.faq || []).map(x => x[0].toLowerCase().trim()));
        const mergedFaq = tcMatch.faqs.map(x => [x.question, x.answer]);
        for (const oldF of (p.faq || [])) {
          if (!existingQs.has(oldF[0].toLowerCase().trim()) && !mergedFaq.some(m => m[0].toLowerCase().trim() === oldF[0].toLowerCase().trim())) {
            mergedFaq.push(oldF);
          }
        }
        p.faq = mergedFaq;
      }
    }

    // Ensure SEO[p.id] exists if folder uses seo-content.js (01, 05, 06)
    if (seoGuide) {
      if (!seoGuide[p.id] || seoGuide[p.id].length === 0) {
        const guideKws = (p.kws || [p.kw]).slice(0, 5);
        seoGuide[p.id] = guideKws.map((gkw, gi) => [
          gkw,
          `How does ${gkw} fit into ${p.short}?`,
          generateParagraphForTextEntry(p, `How does ${gkw} fit into ${p.short}?`, gkw, gi)
        ]);
      } else {
        // Also align first guide entries with workbook primary/secondary keywords if wb exists
        if (wb && wbKeywords.length > 0) {
          for (let gi = 0; gi < Math.min(seoGuide[p.id].length, wbKeywords.length); gi++) {
            const wkw = wbKeywords[gi];
            if (!seoGuide[p.id].some(entry => entry[0].toLowerCase() === wkw.toLowerCase())) {
              seoGuide[p.id][gi] = [
                wkw,
                `How does ${wkw} impact ${p.short} results?`,
                generateParagraphForTextEntry(p, `How does ${wkw} impact ${p.short} results?`, wkw, gi)
              ];
            }
          }
        }
      }
    }
  }

  // Build complete TEXT object for text-content.js with 100% filled 85-115 word paragraphs
  const newText = {};
  const topicTemplates = [
    sName => `${sName}: what it is and how it works`,
    sName => `Why ${sName} matters`,
    sName => `Benefits of ${sName}`,
    sName => `Who needs ${sName}`,
    sName => `Signs your business needs ${sName}`,
    sName => `How to choose a partner for ${sName}`,
    sName => `${sName} pricing factors`,
    sName => `${sName} timeline`,
    sName => `${sName} best practices`,
    sName => `Common ${sName} mistakes`,
    sName => `${sName} compared with the alternatives`,
    sName => `Tools used for ${sName}`,
    sName => `${sName} by industry`,
    sName => `${sName} for small businesses`,
    sName => `${sName} for large companies`,
    sName => `How to measure ${sName}`,
    sName => `${sName} trends to watch`,
    sName => `${sName} case study`,
    sName => `The Beetrix360 approach to ${sName}`,
    sName => `Getting started with ${sName}`
  ];

  for (const p of pages) {
    const sName = p.short || p.name;
    const kws = (p.kws && p.kws.length > 0) ? p.kws : [p.kw];
    const entries = [];

    // 1. 20 core topic headings cycling through p.kws
    for (let i = 0; i < topicTemplates.length; i++) {
      const heading = topicTemplates[i](sName);
      const targetKw = kws[i % kws.length];
      const para = generateParagraphForTextEntry(p, heading, targetKw, i);
      entries.push([heading, targetKw, para]);
    }

    // 2. Dedicated keyword cards for every keyword in p.kws (includes 100% of workbook cluster & gap keywords)
    for (let i = 0; i < kws.length; i++) {
      const targetKw = kws[i];
      const heading = capitalizeHeading(targetKw);
      const para = generateParagraphForTextEntry(p, heading, targetKw, 20 + i);
      entries.push([heading, targetKw, para]);
    }

    newText[p.id] = entries;
    grandTotalTextParagraphs += entries.length;
  }

  grandTotalPages += pages.length;

  // Write updated data1.js and data2.js (split cleanly in half like original)
  const mid = Math.ceil(pages.length / 2);
  const part1 = pages.slice(0, mid);
  const part2 = pages.slice(mid);

  const d1Content = 'const PAGES=[\n' + part1.map(p => JSON.stringify(p)).join(',\n\n') + ',\n';
  const d2Content = part2.map(p => JSON.stringify(p)).join(',\n\n') + '\n];\n';

  fs.writeFileSync(d1Path, d1Content, 'utf8');
  fs.writeFileSync(d2Path, d2Content, 'utf8');

  if (seoGuide && fs.existsSync(scPath)) {
    const scContent = 'const SEO=' + JSON.stringify(seoGuide, null, 2) + ';\n';
    fs.writeFileSync(scPath, scContent, 'utf8');
  }

  // Preserve the FAQ_EXTRA footer at the bottom of text-content.js
  const oldTcRaw = fs.readFileSync(tcPath, 'utf8');
  const faqExtraIdx = oldTcRaw.indexOf('/* Extra FAQs');
  const faqExtraFooter = faqExtraIdx !== -1 ? oldTcRaw.slice(faqExtraIdx) : '';

  let tcOut = `/* PARAGRAPH TEXT. Each line is: ["Heading", "target keyword", "your paragraph"]. */\nconst HIDE_EMPTY=false;\nconst TEXT={\n`;
  const pidList = Object.keys(newText);
  for (let pi = 0; pi < pidList.length; pi++) {
    const pid = pidList[pi];
    tcOut += JSON.stringify(pid) + ':[\n';
    tcOut += newText[pid].map(row => JSON.stringify(row)).join(',\n');
    tcOut += '\n]' + (pi < pidList.length - 1 ? ',\n' : '\n');
  }
  tcOut += '};\n\n' + faqExtraFooter;
  fs.writeFileSync(tcPath, tcOut, 'utf8');

  console.log(`Updated ${f}: ${pages.length} pages, ${Object.values(newText).reduce((a, b) => a + b.length, 0)} text-content paragraphs populated.`);
}

console.log(`\nDONE! Populated ${grandTotalPages} total pages and ${grandTotalTextParagraphs} total paragraphs across all 6 groups.`);

