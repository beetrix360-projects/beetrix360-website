import { Eyebrow, Split } from "@/components/ui";
import type { HomepageContent } from "@/lib/types";

type RoiProps = {
  r: HomepageContent["roi"];
};

const PAD = "px-5 sm:px-8 lg:px-12 2xl:px-20";

export function RoiCalculator({ r }: RoiProps) {
  const rows = [
    { id: "r-team", input: r.inputs.team, display: String(r.inputs.team.default) },
    { id: "r-share", input: r.inputs.share, display: `${r.inputs.share.default}%` },
    { id: "r-cost", input: r.inputs.cost, display: `$${r.inputs.cost.default}` },
  ];

  return (
    <section id="roi" aria-labelledby="roi-title" className={`py-20 sm:py-28 lg:py-36 ${PAD} bg-bx-surface border-y border-bx-border`}>
      <div className="w-full mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <Eyebrow eyebrow={r.eyebrow} />
          <h2 id="roi-title" data-split="" className="font-heading font-extrabold text-4xl sm:text-6xl 2xl:text-7xl tracking-tight mt-4">
            <Split text={r.heading} />
          </h2>
        </div>

        <div data-reveal="" className="mt-12 grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white border border-bx-border rounded-[24px] p-7 sm:p-10 space-y-8 shadow-ambient">
            {rows.map((row) => (
              <div key={row.id}>
                <div className="flex justify-between text-sm mb-3">
                  <label htmlFor={row.id} className="font-medium text-neutral-600">{row.input.label}</label>
                  <span id={`${row.id}-v`} className="font-mono font-bold">{row.display}</span>
                </div>
                <input id={row.id} className="rng" type="range" min={row.input.min} max={row.input.max} step={row.input.step} defaultValue={row.input.default} />
              </div>
            ))}
            <p className="text-[11px] font-mono text-neutral-400">{r.assumption}</p>
          </div>

          <div className="lg:col-span-5 bg-bx-dark text-white rounded-[24px] p-7 sm:p-10 flex flex-col justify-between gap-8" aria-live="polite">
            <div className="flex items-center gap-6">
              <svg viewBox="0 0 120 120" className="w-28 h-28 -rotate-90 shrink-0" aria-hidden="true">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#222" strokeWidth="12" />
                <circle id="r-ring" cx="60" cy="60" r="52" fill="none" stroke="url(#ring-grad)" strokeWidth="12" strokeLinecap="round" strokeDasharray="326.7" strokeDashoffset="326.7" />
                <defs>
                  <linearGradient id="ring-grad">
                    <stop offset="0" stopColor="#2CB383" />
                    <stop offset="1" stopColor="#3ABEF9" />
                  </linearGradient>
                </defs>
              </svg>
              <div>
                <p className="text-[11px] font-mono uppercase text-neutral-400">{r.hoursLabel}</p>
                <p id="r-hours" className="font-heading font-extrabold text-3xl">0</p>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase text-neutral-400">{r.savingsLabel}</p>
              <p id="r-save" className="font-heading font-extrabold text-5xl text-bx-green mt-1">$0</p>
              <p id="r-fte" data-template={r.fteTemplate} className="text-sm text-neutral-400 mt-2">
                {r.fteTemplate.replace("{fte}", "0")}
              </p>
            </div>
            <button
              type="button"
              data-cta={r.button.cta}
              className="magnetic w-full py-4 bg-bx-pink hover:bg-white hover:text-bx-dark rounded-full font-heading font-semibold text-sm transition-colors"
            >
              {r.button.label}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
