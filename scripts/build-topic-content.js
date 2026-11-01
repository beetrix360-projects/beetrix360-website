const fs = require('fs');
const path = require('path');

const modules = [
  'seo.js', 'digital-marketing.js', 'paid-media.js', 'marketplaces.js',
  'branding.js', 'social-media.js', 'content-marketing.js', 'ai-content.js',
  'web-design.js', 'web-dev.js', 'conversion.js', 'email-marketing.js',
  'ai.js', 'automation.js', 'challenges.js', 'pricing.js', 'company.js'
];

const allData = {};
for (const m of modules) {
  const mod = require('./content-modules/' + m);
  Object.assign(allData, mod);
}

const header = `// Auto-generated topic content registry for Beetrix360 IA v2
// Contains bespoke, topic-specific content for all 150 non-locked pages.

export interface PageTopicContent {
  metaDescription: string;
  tagline: string;
  badge?: string;
  overview: string[];
  deliverablesTitle?: string;
  deliverables: string[];
  processTitle?: string;
  process: { step: number; title: string; description: string }[];
  faqs: { question: string; answer: string }[];
}

export const TOPIC_CONTENT_REGISTRY: Record<string, PageTopicContent> = ${JSON.stringify(allData, null, 2)};
`;

const outputPath = path.resolve(__dirname, '../src/lib/topic-content.ts');
fs.writeFileSync(outputPath, header, 'utf8');
console.log('Successfully wrote src/lib/topic-content.ts with', Object.keys(allData).length, 'pages.');
