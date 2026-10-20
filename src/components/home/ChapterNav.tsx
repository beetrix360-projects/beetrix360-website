import type { HomepageContent } from "@/lib/types";

export function ChapterNav({ chapters }: { chapters: HomepageContent["chapters"] }) {
  return (
    <nav id="chapters" aria-label="Page sections" className="hidden xl:flex fixed right-5 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-3">
      {chapters.map((ch) => (
        <a key={ch.href} href={ch.href} className="chap">
          <span>{ch.label}</span>
        </a>
      ))}
    </nav>
  );
}
