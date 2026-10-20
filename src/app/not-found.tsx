import Link from "next/link";

export default function NotFound() {
  return (
    <section className="min-h-[70vh] pt-40 pb-20 px-5 sm:px-8 lg:px-12 2xl:px-20 bg-grid flex items-center">
      <div>
        <p className="font-mono text-xs text-neutral-400">404</p>
        <h1 className="font-heading font-extrabold text-5xl sm:text-6xl tracking-tight mt-2">Page not found</h1>
        <Link href="/" className="inline-flex mt-8 items-center gap-2 bg-bx-dark hover:bg-bx-pink text-white font-heading font-semibold text-sm px-6 py-3.5 rounded-full transition-colors">
          Back to home <i className="fa-solid fa-arrow-right text-[10px]" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
