import Image from "next/image";
import { SafeImage } from "../ui/SafeImage";
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

import { SITE_CONFIG } from "@/constants/site-config";
import { Link } from "@/i18n/navigation";


export function Footer() {
  const t = useTranslations();

  return (
    <footer className="w-full border-t border-[color:var(--border)] bg-foreground/3 backdrop-blur-sm  ">
      <div className="mx-auto max-w-[1440px] px-6 py-12 sm:px-8 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr_1fr]">
          <div className="space-y-4 sm:pr-10 gap-10">
            <div className="flex items-center gap-3  min-w-[150px]  ">
              <SafeImage
                src={SITE_CONFIG.theme.placeholders.logo}
                alt="CRTV"
                width={154}
                height={34}
                className="object-contain rounded-sm"
              />
            </div>
            <p className="max-w-xs text-sm text-[color:var(--muted)]">
              {t("footer.description")}
            </p>

            <div className="flex items-center gap-3 min-w-[235px]  ">
              <a
                href={SITE_CONFIG.apps.googlePlay}
                target="_blank"
                rel="noopener noreferrer"
              >
                <SafeImage
                  src="/assets/backgrounds/store.webp"
                  alt="CRTV on Google Play"
                  width={135}
                  height={40}
                  className="h-11 w-full rounded-sm"
                />
              </a>


              <a
                href={SITE_CONFIG.apps.appleStore}
                target="_blank"
                rel="noopener noreferrer"
              >
                <SafeImage
                  src="/assets/backgrounds/apple.png"
                  alt="CRTV on App Store"
                  width={235}
                  height={40}
                  className="h-11 w-full rounded-sm"
                />
              </a>
            </div>

            <div className="flex items-center gap-5 text-[color:var(--muted)]">
              <a
                href={SITE_CONFIG.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)] hover:text-foreground hover:bg-white hover:border-white transition-all"
              >
                <IconFacebook className="h-7 w-7" />
              </a>
              <a
                href={SITE_CONFIG.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)] hover:text-foreground hover:bg-white hover:border-white transition-all"
              >
                <IconX className="h-7 w-7" />
              </a>
              <a
                href={SITE_CONFIG.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)] hover:text-foreground hover:bg-white hover:border-white transition-all"
              >
                <IconYouTube className="h-7 w-7" />
              </a>
              <a
                href={SITE_CONFIG.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)] hover:text-foreground hover:bg-white hover:border-white transition-all"
              >
                <IconLinkedIn className="h-7 w-7" />
              </a>
              <a
                href={SITE_CONFIG.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)] hover:text-foreground hover:bg-white hover:border-white transition-all"
              >
                <IconInstagram className="h-7 w-7" />
              </a>
              <a
                href={SITE_CONFIG.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)] hover:text-foreground hover:bg-white hover:border-white transition-all"
              >
                {/* Fallback for TikTok icon since it's not defined, or I can add one */}
                <svg className="h-8   w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.01 1.62 4.2 1.13 1.33 2.77 2.13 4.49 2.19v3.86a11.583 11.583 0 01-5.32-1.35c.03 4.1.02 8.21.03 12.31 0 2.25-.87 4.41-2.45 6.01-1.84 1.83-4.48 2.62-6.95 2.15-2.61-.41-4.88-2.26-5.83-4.72-1.12-2.73-.65-6 1.15-8.23 1.41-1.83 3.73-2.85 6.05-2.6v3.9c-1.2-.18-2.44.22-3.32 1.05-.85.76-1.28 1.94-1.13 3.07.11 1.25.96 2.37 2.11 2.85.96.42 2.06.39 2.98-.12.87-.45 1.48-1.36 1.61-2.33.04-1.16.03-2.32.03-3.48V0l.02.02z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold">{t("footer.about")}</div>
            <ul className="space-y-2 text-sm text-[color:var(--muted)]">
              <li>
                <Link href="/about" className="hover:text-foreground">
                  {t("footer.links.about")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground">
                  {t("footer.links.crtvCameroon")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  {t("footer.links.helpCenters")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  {t("footer.links.contact")}
                </Link>
              </li>

            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold">{t("footer.resources")}</div>
            <ul className="space-y-2 text-sm text-[color:var(--muted)]">
              <li>
                <Link href="/live" className="hover:text-foreground">
                  {t("footer.links.tv")}
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-foreground">
                  {t("footer.links.news")}
                </Link>
              </li>
              <li>
                <Link href="/radio" className="hover:text-foreground">
                  {t("footer.links.radio")}
                </Link>
              </li>
              <li>
                <Link href="/replay" className="hover:text-foreground">
                  {t("footer.links.replay")}
                </Link>
              </li>

            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold">
              {t("footer.commitments")}
            </div>
            <ul className="space-y-2 text-sm text-[color:var(--muted)]">
              <li>
                <Link href="/commitments" className="hover:text-foreground">
                  {t("footer.links.quality")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  {t("footer.links.terms")}
                </Link>
              </li>

              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  {t("footer.links.data")}
                </Link>
              </li>

            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold">{t("footer.other")}</div>
            <ul className="space-y-2 text-sm text-[color:var(--muted)]">
              <li>
                <Link href="/legal" className="hover:text-foreground">
                  {t("footer.links.legal")}
                </Link>
              </li>
              <li>
                <Link href="/advertising" className="hover:text-foreground">
                  {t("footer.links.ads")}
                </Link>
              </li>

            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-[color:var(--border)] pt-6">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-[color:var(--muted)]">
            <Link href="/" className="hover:text-foreground">{t("footer.strip.crtv")}</Link>
            <Link href="/live?channel=crtv-sport" className="hover:text-foreground">{t("footer.strip.crtvSport")}</Link>
            <Link href="/radio?channel=poste-national" className="hover:text-foreground">{t("footer.strip.posteNational")}</Link>
            <Link href="/live" className="hover:text-foreground">{t("footer.strip.crtvReligion")}</Link>
            <Link href="/live?channel=crtv-news" className="hover:text-foreground">{t("footer.strip.crtvNews")}</Link>
          </div>
          <p className="text-center text-xs text-[color:var(--muted)]">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}

