import type { HomepageContent } from "@/lib/types";

export function FloatingCta({ f }: { f: HomepageContent["floatingCta"] }) {
  return (
    <button
      type="button"
      id="float-cta"
      data-cta={f.cta}
      className="fixed bottom-5 right-5 z-[45] inline-flex items-center gap-3 bg-bx-dark text-white pl-2 pr-5 py-2 rounded-full shadow-mega font-heading font-semibold text-sm hover:bg-bx-pink transition-all duration-500 cursor-pointer"
    >
      <span className="relative flex w-9 h-9 items-center justify-center rounded-full bg-bx-pink">
        <span className="absolute inset-0 rounded-full bg-bx-pink animate-ping opacity-50" />
        <i className="fa-solid fa-magnifying-glass-chart text-xs relative text-white" aria-hidden="true" />
      </span>
      <span className="hidden sm:inline">{f.label}</span>
      <span className="sm:hidden">{f.labelMobile}</span>
    </button>
  );
}
