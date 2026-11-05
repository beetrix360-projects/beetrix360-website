"use client";

import React from "react";
import { PageData, REVIEWS, VERIFIED } from "../data";

interface Props {
  page: PageData;
  slug: string;
}

export function ReviewsSection({ page, slug }: Props) {
  const isAn = /^[aeiou]/i.test(page.name);
  const matchingReviews = REVIEWS.filter((r) => !r.pages || r.pages.includes(slug));

  return (
    <section className="s-more bx-rev" id="bx-reviews" aria-label="Client reviews">
      <div>
        <div className="r-top">
          <div className="r-score s-glass" data-rv="" data-tilt="">
            <span className="r-stars" aria-hidden="true">
              <i>★</i>
              <i>★</i>
              <i>★</i>
              <i>★</i>
              <i>★</i>
            </span>
            <b>5.0</b>
            <p>out of 5 from 19 client ratings</p>
            <small>Verified on Upwork · 25 completed jobs</small>
            <a href="https://www.upwork.com/freelancers/~016f48c602e3d7d3cc" target="_blank" rel="noopener noreferrer">
              See the verified profile →
            </a>
          </div>

          <div className="r-copy">
            <p className="fx-eyebrow">Client reviews</p>
            <h2 data-fxw="">Clients rate the work. We let the record speak.</h2>
            <p className="s-intro">
              Choosing {isAn ? "an " : "a "} {page.name} partner is a trust decision. You are handing over your visibility, your data and your pipeline, so you should see proof before you commit.
            </p>
            <p className="s-intro">
              These ratings come from real paid projects on a third-party platform, where only the client can leave a score. You can check them yourself on the public profile.
            </p>
          </div>
        </div>

        {matchingReviews.length > 0 && (
          <div className="r-quotes" id="r-quotes">
            {matchingReviews.map((r: any, i: number) => (
              <figure key={i} className="s-glass">
                <blockquote>{r.quote || r.q}</blockquote>
                <figcaption>
                  <b>{r.name || r.c}</b>
                  {[r.role || r.r, r.company || r.v].filter(Boolean).join(", ")}
                </figcaption>
              </figure>
            ))}
          </div>
        )}

        <h3 className="r-sub">Recent 5-star projects</h3>
        <ul className="s-gcards">
          {VERIFIED.map((v, i) => (
            <li key={i} className="s-glass">
              <span className="r-mini" aria-label="Rated 5.0 out of 5">
                ★★★★★ <em>5.0</em>
              </span>
              <h3>{v[0]}</h3>
              <p>{v[1]}</p>
              <small>{v[2]}</small>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
