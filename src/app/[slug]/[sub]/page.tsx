import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Faqs, InnerPage, LinkCards, MainCopyPlaceholder } from "@/components/pages/InnerPage";
import { JsonLd } from "@/components/site/JsonLd";
import { getSiteSettings } from "@/lib/content";
import { structureMetadata } from "@/lib/page-meta";
import { breadcrumbSchema, serviceSchema, webPageSchema } from "@/lib/schema";
import { divisions, resolveSubService } from "@/lib/site-structure";

// Every sub-service page, e.g. /seo-services/local-seo, pre-rendered from src/content/site-structure.json.
export const dynamicParams = false;

export function generateStaticParams() {
  return divisions.flatMap((d) => d.services.flatMap((s) => s.subServices.map((sub) => ({ slug: s.slug, sub: sub.slug }))));
}

type Props = { params: Promise<{ slug: string; sub: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, sub } = await params;
  const r = resolveSubService(slug, sub);
  if (!r) return {};
  return structureMetadata({
    path: `/${slug}/${sub}`,
    keyword: r.subService.keyword,
    name: r.subService.name,
    divisionName: r.division.name,
  });
}

export default async function SubServicePage({ params }: Props) {
  const { slug, sub } = await params;
  const r = resolveSubService(slug, sub);
  if (!r) notFound();
  const site = await getSiteSettings();
  const { division: d, service: s, subService: x } = r;
  const path = `/${s.slug}/${x.slug}`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: d.name, path: `/${d.slug}` },
    { name: s.name, path: `/${s.slug}` },
    { name: x.name, path },
  ];
  const siblings = s.subServices.filter((o) => o.slug !== x.slug);
  return (
    <InnerPage division={d} crumbs={crumbs} title={x.name} label={s.name} site={site}>
      <JsonLd
        data={[
          webPageSchema({ path, name: x.name, description: `${x.name} from BeeTrix360.` }),
          breadcrumbSchema(crumbs),
          serviceSchema({ name: x.name, keyword: x.keyword, path, division: d, parent: s }),
        ]}
      />
      <MainCopyPlaceholder name={x.name} />
      <Faqs faqs={x.faqs} />
      {siblings.length ? (
        <LinkCards
          title={`More ${s.name}`}
          accentSlug={d.slug}
          items={siblings.map((o) => ({ name: o.name, slug: s.slug, href: `/${s.slug}/${o.slug}` }))}
        />
      ) : null}
    </InnerPage>
  );
}
