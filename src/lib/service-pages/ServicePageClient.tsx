"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { mountServicePageClient } from "./index";
import type { ServiceGroupId } from "./types";

interface ServicePageClientProps {
  group: ServiceGroupId;
  pageId: string;
  pagePath: string;
  scopeClass: string;
  fontsUrl: string;
  scopedCss: string;
  htmlContent: string;
}

export function ServicePageClient({
  group,
  pageId,
  pagePath,
  scopeClass,
  fontsUrl,
  scopedCss,
  htmlContent,
}: ServicePageClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  const innerHtml = useMemo(() => ({ __html: htmlContent }), [htmlContent]);
  const cssHtml = useMemo(() => ({ __html: scopedCss }), [scopedCss]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root || typeof window === "undefined") return;

    const cleanup = mountServicePageClient(group, root, pageId, (href) => {
      routerRef.current.push(href);
    });

    return () => {
      cleanup();
    };
  }, [group, pageId, pagePath]);

  return (
    <>
      {fontsUrl ? <link rel="stylesheet" href={fontsUrl} /> : null}
      <style dangerouslySetInnerHTML={cssHtml} />
      <div
        key={pagePath}
        ref={containerRef}
        className={scopeClass}
        dangerouslySetInnerHTML={innerHtml}
      />
    </>
  );
}
