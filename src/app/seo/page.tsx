import type { Metadata } from "next";
import { getMainSeoPage } from "./data";
import { page, schema } from "./render";
import { SeoClient } from "./SeoClient";
import { JsonLd } from "@/components/site/JsonLd";

export async function generateMetadata(): Promise<Metadata> {
  const p = getMainSeoPage();
  return {
    title: p.title,
    description: p.desc,
    keywords: p.kws,
    alternates: {
      canonical: p.path,
    },
    openGraph: {
      title: p.title,
      description: p.desc,
      url: `https://www.beetrix360.com${p.path}`,
      type: "website",
      siteName: "Beetrix360",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: p.title,
      description: p.desc,
    },
  };
}

export default function SeoMainPage() {
  const pageData = getMainSeoPage();
  const htmlContent = page(pageData);
  const jsonLd = schema(pageData);

  return (
    <>
      <JsonLd data={jsonLd} />
      <SeoClient pageData={pageData} htmlContent={htmlContent} />
    </>
  );
}
