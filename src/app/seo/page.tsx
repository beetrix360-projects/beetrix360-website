import type { Metadata } from "next";
import { AiSearchAndSeoClient } from "./AiSearchAndSeoClient";

export const metadata: Metadata = {
  title: "AI Search & SEO Services | Beetrix360",
  description:
    "Technical fixes, content and authority, run as one system and measured in pipeline. Built to rank in Google and get cited by AI.",
  alternates: {
    canonical: "/seo",
  },
};

export default function SeoMainPage() {
  return <AiSearchAndSeoClient />;
}
