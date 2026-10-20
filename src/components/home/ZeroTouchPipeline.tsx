import { AccentHeadingText, CtaBand, Eyebrow } from "@/components/ui";
import { accentTile } from "@/lib/accents";
import type { HomepageContent } from "@/lib/types";

type PipelineProps = {
  p: HomepageContent["pipeline"];
};

const PAD = "px-5 sm:px-8 lg:px-12 2xl:px-20";

export function ZeroTouchPipeline({ p }: PipelineProps) {
  const d = "M125 60 C 250 0, 250 120, 375 60 S 500 0, 625 60 S 750 120, 875 60";
  return (
    <section id="pipeline" aria-labelledby="pipeline-title" className={`py-20 sm:py-28 lg:py-36 ${PAD}`}>
      <div className="w-full mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <Eyebrow eyebrow={p.eyebrow} />
          <h2 id="pipeline-title" data-split="" className="font-heading font-extrabold text-4xl sm:text-6xl 2xl:text-7xl tracking-tight mt-4">
            <AccentHeadingText heading={p.heading} />
          </h2>
          <p data-reveal="" className="text-neutral-600 mt-4">{p.intro}</p>
        </div>

        <div id="pipeline-viz" className="relative mt-16">
          <svg id="pipe-svg" viewBox="0 0 1000 120" className="hidden lg:block absolute top-0 left-0 w-full h-[120px] overflow-visible" aria-hidden="true">
            <path d={d} fill="none" stroke="#E5E7EB" strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" />
            <path id="pipe-path" d={d} fill="none" stroke="url(#pipe-grad)" strokeWidth="4" strokeLinecap="round" />
            <defs>
              <linearGradient id="pipe-grad" x1="0" x2="1">
                <stop offset="0" stopColor="#3ABEF9" />
                <stop offset=".35" stopColor="#DE2056" />
                <stop offset=".7" stopColor="#2CB383" />
                <stop offset="1" stopColor="#FAB12F" />
              </linearGradient>
            </defs>
            <circle id="pipe-dot" cx="125" cy="60" r="9" fill="#0A0A0A" stroke="#fff" strokeWidth="3" />
          </svg>

          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:pt-0 relative">
            {p.stages.map((s) => (
              <li className="pnode text-center" key={s.title}>
                <div className="pdot mx-auto w-[120px] h-[120px] rounded-full bg-white border border-bx-border shadow-elevated flex items-center justify-center relative z-10">
                  <span className={`w-16 h-16 rounded-full ${accentTile[s.accent]} flex items-center justify-center text-2xl`}>
                    <i className={s.icon} aria-hidden="true" />
                  </span>
                </div>
                <p className="font-mono text-[11px] text-neutral-400 mt-6">{s.label}</p>
                <h3 className="font-heading font-bold text-xl mt-1">{s.title}</h3>
                <p className="text-sm text-neutral-500 mt-2 max-w-[220px] mx-auto">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <CtaBand band={p.ctaBand} />
    </section>
  );
}
