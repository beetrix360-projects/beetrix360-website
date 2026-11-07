import React from "react";
import { buildPageMediaJsonLd } from "@/lib/media-placements";

interface MediaStructuredDataProps {
  pageSlug: string;
}

/**
 * Server Component that injects Schema.org ImageObject and VideoObject
 * JSON-LD structured data into the page so Googlebot and search crawlers
 * index every configured media asset with its contentUrl, name, description, and caption.
 */
export async function MediaStructuredData({ pageSlug }: MediaStructuredDataProps) {
  const nodes = await buildPageMediaJsonLd(pageSlug);
  if (!nodes || nodes.length === 0) {
    return null;
  }

  return (
    <>
      {nodes.map((node, index) => (
        <script
          key={node["@id"] || `${pageSlug}-media-ld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
        />
      ))}
    </>
  );
}

