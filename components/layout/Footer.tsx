import Image from "next/image";
import { useTranslations } from "next-intl";

function IconX(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M6 18 18 6M6 6l12 12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconFacebook(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M14 8h2V5h-2c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.2l.8-3H13V9c0-.6.4-1 1-1Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconLinkedIn(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M6.5 9.5H3.8V21h2.7V9.5ZM5.15 3.5a1.65 1.65 0 1 0 0 3.3 1.65 1.65 0 0 0 0-3.3ZM20.5 21h-2.7v-6.1c0-1.5-.6-2.5-2-2.5-1.1 0-1.7.7-2 1.4-.1.3-.1.7-.1 1.1V21h-2.7V9.5h2.7v1.6c.4-.7 1.3-1.8 3.2-1.8 2.3 0 4 1.5 4 4.8V21Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconInstagram(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M17.5 6.5h.01"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconYouTube(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M22.56 6.44a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.62.44a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .44 5.31 2.78 2.78 0 0 0 1.94 2c1.74.44 8.62.44 8.62.44s6.88 0 8.62-.44a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .44-5.31 29 29 0 0 0-.44-5.31Z"
        fill="currentColor"
      />
      <path d="m9.5 15.02 6.02-3.27-6.02-3.27v6.54Z" fill="#fff" />
    </svg>
  );
}

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="w-full border-t border-[color:var(--border)] bg-[color:var(--surface)]">
      <div className="mx-auto max-w-[1440px] px-6 py-12 sm:px-8 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/assets/logo/logo.png"
                alt="CRTV"
                width={44}
                height={44}
                className="h-11 w-11 rounded-sm"
              />
              <div className="text-sm font-semibold tracking-wide">CRTV</div>
            </div>
            <p className="max-w-xs text-sm text-[color:var(--muted)]">
              {t("footer.description")}
            </p>

            <div className="flex items-center gap-3">
              <a
                href="#"
                className="inline-flex items-center justify-center rounded-md border border-[color:var(--border)] bg-[color:var(--surface-2)] px-3 py-2 text-xs font-semibold text-foreground"
              >
                App Store
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center rounded-md border border-[color:var(--border)] bg-[color:var(--surface-2)] px-3 py-2 text-xs font-semibold text-foreground"
              >
                Google Play
              </a>
            </div>

            <div className="flex items-center gap-2 text-[color:var(--muted)]">
              <a
                href="#"
                aria-label="Facebook"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] hover:text-foreground"
              >
                <IconFacebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label="X"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] hover:text-foreground"
              >
                <IconX className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] hover:text-foreground"
              >
                <IconYouTube className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] hover:text-foreground"
              >
                <IconLinkedIn className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] hover:text-foreground"
              >
                <IconInstagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold">{t("footer.about")}</div>
            <ul className="space-y-2 text-sm text-[color:var(--muted)]">
              <li>
                <a href="#" className="hover:text-foreground">
                  {t("footer.links.about")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  {t("footer.links.crtvCameroon")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  {t("footer.links.helpCenters")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  {t("footer.links.contact")}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold">{t("footer.resources")}</div>
            <ul className="space-y-2 text-sm text-[color:var(--muted)]">
              <li>
                <a href="#" className="hover:text-foreground">
                  {t("footer.links.tv")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  {t("footer.links.news")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  {t("footer.links.radio")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  {t("footer.links.replay")}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold">
              {t("footer.commitments")}
            </div>
            <ul className="space-y-2 text-sm text-[color:var(--muted)]">
              <li>
                <a href="#" className="hover:text-foreground">
                  {t("footer.links.quality")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  {t("footer.links.terms")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  {t("footer.links.data")}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold">{t("footer.other")}</div>
            <ul className="space-y-2 text-sm text-[color:var(--muted)]">
              <li>
                <a href="#" className="hover:text-foreground">
                  {t("footer.links.legal")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  {t("footer.links.ads")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-[color:var(--border)] pt-6">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-[color:var(--muted)]">
            <a href="#" className="hover:text-foreground">{t("footer.strip.crtv")}</a>
            <a href="#" className="hover:text-foreground">{t("footer.strip.crtvSport")}</a>
            <a href="#" className="hover:text-foreground">{t("footer.strip.posteNational")}</a>
            <a href="#" className="hover:text-foreground">{t("footer.strip.crtvReligion")}</a>
            <a href="#" className="hover:text-foreground">{t("footer.strip.crtvNews")}</a>
          </div>
          <p className="text-center text-xs text-[color:var(--muted)]">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}

