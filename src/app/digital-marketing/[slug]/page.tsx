import type { Metadata } from "next";
import { getAllServicePages } from "@/lib/service-pages";
import { buildServicePageMetadata, ServicePageView } from "@/lib/service-pages/ServicePageView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllServicePages()
    .filter((p) => p.path.startsWith("/digital-marketing/"))
    .map((p) => ({ slug: p.path.slice("/digital-marketing/".length) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return buildServicePageMetadata(`/digital-marketing/${slug}`) || {};
}

export default async function DigitalMarketingSubPage({ params }: PageProps) {
  const { slug } = await params;
  return <ServicePageView path={`/digital-marketing/${slug}`} />;
}

