import type { Metadata } from "next";
import { getAllServicePages } from "@/lib/service-pages";
import { buildServicePageMetadata, ServicePageView } from "@/lib/service-pages/ServicePageView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllServicePages()
    .filter((p) => p.path.startsWith("/social-media/"))
    .map((p) => ({ slug: p.path.slice("/social-media/".length) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return buildServicePageMetadata(`/social-media/${slug}`) || {};
}

export default async function SocialMediaSubPage({ params }: PageProps) {
  const { slug } = await params;
  return <ServicePageView path={`/social-media/${slug}`} />;
}
