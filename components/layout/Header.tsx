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
      <path d="M6 9l6 6 6-6"  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Header() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [langOpen, setLangOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
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

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { key: "home", href: "/", label: t("nav.home") },
    { key: "news", href: "/news", label: t("nav.news") },
    { key: "live", href: "/live", label: t("nav.live") },
    { key: "replay", href: "/replay", label: t("nav.replay") },
    { key: "radio", href: "/radio", label: t("nav.radio") },
    { key: "contact", href: "/contact", label: t("nav.contact") },
  ];

  const localeOptions = [
    { value: "fr", label: t("header.languages.fr"), flag: "https://flagcdn.com/w40/fr.png" },
    { value: "en", label: t("header.languages.en"), flag: "https://flagcdn.com/w40/gb.png" },
  ] as const;

  const currentLocale = localeOptions.find((o) => o.value === locale) ?? localeOptions[0];
  const isDarkMediaRoute =
    pathname.includes("/live") ||
    pathname.includes("/replay") ||
    pathname.includes("/radio") ||
    pathname.includes("/playback");
  const isDarkTheme = mounted && resolvedTheme === "dark";
  const useDarkHeader = isDarkMediaRoute || isDarkTheme;

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full backdrop-blur transition-all duration-300 ${
          useDarkHeader ? "bg-[#3333331e]" : "bg-[var(--fig-surface)]"
        } ${
          showHeader ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto flex h-[80px] md:h-[130px] max-w-[1920px] items-center justify-center px-4">
          <div className="flex w-full max-w-[1280px] items-center justify-between gap-4 md:grid md:grid-cols-[160px_1fr_220px] md:gap-6">
            
            {/* Mobile Menu Button */}
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M4 12H20M4 18H20" stroke={useDarkHeader ? "#E8E8E8" : "currentColor"} strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            <Link href="/" className="flex items-center">
              <SafeImage
                src={SITE_CONFIG.theme.placeholders.logo}
                alt={SITE_CONFIG.name}
                width={105}
                height={50}
                className="h-[40px] md:h-[50px] w-auto object-contain"
                priority
              />
            </Link>

            <nav className={`mx-auto hidden h-[50px] w-full max-w-[640px] items-center justify-center rounded-[60px] px-[10px] md:flex ${useDarkHeader ? "bg-[#2A2A2A]" : "bg-[#f7f3fa]/50"}`}>
              <div className="flex items-center gap-[8px]">
                {navItems.map((item) => {
                  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={`flex h-[30px] items-center justify-center rounded-[30px] px-4 text-[14px] transition-colors ${
                        useDarkHeader
                          ? active
                            ? "border border-[#8E8E8E] text-[#8E8E8E]"
                            : "text-[#8E8E8E] hover:text-white"
                          : active
                            ? "border text-[#5f3974] [border-color:var(--fig-border)]"
                            : "text-[#5f3974] hover:text-[var(--primary)]"
                      }`}
                    >
                      {item.key === "home" ? <HomeIcon /> : item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="flex items-center gap-2 md:ml-auto md:gap-6 lg:gap-10">
              <div ref={langRef} className="relative">
                <button
                  type="button"
                  onClick={() => setLangOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 md:gap-[9px]"
                >
                  <img
                    src={currentLocale.flag}
                    alt={currentLocale.label}
                    className="h-4 w-6 md:h-[18px] md:w-[28px] object-cover rounded-sm"
                  />
                  <div className="flex items-center gap-[5px]">
                    <span
                      className={`text-[14px] md:text-[18px] font-medium ${
                        useDarkHeader ? "text-[#E8E8E8]" : "text-[var(--fig-text-primary)]"
                      }`}
                    >
                      {currentLocale.value.toUpperCase()}
                    </span>
                    <ChevronDown
                      className={`h-3 w-3 md:h-[13px] md:w-[17px] transition-transform duration-200 ${
                        langOpen ? "rotate-180" : "rotate-0"
                      } ${useDarkHeader ? "text-[#E8E8E8]" : "text-[var(--fig-text-primary)]"}`}
                    />
                  </div>
                </button>

                {langOpen && (
                  <div className="absolute right-0 mt-2 w-[150px] rounded-xl border p-1 shadow-lg bg-[var(--fig-surface)] [border-color:var(--fig-border)] z-[60]">
                    {localeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setLangOpen(false);
                          router.replace(pathname, { locale: option.value });
                        }}
                        className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[13px] ${
                          useDarkHeader ? "text-[#E8E8E8]" : "text-[var(--fig-text-primary)]"
                        } hover:bg-black/5 dark:hover:bg-white/5 transition-colors`}
                      >
                        <img
                          src={option.flag}
                          alt={option.label}
                          className="h-3 w-4.5 object-cover rounded-sm"
                        />
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className={`hidden h-[40px] md:flex md:h-[50px] items-center gap-[5px] rounded-[60px] border px-[9px] ${useDarkHeader ? "border-[#4a4a4a]" : "[border-color:var(--fig-border)]"}`}>
                {(["light", "system", "dark"] as const).map((mode) => {
                  const active = mounted && (theme ?? "system") === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setTheme(mode)}
                      className={`flex h-[28px] w-[28px] md:h-[33px] md:w-[33px] items-center justify-center rounded-full transition-all ${
                        active ? "bg-[#4a4a4a] text-white" : useDarkHeader ? "text-[#E8E8E8]" : "text-[#5f3974] hover:bg-black/5"
                      }`}
                      aria-label={mode}
                    >
                      {mode === "light" && <IconSun className="h-3.5 w-3.5 md:h-4 md:w-4" />}
                      {mode === "system" && <IconMonitor className="h-3.5 w-3.5 md:h-4 md:w-4" />}
                      {mode === "dark" && <IconMoon className="h-3.5 w-3.5 md:h-4 md:w-4" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-[101] w-[280px] transform bg-[var(--fig-surface)] p-6 shadow-2xl transition-transform duration-300 md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <Link href="/">
            <SafeImage
              src={SITE_CONFIG.theme.placeholders.logo}
              alt={SITE_CONFIG.name}
              width={80}
              height={40}
              className="h-[35px] w-auto object-contain"
            />
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-[var(--fig-text-primary)]"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center rounded-xl px-4 py-3 text-[16px] font-medium transition-colors ${
                  active 
                    ? "bg-[var(--primary)] text-white" 
                    : "text-[var(--fig-text-primary)] hover:bg-black/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 border-t pt-8">
          <p className="mb-4 text-[12px] font-semibold uppercase tracking-wider text-[var(--fig-text-secondary)]">Mode d'affichage</p>
          <div className="flex gap-2 rounded-2xl border p-1 [border-color:var(--fig-border)]">
            {(["light", "system", "dark"] as const).map((mode) => {
              const active = mounted && (theme ?? "system") === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTheme(mode)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 transition-all ${
                    active ? "bg-[var(--primary)] text-white" : "text-[var(--fig-text-primary)] hover:bg-black/5"
                  }`}
                >
                  {mode === "light" && <IconSun className="h-4 w-4" />}
                  {mode === "system" && <IconMonitor className="h-4 w-4" />}
                  {mode === "dark" && <IconMoon className="h-4 w-4" />}
                  <span className="text-[13px] capitalize">{mode}</span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}