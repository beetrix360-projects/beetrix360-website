import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSeoPageBySlug, getAllSeoSlugs } from "../data";
import { page, schema } from "../render";
import { SeoClient } from "../SeoClient";
import { JsonLd } from "@/components/site/JsonLd";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllSeoSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const p = getSeoPageBySlug(slug);
  if (!p) return {};

  return {
    title: p.title,
    description: p.desc,
    alternates: {
      canonical: p.path,
    },
    openGraph: {
      title: p.title,
      description: p.desc,
      url: `https://www.beetrix360.com${p.path}`,
      type: "website",
    },
  };
}

export default async function SeoSubPage({ params }: PageProps) {
  const { slug } = await params;
  const pageData = getSeoPageBySlug(slug);

  if (!pageData) {
    notFound();
  }

  const htmlContent = page(pageData);
  const jsonLd = schema(pageData);

  return (
    <>
      <JsonLd data={jsonLd} />
      <SeoClient pageData={pageData} htmlContent={htmlContent} />
    </>
  );
}

