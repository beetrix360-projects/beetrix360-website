import React from "react";

interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

interface ProcessSectionProps {
  title?: string;
  headingLevel?: "h2" | "h3";
  steps?: ProcessStep[];
  placeholder?: boolean;
  isAdmin?: boolean;
}

export function ProcessSection({
  title = "Our Execution Framework",
  headingLevel = "h2",
  steps = [],
  placeholder,
  isAdmin = false,
}: ProcessSectionProps) {
  // If not admin, filter out steps with bracketed text
  const visibleSteps = isAdmin
    ? steps
    : steps.filter(
        (st) =>
          !st.title?.includes("[") &&
          !st.title?.includes("]") &&
          !st.description?.includes("[") &&
          !st.description?.includes("]")
      );

  if (visibleSteps.length === 0) {
    return null;
  }

  if (!isAdmin && title && (title.includes("[") || title.includes("]"))) {
    return null;
  }

  const HeadingTag = headingLevel;

  return (
    <section className="py-12 border-b border-neutral-100 last:border-b-0">
      <div>
        <HeadingTag className="text-2xl sm:text-3xl font-heading font-bold mb-8 text-bx-dark">
          {title}
        </HeadingTag>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleSteps.map((st) => {
            const hasBracket =
              st.title?.includes("[") ||
              st.title?.includes("]") ||
              st.description?.includes("[") ||
              st.description?.includes("]");

            return (
              <div
                key={st.step}
                className={`p-6 rounded-2xl border shadow-sm relative overflow-hidden ${
                  hasBracket
                    ? "bg-amber-50/60 border-amber-300"
                    : "bg-white border-neutral-200/80"
                }`}
              >
                <div className="text-4xl font-extrabold font-heading text-neutral-100 absolute top-4 right-4 select-none pointer-events-none">
                  0{st.step}
                </div>
                <div
                  className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-sm mb-4 ${
                    hasBracket
                      ? "bg-amber-200 text-amber-900"
                      : "bg-bx-pink/10 text-bx-pink"
                  }`}
                >
                  {st.step}
                </div>
                <h3
                  className={`font-heading font-bold text-lg mb-2 ${
                    hasBracket ? "text-amber-950 font-mono text-base" : "text-neutral-900"
                  }`}
                >
                  {st.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed text-left ${
                    hasBracket ? "text-amber-800 font-mono" : "text-neutral-600"
                  }`}
                >
                  {st.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
