import type { Metadata } from "next";
import { buildServicePageMetadata, ServicePageView } from "@/lib/service-pages/ServicePageView";

export async function generateMetadata(): Promise<Metadata> {
  return (await buildServicePageMetadata("/content-marketing")) || {};
}

export default function ContentMarketingHubPage() {
  return <ServicePageView path="/content-marketing" />;
}
