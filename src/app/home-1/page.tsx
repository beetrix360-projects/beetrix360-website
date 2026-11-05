import type { Metadata } from "next";
import { Home1Client } from "./Home1Client";

export const metadata: Metadata = {
  title: "AI Search & SEO | Beetrix360",
  description:
    "Technical fixes, content and authority, run as one system and measured in pipeline. Built to rank in Google and get cited by AI.",
  alternates: {
    canonical: "/home-1",
  },
};

export default function Home1Page() {
  return <Home1Client />;
}

