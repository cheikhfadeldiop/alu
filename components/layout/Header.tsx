"use client";

import * as React from "react";
import Image from "next/image";
import { SafeImage } from "../ui/SafeImage";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { Link, usePathname, useRouter } from "../../i18n/navigation";
function IconMenu(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M4 6h16M4 12h16M4 18h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

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

function IconWhatsApp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.031 21.196c-1.642 0-3.351-.433-4.731-1.246l-0.339-.2-4.043 1.06 1.08-3.939-.219-.348c-0.88-1.396-1.344-3.08-1.344-4.792 0-4.904 4.092-8.892 8.59-8.892 2.179 0 4.228.848 5.767 2.388s2.387 3.588 2.387 5.767c0 4.904-4.092 8.892-8.59 8.892zM12.031 2a11.109 11.109 0 0 0-9.824 5.922 11.39 11.39 0 0 0-0.342 9.426l-1.865 6.802 7.042-1.846a11.025 11.025 0 0 0 5.011 1.201h0.007c6.046 0 11.064-4.887 11.064-10.892 0-2.894-1.127-5.614-3.176-7.663a11.077 11.077 0 0 0-7.917-3.15zM17.024 13.912c-0.274-.137-1.621-.8-1.872-.891s-.433-.137-.617.137-.708.891-.868 1.073-.32.206-.594.069a7.482 7.482 0 0 1-2.204-1.355 8.242 8.242 0 0 1-1.525-1.898c-.16-.274-.017-.423.12-.559.123-.122.274-.32.411-.48s.183-.274.274-.457.046-.343-.023-.48-.617-1.485-.845-2.034c-.223-.537-.44-.463-.617-.472s-.365-.011-.561-.011-.515.074-.785.372-.103 1.052.103 2.103c.515 1.052 1.487 2.012 2.656 2.677a11.842 11.842 0 0 0 5.253 1.554c1.1.067 2.34-.14 3.013-.274.457-.091.731-.549.731-1 0-.152-.008-.312-.023-.483-.023-.274-.114-.503-.389-.636z" />
    </svg>
  );
}

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
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Increased hysteresis gap (120/40) for maximum stability.
      // This ensures that slow scroll movements don't trigger rapid state flipping.
      if (scrollY > 120) {
        if (!isScrolled) setIsScrolled(true);
      } else if (scrollY < 40) {
        if (isScrolled) setIsScrolled(false);
      }
    };

    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", scrollListener, { passive: true });
    return () => window.removeEventListener("scroll", scrollListener);
  }, [isScrolled]);

  const navItems: NavItem[] = [
    { key: "home", href: "/", label: t("nav.home"), icon: IconHome },
    { key: "news", href: "/news", label: t("nav.news"), icon: IconInfo },
    { key: "live", href: "/live", label: t("nav.live"), icon: IconLive },
    { key: "replay", href: "/replay", label: t("nav.replay"), icon: IconVideo },
    { key: "radio", href: "/radio", label: t("nav.radio"), icon: IconAudio },
    { key: "corporate", href: "/corporate", label: t("nav.corporate"), icon: IconCorporate },
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

    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ease-in-out 
      }`}>
      <FlagStripe />

      {/* Scrollable Top Part - Optimized for performance */}
      <div
        className={`overflow-hidden transition-all duration-200 ease-out will-change-[height,opacity,transform] ${isScrolled ? "h-0 opacity-0 -translate-y-2 pointer-events-none" : "h-[40px] opacity-100 translate-y-0"
          }`}
      >
        <div className="mx-auto flex max-w-[1400px] justify-end px-4 sm:px-8 py-2">
          <div className="hidden sm:flex items-center gap-2 ">
            {[
              { icon: IconFacebook, href: SITE_CONFIG.social.facebook, label: "Facebook" },
              { icon: IconInstagram, href: SITE_CONFIG.social.instagram, label: "Instagram" },
              { icon: IconX, href: SITE_CONFIG.social.twitter, label: "X" },
              { icon: IconWhatsApp, href: `https://wa.me/${SITE_CONFIG.contact.whatsapp}`, label: "WhatsApp" },
              { icon: IconYouTube, href: SITE_CONFIG.social.youtube, label: "YouTube" },
            ].map((social, idx) => (
              <a
                key={idx}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="h-8 w-8  flex items-center justify-center rounded-full bg-foreground/80 text-background/90 hover:bg-[color:var(--accent)] hover:text-white transition-all duration-300"
              >
                <social.icon className="h-6 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className={` mx-auto flex max-w-[1400px] items-center justify-between px-4 sm:px-8 transition-all duration-200 ease-out will-change-[height] mt-2
        }`}>
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

        {/* Navigation - Desktop */}
        <nav className="hidden lg:flex items-center gap-1 rounded-full p-1 bg-foreground/5 backdrop-blur-sm">
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
                    ? "ring-2 ring-[color:var(--accent)] "
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
                    {active && <item.icon className="h-4 w-4 text-[color:var(--accent)]" />}
                    <span>{item.label}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-2  ">
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

          {/* Theme Selector - Desktop */}
          <div className="hidden sm:inline-flex h-8 items-center rounded-lg border border-gray-400/50 py-5
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

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="flex lg:hidden h-10 w-10 items-center justify-center rounded-full bg-foreground/5 text-foreground transition-colors hover:bg-foreground/10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? (
              <IconX className="h-6 w-6" />
            ) : (
              <IconMenu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[280px] bg-background p-6 shadow-2xl transition-transform duration-300">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <SafeImage
                  src={SITE_CONFIG.theme.placeholders.logo}
                  alt="CRTV"
                  width={60}
                  height={60}
                  className="h-8 w-16 grayscale brightness-0 dark:invert"
                />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-foreground/5"
                >
                  <IconX className="h-6 w-6" />
                </button>
              </div>

              <nav className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={[
                        "flex items-center gap-4 rounded-xl px-4 py-3 text-base font-semibold transition-all duration-200",
                        active
                          ? "bg-[color:var(--accent)] text-white shadow-lg shadow-[color:var(--accent)]/20"
                          : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground",
                      ].join(" ")}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto pt-8 border-t border-foreground/10">
                <div className="flex flex-col gap-6">
                  {/* Theme Selector - Mobile */}
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground/40 px-2">
                      Theme
                    </span>
                    <div className="grid grid-cols-3 gap-2 bg-foreground/5 p-1 rounded-xl">
                      {themeOptions.map((option) => {
                        const Icon = option.icon;
                        const isActive = mounted && theme === option.value;
                        return (
                          <button
                            key={option.value}
                            onClick={() => setTheme(option.value)}
                            className={[
                              "flex flex-col items-center gap-1.5 py-3 rounded-lg transition-all",
                              isActive
                                ? "bg-background text-foreground shadow-sm"
                                : "text-foreground/40 hover:text-foreground/70"
                            ].join(" ")}
                          >
                            <Icon className="h-5 w-5" />
                            <span className="text-[10px] font-bold uppercase tracking-tight">{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    {[
                      { icon: IconFacebook, href: SITE_CONFIG.social.facebook },
                      { icon: IconInstagram, href: SITE_CONFIG.social.instagram },
                      { icon: IconX, href: SITE_CONFIG.social.twitter },
                      { icon: IconWhatsApp, href: `https://wa.me/${SITE_CONFIG.contact.whatsapp}` },
                      { icon: IconYouTube, href: SITE_CONFIG.social.youtube },
                    ].map((social, idx) => (
                      <a
                        key={idx}
                        href={social.href}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-foreground/5 text-foreground/60"
                      >
                        <social.icon className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}