import structure from "@/content/site-structure.json";
import type { Division, Service, SiteStructure, SubService } from "./types";

// Routes come straight from "Beetrix Navigation.docx":
//   /{division}                 division hub page
//   /{service}                  service page (top level, as in the doc)
//   /{service}/{sub-service}    sub-service page

export const siteStructure = structure as SiteStructure;
export const divisions: Division[] = siteStructure.divisions;

export type ResolvedTopLevel =
  | { kind: "division"; division: Division }
  | { kind: "service"; division: Division; service: Service };

export function resolveTopLevel(slug: string): ResolvedTopLevel | null {
  for (const division of divisions) {
    if (division.slug === slug) return { kind: "division", division };
    const service = division.services.find((s) => s.slug === slug);
    if (service) return { kind: "service", division, service };
  }
  return null;
}

export function resolveSubService(
  serviceSlug: string,
  subSlug: string,
): { division: Division; service: Service; subService: SubService } | null {
  const top = resolveTopLevel(serviceSlug);
  if (!top || top.kind !== "service") return null;
  const subService = top.service.subServices.find((s) => s.slug === subSlug);
  return subService ? { division: top.division, service: top.service, subService } : null;
}

export const divisionPath = (d: Division) => `/${d.slug}`;
export const servicePath = (s: Service) => `/${s.slug}`;
export const subServicePath = (s: Service, sub: SubService) => `/${s.slug}/${sub.slug}`;

/** Every route the navigation doc defines, used by the sitemap and llms.txt. */
export function allStructurePaths(): string[] {
  const paths: string[] = [];
  for (const d of divisions) {
    paths.push(divisionPath(d));
    for (const s of d.services) {
      paths.push(servicePath(s));
      for (const sub of s.subServices) paths.push(subServicePath(s, sub));
    }
  }
  return paths;
}

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
