import { Fragment } from "react";
import type { Kinetic as KineticT } from "@/lib/types";

export function KineticBand({ k }: { k: KineticT }) {
  const seq = [...k.words, ...k.words, ...k.words];
  return (
    <div className="kin bg-white py-10 lg:py-14 overflow-hidden border-b border-bx-border" aria-hidden="true">
      <div className="kin-track" data-dir={k.direction}>
        {seq.map((w, i) => (
          <Fragment key={i}>
            <span className={`kin-word ${i % 2 ? "kin-outline" : ""}`}>{w}</span>
            <span className="kin-star">✦</span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
