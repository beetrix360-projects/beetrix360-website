# BeeTrix360 website (Next.js)

Next.js 15 (App Router, TypeScript, Tailwind CSS 3) build of `beetrix360_homepage_v6.html`, with the
service URL structure from `Beetrix Navigation.docx`.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (all 92 pages are pre-rendered)
npm start
```

No environment variables are needed. `.env.example` lists optional ones for later.

## What is where

| Path | What it is |
| --- | --- |
| `src/content/homepage.json` | **All homepage copy, stats, lists and CTA labels.** Edit this (later: the dashboard) to change the homepage. |
| `src/content/site.json` | Site-wide settings: brand name, phone, header CTA, footer, modal text. |
| `src/content/site-structure.json` | Divisions → services → sub-services, slugs and target keywords, parsed from the navigation doc. Drives the menu, routes, sitemap and llms.txt. |
| `src/lib/types.ts` | TypeScript types for all of the above (the content model for the dashboard / DynamoDB). |
| `src/lib/content.ts` | The only place content is loaded. Swap these functions to DynamoDB later. |
| `src/components/home/*` | Homepage sections (server components) + `HomeAnimations.tsx` (GSAP/Lenis port of the design script). |
| `src/components/site/*` | Header with mega menu, footer, request/video modals, site-wide scroll behaviour, JSON-LD helper. |
| `src/components/pages/InnerPage.tsx` | Template for division, service and sub-service pages. |
| `src/app/[slug]/page.tsx` | Division hubs (`/digital-marketing`) and service pages (`/seo-services`). |
| `src/app/[slug]/[sub]/page.tsx` | Sub-service pages (`/seo-services/local-seo`). |
| `src/app/sitemap.ts`, `robots.ts`, `llms.txt/route.ts`, `opengraph-image.tsx` | SEO / AEO endpoints. |

## Routes (from the navigation doc)

* `/` homepage
* 4 division hubs: `/digital-marketing`, `/ai-automation`, `/ai-content-generation`, `/paid-media-buying`
* 21 service pages at the top level, exactly as the doc specifies (e.g. `/seo-services`, `/amazon-management`)
* 66 sub-service pages (e.g. `/seo-services/answer-engine-optimization`)
* The Google, Meta, TikTok, Walmart and Target ads pages render the doc's "on-page sections" as sections, not separate URLs.

Routes are generated from `site-structure.json`, so adding a service there adds its page, menu link and sitemap entry.

## SEO / AEO built in

* Per-page `<title>` (from the doc's target keyword), meta description, canonical URL, Open Graph and Twitter tags.
* `sitemap.xml` with every route, `robots.txt` that explicitly allows AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, …).
* `/llms.txt`: a Markdown map of the company and all service URLs for LLMs / answer engines.
* JSON-LD: `Organization` + `WebSite` on every page; `WebPage`, `BreadcrumbList`, `Service` (with `OfferCatalog` of sub-services) or `ItemList` on inner pages.
* FAQ support: add `faqs: [{ "question": "...", "answer": "..." }]` to any service or sub-service in `site-structure.json` (later from the dashboard). The page then shows an FAQ block and emits `FAQPage` schema. No FAQs were in the supplied files, so none are filled in.
* Semantic HTML: one `<h1>` per page, labelled `<section>`s, breadcrumb `<nav>`, `<dl>` stats, fonts self-hosted via `next/font`, Font Awesome bundled locally (no CDN).
* All homepage text is server-rendered; animations only enhance it after load, so crawlers see the full content.

## Placeholders (intentionally not invented)

* Inner page copy: each division/service/sub-service page shows a striped **"PAGE CONTENT PLACEHOLDER"** block. Meta descriptions are assembled only from doc facts (`"{name} from BeeTrix360, part of our {division} services."`) until real copy exists.
* Images and videos: the same striped placeholders as the design (with their intended sizes).
* Forms (hero audit, AI check, contact, request modal) behave as in the design: front-end only, no data is sent. Look for `TODO(backend)`.
* The design's mega-menu items (e.g. "PPC Management Services", "About", "Pricing Guides") were replaced by the navigation doc's menu, and their promo cards were dropped, because the doc defines the site's real pages.

## Moving homepage content to DynamoDB (later)

1. Create a table, e.g. `pk` (string) = `page#home`, with the JSON from `homepage.json` as an attribute.
2. `npm i @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb` and replace the body of `getHomepageContent()` in `src/lib/content.ts` with a `GetCommand`.
3. Add `export const revalidate = 60` to `src/app/page.tsx` (or call `revalidatePath("/")` from the dashboard's save action).
4. In Amplify, give the compute role read access to the table and set `CONTENT_SOURCE` / table name env vars at that point.

## Deploying on AWS Amplify

Connect the repo in Amplify Hosting; it detects Next.js (SSR) automatically. `amplify.yml` is included
(`npm ci` → `npm run build`, artifacts in `.next`). Node 20+.
