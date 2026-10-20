import type { HTMLAttributes, ReactNode } from "react";
import { accentCssVar, accentText, ctaBandIcon, ctaButton } from "@/lib/accents";
import type { AccentHeading, CountStat, CtaBandContent, Eyebrow as EyebrowT } from "@/lib/types";

/** Splits text into `.w > .wi` word spans, the markup the design's reveal animations expect. */
export function Split({ text }: { text: string }) {
  const parts = text.split(/(\s+)/).filter(Boolean);
  return (
    <>
      {parts.map((part, i) =>
        /^\s+$/.test(part) ? (
          " "
        ) : (
          <span className="w" key={i}>
            <span className="wi">{part}</span>
          </span>
        ),
      )}
    </>
  );
}

/** Heading text with an optional highlighted phrase (italic serif + drawn underline). */
export function AccentHeadingText({ heading }: { heading: AccentHeading }) {
  return (
    <>
      <Split text={heading.text} />
      {heading.accent ? (
        <>
          {heading.lineBreak ? <br /> : " "}
          <span className={`${accentText[heading.accentColor ?? "pink"]} mark`}>
            <Split text={heading.accent} />
          </span>
        </>
      ) : null}
    </>
  );
}

export function Eyebrow({ eyebrow }: { eyebrow: EyebrowT }) {
  return (
    <span className="eyebrow" style={{ ["--c" as string]: accentCssVar[eyebrow.accent] }}>
      <b>{eyebrow.number}</b>
      {eyebrow.label}
    </span>
  );
}

export function formatCount(stat: Pick<CountStat, "value" | "prefix" | "suffix" | "decimals">) {
  const dec = stat.decimals ?? 0;
  return (
    (stat.prefix ?? "") +
    stat.value.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }) +
    (stat.suffix ?? "")
  );
}

/** Animated counter. Renders the final value on the server so crawlers see real numbers. */
export function Count({
  stat,
  className,
}: {
  stat: Pick<CountStat, "value" | "prefix" | "suffix" | "decimals">;
  className?: string;
}) {
  return (
    <div
      className={className}
      data-count={stat.value}
      data-prefix={stat.prefix}
      data-suffix={stat.suffix}
      data-decimals={stat.decimals}
    >
      {formatCount(stat)}
    </div>
  );
}

/** Pill button with a round arrow chip; opens the request modal via `data-cta`. */
export function ArrowCta({
  cta,
  className,
  children,
  circle = "bg-white/20",
}: {
  cta: string;
  className: string;
  children: ReactNode;
  circle?: string;
}) {
  return (
    <button
      type="button"
      data-cta={cta}
      className={`magnetic btn-shine group inline-flex items-center gap-3 text-white font-heading font-semibold text-sm pl-6 pr-2 py-2 rounded-full transition-colors ${className}`}
    >
      {children}{" "}
      <span
        className={`w-9 h-9 rounded-full ${circle} flex items-center justify-center group-hover:translate-x-1 transition-transform`}
      >
        <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
      </span>
    </button>
  );
}

export function CtaBand({ band }: { band: CtaBandContent }) {
  return (
    <div className="w-full mx-auto mt-16">
      <div data-reveal className="cta-band">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-7 sm:p-9">
          <div className="flex items-center gap-5">
            <span
              className={`cta-icon w-14 h-14 rounded-2xl ${ctaBandIcon[band.iconStyle]} flex items-center justify-center text-xl shrink-0`}
            >
              <i className={band.icon} aria-hidden="true" />
            </span>
            <div>
              <p className="font-heading font-extrabold text-xl sm:text-2xl tracking-tight">{band.title}</p>
              <p className="text-sm text-neutral-500 mt-1">{band.text}</p>
            </div>
          </div>
          <ArrowCta cta={band.cta} className={`shrink-0 w-full md:w-auto justify-between ${ctaButton[band.buttonStyle]}`}>
            {band.button}
          </ArrowCta>
        </div>
      </div>
    </div>
  );
}

/** Striped media placeholder from the design (swap for next/image once assets exist). */
export function Ph({
  icon = "fa-regular fa-image",
  lines,
  className = "",
  dark = false,
  ...rest
}: {
  icon?: string;
  lines: string[];
  className?: string;
  dark?: boolean;
} & HTMLAttributes<HTMLDivElement> & { [key: `data-${string}`]: string | undefined }) {
  return (
    <div className={`ph ${dark ? "ph-dark" : ""} ${className}`} {...rest}>
      <i className={icon} aria-hidden="true" />
      <span>
        {lines.map((l, i) => (
          <span key={i}>
            {i > 0 ? <br /> : null}
            {l}
          </span>
        ))}
      </span>
    </div>
  );
}

export const PUZZLE_PATHS = {
  green:
    "M12,18 C12,13.5 15.5,10 20,10 L46,10 L46,23 C51,21 56,25 56,30 C56,35 51,39 46,37 L46,48 L35,48 C35,42 29,39 25,42 C21,45 23,48 23,48 L12,48 Z",
  pink: "M52,10 L78,10 C82.5,10 86,13.5 86,18 L86,44 L73,44 C73,50 64,50 64,44 L52,44 L52,35 C58,35 58,25 52,25 Z",
  blue: "M50,52 L64,52 C64,58 73,58 73,52 L86,52 L86,80 C86,84.5 82.5,88 78,88 L50,88 L50,75 C44,75 44,65 50,65 Z",
  yellow: "M12,52 L24,52 C24,46 33,46 33,52 L46,52 L46,65 C40,65 40,75 46,75 L46,88 L20,88 C15.5,88 12,84.5 12,80 Z",
};

export function Wordmark({ className = "text-xl" }: { className?: string }) {
  return (
    <span className={`font-heading font-extrabold tracking-tight leading-none ${className}`}>
      Beetrix
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-bx-green mx-0.5 -translate-y-2" />
      <span className="text-bx-pink">360</span>
    </span>
  );
}
