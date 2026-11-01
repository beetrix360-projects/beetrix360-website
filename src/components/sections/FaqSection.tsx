"use client";

import React, { useState } from "react";
import { ChevronDown, AlertCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  title?: string;
  headingLevel?: "h2" | "h3";
  items?: FaqItem[];
  placeholder?: boolean;
  isAdmin?: boolean;
}

export function FaqSection({
  title = "Frequently Asked Questions",
  headingLevel = "h2",
  items = [],
  placeholder,
  isAdmin = false,
}: FaqSectionProps) {
  // If not admin, omit any FAQ item that has a bracketed question or answer
  const visibleItems = isAdmin
    ? items
    : items.filter(
        (it) =>
          !it.question?.includes("[") &&
          !it.question?.includes("]") &&
          !it.answer?.includes("[") &&
          !it.answer?.includes("]")
      );

  if (visibleItems.length === 0) {
    return null;
  }

  if (!isAdmin && title && (title.includes("[") || title.includes("]"))) {
    return null;
  }

  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const HeadingTag = headingLevel;

  return (
    <section className="py-12 border-b border-neutral-100 last:border-b-0">
      <div className="max-w-4xl">
        <HeadingTag className="text-2xl sm:text-3xl font-heading font-bold mb-8 text-bx-dark">
          {title}
        </HeadingTag>
        <div className="space-y-4">
          {visibleItems.map((item, idx) => {
            const isOpen = openIndex === idx;
            const hasBracket =
              item.question?.includes("[") ||
              item.question?.includes("]") ||
              item.answer?.includes("[") ||
              item.answer?.includes("]");

            return (
              <div
                key={idx}
                className={`border rounded-2xl overflow-hidden shadow-sm transition ${
                  hasBracket
                    ? "border-amber-300 bg-amber-50/30"
                    : "border-neutral-200 bg-white"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className={`w-full px-6 py-5 text-left font-heading font-semibold flex items-center justify-between gap-4 transition ${
                    hasBracket
                      ? "text-amber-950 hover:bg-amber-100/50"
                      : "text-neutral-900 hover:bg-neutral-50/80"
                  }`}
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg flex items-center gap-2">
                    {hasBracket && (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-bx-pink" : ""
                    }`}
                  />
                </button>
                <div
                  className={`px-6 pb-6 pt-2 text-sm sm:text-base leading-relaxed border-t ${
                    hasBracket
                      ? "text-amber-900 border-amber-200 font-mono text-sm"
                      : "text-neutral-600 border-neutral-100"
                  } ${isOpen ? "block" : "hidden"}`}
                >
                  <p>{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
