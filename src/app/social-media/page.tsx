import type { Metadata } from "next";
import { buildServicePageMetadata, ServicePageView } from "@/lib/service-pages/ServicePageView";

export async function generateMetadata(): Promise<Metadata> {
  return buildServicePageMetadata("/social-media") || {};
}

export default function SocialMediaHubPage() {
  return <ServicePageView path="/social-media" />;
}
