"use client";

import React from "react";
import { PageData, PROCESS, ROLLOUT, REPORT_ROW } from "../data";

interface Props {
  page: PageData;
}

export function MoreSection({ page }: Props) {
  const isAn = /^[aeiou]/i.test(page.name);
  const processSteps = PROCESS[page.process] || PROCESS.seo;
  const comparisonRows = (page.cmp || []).concat([REPORT_ROW]);

  const proofCards = [
    { name: "Tesla Solar", stat: "+40%", label: "pre-orders against target" },
    { name: "Microsoft", stat: "+30%", label: "engagement" },
    { name: "Subway", stat: "+25%", label: "footfall" },
    { name: "AI search", stat: "+586%", label: "traffic from AI sources" },
  ];

  return (
    <div className="s-more" id="bx-more">
      <div>
        {/* Section 1: Inclusions */}
        <section className="s-block">
          <h2 data-fxw="">What we fix across SEO, AEO and GEO</h2>
          <p className="s-intro">
            Our {page.name} service is made of four connected pieces. Each one has a clear owner, a clear output and a clear link to revenue.
          </p>
          <ul className="s-gcards">
            {page.incl.map((x, i) => (
              <li key={i} className="s-glass">
                <h3>{x[0]}</h3>
                <p>{x[1]}</p>
              </li>
            ))}
          </ul>
          <div className="s-after">
            <p>
              Need all four, or just one? We scope {page.name} around your biggest gap, so you only pay for what moves the numbers.
            </p>
            <a className="s-btn s-btn-a" href="#bx-close">
              Scope my plan →
            </a>
          </div>
        </section>

        {/* Section 2: Pain points */}
        <section className="s-block">
          <h2 data-fxw="">Sound familiar?</h2>
          <p className="s-intro">
            These are the problems we hear most often from teams looking for {page.name} help, and how we solve each one.
          </p>
          <ul className="s-gcards">
            {page.pains.map((x, i) => (
              <li key={i} className="s-glass">
                <h3>{x[0]}</h3>
                <p>
                  <small>The fix</small>
                  {x[1]}
                </p>
              </li>
            ))}
          </ul>
          <div className="s-after">
            <p>
              Recognize one of these? Most of them show up clearly in a free audit, along with the fastest way to fix them.
            </p>
            <a className="s-btn s-btn-a" href="#bx-close">
              Diagnose my site →
            </a>
          </div>
        </section>

        {/* Section 3: Comparison table */}
        <section className="s-block">
          <h2 data-fxw="">Typical agency vs. Beetrix360</h2>
          <p className="s-intro">
            Choosing {isAn ? "an " : "a "} {page.name} partner comes down to how the work is done and what gets measured.
          </p>
          <div className="s-tablewrap s-glass" data-rv="">
            <table className="s-table">
              <thead>
                <tr>
                  <th scope="col" />
                  <th scope="col">Typical agency</th>
                  <th scope="col">Beetrix360</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((r, i) => (
                  <tr key={i}>
                    <th scope="row">{r[0]}</th>
                    <td>{r[1]}</td>
                    <td>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="fx-inline" data-rv="">
            <p>
              Still reading? <b>Your rival may already be the answer.</b>
            </p>
            <a className="s-btn s-btn-a" href="#bx-close">
              Take the answer back
            </a>
          </div>
        </section>

        {/* Section 4: Process */}
        <section className="s-block">
          <h2 data-fxw="">How our {page.name} process works</h2>
          <p className="s-intro">
            The same disciplined method runs behind every engagement, so you always know what is happening and why.
          </p>
          <ul className="s-gcards">
            {processSteps.map((x, i) => (
              <li key={i} className="s-glass">
                <small>Step 0{i + 1}</small>
                <h3>{x[0]}</h3>
                <p>{x[1]}</p>
              </li>
            ))}
          </ul>
          <div className="s-after">
            <p>Step one is free. Share your domain and we will show you where to begin.</p>
            <a className="s-btn s-btn-a" href="#bx-close">
              Start step one →
            </a>
          </div>
        </section>

        {/* Section 5: Rollout */}
        <section className="s-block">
          <h2 data-fxw="">Live in 90 days</h2>
          <p className="s-intro">
            A fixed, four-phase rollout. You see progress every week, your data never trains public AI, and a self-hosted LLM option is available.
          </p>
          <ul className="s-gcards">
            {ROLLOUT.map((x, i) => (
              <li key={i} className="s-glass">
                <small>{x[0]}</small>
                <h3>{x[1]}</h3>
                <p>{x[2]}</p>
              </li>
            ))}
          </ul>
          <div className="s-after">
            <p>
              The sooner day one starts, the sooner your first fixes go live. We can usually begin with your audit right away.
            </p>
            <a className="s-btn s-btn-a" href="#bx-close">
              Book my kickoff call →
            </a>
          </div>
        </section>

        {/* Section 6: Proof */}
        <section className="s-block">
          <h2 data-fxw="">Proof, not promises</h2>
          <p className="s-intro">
            Beetrix360 has generated more than $10B in pipeline and processed 24.8M leads across 55+ industries.
          </p>
          <ul className="s-gcards">
            {proofCards.map((x, i) => (
              <li key={i} className="s-glass">
                <small>{x.name}</small>
                <h3 className="g-num">{x.stat}</h3>
                <p>{x.label}</p>
              </li>
            ))}
          </ul>
          <div className="s-after">
            <p>
              Want results like these for your own pipeline? Let&apos;s map what {page.name} could add.
            </p>
            <a className="s-btn s-btn-a" href="#bx-close">
              Get my growth plan →
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

