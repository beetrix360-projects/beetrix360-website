"use client";

import React from "react";
import { PageData, D } from "../data";

interface Props {
  page: PageData;
}

export function GuideSection({ page }: Props) {
  return (
    <div className="s-more fx-guide" id="fx-guide">
      <div className="g-in">
        <article className="g-main">
          <p className="fx-eyebrow">{page.group}</p>
          <h2 data-fxw="">What is {page.name}?</h2>
          <p>{page.what}</p>

          <h2 data-fxw="">Why {page.name} matters now</h2>
          <p>{page.why}</p>

          <h2 data-fxw="">Who {page.name} is for</h2>
          <p>{page.who}</p>

          <h2 data-fxw="">How Beetrix360 approaches {page.name}</h2>
          <p>{page.how}</p>

          <h2 data-fxw="">Common {page.name} mistakes to avoid</h2>
          <ul className="g-mist">
            {page.mist.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>

          <div className="s-after">
            <p>Not sure which of these applies to you? We will check them in your free audit.</p>
            <a className="s-btn s-btn-a" href="#bx-close">
              Check my site for free →
            </a>
          </div>
        </article>

        <aside className="g-side s-glass" data-rv="">
          <h3>How we measure success</h3>
          <ul>
            {page.kpis.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ul>
          <p>Every result is reported in one place, tied to your CRM, so you can see what search adds to pipeline.</p>
          <a className="s-btn s-btn-a" href="#bx-close">
            Get my free audit
          </a>
        </aside>
      </div>

      <div className="g-defs">
        <h2 data-fxw="">{page.name} across SEO, AEO, GEO and LLMO</h2>
        <p className="s-intro">
          Search now happens in more than one place. {page.name} works best when it supports all four disciplines, so we plan them as one system.
        </p>
        <ul className="s-gcards">
          {D.map((d, i) => (
            <li key={i} className="s-glass">
              <small>{d[0]}</small>
              <h3>{d[1]}</h3>
              <p>
                {d[1]} {d[2]}
              </p>
            </li>
          ))}
        </ul>
        <div className="s-after">
          <p>Find out which of the four is costing you the most buyers.</p>
          <a className="s-btn s-btn-a" href="#bx-score">
            Show me my weakest link →
          </a>
        </div>
      </div>
    </div>
  );
}

