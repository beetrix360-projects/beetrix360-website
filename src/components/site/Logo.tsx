import { PUZZLE_PATHS, Wordmark } from "@/components/ui";

/** Puzzle mark + wordmark from the design header. */
export function Logo({ floating = false }: { floating?: boolean }) {
  return (
    <>
      <svg viewBox="0 0 100 100" className="w-10 h-10 overflow-visible" aria-hidden="true">
        <path d={PUZZLE_PATHS.green} fill="#2CB383" />
        <path d={PUZZLE_PATHS.yellow} fill="#FAB12F" />
        <path d={PUZZLE_PATHS.blue} fill="#3ABEF9" />
        <g className={floating ? "puzzle-float" : undefined} style={{ transformOrigin: "68px 28px" }}>
          <path d={PUZZLE_PATHS.pink} fill="#DE2056" />
        </g>
      </svg>
      <Wordmark />
    </>
  );
}
