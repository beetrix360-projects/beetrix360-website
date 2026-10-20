import { ArrowCta, Eyebrow, Split } from "@/components/ui";
import type { HomepageContent } from "@/lib/types";

type StatementProps = {
  s: HomepageContent["statement"];
};

const PAD = "px-5 sm:px-8 lg:px-12 2xl:px-20";

export function ProblemStatement({ s }: StatementProps) {
  return (
    <section id="statement" aria-label={s.eyebrow.label} className={`py-20 sm:py-28 lg:py-40 ${PAD}`}>
      <div className="w-full mx-auto max-w-[1500px]">
        <Eyebrow eyebrow={s.eyebrow} />
        <p data-scrub="" className="font-heading font-extrabold tracking-tight text-3xl sm:text-5xl lg:text-[64px] 2xl:text-[80px] leading-[1.08] mt-6">
          <Split text={s.text} />
        </p>
        <div data-reveal="" className="mt-12 flex flex-wrap items-center gap-5">
          <ArrowCta cta={s.button.cta} className="bg-bx-dark hover:bg-bx-pink" circle="bg-white/15">
            {s.button.label}
          </ArrowCta>
          <span className="text-sm text-neutral-500">
            <i className="fa-regular fa-clock mr-1 text-bx-pink" aria-hidden="true" />
            {s.note}
          </span>
        </div>
      </div>
    </section>
  );
}
