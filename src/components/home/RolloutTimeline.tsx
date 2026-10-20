import { AccentHeadingText, CtaBand, Eyebrow, Ph } from "@/components/ui";
import { accentHex, accentText } from "@/lib/accents";
import type { HomepageContent } from "@/lib/types";

type ProcessProps = {
  p: HomepageContent["process"];
};

const PAD = "px-5 sm:px-8 lg:px-12 2xl:px-20";

export function RolloutTimeline({ p }: ProcessProps) {
  return (
    <section id="process" aria-labelledby="process-title" className={`py-20 sm:py-28 lg:py-36 ${PAD}`}>
      <div className="w-full mx-auto grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 lg:sticky lg:top-28 self-start">
          <Eyebrow eyebrow={p.eyebrow} />
          <h2 id="process-title" data-split="" className="font-heading font-extrabold text-4xl sm:text-6xl 2xl:text-7xl tracking-tight mt-4">
            <AccentHeadingText heading={p.heading} />
          </h2>
          <p data-reveal="" className="text-neutral-600 mt-4 max-w-sm">{p.intro}</p>
          <Ph
            data-reveal=""
            data-video={p.video.video}
            data-cursor=""
            icon="fa-solid fa-circle-play"
            lines={[p.video.label]}
            className="aspect-video rounded-2xl mt-8 cursor-pointer"
          />
          <ul data-reveal="" className="flex flex-wrap gap-2 mt-6">
            {p.badges.map((b) => (
              <li key={b.text} className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-bx-surface border border-bx-border text-xs font-medium">
                <i className={`${b.icon} ${accentText[b.accent]}`} aria-hidden="true" />
                {b.text}
              </li>
            ))}
          </ul>
        </div>

        <div id="timeline" className="lg:col-span-7 relative pl-10">
          <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-bx-border rounded">
            <div id="tl-fill" className="w-full h-full bg-gradient-to-b from-bx-blue via-bx-pink to-bx-green rounded" />
          </div>
          <ol className="space-y-16">
            {p.steps.map((s) => (
              <li key={s.title} className="tl-step relative" style={{ ["--c" as string]: accentHex[s.accent] }}>
                <span className="tl-dot absolute -left-10 top-1 w-6 h-6 rounded-full bg-white border-2 border-bx-border" />
                <p className="font-mono text-xs text-neutral-400">{s.range}</p>
                <h3 className="font-heading font-bold text-2xl mt-1">{s.title}</h3>
                <p className="text-neutral-500 mt-2">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <CtaBand band={p.ctaBand} />
    </section>
  );
}
