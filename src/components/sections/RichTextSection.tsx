import React from "react";

interface RichTextSectionProps {
  title?: string;
  headingLevel?: "h2" | "h3";
  paragraphs?: string[];
  placeholder?: boolean;
}

export function RichTextSection({
  title,
  headingLevel = "h2",
  paragraphs = [],
  placeholder,
}: RichTextSectionProps) {
  const HeadingTag = headingLevel;

  return (
    <section className="py-12 border-b border-neutral-100 last:border-b-0">
      <div className="max-w-4xl">
        {title && (
          <HeadingTag className="text-2xl sm:text-3xl font-heading font-bold mb-6 text-bx-dark">
            {title}
          </HeadingTag>
        )}
        <div className="space-y-4 text-base sm:text-lg text-neutral-700 leading-relaxed">
          {paragraphs.map((p, idx) => (
            <p
              key={idx}
              className={
                p.startsWith("[") && p.endsWith("]")
                  ? "p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-amber-800 font-mono text-sm"
                  : ""
              }
            >
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
