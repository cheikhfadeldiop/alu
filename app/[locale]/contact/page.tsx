import Image from "next/image";
import { useTranslations } from "next-intl";

import { SectionTitle } from "../../../components/ui/SectionTitle";

function IconPin(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 21c-3-3-6-7-6-11a6 6 0 1 1 12 0c0 4-3 8-6 11Z" />
      <path d="M12 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
    </svg>
  );
}
function IconPhone(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.5 2.6a2 2 0 0 1 1.1 1.3c.1.4.2.9.3 1.4.1.5.1 1 .1 1.5a2 2 0 0 1-.6 1.4l-1.3 1.3a15.9 15.9 0 0 0 6 6l1.3-1.3a2 2 0 0 1 1.4-.6 15.3 15.3 0 0 0 1.5.1c.5 0 1 0 .1.3 1.4.1.4.2.9.3 1.4a2 2 0 0 1 1.1 1.1c.8.2 1.7.4 2.6.5a2 2 0 0 1 1.7 2Z" />
    </svg>
  );
}
function IconSend(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

export default function ContactPage() {
  const t = useTranslations("pages.contact");
  const tc = useTranslations("common");

  return (
    <div className="crtv-page-enter space-y-8">
      {/* Hero: CONTACT + intro, fond avec motif discret (lignes pointillées) */}
      <section className="relative overflow-hidden rounded-2xl border border-[color:var(--border)] bg-white/50 dark:bg-black/50 backdrop-blur-md p-8 sm:p-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        <div className="relative flex flex-col items-center text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("title").toUpperCase()}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-[color:var(--muted)]">
            {t("intro")}
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.25fr]">
        {/* Gauche: adresse, téléphone (avec icônes), carte */}
        <section className="space-y-4">
          <div className="rounded-2xl border border-[color:var(--border)] bg-white/50 dark:bg-black/50 backdrop-blur-md p-5">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[color:var(--border)] bg-white/60 dark:bg-white/5 text-[color:var(--muted)]">
                  <IconPin className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold tracking-widest text-[color:var(--muted)]">
                    {t("address").toUpperCase()}
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    MBALLA II, Yaoundé, Cameroun.
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[color:var(--border)] bg-white/60 dark:bg-white/5 text-[color:var(--muted)]">
                  <IconPhone className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold tracking-widest text-[color:var(--muted)]">
                    {t("phone").toUpperCase()}
                  </div>
                  <div className="text-sm font-semibold text-foreground">(+237) 222 214 088</div>
                  <div className="text-sm font-semibold text-foreground">(+237) 222 214 047</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-[color:var(--border)] bg-white/50 dark:bg-black/50 backdrop-blur-md">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src="/assets/placeholders/news_wide.png"
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          </div>
        </section>

        {/* Droite: formulaire */}
        <section className="rounded-2xl border border-[color:var(--border)] bg-white/50 dark:bg-black/50 backdrop-blur-md p-6">
          <h2 className="text-base font-semibold tracking-wide text-foreground">
            {t("formTitle")}
          </h2>

          <form className="mt-6 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-xs font-semibold text-[color:var(--muted)]">
                  {t("firstName")} <span className="text-[color:var(--accent)]">*</span>
                </span>
                <input
                  className="h-11 rounded-md border border-[color:var(--border)] bg-transparent px-3 text-sm outline-none focus:border-[color:var(--accent)]"
                  placeholder={t("placeholders.firstName")}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-semibold text-[color:var(--muted)]">
                  {t("lastName")} <span className="text-[color:var(--accent)]">*</span>
                </span>
                <input
                  className="h-11 rounded-md border border-[color:var(--border)] bg-transparent px-3 text-sm outline-none focus:border-[color:var(--accent)]"
                  placeholder={t("placeholders.lastName")}
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-xs font-semibold text-[color:var(--muted)]">
                  {t("email")} <span className="text-[color:var(--accent)]">*</span>
                </span>
                <input
                  type="email"
                  className="h-11 rounded-md border border-[color:var(--border)] bg-transparent px-3 text-sm outline-none focus:border-[color:var(--accent)]"
                  placeholder={t("placeholders.email")}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-semibold text-[color:var(--muted)]">
                  {t("phone")}
                </span>
                <input
                  className="h-11 rounded-md border border-[color:var(--border)] bg-transparent px-3 text-sm outline-none focus:border-[color:var(--accent)]"
                  placeholder={t("placeholders.phone")}
                />
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-xs font-semibold text-[color:var(--muted)]">
                {t("subject")} <span className="text-[color:var(--accent)]">*</span>
              </span>
              <select
                className="h-11 rounded-md border border-[color:var(--border)] bg-transparent px-3 text-sm outline-none focus:border-[color:var(--accent)]"
                defaultValue=""
              >
                <option value="" disabled>{t("placeholders.subject")}</option>
                <option>Partenariat</option>
                <option>Support</option>
                <option>Autre</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold text-[color:var(--muted)]">
                {t("message")} <span className="text-[color:var(--accent)]">*</span>
              </span>
              <textarea
                className="min-h-[120px] rounded-md border border-[color:var(--border)] bg-transparent px-3 py-3 text-sm outline-none focus:border-[color:var(--accent)]"
                placeholder={t("placeholders.message")}
              />
            </label>

            <p className="text-xs text-[color:var(--muted)]">
              * {t("requiredHint")}
            </p>

            <button
              type="button"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[color:var(--flag-green)] font-semibold text-white transition-colors hover:brightness-110"
            >
              {tc("send")}
              <IconSend className="h-5 w-5" />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

