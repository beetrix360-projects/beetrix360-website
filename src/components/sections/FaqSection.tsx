"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  title?: string;
  headingLevel?: "h2" | "h3";
  items?: FaqItem[];
  placeholder?: boolean;
}

export function FaqSection({
  title = "Frequently Asked Questions",
  headingLevel = "h2",
  items = [],
  placeholder,
}: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const HeadingTag = headingLevel;

  return (
    <section className="py-12 border-b border-neutral-100 last:border-b-0">
      <div className="max-w-4xl">
        <HeadingTag className="text-2xl sm:text-3xl font-heading font-bold mb-8 text-bx-dark">
          {title}
        </HeadingTag>
        <div className="space-y-4">
          {items.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-sm transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-5 text-left font-heading font-semibold text-neutral-900 flex items-center justify-between gap-4 hover:bg-neutral-50/80 transition"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg">{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-bx-pink" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-2 text-sm sm:text-base text-neutral-600 leading-relaxed border-t border-neutral-100">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
