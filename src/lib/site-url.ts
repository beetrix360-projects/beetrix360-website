import site from "../content/site.json";

/**
 * Public canonical site URL.
 * Always resolves to the official custom domain (https://www.beetrix360.com)
 * unless an explicit production domain override is provided (ignoring temporary amplifyapp/vercel dev domains).
 */
const rawEnvUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
const isDevPreviewDomain =
  rawEnvUrl.includes("amplifyapp.com") ||
  rawEnvUrl.includes("vercel.app") ||
  rawEnvUrl.includes("localhost");

export const SITE_URL = (
  !isDevPreviewDomain && rawEnvUrl ? rawEnvUrl : site.url || "https://www.beetrix360.com"
).replace(/\/$/, "");

export const absoluteUrl = (path = "/") => {
  if (!path || path === "/") return SITE_URL;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
};
