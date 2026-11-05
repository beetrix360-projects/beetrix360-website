"use client";

import React, { useState } from "react";
import { PageData } from "../data";

interface Props {
  page: PageData;
}

export function ScoreSection({ page }: Props) {
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState("");

  const questions = [
    { k: "SEO", title: "SEO", q: "Do you rank on page one for your top buying keyword?" },
    { k: "AEO", title: "AEO", q: "Do you own the direct answer for your main buyer question?" },
    { k: "GEO", title: "GEO", q: "Do ChatGPT, Perplexity or AI Overviews cite you in your category?" },
    { k: "LLMO", title: "LLMO", q: "Do AI models describe what you do correctly?" },
  ];

  const keys = ["SEO", "AEO", "GEO", "LLMO"];
  const done = keys.filter((k) => k in answers);
  const yes = done.filter((k) => answers[k]);
  const gaps = done.filter((k) => !answers[k]);

  const scoreText = `${yes.length}/4`;
  const strokeOffset = 100 - yes.length * 25;

  let msgText = "Answer all four to see your gap.";
  let goText = "Show me my gap";

  if (done.length < 4) {
    msgText = `${4 - done.length} to go.`;
    goText = "Show me my gap";
  } else if (gaps.length === 0) {
    msgText = "Strong on all four. Now defend it and prove the revenue.";
    goText = "Audit what's still leaking";
  } else {
    msgText = `Your gap: ${gaps.join(", ")}. Rivals can take those answers.`;
    goText = `Fix my ${gaps.join(" + ")}`;
  }

  const promptText = `"${page.q}"`;

  const handleCopy = () => {
    const textToCopy = page.q;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).then(
        () => setCopied("Copied. Paste it into ChatGPT."),
        () => setCopied("Select the text above to copy it.")
      );
    } else {
      setCopied("Select the text above to copy it.");
    }
  };

  return (
    <section className="fx-score" id="bx-score">
      <div className="fx-wrap">
        <div className="fx-left" data-rv="">
          <p className="fx-eyebrow">20-second self-check</p>
          <h2 data-fxw="">Which one is leaking: SEO, AEO, GEO or LLMO?</h2>
          <p className="fx-lead">Answer four questions. We&apos;ll show your gap and what to fix first.</p>
          <p className="fx-lead" id="fx-extra" />
          <div className="fx-try">
            <small>Now try this in ChatGPT</small>
            <p id="fx-prompt">{promptText}</p>
            <button className="s-btn s-btn-b s-glass" type="button" id="fx-copy" onClick={handleCopy}>
              Copy this prompt
            </button>
            <span id="fx-copied" role="status">
              {copied}
            </span>
          </div>
        </div>

        <div className="fx-card s-glass" data-rv="" data-tilt="">
          <ul id="fx-qs">
            {questions.map((item) => (
              <li key={item.k} data-k={item.k}>
                <div>
                  <b>{item.title}</b>
                  <p>{item.q}</p>
                </div>
                <span>
                  <button
                    type="button"
                    data-a="1"
                    aria-pressed={answers[item.k] === true}
                    onClick={() => setAnswers((prev) => ({ ...prev, [item.k]: true }))}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    data-a="0"
                    aria-pressed={answers[item.k] === false}
                    onClick={() => setAnswers((prev) => ({ ...prev, [item.k]: false }))}
                  >
                    No
                  </button>
                </span>
              </li>
            ))}
          </ul>

          <div className="fx-res">
            <div className="fx-ring">
              <svg viewBox="0 0 80 80" aria-hidden="true">
                <circle cx="40" cy="40" r="34" />
                <circle
                  id="fx-arc"
                  cx="40"
                  cy="40"
                  r="34"
                  pathLength="100"
                  style={{ strokeDashoffset: strokeOffset }}
                />
              </svg>
              <b id="fx-n">{scoreText}</b>
            </div>
            <div>
              <p id="fx-msg" role="status">
                {msgText}
              </p>
              <a className="s-btn s-btn-a fx-go" id="fx-go" href="#bx-close">
                {goText}
              </a>
            </div>
          </div>

          <small className="fx-note">
            Based only on your answers. It is not a scan of your site.{" "}
            <a href="#bx-close">Want the real scan? Get the free audit →</a>
          </small>
        </div>
      </div>
    </section>
  );
}

