import React from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";

interface ProofPlaceholderSectionProps {
  title?: string;
  headingLevel?: "h2" | "h3";
  notice?: string;
  text?: string;
  placeholder?: boolean;
  isAdmin?: boolean;
}

export function ProofPlaceholderSection({
  title = "Work Relevant to Your Project",
  headingLevel = "h2",
  notice,
  text,
  placeholder,
  isAdmin = false,
}: ProofPlaceholderSectionProps) {
  // If this is a raw bracketed placeholder notice
  if (notice && notice.includes("[")) {
    if (!isAdmin) {
      return null;
    }
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
                Evidence Notice
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

  // Neutral "Want to see work relevant to your project? Ask us for examples." block linking to /contact and /get-a-proposal
  const HeadingTag = headingLevel;
  const descriptionText =
    text ||
    "Want to see work relevant to your project? Ask us for examples.";

  return (
    <section className="py-12 border-b border-neutral-100 last:border-b-0">
      <div className="max-w-4xl">
        <HeadingTag className="text-2xl sm:text-3xl font-heading font-bold mb-4 text-bx-dark">
          {title}
        </HeadingTag>
        <p className="text-base sm:text-lg text-neutral-700 leading-relaxed mb-6">
          {descriptionText}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-medium text-sm transition-colors"
          >
            <span>Contact Us</span>
            <ArrowRight className="w-4 h-4 text-neutral-500" />
          </Link>
          <Link
            href="/get-a-proposal"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-bx-dark hover:bg-neutral-800 text-white font-medium text-sm transition-colors shadow-sm"
          >
            <span>Get a Proposal</span>
            <ArrowRight className="w-4 h-4 text-neutral-300" />
          </Link>
        </div>
      </div>
    </section>
  );
}
