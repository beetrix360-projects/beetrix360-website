// Content model for the site. The dashboard (to be built later) should read and write
// objects of these shapes; DynamoDB items can store them as-is (one item per page or per section).

export type Accent = "pink" | "green" | "yellow" | "blue";

export interface Eyebrow {
  number: string;
  label: string;
  accent: Accent;
}

/** A headline with an optional highlighted (italic serif, underlined) phrase at the end. */
export interface AccentHeading {
  text: string;
  accent?: string;
  accentColor?: Accent;
  lineBreak?: boolean;
}

export interface CountStat {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
  accent?: Accent;
}

/** The `data-cta` value opens the request modal with this label as its tag. */
export interface CtaButton {
  label: string;
  cta: string;
}

export type CtaIconStyle = Accent;
export type CtaButtonStyle = "pink" | "dark-green" | "dark-blue";

export interface CtaBandContent {
  icon: string;
  iconStyle: CtaIconStyle;
  title: string;
  text: string;
  button: string;
  buttonStyle: CtaButtonStyle;
  cta: string;
}

export interface Placeholder {
  icon: string;
  lines: string[];
}

export interface PainCard {
  accent: Accent;
  ariaLabel: string;
  icon: string;
  front:
    | { kind: "stat"; stat: string; text: string }
    | { kind: "bars"; text: string }
    | { kind: "query"; query: string; text: string };
  tag: string;
  back: { icon: string; label: string; text: string; button: string; cta: string };
}

export type PillarVisual = "layers" | "workflow" | "agents" | "bars";

export interface PillarCard {
  accent: Accent;
  stepIcon: string;
  tag: string;
  number: string;
  title: string;
  text: string;
  visual: PillarVisual;
  visualFirst: boolean;
  placeholder: Placeholder;
  image?: string;
  chips: string[];
  footer: string;
  button: string;
  cta: string;
}

export interface Kinetic {
  words: string[];
  direction: 1 | -1;
}

export interface RangeInput {
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
}

export interface HomepageContent {
  seo: { title: string; description: string };
  hero: {
    badge: { tag: string; text: string; strong: string; cta: string };
    headline: string;
    rotatingWords: string[];
    subheading: string;
    auditForm: { label: string; placeholder: string; button: string; modalTag: string };
    trust: { badge: string; text: string; highlight: string };
    stats: CountStat[];
    puzzle: {
      ariaLabel: string;
      labels: { topLeft: string; topRight: string; bottomRight: string; bottomLeft: string };
      chips: { label: string; value: string }[];
      hintDesktop: string;
      hintMobile: string;
    };
    image?: string;
    showreel: { title: string; subtitle: string; video: string };
  };
  clients: { name: string; badge?: string; accent?: Accent }[];
  statement: {
    eyebrow: Eyebrow;
    text: string;
    button: CtaButton;
    note: string;
  };
  pain: {
    heading: string;
    hint: string;
    cards: PainCard[];
    ctaBand: CtaBandContent;
  };
  pillars: {
    eyebrow: Eyebrow;
    heading: AccentHeading;
    intro: string;
    button: CtaButton;
    link: { label: string; href: string };
    cards: PillarCard[];
  };
  kineticPillars: Kinetic;
  pipeline: {
    eyebrow: Eyebrow;
    heading: AccentHeading;
    intro: string;
    stages: { accent: Accent; icon: string; label: string; title: string; text: string }[];
    ctaBand: CtaBandContent;
  };
  geo: {
    eyebrow: Eyebrow;
    heading: AccentHeading;
    intro: string;
    stats: CountStat[];
    shareOfVoice: { title: string; rows: { label: string; value: number }[] };
    chat: {
      windowLabel: string;
      question: string;
      answerLead: string;
      answerBrand: string;
      answerRest: string;
      citation: string;
    };
    rankBadge: { label: string; value: string };
    checkBand: {
      icon: string;
      title: string;
      text: string;
      label: string;
      placeholder: string;
      button: string;
      modalTag: string;
    };
  };
  compare: {
    eyebrow: Eyebrow;
    heading: AccentHeading;
    before: { label: string; items: { icon: string; label: string; value: string }[] };
    after: { label: string; items: { icon: string; accent: Accent; label: string; value: string }[] };
    rangeLabel: string;
    followUp: { title: string; button: string; cta: string };
  };
  kineticProof: Kinetic;
  work: {
    eyebrow: Eyebrow;
    heading: string;
    allButton: CtaButton;
    cases: {
      accent: Accent;
      placeholder: string;
      category: string;
      value: number;
      prefix?: string;
      suffix?: string;
      title: string;
    }[];
    realEstate: { title: string; placeholder: string; items: { name: string; location: string }[] };
    ctaBand: CtaBandContent;
  };
  roi: {
    eyebrow: Eyebrow;
    heading: string;
    inputs: { team: RangeInput; share: RangeInput; cost: RangeInput };
    assumption: string;
    hoursLabel: string;
    savingsLabel: string;
    /** `{fte}` is replaced with the computed number of roles. */
    fteTemplate: string;
    button: CtaButton;
  };
  process: {
    eyebrow: Eyebrow;
    heading: AccentHeading;
    intro: string;
    video: { label: string; video: string };
    badges: { icon: string; accent: Accent; text: string }[];
    steps: { accent: Accent; range: string; title: string; text: string }[];
    ctaBand: CtaBandContent;
  };
  contact: {
    heading: AccentHeading;
    intro: string;
    form: {
      nameLabel: string;
      emailLabel: string;
      websiteLabel: string;
      websitePlaceholder: string;
      goalLegend: string;
      goals: { icon: string; accent: Accent; label: string }[];
      budgetLabel: string;
      budgets: string[];
      submit: string;
      note: string;
    };
    success: { title: string; text: string };
  };
  floatingCta: { cta: string; label: string; labelMobile: string };
  chapters: { href: string; label: string }[];
}

