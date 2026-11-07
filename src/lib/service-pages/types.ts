export type ServiceGroupId = "01" | "02" | "03" | "04" | "05" | "06";

export interface ServicePageMeta {
  id: string;
  path: string;
  col?: string;
  name: string;
  short: string;
  kw: string;
  title: string;
  desc: string;
  kws?: string[];
  group: ServiceGroupId;
}

export interface RenderedServicePage {
  meta: ServicePageMeta;
  group: ServiceGroupId;
  scopeClass: string;
  fontsUrl: string;
  scopedCss: string;
  htmlContent: string;
  jsonLd: Record<string, any>;
}

