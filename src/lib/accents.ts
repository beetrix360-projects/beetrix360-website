import type { Accent, CtaButtonStyle } from "./types";

// Tailwind needs literal class names, so every color variant used by the design lives here.

export const accentText: Record<Accent, string> = {
  pink: "text-bx-pink",
  green: "text-bx-green",
  yellow: "text-bx-yellow",
  blue: "text-bx-blue",
};

export const accentDot: Record<Accent, string> = {
  pink: "bg-bx-pink",
  green: "bg-bx-green",
  yellow: "bg-bx-yellow",
  blue: "bg-bx-blue",
};

export const accentHex: Record<Accent, string> = {
  pink: "#DE2056",
  green: "#2CB383",
  yellow: "#FAB12F",
  blue: "#3ABEF9",
};

export const accentCssVar: Record<Accent, string> = {
  pink: "var(--pink)",
  green: "var(--green)",
  yellow: "var(--yellow)",
  blue: "var(--blue)",
};

/** Soft icon tiles (pain card fronts, CTA band icons). */
export const accentTileSoft: Record<Accent, string> = {
  pink: "bg-bx-pink/10 text-bx-pink",
  blue: "bg-bx-blue/10 text-bx-blue",
  yellow: "bg-bx-yellow/20 text-bx-dark",
  green: "bg-bx-green/10 text-bx-green",
};

/** Slightly stronger tiles (pillar steps, pipeline nodes, CTA bands). */
export const accentTile: Record<Accent, string> = {
  pink: "bg-bx-pink/15 text-bx-pink",
  blue: "bg-bx-blue/15 text-bx-blue",
  yellow: "bg-bx-yellow/25 text-bx-dark",
  green: "bg-bx-green/15 text-bx-green",
};

export const ctaBandIcon: Record<Accent, string> = {
  pink: "bg-bx-pink/10 text-bx-pink",
  green: "bg-bx-green/15 text-bx-green",
  yellow: "bg-bx-yellow/25 text-bx-dark",
  blue: "bg-bx-blue/15 text-bx-blue",
};

export const ctaButton: Record<CtaButtonStyle, string> = {
  pink: "bg-bx-pink hover:bg-bx-dark",
  "dark-green": "bg-bx-dark hover:bg-bx-green",
  "dark-blue": "bg-bx-dark hover:bg-bx-blue",
};

/** Back face of the pain flip cards. */
export const flipBack: Record<Accent, string> = {
  pink: "bg-bx-pink text-white",
  blue: "bg-bx-blue text-bx-dark",
  yellow: "bg-bx-yellow text-bx-dark",
  green: "bg-bx-green text-white",
};

/** Pillar card "Deploy" buttons. */
export const pillarButtonHover: Record<Accent, string> = {
  blue: "hover:bg-bx-blue hover:text-bx-dark",
  pink: "hover:bg-bx-pink",
  green: "hover:bg-bx-green",
  yellow: "hover:bg-bx-yellow hover:text-bx-dark",
};

export const pillarRibbon: Record<Accent, string> = {
  blue: "ribbon-1",
  pink: "ribbon-2",
  green: "ribbon-3",
  yellow: "ribbon-4",
};

/** Big result numbers in the Results section (the design leaves the yellow one uncolored). */
export const caseNumber: Record<Accent, string> = {
  green: "text-bx-green",
  blue: "text-bx-blue",
  yellow: "",
  pink: "text-bx-pink",
};

export const clientBadge: Record<Accent, string> = {
  green: "bg-bx-green/10 text-bx-green",
  blue: "bg-bx-blue/10 text-bx-blue",
  yellow: "bg-bx-yellow/20 text-bx-dark",
  pink: "bg-bx-pink/10 text-bx-pink",
};
