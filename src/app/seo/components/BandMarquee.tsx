"use client";

import React from "react";

interface Props {
  items: { label: string; href?: string; slug?: string }[];
  rev?: boolean;
  onSelectSlug?: (slug: string) => void;
}

export function BandMarquee({ items, rev = false, onSelectSlug }: Props) {
  // Repeat items to ensure seamless loop
  const repeated = Array(6).fill(items).flat();

  return (
    <div className={`fx-band ${rev ? "rev" : ""}`} data-band>
      <div>
        {repeated.map((item, i) => (
          <React.Fragment key={i}>
            {item.slug ? (
              <a
                href={item.href || `#${item.slug}`}
                data-slug={item.slug}
                onClick={(e) => {
                  if (item.slug && onSelectSlug) {
                    e.preventDefault();
                    onSelectSlug(item.slug);
                  }
                }}
              >
                {item.label}
              </a>
            ) : (
              <a href={item.href || "#"}>{item.label}</a>
            )}
            <i>✦</i>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

