import React from "react";

interface RichTextSectionProps {
  title?: string;
  headingLevel?: "h2" | "h3";
  paragraphs?: string[];
  placeholder?: boolean;
  isAdmin?: boolean;
}

export function RichTextSection({
  title,
  headingLevel = "h2",
  paragraphs = [],
  placeholder,
  isAdmin = false,
}: RichTextSectionProps) {
  // If not admin, filter out any paragraph containing bracketed placeholder text
  const visibleParagraphs = isAdmin
    ? paragraphs
    : paragraphs.filter((p) => typeof p === "string" && !p.includes("[") && !p.includes("]"));

  if (visibleParagraphs.length === 0) {
    return null;
  }

  // If section title contains bracketed text and user is not admin, hide entire section
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
        <div className="space-y-4 text-base sm:text-lg text-neutral-700 leading-relaxed text-justify">
          {visibleParagraphs.map((p, idx) => {
            const hasBracket = p.includes("[") || p.includes("]");
            return (
              <p
                key={idx}
                className={
                  hasBracket
                    ? "p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-amber-800 font-mono text-sm"
                    : ""
                }
              >
                {p}
              </p>
            );
          })}
        </div>
      </div>
    </section>
  );
}
