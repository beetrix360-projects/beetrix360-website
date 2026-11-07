import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/site/JsonLd";
import { getServicePageByPath, renderServicePageByPath } from "./index";
import { ServicePageClient } from "./ServicePageClient";

export function buildServicePageMetadata(rawPath: string): Metadata | null {
  const p = getServicePageByPath(rawPath);
  if (!p) return null;

  return {
    title: { absolute: p.title },
    description: p.desc,
    keywords: p.kws,
    alternates: {
      canonical: `https://www.beetrix360.com${p.path}`,
    },
    robots: {
      index: true,
      follow: true,
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

export function ServicePageView({ path }: { path: string }) {
  const rendered = renderServicePageByPath(path);
  if (!rendered) {
    notFound();
  }

  return (
    <>
      <JsonLd data={rendered.jsonLd} />
      <ServicePageClient
        group={rendered.group}
        pageId={rendered.meta.id}
        pagePath={rendered.meta.path}
        scopeClass={rendered.scopeClass}
        fontsUrl={rendered.fontsUrl}
        scopedCss={rendered.scopedCss}
        htmlContent={rendered.htmlContent}
      />
    </>
  );
}

