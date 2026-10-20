import { Fragment } from "react";
import type { HomepageContent } from "@/lib/types";
import { clientBadge } from "@/lib/accents";

type Clients = HomepageContent["clients"];
const marqueeDots = ["bg-bx-pink", "bg-bx-yellow", "bg-bx-blue", "bg-bx-green"];

export function ClientMarquee({ clients }: { clients: Clients }) {
  const items = (hidden: boolean) =>
    clients.map((c, i) => (
      <Fragment key={`${hidden}-${c.name}`}>
        <span className="flex items-center gap-3" aria-hidden={hidden || undefined}>
          {c.name}
          {c.badge && c.accent ? (
            <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full ${clientBadge[c.accent]}`}>
              {c.badge}
            </span>
          ) : null}
        </span>
        <span className={`w-2 h-2 rounded-full ${marqueeDots[i % 4]}`} aria-hidden="true" />
      </Fragment>
    ));

  return (
    <div className="border-y border-bx-border bg-bx-surface py-5 overflow-hidden" aria-label="Selected clients">
      <div id="marquee" className="flex w-max items-center gap-14 font-heading font-extrabold text-xl text-neutral-400 whitespace-nowrap">
        {items(false)}
        {items(true)}
      </div>
    </div>
  );
}
