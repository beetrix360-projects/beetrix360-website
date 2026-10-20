import { Count, PUZZLE_PATHS, Split } from "@/components/ui";
import type { HomepageContent } from "@/lib/types";

export function Loader() {
  return (
    <div id="loader" aria-hidden="true">
      <svg viewBox="0 0 100 100" className="w-20 h-20 overflow-visible">
        <path className="lp" d={PUZZLE_PATHS.green} fill="#2CB383" />
        <path className="lp" d={PUZZLE_PATHS.pink} fill="#DE2056" />
        <path className="lp" d={PUZZLE_PATHS.blue} fill="#3ABEF9" />
        <path className="lp" d={PUZZLE_PATHS.yellow} fill="#FAB12F" />
      </svg>
    </div>
  );
}

export function Hero({ hero }: { hero: HomepageContent["hero"] }) {
  const p = hero.puzzle;
  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="relative min-h-[100svh] pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 bg-grid overflow-hidden flex items-center"
    >
      <canvas id="hero-canvas" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" />
      <div id="spot" className="absolute inset-0 pointer-events-none" aria-hidden="true" />
      <div className="blob absolute -top-20 right-[10%] w-[520px] h-[520px] rounded-full bg-bx-blue/15 blur-3xl pointer-events-none" />
      <div className="blob absolute bottom-0 -left-20 w-[420px] h-[420px] rounded-full bg-bx-pink/10 blur-3xl pointer-events-none" />

      <div className="w-full mx-auto px-5 sm:px-8 lg:px-12 2xl:px-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-7">
            <button
              type="button"
              data-cta={hero.badge.cta}
              className="hero-fade group inline-flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full bg-white/90 border border-bx-border text-xs shadow-ambient hover:border-bx-dark transition-colors text-left"
            >
              <span className="px-2 py-0.5 rounded-full bg-bx-pink text-white font-mono text-[10px] uppercase shrink-0">
                {hero.badge.tag}
              </span>
              <span>
                {hero.badge.text} <strong>{hero.badge.strong}</strong>
              </span>
              <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </button>

            <h1 className="hero-title font-heading font-extrabold tracking-tight text-[44px] sm:text-6xl lg:text-[78px] 2xl:text-[104px] leading-[1.0] mt-6">
              <Split text={hero.headline} />{" "}
              <span className="rotator text-bx-pink">
                {hero.rotatingWords.map((w, i) => (
                  <span className="rot-word" key={w} aria-hidden={i > 0 ? true : undefined}>
                    {w.replace(/ /g, " ")}
                  </span>
                ))}
              </span>
            </h1>
            <p className="hero-fade text-neutral-600 text-lg mt-6 max-w-xl">{hero.subheading}</p>

            <form
              id="audit-form"
              data-modal-form={hero.auditForm.modalTag}
              className="hero-fade mt-8 max-w-xl bg-white border border-bx-border rounded-full p-1.5 shadow-elevated flex items-center gap-2"
            >
              <i className="fa-solid fa-magnifying-glass-chart text-bx-blue ml-4" aria-hidden="true" />
              <label htmlFor="audit-domain" className="sr-only">
                {hero.auditForm.label}
              </label>
              <input
                id="audit-domain"
                name="domain"
                required
                placeholder={hero.auditForm.placeholder}
                className="flex-1 min-w-0 bg-transparent text-sm focus:outline-none py-3"
              />
              <button className="magnetic btn-shine bg-bx-pink hover:bg-bx-dark text-white font-heading font-semibold text-xs px-5 sm:px-6 py-3.5 rounded-full transition-colors whitespace-nowrap">
                {hero.auditForm.button}
              </button>
            </form>
            <div className="hero-fade flex flex-wrap items-center gap-x-5 gap-y-3 mt-5 px-2">
              <div className="flex -space-x-2" aria-hidden="true">
                <span className="w-8 h-8 rounded-full border-2 border-white bg-bx-blue" />
                <span className="w-8 h-8 rounded-full border-2 border-white bg-bx-pink" />
                <span className="w-8 h-8 rounded-full border-2 border-white bg-bx-yellow" />
                <span className="w-8 h-8 rounded-full border-2 border-white bg-bx-green flex items-center justify-center text-[10px] text-white font-bold">
                  {hero.trust.badge}
                </span>
              </div>
              <span className="text-xs text-neutral-500">
                {hero.trust.text} <strong className="text-bx-dark">{hero.trust.highlight}</strong>
              </span>
            </div>

            <dl className="hero-fade grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10 pt-8 border-t border-bx-border">
              {hero.stats.map((s) => (
                <div key={s.label} className="flex flex-col-reverse">
                  <dt className="text-xs text-neutral-500 mt-1">{s.label}</dt>
                  <dd>
                    <Count stat={s} className="font-heading text-3xl font-extrabold" />
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* interactive 3D puzzle */}
          <div className="lg:col-span-5 hero-visual order-first lg:order-none">
            <div
              id="puzzle-stage"
              className="relative mx-auto w-full max-w-[250px] sm:max-w-[340px] lg:max-w-[460px] aspect-square"
              style={{ perspective: "1100px" }}
              data-cursor=""
              role="img"
              aria-label={p.ariaLabel}
            >
              <div id="puzzle-tilt" className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
                <div
                  className="absolute inset-[5%] rounded-[44px] bg-white/80 backdrop-blur border border-bx-border shadow-mega"
                  style={{ transform: "translateZ(-50px)" }}
                />
                <div className="absolute inset-[5%] rounded-[44px] bg-grid opacity-60" style={{ transform: "translateZ(-49px)" }} />
                <svg
                  viewBox="0 0 100 100"
                  className="absolute left-[16%] top-[16%] w-[68%] h-[68%] overflow-visible"
                  style={{ transform: "translateZ(40px)" }}
                >
                  <g className="hp" data-x="-1" data-y="-1">
                    <path d={PUZZLE_PATHS.green} fill="#2CB383" />
                  </g>
                  <g className="hp" data-x="1" data-y="-1">
                    <path d={PUZZLE_PATHS.pink} fill="#DE2056" />
                  </g>
                  <g className="hp" data-x="1" data-y="1">
                    <path d={PUZZLE_PATHS.blue} fill="#3ABEF9" />
                  </g>
                  <g className="hp" data-x="-1" data-y="1">
                    <path d={PUZZLE_PATHS.yellow} fill="#FAB12F" />
                  </g>
                </svg>
                <span className="hp-label absolute left-[2%] top-[8%] px-3 py-1.5 rounded-full bg-bx-green text-white text-xs font-bold shadow-elevated" style={{ transform: "translateZ(90px)" }}>
                  {p.labels.topLeft}
                </span>
                <span className="hp-label absolute right-[2%] top-[8%] px-3 py-1.5 rounded-full bg-bx-pink text-white text-xs font-bold shadow-elevated" style={{ transform: "translateZ(90px)" }}>
                  {p.labels.topRight}
                </span>
                <span className="hp-label absolute right-[2%] bottom-[8%] px-3 py-1.5 rounded-full bg-bx-blue text-bx-dark text-xs font-bold shadow-elevated" style={{ transform: "translateZ(90px)" }}>
                  {p.labels.bottomRight}
                </span>
                <span className="hp-label absolute left-[2%] bottom-[8%] px-3 py-1.5 rounded-full bg-bx-yellow text-bx-dark text-xs font-bold shadow-elevated" style={{ transform: "translateZ(90px)" }}>
                  {p.labels.bottomLeft}
                </span>
                {p.chips[0] ? (
                  <div className="hidden sm:block absolute -left-6 top-[38%]" style={{ transform: "translateZ(120px)" }}>
                    <div className="float bg-white border border-bx-border rounded-2xl p-3.5 shadow-elevated">
                      <div className="text-[10px] font-mono text-neutral-400 uppercase">{p.chips[0].label}</div>
                      <div className="font-heading font-extrabold text-xl text-bx-green">{p.chips[0].value}</div>
                      <svg viewBox="0 0 100 30" className="w-20 h-5">
                        <polyline points="0,26 18,22 34,24 50,14 66,16 82,6 100,2" fill="none" stroke="#2CB383" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                ) : null}
                {p.chips[1] ? (
                  <div className="hidden sm:block absolute -right-4 top-[56%]" style={{ transform: "translateZ(150px)" }}>
                    <div className="float-d bg-bx-dark text-white rounded-2xl p-3.5 shadow-elevated">
                      <div className="text-[10px] font-mono text-neutral-400 uppercase">{p.chips[1].label}</div>
                      <div className="font-heading font-extrabold text-xl">{p.chips[1].value}</div>
                    </div>
                  </div>
                ) : null}
              </div>
              <p className="absolute -bottom-2 left-0 right-0 text-center text-[11px] font-mono text-neutral-400">
                <i className="fa-solid fa-hand-pointer mr-1" aria-hidden="true" />
                <span className="hidden sm:inline">{p.hintDesktop}</span>
                <span className="sm:hidden">{p.hintMobile}</span>
              </p>
            </div>

            <button
              type="button"
              data-video={hero.showreel.video}
              className="group mt-8 mx-auto hidden sm:flex items-center gap-4 bg-white border border-bx-border rounded-full pl-2 pr-6 py-2 shadow-elevated hover:border-bx-dark transition-colors"
              data-cursor=""
            >
              <span className="play relative w-12 h-12 rounded-full bg-bx-pink text-white flex items-center justify-center">
                <i className="fa-solid fa-play ml-0.5" aria-hidden="true" />
              </span>
              <span className="text-left">
                <span className="block text-sm font-heading font-bold">{hero.showreel.title}</span>
                <span className="block text-[11px] font-mono text-neutral-400">{hero.showreel.subtitle}</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <a
        href="#statement"
        className="hidden lg:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-neutral-400"
      >
        Scroll{" "}
        <span className="w-5 h-8 rounded-full border-2 border-neutral-300 flex justify-center pt-1.5">
          <span className="w-1 h-1.5 rounded-full bg-neutral-400 animate-bounce" />
        </span>
      </a>
    </section>
  );
}
