import { CtaBand, Split } from "@/components/ui";
import { accentHex, accentTileSoft, flipBack } from "@/lib/accents";
import type { HomepageContent, PainCard } from "@/lib/types";

type PainProps = {
  pain: HomepageContent["pain"];
};

const PAD = "px-5 sm:px-8 lg:px-12 2xl:px-20";

function PainFront({ card }: { card: PainCard }) {
  const f = card.front;
  if (f.kind === "stat")
    return (
      <div>
        <div className="font-heading font-extrabold text-5xl">{f.stat}</div>
        <p className="font-semibold mt-2">{f.text}</p>
      </div>
    );
  if (f.kind === "bars")
    return (
      <div>
        <svg viewBox="0 0 120 40" className="w-32 h-10" aria-hidden="true">
          <rect x="0" y="10" width="20" height="30" rx="4" fill="#E5E7EB" />
          <rect x="26" y="4" width="20" height="36" rx="4" fill="#E5E7EB" />
          <rect x="52" y="0" width="20" height="40" rx="4" fill="#E5E7EB" />
          <rect x="78" y="30" width="20" height="10" rx="4" fill={accentHex[card.accent]} />
        </svg>
        <p className="font-semibold mt-3">{f.text}</p>
      </div>
    );
  return (
    <div>
      <div className="inline-flex items-center gap-2 bg-bx-surface border border-bx-border rounded-full px-3 py-1.5 text-xs">
        <i className="fa-solid fa-comment-dots text-neutral-400" aria-hidden="true" /> {f.query}
      </div>
      <p className="font-semibold mt-3">{f.text}</p>
    </div>
  );
}

export function PainFlipCards({ pain }: PainProps) {
  return (
    <section id="pain" aria-labelledby="pain-title" className={`pb-20 sm:pb-28 ${PAD}`}>
      <div className="w-full mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <h2 id="pain-title" data-split="" className="font-heading font-extrabold text-4xl sm:text-5xl tracking-tight">
            <Split text={pain.heading} />
          </h2>
          <span className="text-xs font-mono text-neutral-400">
            <i className="fa-solid fa-hand-pointer mr-1" aria-hidden="true" /> {pain.hint}
          </span>
        </div>
        <div data-stagger="" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pain.cards.map((card) => (
            <div className="flip h-[300px]" tabIndex={0} role="button" aria-label={card.ariaLabel} key={card.tag}>
              <div className="flip-inner">
                <div className="flip-face bg-white border border-bx-border p-7 flex flex-col justify-between shadow-ambient">
                  <div className={`w-12 h-12 rounded-2xl ${accentTileSoft[card.accent]} flex items-center justify-center text-lg`}>
                    <i className={card.icon} aria-hidden="true" />
                  </div>
                  <PainFront card={card} />
                  <span className="text-[10px] font-mono uppercase text-neutral-400">{card.tag}</span>
                </div>
                <div className={`flip-face flip-back ${flipBack[card.accent]} p-7 flex flex-col justify-between`}>
                  <i className={`${card.back.icon} text-2xl`} aria-hidden="true" />
                  <div>
                    <p className="text-[10px] font-mono uppercase opacity-70">{card.back.label}</p>
                    <p className="font-heading font-bold text-xl mt-1">{card.back.text}</p>
                  </div>
                  <button
                    type="button"
                    data-cta={card.back.cta}
                    className="self-start inline-flex items-center gap-2 bg-white/20 hover:bg-white/35 backdrop-blur px-4 py-2 rounded-full text-xs font-semibold transition-colors"
                  >
                    {card.back.button} <i className="fa-solid fa-arrow-right text-[10px]" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <CtaBand band={pain.ctaBand} />
    </section>
  );
}
