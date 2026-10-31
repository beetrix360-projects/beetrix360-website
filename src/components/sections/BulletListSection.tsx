import React from "react";
import { CheckCircle2 } from "lucide-react";

interface BulletListSectionProps {
  title?: string;
  headingLevel?: "h2" | "h3";
  items?: string[];
  placeholder?: boolean;
}

export function BulletListSection({
  title,
  headingLevel = "h2",
  items = [],
  placeholder,
}: BulletListSectionProps) {
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
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-4 rounded-xl bg-white border border-neutral-200/80 shadow-sm"
            >
              <CheckCircle2 className="w-5 h-5 text-bx-pink shrink-0 mt-0.5" />
              <span className="text-sm sm:text-base text-neutral-800 font-medium leading-snug">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
