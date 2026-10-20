import type { PillarVisual } from "@/lib/types";

// Animated SVG infographics from the pillar cards (decorative).

const mono = { fontFamily: "var(--font-geist-mono)" };

function Layers() {
  return (
    <div className="col-span-2 rounded-2xl bg-bx-surface border border-bx-border flex items-center justify-center p-3">
      <svg viewBox="0 0 120 120" className="w-full max-w-[140px]" aria-hidden="true">
        <g className="float">
          <rect x="20" y="20" width="80" height="22" rx="6" fill="#3ABEF9" />
          <rect x="28" y="28" width="30" height="6" rx="3" fill="#fff" />
        </g>
        <g className="float-d">
          <rect x="14" y="50" width="92" height="22" rx="6" fill="#2CB383" />
          <rect x="22" y="58" width="46" height="6" rx="3" fill="#fff" />
        </g>
        <g className="float">
          <rect x="8" y="80" width="104" height="22" rx="6" fill="#FAB12F" />
          <rect x="16" y="88" width="60" height="6" rx="3" fill="#fff" />
        </g>
      </svg>
    </div>
  );
}

function Workflow() {
  return (
    <div className="col-span-2 rounded-2xl bg-bx-surface border border-bx-border flex items-center justify-center p-3">
      <svg viewBox="0 0 120 120" className="w-full max-w-[140px]" aria-hidden="true">
        <path className="dash" d="M30 30 L90 30 L90 90 L30 90 Z" fill="none" stroke="#DE2056" strokeWidth="2" />
        <circle cx="30" cy="30" r="12" fill="#DE2056" />
        <text x="30" y="34" textAnchor="middle" fontSize="10" fill="#fff" style={mono}>HR</text>
        <circle cx="90" cy="30" r="12" fill="#FAB12F" />
        <text x="90" y="34" textAnchor="middle" fontSize="10" fill="#0A0A0A" style={mono}>$</text>
        <circle cx="90" cy="90" r="12" fill="#3ABEF9" />
        <text x="90" y="94" textAnchor="middle" fontSize="9" fill="#0A0A0A" style={mono}>CRM</text>
        <circle cx="30" cy="90" r="12" fill="#2CB383" />
        <text x="30" y="94" textAnchor="middle" fontSize="9" fill="#fff" style={mono}>API</text>
        <g className="spin" style={{ transformOrigin: "60px 60px", transformBox: "view-box" }}>
          <circle cx="60" cy="60" r="14" fill="#0A0A0A" />
          <rect x="57" y="42" width="6" height="8" rx="2" fill="#0A0A0A" />
          <rect x="57" y="70" width="6" height="8" rx="2" fill="#0A0A0A" />
          <rect x="42" y="57" width="8" height="6" rx="2" fill="#0A0A0A" />
          <rect x="70" y="57" width="8" height="6" rx="2" fill="#0A0A0A" />
        </g>
        <circle cx="60" cy="60" r="5" fill="#fff" />
      </svg>
    </div>
  );
}

function Agents() {
  return (
    <div className="col-span-2 rounded-2xl bg-bx-dark flex items-center justify-center p-3">
      <svg viewBox="0 0 120 120" className="w-full max-w-[140px]" aria-hidden="true">
        <circle cx="60" cy="60" r="44" fill="none" stroke="#333" strokeDasharray="3 5" />
        <circle cx="60" cy="60" r="26" fill="none" stroke="#333" strokeDasharray="3 5" />
        <g className="spin" style={{ transformOrigin: "60px 60px", transformBox: "view-box" }}>
          <circle cx="60" cy="16" r="7" fill="#2CB383" />
          <circle cx="104" cy="60" r="6" fill="#FAB12F" />
          <circle cx="22" cy="82" r="6" fill="#DE2056" />
        </g>
        <g
          className="spin"
          style={{ transformOrigin: "60px 60px", transformBox: "view-box", animationDuration: "6s", animationDirection: "reverse" }}
        >
          <circle cx="60" cy="34" r="5" fill="#3ABEF9" />
        </g>
        <circle cx="60" cy="60" r="15" fill="#2CB383" />
        <text x="60" y="64" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff" style={mono}>AI</text>
      </svg>
    </div>
  );
}

function Bars() {
  return (
    <div className="col-span-2 rounded-2xl bg-bx-surface border border-bx-border flex items-end justify-center p-4">
      <svg viewBox="0 0 120 100" className="w-full max-w-[140px]" aria-hidden="true">
        <line x1="0" y1="98" x2="120" y2="98" stroke="#E5E7EB" strokeWidth="2" />
        <rect className="grow" x="8" y="60" width="18" height="38" rx="4" fill="#3ABEF9" />
        <rect className="grow" style={{ animationDelay: "-.6s" }} x="36" y="40" width="18" height="58" rx="4" fill="#2CB383" />
        <rect className="grow" style={{ animationDelay: "-1.2s" }} x="64" y="24" width="18" height="74" rx="4" fill="#FAB12F" />
        <rect className="grow" style={{ animationDelay: "-1.8s" }} x="92" y="6" width="18" height="92" rx="4" fill="#DE2056" />
      </svg>
    </div>
  );
}

export function PillarVisualBlock({ visual }: { visual: PillarVisual }) {
  switch (visual) {
    case "layers":
      return <Layers />;
    case "workflow":
      return <Workflow />;
    case "agents":
      return <Agents />;
    case "bars":
      return <Bars />;
  }
}
