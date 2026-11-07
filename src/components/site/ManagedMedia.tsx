import React from "react";
import Image from "next/image";
import { getPageMediaPlacementsMap } from "@/lib/media-placements";
import type { MediaPlaceholderSlotView } from "@/lib/types";

export interface ManagedMediaProps {
  pageSlug: string;
  placeholderKey: string;
  /** Optional pre-fetched placement to avoid redundant lookups when rendering lists */
  placement?: MediaPlaceholderSlotView | null;
  className?: string;
  imgClassName?: string;
  videoClassName?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  poster?: string;
  /** Fallback UI when no media is mapped to this placeholderKey yet */
  fallback?: React.ReactNode;
  children?: React.ReactNode;
}

export async function ManagedMedia({
  pageSlug,
  placeholderKey,
  placement: providedPlacement,
  className = "",
  imgClassName = "w-full h-full object-cover",
  videoClassName = "w-full h-full object-cover",
  width = 1200,
  height = 900,
  fill = false,
  priority = false,
  controls = true,
  autoPlay = false,
  muted = true,
  loop = true,
  poster,
  fallback,
  children,
}: ManagedMediaProps) {
  let activePlacement = providedPlacement;

  if (activePlacement === undefined) {
    const map = await getPageMediaPlacementsMap(pageSlug);
    activePlacement = map.get(placeholderKey) || null;
  }

  if (!activePlacement || !activePlacement.isConfigured || !activePlacement.mediaUrl) {
    return <>{fallback ?? children ?? null}</>;
  }

  const altText = activePlacement.altText || activePlacement.label || placeholderKey;
  const seoTitle = activePlacement.seoTitle || undefined;

  if (activePlacement.mediaType === "VIDEO") {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <video
          src={activePlacement.mediaUrl}
          aria-label={altText}
          title={seoTitle}
          poster={poster}
          controls={controls}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          playsInline
          className={videoClassName}
        />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {fill ? (
        <Image
          src={activePlacement.mediaUrl}
          alt={altText}
          title={seoTitle}
          fill
          priority={priority}
          unoptimized
          className={imgClassName}
        />
      ) : (
        <Image
          src={activePlacement.mediaUrl}
          alt={altText}
          title={seoTitle}
          width={width}
          height={height}
          priority={priority}
          unoptimized
          className={imgClassName}
        />
      )}
    </div>
  );
}

