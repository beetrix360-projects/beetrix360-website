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
}

export function ProcessSection({
  title = "Our Execution Framework",
  headingLevel = "h2",
  steps = [],
  placeholder,
}: ProcessSectionProps) {
  const HeadingTag = headingLevel;

  return (
    <section className="py-12 border-b border-neutral-100 last:border-b-0">
      <div>
        <HeadingTag className="text-2xl sm:text-3xl font-heading font-bold mb-8 text-bx-dark">
          {title}
        </HeadingTag>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st) => (
            <div
              key={st.step}
              className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-sm relative overflow-hidden"
            >
              <div className="text-4xl font-extrabold font-heading text-neutral-100 absolute top-4 right-4 select-none pointer-events-none">
                0{st.step}
              </div>
              <div className="w-8 h-8 rounded-full bg-bx-pink/10 text-bx-pink font-bold flex items-center justify-center text-sm mb-4">
                {st.step}
              </div>
              <h3 className="font-heading font-bold text-lg text-neutral-900 mb-2">
                {st.title}
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {st.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

