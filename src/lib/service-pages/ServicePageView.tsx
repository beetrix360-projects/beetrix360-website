import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/site/JsonLd";
import { MediaStructuredData } from "@/components/site/MediaStructuredData";
import {
  getPageMediaMetadata,
  getPageMediaPlacementsMap,
  injectMediaPlacementsIntoServiceHtml,
} from "@/lib/media-placements";
import { getServicePageByPath, renderServicePageByPath } from "./index";
import { ServicePageClient } from "./ServicePageClient";

export async function buildServicePageMetadata(rawPath: string): Promise<Metadata | null> {
  const p = getServicePageByPath(rawPath);
  if (!p) return null;

  const mediaSeo = await getPageMediaMetadata(p.path);

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
      ...(mediaSeo.openGraphImages.length > 0
        ? { images: mediaSeo.openGraphImages }
        : {}),
      ...(mediaSeo.openGraphVideos.length > 0
        ? { videos: mediaSeo.openGraphVideos }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: p.title,
      description: p.desc,
      ...(mediaSeo.twitterImages.length > 0
        ? { images: mediaSeo.twitterImages }
        : {}),
    },
  };
}

export async function ServicePageView({ path }: { path: string }) {
  const rendered = renderServicePageByPath(path);
  if (!rendered) {
    notFound();
  }

  const placementsMap = await getPageMediaPlacementsMap(rendered.meta.path);
  const htmlWithMedia = injectMediaPlacementsIntoServiceHtml(
    rendered.htmlContent,
    placementsMap
  );

  return (
    <>
      <JsonLd data={rendered.jsonLd} />
      <MediaStructuredData pageSlug={rendered.meta.path} />
      <ServicePageClient
        group={rendered.group}
        pageId={rendered.meta.id}
        pagePath={rendered.meta.path}
        scopeClass={rendered.scopeClass}
        fontsUrl={rendered.fontsUrl}
        scopedCss={rendered.scopedCss}
        htmlContent={htmlWithMedia}
      />
    </>
  );
}
