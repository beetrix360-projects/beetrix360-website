import { AccentHeadingText } from "@/components/ui";
import { accentText } from "@/lib/accents";
import type { HomepageContent } from "@/lib/types";

type ContactProps = {
  c: HomepageContent["contact"];
  phone: { display: string; tel: string };
};

const PAD = "px-5 sm:px-8 lg:px-12 2xl:px-20";

export function ContactSection({ c, phone }: ContactProps) {
  const field = "mt-1.5 w-full bg-bx-surface border border-bx-border focus:border-bx-dark rounded-xl px-4 py-3 text-sm focus:outline-none";
  const label = "text-[11px] font-mono uppercase text-neutral-500";

  return (
    <section id="contact" aria-labelledby="contact-title" className={`relative py-20 sm:py-28 lg:py-36 ${PAD} bg-bx-dark text-white overflow-hidden bg-grid-dark`}>
      <div data-speed="0.5" className="absolute top-10 left-[8%] w-16 h-16 rounded-2xl bg-bx-pink rotate-12" aria-hidden="true" />
      <div data-speed="1" className="absolute bottom-16 left-[40%] w-8 h-8 rounded-full bg-bx-blue" aria-hidden="true" />
      <div data-speed="0.7" className="absolute top-24 right-[6%] w-20 h-20 rounded-full border-8 border-bx-yellow" aria-hidden="true" />
      <div className="w-full mx-auto relative grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <h2 id="contact-title" data-split="" className="font-heading font-extrabold text-5xl sm:text-7xl 2xl:text-8xl tracking-tight leading-[1.0]">
            <AccentHeadingText heading={c.heading} />
          </h2>
          <p data-reveal="" className="text-neutral-400 mt-6 max-w-md">{c.intro}</p>
          <div data-reveal="" className="mt-8 flex items-center gap-6 text-sm">
            <a href={`tel:${phone.tel}`} className="font-mono hover:text-bx-pink transition-colors">
              <i className="fa-solid fa-phone text-bx-green mr-2" aria-hidden="true" />
              {phone.display}
            </a>
          </div>
        </div>

        <div data-reveal="" className="bg-white text-bx-dark rounded-[28px] p-7 sm:p-9 shadow-mega">
          <form id="cta-form" className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className={label}>{c.form.nameLabel}</span>
                <input name="name" autoComplete="name" required className={field} />
              </label>
              <label className="block">
                <span className={label}>{c.form.emailLabel}</span>
                <input name="email" type="email" autoComplete="email" required className={field} />
              </label>
            </div>
            <label className="block">
              <span className={label}>{c.form.websiteLabel}</span>
              <input name="website" required placeholder={c.form.websitePlaceholder} className={field} />
            </label>
            <fieldset>
              <legend className={`${label} mb-2`}>{c.form.goalLegend}</legend>
              <div className="flex flex-wrap gap-2">
                {c.form.goals.map((g, i) => (
                  <label className="pill relative" key={g.label}>
                    <input type="radio" name="goal" value={g.label} defaultChecked={i === 0} />
                    <span>
                      <i className={`${g.icon} ${accentText[g.accent]}`} aria-hidden="true" />
                      {g.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="block">
              <span className={label}>{c.form.budgetLabel}</span>
              <select name="budget" className={field}>
                {c.form.budgets.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </label>
            <button className="magnetic w-full py-4 bg-bx-pink hover:bg-bx-dark text-white rounded-full font-heading font-semibold text-sm transition-colors">
              {c.form.submit}
            </button>
            <p className="text-[11px] text-neutral-400 text-center">{c.form.note}</p>
          </form>
          <div id="cta-success" className="hidden text-center py-10" role="status">
            <div className="w-14 h-14 mx-auto rounded-full bg-bx-green/15 text-bx-green flex items-center justify-center text-xl">
              <i className="fa-solid fa-check" aria-hidden="true" />
            </div>
            <h3 className="font-heading font-bold text-2xl mt-4">{c.success.title}</h3>
            <p className="text-sm text-neutral-500 mt-2">{c.success.text}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