export interface SiteSettings {
  name: string;
  url: string;
  description: string;
  foundingYear: number;
  formerName: string;
  phone: { display: string; tel: string; ariaLabel: string };
  header: { cta: CtaButton; mobileCta: CtaButton };
  footer: {
    tagline: string;
    exploreTitle: string;
    explore: { label: string; href: string }[];
    contactTitle: string;
    domainLabel: string;
    bookLabel: string;
    bookHref: string;
    copyright: string;
    backToTop: string;
  };
  modal: {
    defaultTag: string;
    defaultTitle: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    websitePlaceholder: string;
    submit: string;
    successTitle: string;
    successText: string;
  };
  videoModal: { label: string; hint: string };
}

export interface CustomConversionEvent {
  id: string;
  name: string;
  eventName: string;
  triggerSelector?: string;
  enabled: boolean;
}

export interface AnalyticsSettings {
  gaEnabled: boolean;
  gaMeasurementId: string; // e.g., G-XXXXXXXXXX
  gtmEnabled: boolean;
  gtmContainerId: string; // e.g., GTM-XXXXXXX
  trackPageViews: boolean;
  trackCtaClicks: boolean;
  trackFormSubmissions: boolean;
  trackVideoPlays: boolean;
  trackRoiCalculator: boolean;
  trackPhoneClicks: boolean;
  trackOutboundLinks: boolean;
  anonymizeIp: boolean;
  consentModeDefault: "granted" | "denied";
  customHeadScripts?: string;
  customConversionEvents: CustomConversionEvent[];
}

// ---- Site structure (from "Beetrix Navigation.docx") ----

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SubService {
  name: string;
  slug: string;
  keyword: string;
  /** Optional, filled from the dashboard later. Renders an FAQ block + FAQPage schema when present. */
  faqs?: FaqItem[];
}

export interface Service {
  name: string;
  slug: string;
  keyword: string;
  subServices: SubService[];
  /** On-page sections listed in the handoff doc (not separate URLs). */
  sections?: string[];
  faqs?: FaqItem[];
}

export interface Division {
  name: string;
  slug: string;
  services: Service[];
}

export interface SiteStructure {
  divisions: Division[];
}

