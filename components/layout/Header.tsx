"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Link, usePathname, useRouter } from "../../i18n/navigation";
import { SafeImage } from "../ui/SafeImage";
import { SITE_CONFIG } from "@/constants/site-config";

function HomeIcon() {
  return (
    <SafeImage src="/assets/homeicon.png" alt="Pub" width={25} height={23} />

  );
}
function IconSun(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 2v2.5M12 19.5V22M4 12H2M22 12h-2M5 5l1.8 1.8M17.2 17.2 19 19M19 5l-1.8 1.8M6.8 17.2 5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconMoon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M21 14.3A8.2 8.2 0 0 1 9.7 3a6.9 6.9 0 1 0 11.3 11.3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function IconMonitor(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Header() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [langOpen, setLangOpen] = React.useState(false);
  const [showHeader, setShowHeader] = React.useState(true);
  const lastScrollY = React.useRef(0);
  const langRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY <= 20) {
        setShowHeader(true);
      } else if (currentY > lastScrollY.current) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!langRef.current?.contains(event.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const navItems = [
    { key: "home", href: "/", label: t("nav.home") },
    { key: "news", href: "/news", label: t("nav.news") },
    { key: "live", href: "/live", label: t("nav.live") },
    { key: "replay", href: "/replay", label: t("nav.replay") },
    { key: "radio", href: "/radio", label: t("nav.radio") },
    { key: "contact", href: "/contact", label: t("nav.contact") },
  ];

  const localeOptions = [
    { value: "fr", label: "Français", flag: "https://flagcdn.com/w40/fr.png" },
    { value: "en", label: "English", flag: "https://flagcdn.com/w40/gb.png" },
  ] as const;

  const currentLocale = localeOptions.find((o) => o.value === locale) ?? localeOptions[0];

  return (
    <header
      className={`sticky top-0 z-50 w-full  bg-[var(--fig-surface)]/95 backdrop-blur transition-transform duration-300 ${
        showHeader ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto flex h-[130px] max-w-[1920px] items-center justify-center px-4">
        <div className="grid w-full max-w-[1280px] grid-cols-[160px_1fr_220px] items-center gap-6">
          <Link href="/" className="flex items-center">
            <SafeImage
              src={SITE_CONFIG.theme.placeholders.logo}
              alt={SITE_CONFIG.name}
              width={105}
              height={50}
              className="h-[50px] w-[105px] object-contain"
              priority
            />
          </Link>

          <nav className="mx-auto hidden h-[50px] w-full max-w-[640px] items-center justify-center rounded-[60px] bg-[#f7f3fa]/50 px-[10px] md:flex">
            <div className="flex items-center gap-[8px]">
              {navItems.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`flex h-[30px] items-center justify-center rounded-[30px] px-4 text-[14px] ${
                      active
                        ? "border text-[#5f3974] [border-color:var(--fig-border)]"
                        : "text-[#5f3974]"
                    }`}
                  >
                    {item.key === "home" ? <HomeIcon /> : item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div ref={langRef} className="relative">
              <button
                type="button"
                onClick={() => setLangOpen((prev) => !prev)}
                className="flex h-[34px] items-center gap-2 rounded-full border px-2 pr-3 text-[13px] text-[#333] [border-color:var(--fig-border)]"
              >
                <img src={currentLocale.flag} alt={currentLocale.label} className="h-4 w-6 rounded-[2px] object-cover" />
                <span>{currentLocale.value.toUpperCase()}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {langOpen && (
                <div className="absolute right-0 mt-2 w-[150px] rounded-xl border bg-[var(--fig-surface)] p-1 shadow-lg [border-color:var(--fig-border)]">
                  {localeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setLangOpen(false);
                        router.replace(pathname, { locale: option.value });
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[13px] text-[var(--fig-text-primary)] hover:bg-[#f4eef9]"
                    >
                      <img src={option.flag} alt={option.label} className="h-4 w-6 rounded-[2px] object-cover" />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex h-[50px] items-center gap-[5px] rounded-[60px] border px-[9px] [border-color:var(--fig-border)]">
              {(["light", "system", "dark"] as const).map((mode) => {
                const active = mounted && (theme ?? "system") === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTheme(mode)}
                    className={`flex h-[33px] w-[33px] items-center justify-center rounded-full ${
                      active ? "bg-[#4a4a4a] text-white" : "text-[#5f3974]"
                    }`}
                    aria-label={mode}
                  >
                    {mode === "light" && <IconSun className="h-4 w-4" />}
                    {mode === "system" && <IconMonitor className="h-4 w-4" />}
                    {mode === "dark" && <IconMoon className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}