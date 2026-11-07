import type { Metadata } from "next";
import { getAllServicePages } from "@/lib/service-pages";
import { buildServicePageMetadata, ServicePageView } from "@/lib/service-pages/ServicePageView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllServicePages()
    .filter((p) => p.path.startsWith("/branding/"))
    .map((p) => ({ slug: p.path.slice("/branding/".length) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return buildServicePageMetadata(`/branding/${slug}`) || {};
}

export default async function BrandingSubPage({ params }: PageProps) {
  const { slug } = await params;
  return <ServicePageView path={`/branding/${slug}`} />;
}
