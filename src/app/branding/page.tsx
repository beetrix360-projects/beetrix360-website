import type { Metadata } from "next";
import { buildServicePageMetadata, ServicePageView } from "@/lib/service-pages/ServicePageView";

export async function generateMetadata(): Promise<Metadata> {
  return (await buildServicePageMetadata("/branding")) || {};
}

export default function BrandingHubPage() {
  return <ServicePageView path="/branding" />;
}
