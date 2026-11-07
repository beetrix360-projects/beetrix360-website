import type { Metadata } from "next";
import { buildServicePageMetadata, ServicePageView } from "@/lib/service-pages/ServicePageView";

export async function generateMetadata(): Promise<Metadata> {
  return (await buildServicePageMetadata("/digital-marketing")) || {};
}

export default function DigitalMarketingHubPage() {
  return <ServicePageView path="/digital-marketing" />;
}
