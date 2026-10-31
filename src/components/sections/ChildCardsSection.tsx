import React from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

interface ChildCard {
  name: string;
  path: string;
  targetKeyword?: string;
  menuLabel?: string;
}

interface ChildCardsSectionProps {
  title?: string;
  headingLevel?: "h2" | "h3";
  subtitle?: string;
  cards?: ChildCard[];
  placeholder?: boolean;
}

export function ChildCardsSection({
  title = "Core Capabilities & Modules",
  headingLevel = "h2",
  subtitle,
  cards = [],
  placeholder,
}: ChildCardsSectionProps) {
  if (cards.length === 0) return null;

  const HeadingTag = headingLevel;

  return (
    <section className="py-12 border-b border-neutral-100 last:border-b-0">
      <div>
        <HeadingTag className="text-2xl sm:text-3xl font-heading font-bold mb-2 text-bx-dark">
          {title}
        </HeadingTag>
        {subtitle && (
          <p className="text-neutral-600 text-base sm:text-lg mb-8 max-w-2xl">
            {subtitle}
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link
              key={card.path}
              href={card.path}
              className="group p-6 rounded-2xl bg-white border border-neutral-200/80 hover:border-bx-pink/40 hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div>
                <h3 className="font-heading font-bold text-lg text-neutral-900 group-hover:text-bx-pink transition flex items-center justify-between">
                  {card.name}
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-bx-pink group-hover:translate-x-1 transition" />
                </h3>
                {card.targetKeyword && (
                  <p className="mt-2 text-xs font-mono uppercase tracking-wider text-neutral-400">
                    {card.targetKeyword}
                  </p>
                )}
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center text-xs font-semibold text-bx-pink gap-1">
                Explore discipline <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

