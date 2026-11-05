"use client";

import React, { useState } from "react";
import { PageData, NAV, PAGES } from "../data";

interface Props {
  page: PageData;
  slug: string;
  onSelectSlug: (slug: string) => void;
}

export function FaqSection({ page, slug, onSelectSlug }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Group related slugs
  const related = (NAV[page.group] || [])
    .filter((s) => s !== slug)
    .concat(Object.keys(PAGES).filter((s) => PAGES[s]?.group !== page.group))
    .slice(0, 6);

  return (
    <section className="s-more bx-faq" id="bx-faq">
      <div className="f-in">
        <div className="f-head">
          <p className="fx-eyebrow">FAQ</p>
          <h2 data-fxw="">{page.name} FAQs</h2>
          <p>
            Straight answers about {page.name}, results, timelines and how it connects with SEO, AEO, GEO and LLMO.
          </p>
          <a className="s-btn s-btn-a" href="#bx-close">
            Ask us directly
          </a>
        </div>

        <div className="s-faq">
          {page.faq.map((x, i) => (
            <details
              key={i}
              open={openIndex === i}
              onClick={(e) => {
                e.preventDefault();
                setOpenIndex(openIndex === i ? null : i);
              }}
            >
              <summary>{x[0]}</summary>
              <p>{x[1]}</p>
            </details>
          ))}
        </div>
      </div>

      <div className="fx-inline f-cta">
        <p>
          Still have questions? <b>Get a straight answer from a real strategist.</b>
        </p>
        <a className="s-btn s-btn-a" href="#bx-close">
          Talk to Beetrix360
        </a>
      </div>

      <div className="f-rel">
        <h2 data-fxw="">Related services</h2>
        <p className="s-intro">
          {page.name} works even better alongside these services. Explore what else can strengthen your search visibility.
        </p>
        <div className="s-rel">
          {related.map((s) => (
            <a
              key={s}
              className="s-glass"
              href={`#${s}`}
              data-slug={s}
              onClick={(e) => {
                e.preventDefault();
                onSelectSlug(s);
              }}
            >
              {PAGES[s]?.name || s}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

