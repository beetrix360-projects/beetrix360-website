import { Count, CtaBand, Eyebrow, Ph, Split } from "@/components/ui";
import { accentDot, caseNumber } from "@/lib/accents";
import type { HomepageContent } from "@/lib/types";

type ProofProps = {
  w: HomepageContent["work"];
};

const PAD = "px-5 sm:px-8 lg:px-12 2xl:px-20";

export function ProofSection({ w }: ProofProps) {
  return (
    <section id="work" aria-labelledby="work-title" className={`py-20 sm:py-28 lg:py-36 ${PAD}`}>
      <div className="w-full mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div>
            <Eyebrow eyebrow={w.eyebrow} />
            <h2 id="work-title" data-split="" className="font-heading font-extrabold text-4xl sm:text-6xl 2xl:text-7xl tracking-tight mt-4">
              <Split text={w.heading} />
            </h2>
          </div>
          <button
            type="button"
            data-cta={w.allButton.cta}
            className="magnetic inline-flex items-center gap-2 text-sm font-semibold border border-bx-border hover:border-bx-dark rounded-full px-5 py-3 transition-colors"
          >
            {w.allButton.label} <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
          </button>
        </div>

        <div data-stagger="" className="grid md:grid-cols-3 gap-6 mt-12">
          {w.cases.map((cs) => (
            <article key={cs.title} data-tilt="" className="group rounded-[24px] border border-bx-border bg-white overflow-hidden shadow-ambient">
              <Ph lines={[cs.placeholder]} className="aspect-[4/3] border-0 rounded-none" />
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-neutral-400">{cs.category}</span>
                  <span className={`w-2 h-2 rounded-full ${accentDot[cs.accent]}`} />
                </div>
                <Count stat={cs} className={`font-heading font-extrabold text-5xl mt-3 ${caseNumber[cs.accent]}`} />
                <h3 className="font-semibold mt-1">{cs.title}</h3>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading font-bold text-xl">{w.realEstate.title}</h3>
            <div className="flex gap-2">
              <button type="button" id="re-prev" className="w-10 h-10 rounded-full border border-bx-border hover:border-bx-dark" aria-label="Previous">
                <i className="fa-solid fa-arrow-left text-xs" aria-hidden="true" />
              </button>
              <button type="button" id="re-next" className="w-10 h-10 rounded-full border border-bx-border hover:border-bx-dark" aria-label="Next">
                <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div id="re-strip" className="no-scrollbar flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2 cursor-grab">
            {w.realEstate.items.map((it) => (
              <figure key={it.name} className="snap-start shrink-0 w-[260px] sm:w-[320px]">
                <Ph lines={[w.realEstate.placeholder]} className="aspect-[3/4] rounded-2xl" />
                <figcaption className="mt-3 flex items-center justify-between text-sm">
                  <span className="font-semibold">{it.name}</span>
                  <span className="font-mono text-[11px] text-neutral-400">{it.location}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
      <CtaBand band={w.ctaBand} />
    </section>
  );
}
