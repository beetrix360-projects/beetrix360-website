import * as g01 from "./group-01";
import * as g02 from "./group-02";
import * as g03 from "./group-03";
import * as g04 from "./group-04";
import * as g05 from "./group-05";
import * as g06 from "./group-06";
import type { RenderedServicePage, ServiceGroupId, ServicePageMeta } from "./types";

const GROUPS: Record<
  ServiceGroupId,
  {
    GROUP_ID: ServiceGroupId;
    SCOPE_CLASS: string;
    FONTS_URL: string;
    SCOPED_CSS: string;
    groupRuntime: {
      PAGES: any[];
      renderPage: (pageId: string) => string;
      renderSchema: (pageId: string) => Record<string, any>;
      mountClient: (root: HTMLElement, pageId: string, navigate: (href: string) => void) => () => void;
    };
  }
> = {
  "01": g01 as any,
  "02": g02 as any,
  "03": g03 as any,
  "04": g04 as any,
  "05": g05 as any,
  "06": g06 as any,
};

function normalizePath(rawPath: string): string {
  if (!rawPath) return "/";
  const trimmed = rawPath.trim();
  if (trimmed === "/") return "/";
  return "/" + trimmed.replace(/^\/+|\/+$/g, "");
}

const ALL_SERVICE_PAGES: ServicePageMeta[] = [];
const PAGE_BY_PATH = new Map<string, ServicePageMeta>();

for (const groupId of ["01", "02", "03", "04", "05", "06"] as ServiceGroupId[]) {
  const mod = GROUPS[groupId];
  for (const p of mod.groupRuntime.PAGES) {
    const cleanPath = normalizePath(p.path);
    const meta: ServicePageMeta = {
      id: p.id,
      path: cleanPath,
      col: p.col,
      name: p.name,
      short: p.short || p.name,
      kw: p.kw || "",
      title: p.title,
      desc: p.desc,
      kws: p.kws,
      group: groupId,
    };
    ALL_SERVICE_PAGES.push(meta);
    PAGE_BY_PATH.set(cleanPath, meta);
  }
}

export function getAllServicePages(): ServicePageMeta[] {
  return ALL_SERVICE_PAGES;
}

export function getServicePageByPath(rawPath: string): ServicePageMeta | undefined {
  return PAGE_BY_PATH.get(normalizePath(rawPath));
}

export function renderServicePageByPath(rawPath: string): RenderedServicePage | null {
  const meta = getServicePageByPath(rawPath);
  if (!meta) return null;
  const mod = GROUPS[meta.group];
  const htmlContent = mod.groupRuntime.renderPage(meta.id);
  const jsonLd = mod.groupRuntime.renderSchema(meta.id);
  return {
    meta,
    group: meta.group,
    scopeClass: mod.SCOPE_CLASS,
    fontsUrl: mod.FONTS_URL,
    scopedCss: mod.SCOPED_CSS,
    htmlContent,
    jsonLd,
  };
}

export function mountServicePageClient(
  group: ServiceGroupId,
  root: HTMLElement,
  pageId: string,
  navigate: (href: string) => void
): () => void {
  const mod = GROUPS[group];
  if (!mod) return () => {};
  return mod.groupRuntime.mountClient(root, pageId, navigate);
}

