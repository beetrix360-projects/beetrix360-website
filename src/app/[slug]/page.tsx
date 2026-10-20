import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InnerPage, LinkCards, MainCopyPlaceholder, PlaceholderSections, Faqs } from "@/components/pages/InnerPage";
import { JsonLd } from "@/components/site/JsonLd";
import { getSiteSettings } from "@/lib/content";
import { structureMetadata } from "@/lib/page-meta";
import { breadcrumbSchema, itemListSchema, serviceSchema, webPageSchema } from "@/lib/schema";
import { divisions, resolveTopLevel } from "@/lib/site-structure";

// One route file serves every division hub (/digital-marketing) and every service page
// (/seo-services). All of them are pre-rendered at build time from src/content/site-structure.json.
export const dynamicParams = false;

export function generateStaticParams() {
  return divisions.flatMap((d) => [{ slug: d.slug }, ...d.services.map((s) => ({ slug: s.slug }))]);
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = resolveTopLevel(slug);
  if (!r) return {};
  if (r.kind === "division") {
    return structureMetadata({ path: `/${slug}`, keyword: r.division.name, name: r.division.name, divisionName: r.division.name });
  }
  return structureMetadata({ path: `/${slug}`, keyword: r.service.keyword, name: r.service.name, divisionName: r.division.name });
}

export default async function TopLevelPage({ params }: Props) {
  const { slug } = await params;
  const r = resolveTopLevel(slug);
  if (!r) notFound();
  const site = await getSiteSettings();

  if (r.kind === "division") {
    const d = r.division;
    const crumbs = [
      { name: "Home", path: "/" },
      { name: d.name, path: `/${d.slug}` },
    ];
    const services = d.services.map((s) => ({ name: s.name, path: `/${s.slug}` }));
    return (
      <InnerPage division={d} crumbs={crumbs} title={d.name} label="Services" site={site}>
        <JsonLd
          data={[
            webPageSchema({ path: `/${d.slug}`, name: d.name, description: `${d.name} services from BeeTrix360.` }),
            breadcrumbSchema(crumbs),
            itemListSchema(d.name, services),
          ]}
        />
        <LinkCards
          title={`${d.name} services`}
          accentSlug={d.slug}
          items={d.services.map((s) => ({
            name: s.name,
            slug: s.slug,
            href: `/${s.slug}`,
            links: s.subServices.map((sub) => ({ name: sub.name, href: `/${s.slug}/${sub.slug}` })),
          }))}
        />
      </InnerPage>
    );
  }

  const { division: d, service: s } = r;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: d.name, path: `/${d.slug}` },
    { name: s.name, path: `/${s.slug}` },
  ];
  const children = s.subServices.map((sub) => ({ name: sub.name, path: `/${s.slug}/${sub.slug}` }));
  return (
    <InnerPage division={d} crumbs={crumbs} title={s.name} label={d.name} site={site}>
      <JsonLd
        data={[
          webPageSchema({ path: `/${s.slug}`, name: s.name, description: `${s.name} from BeeTrix360.` }),
          breadcrumbSchema(crumbs),
          serviceSchema({ name: s.name, keyword: s.keyword, path: `/${s.slug}`, division: d, children }),
        ]}
      />
      {s.sections?.length ? <PlaceholderSections sections={s.sections} /> : <MainCopyPlaceholder name={s.name} />}
      {s.subServices.length ? (
        <LinkCards
          title={`${s.name} services`}
          accentSlug={d.slug}
          items={s.subServices.map((sub) => ({ name: sub.name, slug: s.slug, href: `/${s.slug}/${sub.slug}` }))}
        />
      ) : null}
      <Faqs faqs={s.faqs} />
    </InnerPage>
  );
}
