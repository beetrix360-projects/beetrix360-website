"use client";

import React, { useState, useEffect } from "react";

export function FloatingBar() {
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      if (dismissed) {
        setVisible(false);
        return;
      }

      const y = window.scrollY;
      const innerHeight = window.innerHeight;
      let hide = y < innerHeight * 0.8;

      const closeEl = document.getElementById("bx-close");
      if (closeEl) {
        const r = closeEl.getBoundingClientRect();
        if (r.top < innerHeight * 0.7) hide = true;
      }

      const scoreEl = document.getElementById("bx-score");
      if (scoreEl) {
        const sc = scoreEl.getBoundingClientRect();
        if (sc.top < innerHeight * 0.6 && sc.bottom > innerHeight * 0.4) hide = true;
      }

      if (window.innerWidth < 769) {
        ["#fx-guide", "#bx-faq"].forEach((q) => {
          const el = document.querySelector(q);
          if (el) {
            const g = el.getBoundingClientRect();
            if (g.top < innerHeight && g.bottom > 0) hide = true;
          }
        });
      }

      setVisible(!hide);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [dismissed]);

  if (dismissed || !visible) return null;

  return (
    <div className="fx-bar" id="fx-bar">
      <span>
        Is AI naming <b>you</b> or your rival?
      </span>
      <a href="#bx-score">Find out in 20s</a>
      <button
        type="button"
        id="fx-x"
        aria-label="Dismiss"
        onClick={() => setDismissed(true)}
      >
        ×
      </button>
    </div>
  );
}

