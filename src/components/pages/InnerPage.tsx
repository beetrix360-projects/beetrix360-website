import Link from "next/link";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/site/JsonLd";
import { Ph } from "@/components/ui";
import { accentCssVar, accentHex } from "@/lib/accents";
import { divisionStyle, serviceIcon } from "@/lib/nav-icons";
import { faqSchema } from "@/lib/schema";
import type { Division, FaqItem, SiteSettings } from "@/lib/types";

const PAD = "px-5 sm:px-8 lg:px-12 2xl:px-20";

export type Crumb = { name: string; path: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs font-mono text-neutral-500">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((c, i) => (
          <li key={c.path} className="flex items-center gap-2">
            {i > 0 ? <i className="fa-solid fa-chevron-right text-[8px] text-neutral-300" aria-hidden="true" /> : null}
            {i === items.length - 1 ? (
              <span aria-current="page" className="text-bx-dark">
                {c.name}
              </span>
            ) : (
              <Link href={c.path} className="hover:text-bx-pink">
                {c.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Shared shell for division hubs, service pages and sub-service pages. */
export function InnerPage({
  division,
  crumbs,
  title,
  label,
  site,
  children,
}: {
  division: Division;
  crumbs: Crumb[];
  title: string;
  label: string;
  site: SiteSettings;
  children: ReactNode;
}) {
  const accent = divisionStyle[division.slug]?.accent ?? "pink";
  return (
    <>
      <section className={`relative pt-32 pb-16 sm:pt-36 lg:pt-40 lg:pb-20 bg-grid overflow-hidden ${PAD}`}>
        <div
          className="absolute -top-20 right-[10%] w-[420px] h-[420px] rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ background: accentHex[accent] }}
          aria-hidden="true"
        />
        <div className="relative w-full mx-auto">
          <Breadcrumbs items={crumbs} />
          <span className="eyebrow mt-8" style={{ ["--c" as string]: accentCssVar[accent] }}>
            <b>
              <i className={divisionStyle[division.slug]?.icon} aria-hidden="true" />
            </b>
            {label}
          </span>
          <h1 className="font-heading font-extrabold tracking-tight text-[40px] sm:text-6xl lg:text-7xl leading-[1.02] mt-6 max-w-5xl">
            {title}
          </h1>
          <Ph
            icon="fa-regular fa-file-lines"
            lines={["INTRO COPY PLACEHOLDER", `Replace with the final introduction for “${title}”`]}
            className="prose-ph rounded-2xl mt-10 max-w-3xl !min-h-[120px]"
          />
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              data-cta={site.header.cta.cta}
              className="magnetic btn-shine inline-flex items-center gap-2 bg-bx-dark hover:bg-bx-pink text-white font-heading font-semibold text-sm px-6 py-3.5 rounded-full transition-colors"
            >
              {site.header.cta.label} <i className="fa-solid fa-arrow-right text-[10px]" aria-hidden="true" />
            </button>
            <a href={`tel:${site.phone.tel}`} className="font-mono text-sm hover:text-bx-pink transition-colors">
              <i className="fa-solid fa-phone text-bx-green mr-2" aria-hidden="true" />
              {site.phone.display}
            </a>
          </div>
        </div>
      </section>
      <div className={`py-16 sm:py-20 ${PAD}`}>
        <div className="w-full mx-auto space-y-20">{children}</div>
      </div>
    </>
  );
}

export function LinkCards({
  title,
  items,
  accentSlug,
}: {
  title: string;
  items: { name: string; href: string; slug?: string; meta?: string; links?: { name: string; href: string }[] }[];
  accentSlug: string;
}) {
  const accent = divisionStyle[accentSlug]?.accent ?? "pink";
  const tint = accentHex[accent];
  return (
    <section aria-labelledby={`h-${title.replace(/\W+/g, "-")}`}>
      <h2 id={`h-${title.replace(/\W+/g, "-")}`} className="font-heading font-extrabold text-3xl sm:text-4xl tracking-tight">
        {title}
      </h2>
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
        {items.map((it) => (
          <li key={it.href} className="mcard !opacity-100 !transform-none flex flex-col">
            <div className="mcard-h">
              <Link href={it.href} className="hover:text-bx-pink transition-colors">
                {it.name}
              </Link>
              <span className="mi" aria-hidden="true">
                <span className="mi-bg" style={{ background: tint }} />
                <i className={(it.slug && serviceIcon[it.slug]) || divisionStyle[accentSlug]?.icon} style={{ color: tint }} />
              </span>
            </div>
            {it.links?.length ? (
              <div className="flex flex-col">
                {it.links.map((l) => (
                  <Link key={l.href} href={l.href} className="mlink">
                    {l.name}
                  </Link>
                ))}
              </div>
            ) : null}
            <Link
              href={it.href}
              className="mt-auto pt-4 inline-flex items-center gap-2 text-sm font-semibold hover:text-bx-pink"
              aria-label={`View ${it.name}`}
            >
              {it.meta ?? "View service"} <i className="fa-solid fa-arrow-right text-[10px]" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Sections named in the handoff doc. Copy is a clearly marked placeholder until it is written. */
export function PlaceholderSections({ sections }: { sections: string[] }) {
  return (
    <section aria-label="Service details" className="grid md:grid-cols-2 gap-6">
      {sections.map((s) => (
        <article key={s} className="rounded-[24px] border border-bx-border bg-white p-7 shadow-ambient">
          <h2 className="font-heading font-bold text-2xl tracking-tight">{s.charAt(0).toUpperCase() + s.slice(1)}</h2>
          <Ph icon="fa-regular fa-file-lines" lines={["SECTION COPY PLACEHOLDER"]} className="rounded-xl mt-5 min-h-[120px]" />
        </article>
      ))}
    </section>
  );
}

export function MainCopyPlaceholder({ name }: { name: string }) {
  return (
    <section aria-label="Overview">
      <Ph
        icon="fa-regular fa-file-lines"
        lines={["PAGE CONTENT PLACEHOLDER", `Body copy, proof and FAQs for “${name}” go here`]}
        className="prose-ph rounded-[24px]"
      />
    </section>
  );
}

/** Renders only when real FAQ content exists; also emits FAQPage schema for answer engines. */
export function Faqs({ faqs }: { faqs?: FaqItem[] }) {
  const schema = faqSchema(faqs);
  if (!faqs?.length || !schema) return null;
  return (
    <section aria-labelledby="faq-title">
      <JsonLd data={schema} />
      <h2 id="faq-title" className="font-heading font-extrabold text-3xl sm:text-4xl tracking-tight">
        Frequently asked questions
      </h2>
      <div className="mt-8 divide-y divide-bx-border border-y border-bx-border">
        {faqs.map((f) => (
          <details key={f.question} className="py-5 group">
            <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-heading font-bold text-lg">
              {f.question}
              <i className="fa-solid fa-plus text-xs text-neutral-400 group-open:rotate-45 transition-transform" aria-hidden="true" />
            </summary>
            <p className="text-neutral-600 mt-3">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