// ============================================================================
// IA v2 Data Model (Single source of truth: src/content/ia-v2.seed.json)
// ============================================================================

export type PageTypeV2 =
  | "home"
  | "hub"
  | "service"
  | "sub"
  | "platform"
  | "challenge"
  | "proof"
  | "company"
  | "pricing"
  | "resource"
  | "tool"
  | "legal";

export type PageOrigin = "hammad" | "webfx" | "both" | "new" | "standard";
export type ContentStatus = "placeholder" | "ready";

export interface SeoRobots {
  index: boolean;
  follow: boolean;
}

export interface SeoConfigV2 {
  titleTag: string;
  metaDescription: string | null;
  canonicalPath: string;
  robots: SeoRobots;
  robotsAfterContentReady: SeoRobots;
  breadcrumbLabel: string;
  indexLock?: boolean;
  indexLockReason?: string;
  indexedAt?: string;
  schemaTypes: string[];
  faqSchemaOnlyWhenReady: boolean;
  openGraph: {
    type: string;
    imagePath: string | null;
    title?: string;
    description?: string;
  };
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
    imagePath?: string | null;
  };
  customJsonLd?: string;
}

export interface SectionImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export type SectionBlockTypeV2 =
  | "hero"
  | "intro"
  | "richText"
  | "bulletList"
  | "childCards"
  | "process"
  | "faq"
  | "proofPlaceholder"
  | "relatedLinks"
  | "cta";

export interface SectionBlockV2 {
  id: string;
  type: SectionBlockTypeV2;
  placeholder?: boolean;
  generated?: boolean;
  generatedAt?: string;
  title?: string;
  headingLevel?: "h1" | "h2" | "h3";
  content: Record<string, any>;
  images?: SectionImage[];
}

export interface PageRecordV2 {
  id: string;
  path: string; // Full path without trailing slash, e.g. /seo/local-seo; home is /. Unique. Max 3 segments
  parentId: string | null; // null for top-level pages
  slug: string; // Last path segment; unique among siblings
  h1: string;
  menuLabel: string; // Defaults to h1
  targetKeyword: string;
  seo: SeoConfigV2;
  pageType: PageTypeV2;
  origin: PageOrigin;
  division: string;
  sections: SectionBlockV2[];
  contentStatus: ContentStatus;
  published: boolean;
  redirectFrom: string[];
  note?: string;
  updatedAt: string;
  updatedBy?: string;
  savedInStudioAt?: string;
}

// ---- Navigation Model ----

export type NavigationDynamicSource = {
  dynamic: "latestPostsByTag";
  tag: string;
  limit: number;
  label: string;
};

export type NavigationItem =
  | { pageId: string; label?: string; path?: string }
  | NavigationDynamicSource;

export interface NavigationGroup {
  heading: string;
  headingPath: string | null;
  items: NavigationItem[];
}

export interface NavigationProofCard {
  text: string;
  cta: string;
  path: string;
}

export interface NavigationMenu {
  label: string;
  shortLabel?: string;
  viewAllPath: string;
  bottomBarLinks: { label: string; path: string }[];
  proofCard: NavigationProofCard | null;
  groups: NavigationGroup[];
}

export interface NavigationRecord {
  logoPath: string;
  cta: { label: string; path: string };
  footerLegal: string[];
  menus: NavigationMenu[];
  updatedAt?: string;
  updatedBy?: string;
}

// Compute group track span: 1 track if <= 6 items, 2 tracks if 7-12 items
export function computeGroupSpan(group: { items: any[] }): 1 | 2 {
  return group.items && group.items.length > 6 ? 2 : 1;
}

// Compute total tracks in a menu dropdown
export function computeMenuTracks(menu: NavigationMenu): number {
  let tracks = menu.proofCard ? 1 : 0;
  for (const group of menu.groups || []) {
    tracks += computeGroupSpan(group);
  }
  return tracks;
}

// ---- 301 Redirect Record ----

export interface RedirectRecord {
  from: string; // Normalized source path, e.g. /seo-services/local-seo
  to: string; // Target path, e.g. /seo/local-seo
  status: 301 | 308;
  createdAt?: string;
}

