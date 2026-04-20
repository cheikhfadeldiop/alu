"use client";

import { SafeImage } from "../ui/SafeImage";
import { SITE_CONFIG } from "@/constants/site-config";
import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export function Footer() {
  const pathname = usePathname();
  const t = useTranslations("footer");
  const isDarkMediaRoute =
    pathname.includes("/live") ||
    pathname.includes("/replay") ||
    pathname.includes("/radio");

  return (
    <footer
      className={`relative z-20 w-full px-4 pb-[50px] ${isDarkMediaRoute ? "mt-0 bg-[#171717]" : "mt-[50px]"
        }`}
    >
      <div
        className={`mx-auto max-w-[1812px] rounded-[55px] px-6 py-[43px] md:px-[120px] ${isDarkMediaRoute ? "bg-[#1F1F1F]" : "bg-[var(--fig-surface)]"
          }`}
      >
        <div className="mx-auto max-w-[1284px] ">
          <div className="grid items-start gap-10 md:grid-cols-[364px_1fr_281px] justify-between">
            <div className="space-y-[14px]">
              <SafeImage src={SITE_CONFIG.theme.placeholders.logo} alt={SITE_CONFIG.name} width={119} height={57} className="h-[57px] w-[119px] object-contain" />
              <p className={`fig-b3 ${isDarkMediaRoute ? "text-[#E8E8E8]" : "text-[var(--fig-text-primary)]"}`}>
                {SITE_CONFIG.description}
              </p>
            </div>

            <div>
              <h3 className={`fig-h10 ${isDarkMediaRoute ? "text-[#E8E8E8]" : "text-[var(--fig-text-primary)]"}`}>{t("links.contact")}</h3>
              <div className={`mt-[22px] space-y-5 text-[16px] leading-[24px] ${isDarkMediaRoute ? "text-[#E8E8E8]" : "text-[var(--fig-text-primary)]"}`}>
                <p>{SITE_CONFIG.contact.address}</p>
                <p>{SITE_CONFIG.contact.phones}</p>
                <p>{SITE_CONFIG.contact.email}</p>
              </div>
            </div>

            <div>
              <h3 className={`fig-h10 ${isDarkMediaRoute ? "text-[#E8E8E8]" : "text-[var(--fig-text-primary)]"}`}>{t("downloadApp")}</h3>
              <div className="mt-[30px] flex items-center gap-[7px] ">
                <a href={SITE_CONFIG.apps.appleStore} target="_blank" rel="noopener noreferrer" className="block h-[40px] hover-lift-primary rounded-[5px]">
                  <SafeImage src="/assets/backgrounds/apple.png" alt="App Store" width={135} height={40} className="h-full w-auto object-contain" />
                </a>
                <a href={SITE_CONFIG.apps.googlePlay} target="_blank" rel="noopener noreferrer" className="block h-[40px] hover-lift-primary rounded-[5px]">
                  <SafeImage src="/assets/backgrounds/store.webp" alt="Google Play" width={135} height={40} className="h-full w-auto object-contain" />
                </a>
              </div>
            </div>
          </div>

          <div className={`mt-[56px] border-t pt-[19px] ${isDarkMediaRoute ? "border-[#3A3A3A]" : "[border-color:var(--fig-border)]"}`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className={`flex items-center gap-[15px] ${isDarkMediaRoute ? "text-[#E8E8E8]" : "text-[var(--fig-text-primary)]"}`}>
                <a
                  href={SITE_CONFIG.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("social.facebook")}
                  className="inline-flex h-[16px] w-6 items-center justify-center transition-opacity hover:opacity-80 hover-lift-primary rounded-[3px]"
                >
                  <svg viewBox="0 0 24 25" className="h-[15px] w-6 fill-current" aria-hidden="true">
                    <path d="M13.73 24.5v-10.2h3.42l.51-3.98h-3.93V7.78c0-1.15.32-1.93 1.97-1.93h2.11V2.3A28.8 28.8 0 0 0 14.74 2c-3 0-5.05 1.83-5.05 5.18v2.89H6.3v3.98h3.39V24.5h4.04z" />
                  </svg>
                </a>
                <a
                  href={SITE_CONFIG.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("social.twitter")}
                  className="inline-flex h-[16px] w-6 items-center justify-center transition-opacity hover:opacity-80 hover-lift-primary rounded-[3px]"
                >
                  <svg viewBox="0 0 24 25" className="h-[15px] w-6 fill-current" aria-hidden="true">
                    <path d="M14.3 10.98 22.23 1.5H20.35l-6.9 8.25L7.95 1.5H1.6l8.32 12.13L1.6 23.5h1.88l7.28-8.7 5.97 8.7h6.35L14.3 10.98Zm-2.58 3.08-.84-1.2L4.2 3.3H7.1l5.39 7.68.84 1.2 7.01 10.02h-2.9l-5.72-8.14Z" />
                  </svg>
                </a>
                <a
                  href={SITE_CONFIG.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("social.linkedin")}
                  className="inline-flex h-[16px] w-6 items-center justify-center transition-opacity hover:opacity-80 hover-lift-primary rounded-[3px]"
                >
                  <svg viewBox="0 0 24 25" className="h-[15px] w-6 fill-current" aria-hidden="true">
                    <path d="M5.34 8.92a2.14 2.14 0 1 1 0-4.28 2.14 2.14 0 0 1 0 4.28ZM3.5 22.5h3.7V10.4H3.5V22.5Zm5.86 0h3.7v-6.04c0-1.6.3-3.15 2.3-3.15 1.98 0 2 1.85 2 3.25v5.94H21v-6.68c0-3.28-.7-5.8-4.53-5.8-1.84 0-3.07 1-3.58 1.98h-.05V10.4h-3.48V22.5Z" />
                  </svg>
                </a>
                <a
                  href={SITE_CONFIG.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("social.instagram")}
                  className="inline-flex h-[17px]  w-6 items-center justify-center transition-opacity hover:opacity-80 hover-lift-primary rounded-[3px]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-[15px] w-6 fill-current"
                    aria-hidden="true"
                  >
                    <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm10 2c1.66 0 3 1.34 3 3v10c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V7c0-1.66 1.34-3 3-3h10zm-5 3.5A5.5 5.5 0 1 0 17.5 13 5.5 5.5 0 0 0 12 7.5zm0 9A3.5 3.5 0 1 1 15.5 13 3.5 3.5 0 0 1 12 16.5zm4.75-9.75a1.25 1.25 0 1 0 1.25 1.25 1.25 1.25 0 0 0-1.25-1.25z" />
                  </svg>
                </a>
              </div>
              <p className={`text-[12px] md:text-[14px] text-center md:text-left ${isDarkMediaRoute ? "text-[#E8E8E8]" : "text-[var(--fig-text-primary)]"}`}>
                {t("copyright")}
              </p>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}

