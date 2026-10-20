import site from "@/content/site.json";

/** Public site URL. Optional env override; falls back to the domain in the design. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || site.url).replace(/\/$/, "");

export const absoluteUrl = (path = "/") => `${SITE_URL}${path === "/" ? "" : path}`;
