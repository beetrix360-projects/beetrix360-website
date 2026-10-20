import { AccentHeadingText, ArrowCta, Eyebrow } from "@/components/ui";
import { accentText } from "@/lib/accents";
import type { HomepageContent } from "@/lib/types";

type CompareProps = {
  c: HomepageContent["compare"];
};

const PAD = "px-5 sm:px-8 lg:px-12 2xl:px-20";

export function CompareSlider({ c }: CompareProps) {
  return (
    <section id="compare" aria-labelledby="compare-title" className={`py-20 sm:py-28 lg:py-36 ${PAD} bg-bx-surface`}>
      <div className="w-full mx-auto">
        <div className="text-center">
          <Eyebrow eyebrow={c.eyebrow} />
          <h2 id="compare-title" data-split="" className="font-heading font-extrabold text-4xl sm:text-6xl 2xl:text-7xl tracking-tight mt-4">
            <AccentHeadingText heading={c.heading} />
          </h2>
        </div>

        <div data-reveal="" className="compare relative mt-12 rounded-[28px] overflow-hidden border border-bx-border shadow-elevated select-none">
          <div className="bg-white p-6 sm:p-10">
            <p className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-6">
              <span className="inline-block w-2 h-2 rounded-full bg-neutral-300 mr-2" />
              {c.before.label}
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {c.before.items.map((it) => (
                <div key={it.label} className="flex items-center gap-4 p-4 rounded-2xl bg-bx-surface">
                  <i className={`${it.icon} text-neutral-400 w-6 text-center`} aria-hidden="true" />
                  <div>
                    <p className="text-[10px] font-mono text-neutral-400 uppercase">{it.label}</p>
                    <p className="font-semibold text-neutral-500">{it.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="compare-top absolute inset-0 bg-bx-dark text-white p-6 sm:p-10">
            <p className="text-[11px] font-mono uppercase tracking-wider text-bx-green mb-6">
              <span className="inline-block w-2 h-2 rounded-full bg-bx-green mr-2" />
              {c.after.label}
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {c.after.items.map((it) => (
                <div key={it.label} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <i className={`${it.icon} ${accentText[it.accent]} w-6 text-center`} aria-hidden="true" />
                  <div>
                    <p className="text-[10px] font-mono text-neutral-400 uppercase">{it.label}</p>
                    <p className="font-semibold">{it.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="compare-handle absolute top-0 bottom-0 w-[3px] -ml-[1.5px] bg-bx-pink z-20 pointer-events-none">
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-bx-pink text-white flex items-center justify-center shadow-elevated">
              <i className="fa-solid fa-left-right" aria-hidden="true" />
            </span>
          </div>
          <input id="compare-range" type="range" min="0" max="100" defaultValue="50" aria-label={c.rangeLabel} />
        </div>
      </div>
      <div data-reveal="" className="w-full mx-auto mt-12 text-center">
        <p className="font-heading font-extrabold text-2xl">{c.followUp.title}</p>
        <ArrowCta cta={c.followUp.cta} className="mt-5 bg-bx-green hover:bg-bx-dark">
          {c.followUp.button}
        </ArrowCta>
      </div>
    </section>
  );
}
