import type { Metadata } from "next";
import { getAllServicePages } from "@/lib/service-pages";
import { buildServicePageMetadata, ServicePageView } from "@/lib/service-pages/ServicePageView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllServicePages()
    .filter((p) => p.path.startsWith("/content-marketing/"))
    .map((p) => ({ slug: p.path.slice("/content-marketing/".length) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return (await buildServicePageMetadata(`/content-marketing/${slug}`)) || {};
}

export default async function ContentMarketingSubPage({ params }: PageProps) {
  const { slug } = await params;
  return <ServicePageView path={`/content-marketing/${slug}`} />;
}
