import type { Metadata } from "next";
import { buildServicePageMetadata, ServicePageView } from "@/lib/service-pages/ServicePageView";

export async function generateMetadata(): Promise<Metadata> {
  return (await buildServicePageMetadata("/seo")) || {};
}

export default function SeoMainPage() {
  return <ServicePageView path="/seo" />;
}
