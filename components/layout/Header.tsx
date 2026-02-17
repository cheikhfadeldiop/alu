"use client";

import * as React from "react";
import Image from "next/image";
import { SafeImage } from "../ui/SafeImage";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { Link, usePathname, useRouter } from "../../i18n/navigation";
import { FlagStripe } from "./FlagStripe";

type NavItem = {
  key: string;
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

function IconSun(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 2v2.5M12 19.5V22M4 12H2M22 12h-2M5 5l1.8 1.8M17.2 17.2 19 19M19 5l-1.8 1.8M6.8 17.2 5 19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMoon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M21 14.3A8.2 8.2 0 0 1 9.7 3a6.9 6.9 0 1 0 11.3 11.3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMonitor(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect
        x="2"
        y="3"
        width="20"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 21h8M12 17v4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconHome(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}

function IconInfo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function IconLive(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="2" />
      <path d="M16.24 7.76a6 6 0 0 1 0 8.48m-8.48 0a6 6 0 0 1 0-8.48m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
    </svg>
  );
}

function IconVideo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

function IconAudio(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function IconCorporate(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function IconContact(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}


import { SITE_CONFIG } from "@/constants/site-config";

export function Header() {
  const t = useTranslations();
  const locale = useLocale();

  const pathname = usePathname();
  const router = useRouter();

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  const [isLangDropdownOpen, setIsLangDropdownOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const navItems: NavItem[] = [
    { key: "home", href: "/", label: t("nav.home"), icon: IconHome },
    { key: "news", href: "/news", label: t("nav.news"), icon: IconInfo },
    { key: "live", href: "/live", label: t("nav.live"), icon: IconLive },
    { key: "replay", href: "/replay", label: t("nav.replay"), icon: IconVideo },
    { key: "radio", href: "/radio", label: t("nav.radio"), icon: IconAudio },
    { key: "corporate", href: "/news2", label: t("nav.corporate"), icon: IconCorporate },
    { key: "contact", href: "/contact", label: t("nav.contact"), icon: IconContact },
  ];

  const themeOptions = [
    { value: "system", label: t("header.themes.system"), icon: IconMonitor },
    { value: "light", label: t("header.themes.light"), icon: IconSun },
    { value: "dark", label: t("header.themes.dark"), icon: IconMoon },
  ];

  const languageOptions = [
    { value: "fr", label: "Français", flag: "🇫🇷" },
    { value: "en", label: "English", flag: "🇬🇧" },
  ];

  const currentLanguage = languageOptions.find((lang) => lang.value === locale);
  const currentThemeIndex = themeOptions.findIndex((opt) => opt.value === theme);

  return (

    <header className="sticky top-0 z-50 w-full">
      <div>
        <FlagStripe />
      </div>

      <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-8">
        {/* Logo */}
        <div className="flex items-center ">
          <Link href="/" className="flex items-center gap-2">
            <SafeImage
              src={SITE_CONFIG.theme.placeholders.logo}
              alt="CRTV"
              width={72}
              height={72}
              className="h-10 w-20"
              priority
            />
          </Link>
        </div>

        {/* Navigation - Fond transparent gris en light, noir en dark */}
        <nav className="flex items-center gap-1 rounded-full p-1 bg-foreground/5 backdrop-blur-sm ">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const isLive = item.key === "live";

            return (
              <Link
                key={item.key}
                href={item.href}
                className={[
                  "relative flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-300 min-w-[44px] justify-center",
                  active
                    ? "border-2 border-[color:var(--accent)] bg-gackground "
                    : "",
                ].join(" ")}
              >
                {active ? (
                  <item.icon className="h-5 w-5 text-foreground" />
                ) : (
                  <div className="flex items-center gap-1.5">
                    {isLive && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)] animate-pulse" aria-hidden />
                    )}
                    <span>{item.label}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-2 ">
          {/* Language Dropdown - Fond transparent gris en light, noir en dark */}
          <div className="relative">
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-md  px-3 text-[13px] font-medium transition-colors ] text-gray-900 hover:bg-gray-400/40 dark:text-foreground bg-foreground/5 backdrop-blur-sm"
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              aria-label={t("header.language")}
            >
              <span className="text-[11px]">{currentLanguage?.flag}</span>
              <span>{currentLanguage?.value.toUpperCase()}</span>
              <IconChevronDown className="h-4 w-4 opacity-50" />
            </button>

            {isLangDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsLangDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-lg border shadow-lg border-gray-400/50 bg-gray-400/80 backdrop-blur-md dark:border-white/20 ">
                  {languageOptions.map((lang) => (
                    <button
                      key={lang.value}
                      type="button"
                      className={[
                        "flex w-full items-center gap-2 px-3 py-2 text-[13px] font-medium transition-colors",
                        locale === lang.value
                          ? "bg-white/40 text-gray-900 dark:bg-white/10 dark:text-white"
                          : "text-gray-700 hover:bg-white/20 dark:text-gray-300 dark:hover:bg-white/10",
                      ].join(" ")}
                      onClick={() => {
                        router.replace(pathname, { locale: lang.value });
                        setIsLangDropdownOpen(false);
                      }}
                    >
                      <span className="text-[11px]">{lang.flag}</span>
                      <span className="flex-1 text-left">{lang.label}</span>
                      {locale === lang.value && (
                        <IconCheck className="h-4 w-4" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Theme Selector - Fond transparent gris en light, noir en dark */}
          <div className="relative inline-flex h-8 items-center rounded-lg border border-gray-400/50 py-5
          ">
            {/* Sliding background */}
            {mounted && (
              <div
                className="absolute h-[calc(100%-4px)] w-[calc(33.333%-2px)] rounded-[4px] transition-transform duration-300 ease-out "
                style={{
                  transform: `translateX(${currentThemeIndex * 100}%)`,
                }}
              />
            )}

            {/* Theme buttons */}
            {themeOptions.map((option, index) => {
              const Icon = option.icon;
              const isActive = mounted && theme === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  suppressHydrationWarning
                  className={[

                    "relative z-10 rounded-sm flex m-1 h-full items-center justify-center py-3.5 px-2.5 text-[11px] font-medium transition-colors duration-200",
                    isActive
                      ? "text-background bg-foreground   "
                      : "text-foreground hover:bg-foreground   dark:hover:text-background  bg-foreground/5 backdrop-blur-sm",
                  ].join(" ")}
                  onClick={() => setTheme(option.value)}
                  aria-label={option.label}
                >
                  <Icon className={`h-4.5 w-4.5 `} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

    </header>
  );
}