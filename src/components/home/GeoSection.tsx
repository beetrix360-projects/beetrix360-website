import { AccentHeadingText, Count, Eyebrow } from "@/components/ui";
import { accentText } from "@/lib/accents";
import type { HomepageContent } from "@/lib/types";

type GeoProps = {
  g: HomepageContent["geo"];
};

const PAD = "px-5 sm:px-8 lg:px-12 2xl:px-20";

export function GeoSection({ g }: GeoProps) {
  const barClass = ["bg-gradient-to-r from-bx-pink to-bx-yellow", "bg-neutral-500", "bg-neutral-600"];

  return (
    <section id="geo" aria-labelledby="geo-title" className={`relative bg-bx-dark text-white py-20 sm:py-28 lg:py-36 ${PAD} overflow-hidden bg-grid-dark`}>
      <div data-speed="0.8" className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-bx-pink/20 blur-3xl pointer-events-none" />
      <div data-speed="-0.6" className="absolute bottom-0 left-0 w-[360px] h-[360px] rounded-full bg-bx-blue/15 blur-3xl pointer-events-none" />
      <div className="w-full mx-auto relative grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <Eyebrow eyebrow={g.eyebrow} />
          <h2 id="geo-title" data-split="" className="font-heading font-extrabold text-4xl sm:text-6xl 2xl:text-7xl tracking-tight leading-[1.08] mt-4">
            <AccentHeadingText heading={g.heading} />
          </h2>
          <p data-reveal="" className="text-neutral-400 mt-5 max-w-md">{g.intro}</p>

          <div className="grid grid-cols-2 gap-6 mt-10">
            {g.stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <Count stat={s} className={`font-heading font-extrabold text-4xl ${s.accent ? accentText[s.accent] : ""}`} />
                <p className="text-xs text-neutral-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div id="sov" className="mt-8 space-y-3">
            <p className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">{g.shareOfVoice.title}</p>
            {g.shareOfVoice.rows.map((r, i) => (
              <div key={r.label} className={`flex items-center gap-3 text-xs ${i ? "text-neutral-400" : ""}`}>
                <span className={`w-20 shrink-0 ${i ? "" : "font-semibold"}`}>{r.label}</span>
                <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
                  <div className={`sov-bar h-full rounded-full ${barClass[Math.min(i, 2)]}`} data-w={`${r.value}%`} style={{ width: `${r.value}%` }} />
                </div>
                <span className="w-10 text-right font-mono">{r.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* chat mock */}
        <div data-reveal="" className="relative">
          <div className="rounded-[28px] bg-[#111] border border-white/10 shadow-mega overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
              <span className="w-3 h-3 rounded-full bg-bx-pink" />
              <span className="w-3 h-3 rounded-full bg-bx-yellow" />
              <span className="w-3 h-3 rounded-full bg-bx-green" />
              <span className="ml-3 text-[11px] font-mono text-neutral-500">{g.chat.windowLabel}</span>
            </div>
            <div className="p-6 space-y-5 min-h-[340px]">
              <div className="flex justify-end">
                <div className="max-w-[85%] bg-white/10 rounded-2xl rounded-br-md px-4 py-3 text-sm">
                  <span id="chat-q" data-text={g.chat.question}>{g.chat.question}</span>
                  <span id="chat-caret" className="inline-block w-[2px] h-4 bg-bx-pink align-middle ml-0.5 animate-pulse" />
                </div>
              </div>
              <div id="chat-thinking" className="hidden items-center gap-1.5 pl-1">
                <span className="w-2 h-2 rounded-full bg-neutral-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-neutral-500 animate-bounce [animation-delay:.15s]" />
                <span className="w-2 h-2 rounded-full bg-neutral-500 animate-bounce [animation-delay:.3s]" />
              </div>
              <div id="chat-a" className="flex gap-3">
                <span className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-bx-green to-bx-blue flex items-center justify-center text-xs">
                  <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />
                </span>
                <div className="text-sm text-neutral-300 leading-relaxed">
                  <p>
                    {g.chat.answerLead} <strong className="text-white">{g.chat.answerBrand}</strong> {g.chat.answerRest}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 text-[11px] font-mono bg-bx-green/15 text-bx-green px-2.5 py-1 rounded-full">
                    <i className="fa-solid fa-link" aria-hidden="true" /> {g.chat.citation}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div data-speed="-0.7" className="absolute -bottom-6 -left-4 sm:-left-8 bg-bx-yellow text-bx-dark rounded-2xl px-4 py-3 shadow-elevated float">
            <p className="text-[10px] font-mono uppercase">{g.rankBadge.label}</p>
            <p className="font-heading font-extrabold text-2xl">{g.rankBadge.value}</p>
          </div>
        </div>
      </div>
      <div className="w-full mx-auto relative mt-16">
        <div data-reveal="" className="cta-band dark">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-7 sm:p-9">
            <div className="flex items-center gap-5">
              <span className="cta-icon w-14 h-14 rounded-2xl bg-bx-yellow text-bx-dark flex items-center justify-center text-xl shrink-0">
                <i className={g.checkBand.icon} aria-hidden="true" />
              </span>
              <div>
                <p className="font-heading font-extrabold text-xl sm:text-2xl tracking-tight">{g.checkBand.title}</p>
                <p className="text-sm text-neutral-400 mt-1">{g.checkBand.text}</p>
              </div>
            </div>
            <form
              id="geo-form"
              data-modal-form={g.checkBand.modalTag}
              className="w-full lg:w-auto flex items-center gap-2 bg-white/10 border border-white/15 rounded-full p-1.5"
            >
              <label htmlFor="geo-domain" className="sr-only">{g.checkBand.label}</label>
              <input
                id="geo-domain"
                name="domain"
                required
                placeholder={g.checkBand.placeholder}
                className="flex-1 lg:w-56 min-w-0 bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none px-4 py-2.5"
              />
              <button className="magnetic btn-shine bg-bx-pink hover:bg-white hover:text-bx-dark text-white font-heading font-semibold text-xs px-5 py-3 rounded-full transition-colors whitespace-nowrap">
                {g.checkBand.button}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
