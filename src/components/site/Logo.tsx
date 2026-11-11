// import { PUZZLE_PATHS, Wordmark } from "@/components/ui";
import Image from "next/image";

/** Puzzle mark + wordmark from the design header. */
// export function Logo({ floating = false }: { floating?: boolean }) {
export function Logo() {
  return (
    <>
      {/* <svg viewBox="0 0 100 100" className="w-8 h-8 xl:w-9 xl:h-9 2xl:w-10 2xl:h-10 overflow-visible shrink-0" aria-hidden="true">
        <path d={PUZZLE_PATHS.green} fill="#2CB383" />
        <path d={PUZZLE_PATHS.yellow} fill="#FAB12F" />
        <path d={PUZZLE_PATHS.blue} fill="#3ABEF9" />
        <g className={floating ? "puzzle-float" : undefined} style={{ transformOrigin: "68px 28px" }}>
          <path d={PUZZLE_PATHS.pink} fill="#DE2056" />
        </g>
      </svg>
      <Wordmark className="text-base xl:text-lg 2xl:text-xl shrink-0" /> */}
      <Image
        src="/LogoFirstDraft-01.png"
        alt="Beetrix360"
        width={900}
        height={241}
        className="h-auto w-[180px] shrink-0"
        priority
      />
    </>
  );
}