import React from "react";
import { AlertCircle } from "lucide-react";

interface ProofPlaceholderSectionProps {
  title?: string;
  headingLevel?: "h2" | "h3";
  notice?: string;
  placeholder?: boolean;
}

export function ProofPlaceholderSection({
  title = "Verified Performance & Case Studies",
  headingLevel = "h2",
  notice = "[Add verified client case studies, verified ROI metrics, and industry accolades]",
  placeholder,
}: ProofPlaceholderSectionProps) {
  const HeadingTag = headingLevel;

  return (
    <section className="py-12 border-b border-neutral-100 last:border-b-0">
      <div className="max-w-4xl">
        <HeadingTag className="text-2xl sm:text-3xl font-heading font-bold mb-6 text-bx-dark">
          {title}
        </HeadingTag>
        <div className="p-8 rounded-2xl bg-amber-50/50 border border-dashed border-amber-300 text-amber-900 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-heading font-bold text-base text-amber-950">
              Verified Evidence Notice
            </h3>
            <p className="font-mono text-sm leading-relaxed text-amber-800">
              {notice}
            </p>
            <p className="text-xs text-amber-700/80">
              Beetrix360 editorial standard: Zero fabricated client metrics. Case studies are populated through Admin Studio once client authorization is obtained.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
