import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CtaSectionProps {
  title?: string;
  headingLevel?: "h2" | "h3";
  text?: string;
  buttonLabel?: string;
  buttonPath?: string;
  placeholder?: boolean;
}

export function CtaSection({
  title = "Ready to Engineer Your Revenue Growth?",
  headingLevel = "h2",
  text = "Partner with Beetrix360 to deploy measurable, enterprise-grade digital systems and AI architectures.",
  buttonLabel = "Request Strategic Proposal",
  buttonPath = "/get-a-proposal",
  placeholder,
}: CtaSectionProps) {
  const HeadingTag = headingLevel;

  return (
    <section className="py-16 sm:py-20">
      <div className="relative rounded-3xl bg-bx-dark text-white p-8 sm:p-12 lg:p-16 overflow-hidden shadow-xl">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-bx-pink/20 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative max-w-2xl">
          <HeadingTag className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight leading-tight">
            {title}
          </HeadingTag>
          <p className="mt-4 text-base sm:text-lg text-neutral-300 leading-relaxed">
            {text}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href={buttonPath}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-bx-pink text-white font-semibold text-sm hover:bg-bx-pink/90 transition shadow-md"
            >
              {buttonLabel} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 text-white border border-white/20 font-semibold text-sm hover:bg-white/20 transition"
            >
              Schedule Strategy Call
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

