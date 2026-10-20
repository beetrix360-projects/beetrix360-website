"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/ui";
import type { Division, SiteSettings } from "@/lib/types";

export function Footer({ site, divisions }: { site: SiteSettings; divisions: Division[] }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return null;
  }
  const f = site.footer;
  return (
    <footer className="bg-white px-5 sm:px-8 lg:px-12 2xl:px-20 pt-16 pb-10">
      <div className="w-full mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-bx-border">
          <div className="lg:col-span-2">
            <Wordmark className="text-2xl" />
            <p className="text-sm text-neutral-500 mt-3 max-w-xs">{f.tagline}</p>
            <div className="flex gap-1.5 mt-5" aria-hidden="true">
              <span className="w-8 h-1.5 rounded bg-bx-green" />
              <span className="w-8 h-1.5 rounded bg-bx-pink" />
              <span className="w-8 h-1.5 rounded bg-bx-yellow" />
              <span className="w-8 h-1.5 rounded bg-bx-blue" />
            </div>
          </div>
          <nav aria-label={f.exploreTitle}>
            <p className="text-[11px] font-mono uppercase text-neutral-400 mb-3">{f.exploreTitle}</p>
            <ul className="space-y-2 text-sm">
              {f.explore.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-bx-pink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="text-[11px] font-mono uppercase text-neutral-400 mb-3">{f.contactTitle}</p>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={`tel:${site.phone.tel}`} className="hover:text-bx-pink">
                  {site.phone.display}
                </a>
              </li>
              <li>{f.domainLabel}</li>
              <li>
                <Link href={f.bookHref} className="hover:text-bx-pink">
                  {f.bookLabel}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        {/* Division hubs: crawlable links to every section of the site (from the navigation doc). */}
        <nav aria-label="Services" className="py-6 border-b border-bx-border flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {divisions.map((d) => (
            <Link key={d.slug} href={`/${d.slug}`} className="text-neutral-500 hover:text-bx-pink">
              {d.name}
            </Link>
          ))}
        </nav>
        <div className="pt-6 flex flex-col sm:flex-row justify-between gap-3 text-xs text-neutral-400">
          <span>{f.copyright}</span>
          <a href="#top" className="hover:text-bx-dark">
            {f.backToTop}
          </a>
        </div>
      </div>
    </footer>
  );
}
