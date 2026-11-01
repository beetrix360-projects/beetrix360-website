import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface BulletListSectionProps {
  title?: string;
  headingLevel?: "h2" | "h3";
  items?: string[];
  placeholder?: boolean;
  isAdmin?: boolean;
}

export function BulletListSection({
  title,
  headingLevel = "h2",
  items = [],
  placeholder,
  isAdmin = false,
}: BulletListSectionProps) {
  // If not admin, filter out items containing brackets
  const visibleItems = isAdmin
    ? items
    : items.filter((it) => typeof it === "string" && !it.includes("[") && !it.includes("]"));

  if (visibleItems.length === 0) {
    return null;
  }

  // If section title contains brackets and user is not admin, hide entire section
  if (!isAdmin && title && (title.includes("[") || title.includes("]"))) {
    return null;
  }

  const HeadingTag = headingLevel;

  return (
    <section className="py-12 border-b border-neutral-100 last:border-b-0">
      <div className="max-w-4xl">
        {title && (
          <HeadingTag className="text-2xl sm:text-3xl font-heading font-bold mb-6 text-bx-dark">
            {title}
          </HeadingTag>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {visibleItems.map((item, idx) => {
            const hasBracket = item.includes("[") || item.includes("]");
            return (
              <div
                key={idx}
                className={`flex items-start gap-3 p-4 rounded-xl border shadow-sm ${
                  hasBracket
                    ? "bg-amber-50/60 border-amber-300 text-amber-900"
                    : "bg-white border-neutral-200/80 text-neutral-800"
                }`}
              >
                {hasBracket ? (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-bx-pink shrink-0 mt-0.5" />
                )}
                <span className={`text-sm sm:text-base font-medium leading-snug ${hasBracket ? "font-mono" : ""}`}>
                  {item}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
