import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface RelatedLink {
  name: string;
  path: string;
  targetKeyword?: string;
}

interface RelatedLinksSectionProps {
  title?: string;
  headingLevel?: "h2" | "h3";
  links?: RelatedLink[];
  placeholder?: boolean;
}

export function RelatedLinksSection({
  title = "Related Disciplines & Capabilities",
  headingLevel = "h2",
  links = [],
  placeholder,
}: RelatedLinksSectionProps) {
  if (links.length === 0) return null;

  const HeadingTag = headingLevel;

  return (
    <section className="py-12 border-b border-neutral-100 last:border-b-0">
      <div>
        <HeadingTag className="text-2xl sm:text-3xl font-heading font-bold mb-6 text-bx-dark">
          {title}
        </HeadingTag>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {links.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className="group p-4 rounded-xl bg-white border border-neutral-200 hover:border-bx-pink/40 hover:shadow-sm transition flex items-center justify-between"
            >
              <div>
                <span className="font-heading font-semibold text-sm text-neutral-800 group-hover:text-bx-pink transition">
                  {link.name}
                </span>
                {link.targetKeyword && (
                  <p className="text-[11px] font-mono text-neutral-400 uppercase mt-0.5">
                    {link.targetKeyword}
                  </p>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-bx-pink group-hover:translate-x-1 transition shrink-0 ml-2" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

