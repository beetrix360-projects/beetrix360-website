import { AccentHeadingText, ArrowCta, Eyebrow, Ph } from "@/components/ui";
import { accentDot, accentTile, pillarButtonHover, pillarRibbon } from "@/lib/accents";
import type { HomepageContent } from "@/lib/types";
import { PillarVisualBlock } from "./PillarVisuals";

type PillarsProps = {
  p: HomepageContent["pillars"];
};

const PAD = "px-5 sm:px-8 lg:px-12 2xl:px-20";

export function FourPillars({ p }: PillarsProps) {
  const tops = ["88px", "102px", "116px", "130px"];

  return (
    <section
      id="pillars"
      aria-labelledby="pillars-title"
      className="relative bg-bx-surface border-y border-bx-border py-20 lg:py-0 lg:h-screen lg:flex lg:items-center lg:overflow-hidden"
    >
      <div className={`w-full mx-auto ${PAD} grid lg:grid-cols-12 gap-10 lg:gap-14 items-center`}>
        <div className="lg:col-span-5">
          <Eyebrow eyebrow={p.eyebrow} />
          <h2 id="pillars-title" data-split="" className="font-heading font-extrabold text-4xl sm:text-6xl 2xl:text-7xl tracking-tight leading-[1.05] mt-4">
            <AccentHeadingText heading={p.heading} />
          </h2>
          <p className="text-neutral-600 mt-4 max-w-sm">{p.intro}</p>

          <ol id="stack-steps" className="hidden lg:block mt-8 space-y-2">
            {p.cards.map((c, i) => (
              <li key={c.number}>
                <button type="button" data-step={i} className="step w-full text-left flex items-center gap-4 p-3 rounded-xl border border-transparent transition-all">
                  <span className={`w-9 h-9 rounded-lg ${accentTile[c.accent]} flex items-center justify-center text-sm shrink-0`}>
                    <i className={c.stepIcon} aria-hidden="true" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-heading font-bold">{c.title}</span>
                    <span className="block h-1 mt-2 rounded-full bg-bx-border overflow-hidden">
                      <span className={`sfill block h-full ${accentDot[c.accent]} origin-left`} style={{ transform: `scaleX(${i === 0 ? 1 : 0})` }} />
                    </span>
                  </span>
                  <span className="font-mono text-[10px] text-neutral-400">{c.number}</span>
                </button>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ArrowCta cta={p.button.cta} className="bg-bx-dark hover:bg-bx-blue hover:text-bx-dark" circle="bg-white/15">
              {p.button.label}
            </ArrowCta>
            <a href={p.link.href} className="text-sm font-semibold underline underline-offset-4 decoration-bx-blue decoration-2 hover:text-bx-blue">
              {p.link.label}
            </a>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div id="stack" className="relative lg:h-[600px]">
            {p.cards.map((c, i) => {
              const ph = (
                <Ph key="ph" icon={c.placeholder.icon} lines={c.placeholder.lines} className="col-span-3 rounded-2xl" />
              );
              const vis = <PillarVisualBlock key="vis" visual={c.visual} />;
              return (
                <article
                  key={c.number}
                  className={`stack-card bx-frame ${pillarRibbon[c.accent]} max-lg:sticky max-lg:top-[var(--t)] ${i < p.cards.length - 1 ? "max-lg:mb-8" : ""} lg:absolute lg:inset-0`}
                  style={{ ["--t" as string]: tops[i] ?? "130px" }}
                >
                  <div className="pc-inner h-full p-5 sm:p-9 flex flex-col">
                    <div className="flex items-start justify-between">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-bx-border text-xs font-bold">
                        <span className={`w-2 h-2 rounded-full ${accentDot[c.accent]}`} />
                        {c.tag}
                      </span>
                      <span className="outline-num" aria-hidden="true">{c.number}</span>
                    </div>
                    <h3 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight -mt-2">{c.title}</h3>
                    <p className="text-neutral-500 mt-2">{c.text}</p>
                    <div className="grid grid-cols-5 gap-3 sm:gap-4 mt-5 sm:mt-6 flex-1 min-h-[140px] sm:min-h-[170px]">
                      {c.visualFirst ? [vis, ph] : [ph, vis]}
                    </div>
                    <ul className="flex flex-wrap gap-2 mt-5">
                      {c.chips.map((chip) => (
                        <li key={chip} className="px-3 py-1.5 rounded-full bg-bx-surface border border-bx-border text-xs font-medium">
                          {chip}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-5 pt-5 border-t border-bx-border flex items-center justify-between gap-3">
                      <span className="font-mono text-[11px] text-neutral-400">{c.footer}</span>
                      <button
                        type="button"
                        data-cta={c.cta}
                        className={`btn-shine group inline-flex items-center gap-2 bg-bx-dark ${pillarButtonHover[c.accent]} text-white text-xs font-semibold px-4 py-2.5 rounded-full transition-colors`}
                      >
                        {c.button} <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
