"use client";

import * as React from "react";
import Image from "next/image";
import { SafeImage } from "../ui/SafeImage";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Link, usePathname, useRouter } from "../../i18n/navigation";
import { useSearchParams } from "next/navigation";
import { SITE_CONFIG } from "@/constants/site-config";
import { FlagStripe } from "./FlagStripe";

/* ──────────────────────────────────────────────
   SVG Icons
─────────────────────────────────────────────── */
function IconMenu(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function IconX(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M6 18 18 6M6 6l12 12"
        stroke="background"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconFacebook(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none"  {...props}>
      <path
        d="M14 8h2V5h-2c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.2l.8-3H13V9c0-.6.4-1 1-1Z"
        fill="background"
      />
    </svg>
  );
}



function IconInstagram(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z"
        stroke="background"
        strokeWidth="1.6"
      />
      <path
        d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="background"
        strokeWidth="1.6"
      />
      <path
        d="M17.5 6.5h.01"
        stroke="background"
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
        fill="background"
      />
      <path d="m9.5 15.02 6.02-3.27-6.02-3.27v6.54Z" fill="grey" />
    </svg>
  );
}

function IconWhatsApp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="background" {...props}>
      <path d="M12.031 21.196c-1.642 0-3.351-.433-4.731-1.246l-0.339-.2-4.043 1.06 1.08-3.939-.219-.348c-0.88-1.396-1.344-3.08-1.344-4.792 0-4.904 4.092-8.892 8.59-8.892 2.179 0 4.228.848 5.767 2.388s2.387 3.588 2.387 5.767c0 4.904-4.092 8.892-8.59 8.892zM12.031 2a11.109 11.109 0 0 0-9.824 5.922 11.39 11.39 0 0 0-0.342 9.426l-1.865 6.802 7.042-1.846a11.025 11.025 0 0 0 5.011 1.201h0.007c6.046 0 11.064-4.887 11.064-10.892 0-2.894-1.127-5.614-3.176-7.663a11.077 11.077 0 0 0-7.917-3.15zM17.024 13.912c-0.274-.137-1.621-.8-1.872-.891s-.433-.137-.617.137-.708.891-.868 1.073-.32.206-.594.069a7.482 7.482 0 0 1-2.204-1.355 8.242 8.242 0 0 1-1.525-1.898c-.16-.274-.017-.423.12-.559.123-.122.274-.32.411-.48s.183-.274.274-.457.046-.343-.023-.48-.617-1.485-.845-2.034c-.223-.537-.44-.463-.617-.472s-.365-.011-.561-.011-.515.074-.785.372-.103 1.052.103 2.103c.515 1.052 1.487 2.012 2.656 2.677a11.842 11.842 0 0 0 5.253 1.554c1.1.067 2.34-.14 3.013-.274.457-.091.731-.549.731-1 0-.152-.008-.312-.023-.483-.023-.274-.114-.503-.389-.636z" />
    </svg>
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
function IconHome(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}
function IconInfo(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>;
}
function IconLive(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="2" /><path d="M16.24 7.76a6 6 0 0 1 0 8.48m-8.48 0a6 6 0 0 1 0-8.48m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" /></svg>;
}
function IconVideo(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>;
}
function IconAudio(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v1a7 7 0 0 1-14 0v-1" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>;
}
function IconCorporate(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>;
}
function IconContact(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>;
}
function IconCheck(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 20 20" fill="currentColor" {...props}><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
}

type NavItem = {
  key: string;
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

/* ──────────────────────────────────────────────
   ScrollResetter — resets to top on route change
─────────────────────────────────────────────── */
function ScrollResetter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    // Reset scroll to top on every navigation (path or search params change)
    // Small timeout to allow the browser to start rendering the new state
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, 10);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return null;
}

/* ──────────────────────────────────────────────
   Header
─────────────────────────────────────────────── */
export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      const y = window.scrollY;
      if (y > 120) setIsScrolled(true);
      else if (y < 40) setIsScrolled(false);
    };
    let ticking = false;
    const listener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => { handleScroll(); ticking = false; });
        ticking = true;
      }
    };
    window.addEventListener("scroll", listener, { passive: true });
    return () => window.removeEventListener("scroll", listener);
  }, []);

  const navItems = React.useMemo<NavItem[]>(() => [
    { key: "home", href: "/", label: t("nav.home"), icon: IconHome },
    { key: "news", href: "/news", label: t("nav.news"), icon: IconInfo },
    { key: "live", href: "/live", label: t("nav.live"), icon: IconLive },
    { key: "replay", href: "/replay", label: t("nav.replay"), icon: IconVideo },
    { key: "audio", href: "/audio", label: t("nav.audio"), icon: IconAudio },
    { key: "corporate", href: "/corporate", label: t("nav.corporate"), icon: IconCorporate },
    { key: "contact", href: "/contact", label: t("nav.contact"), icon: IconContact },
  ], [t]);

  const themeOptions = React.useMemo(() => [
    { value: "light", label: t("header.themes.light"), icon: IconSun },
    { value: "system", label: t("header.themes.system"), icon: IconMonitor },
    { value: "dark", label: t("header.themes.dark"), icon: IconMoon },
  ], [t]);

  const languageOptions = React.useMemo(() => [
    { value: "fr", label: "Français", flag: "🇫🇷" },
    { value: "en", label: "English", flag: "🇬🇧" },
  ], []);

  const currentLanguage = languageOptions.find((l) => l.value === locale);

  const socials = React.useMemo(() => [
    { icon: IconFacebook, href: SITE_CONFIG.social.facebook, label: "Facebook" },
    { icon: IconInstagram, href: SITE_CONFIG.social.instagram, label: "Instagram" },
    { icon: IconX, href: SITE_CONFIG.social.twitter, label: "X" },
    { icon: IconWhatsApp, href: `https://wa.me/${SITE_CONFIG.contact.whatsapp}`, label: "WhatsApp" },
    { icon: IconYouTube, href: SITE_CONFIG.social.youtube, label: "YouTube" },
  ], []);

  return (
    <>
      {/* Scroll-to-top on navigation */}
      <ScrollResetter />

      <header className="sticky top-0 z-50 w-full">
        <FlagStripe />

        {/* ── Social bar (hides on scroll) ── */}
        <div
          className={`overflow-hidden transition-all duration-200 ease-out ${isScrolled ? "h-0 opacity-0 pointer-events-none" : "h-[60px] opacity-100"
            }`}
        >
          <div className="mx-auto flex max-w-[1460px] justify-end px-6 md:px-10 py-4">
            <div className="hidden sm:flex items-center gap-1.5">
              {socials.map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="h-7 w-7 flex items-center justify-center rounded-full bg-neutral-900 text-neutral-100 hover:bg-accent hover:scale-110 transition-all duration-300 shadow-sm">
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main nav bar ── */}
        <div className="mx-auto flex max-w-[1465px] items-center justify-between px-6 md:px-10 py-3 mt-1">

          {/* Logo (Figma: 149×53) */}
          <Link href="/" className="flex items-center shrink-0">
            <SafeImage
              src={SITE_CONFIG.theme.placeholders.logo}
              alt="CRTV"
              width={149}
              height={53}
              className="h-[53px] w-[149px] object-contain"
              priority
            />
          </Link>

          {/* ── Desktop Nav pill (Figma: 786×60, bg #F5F5F5 + backdrop-blur) ── */}
          <nav
            className="hidden lg:flex items-center justify-center bg-neutral-200"
            style={{
              height: 60,
              padding: 10,
              /* keep Figma #F5F5F5 tint but add frosted glass */
              //background: "rgba(245, 245, 245, 0.9)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderRadius: 15,
              // border: "1px solid rgba(255,255,255,0.6)",
            }}
          >
            <div className="flex items-center" style={{ gap: 15, height: 40 }}>
              {navItems.map((item) => {
                /*
                  Recompute active purely from current pathname — no local state.
                  This ensures the red border disappears instantly on navigation.
                */
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                const isLive = item.key === "live";
                const isHome = item.key === "home";

                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    prefetch={true}
                    className={`
                      relative flex items-center justify-center px-4 py-2 rounded-full h-[37px] 
                      no-underline font-['Inter'] font-normal text-sm leading-[21px] whitespace-nowrap
                      transition-all duration-200 ease-out border
                      ${active
                        ? "border-[color:var(--accent)]"
                        : "border-transparent hover:bg-foreground/5"}
                    `}
                  >
                    {isHome ? (
                      <item.icon className="w-6 h-6 text-muted/90" />
                    ) : isLive ? (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f00011] shrink-0 animate-pulse" />
                        {item.label}
                      </span>
                    ) : (
                      item.label
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* ── Right controls ── */}
          <div className="flex items-center gap-4">

            {/* Theme Switcher (Figma: 127×47, border #E8E8E8, radius 10, 3 options 33×33) */}
            <div
              className="hidden sm:flex items-center justify-center"
              style={{
                width: 127,
                height: 47,
                border: "1px solid #b1b1b183",
                borderRadius: 10,
                padding: "0 9px",
              }}
            >
              {/* Inner options row (Figma: 109×33, gap 5) */}
              <div style={{ display: "flex", alignItems: "center", gap: 5, width: 109, height: 33 }}>
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = mounted && theme === option.value;

                  /*
                    Figma active (selected):
                      - system/monitor → bg #4A4A4A, icon white
                      - light/sun      → bg #E8E8E8, icon #333
                      - dark/moon      → bg #E8E8E8, icon #333
                    (in the Figma screenshot "system" appears selected with dark bg)
                    We adapt: active = bg based on theme context
                  */
                  const activeBg = option.value === "system" ? "#4A4A4A" : "#E8E8E8";
                  const activeIconColor = option.value === "system" ? "#FFFFFF" : "#333333";

                  return (
                    <button
                      key={option.value}
                      type="button"
                      suppressHydrationWarning
                      onClick={() => setTheme(option.value)}
                      aria-label={option.label}
                      style={{
                        width: 33, height: 33,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        borderRadius: 2,
                        border: "none",
                        cursor: "pointer",
                        background: isActive ? activeBg : "transparent",
                        transition: "background 0.15s",
                        flexShrink: 0,
                      }}
                    >
                      <Icon
                        style={{
                          width: 20, height: 20,
                          color: isActive ? activeIconColor : "#777777",
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile burger */}
            <button
              type="button"
              className="flex lg:hidden h-10 w-10 items-center justify-center rounded-full bg-foreground/5 text-foreground hover:bg-foreground/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <IconX className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu Overlay ── */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="absolute right-0 top-0 h-full w-[280px] bg-background p-6 shadow-2xl">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <SafeImage
                    src={SITE_CONFIG.theme.placeholders.logo}
                    alt="CRTV"
                    width={60}
                    height={60}
                    className="h-8 w-16 grayscale brightness-0 dark:invert"
                  />
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-foreground/5">
                    <IconX className="h-6 w-6" />
                  </button>
                </div>

                {/* Nav links */}
                <nav className="flex flex-col gap-2">
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
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={[
                          "relative flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                          active
                            ? "bg-[color:var(--accent)] text-white shadow-lg"
                            : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10",
                        ].join(" ")}
                      >
                        <item.icon className={`h-5 w-5 ${active ? 'text-white' : 'text-foreground/50'}`} />
                        <div className="flex items-center gap-2">
                          <span>{item.label}</span>
                          {isLive && (
                            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </nav>

                {/* Footer: theme + socials */}
                <div className="mt-auto pt-8  flex flex-col gap-6">
                  {/* Theme selector */}
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground/40 px-2">Theme</span>
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
                              isActive ? "bg-background text-foreground shadow-sm" : "text-foreground/40 hover:text-foreground/70",
                            ].join(" ")}
                          >
                            <Icon className="h-5 w-5" />
                            <span className="text-[10px] font-bold uppercase tracking-tight">{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Socials */}
                  <div className="flex justify-center gap-4">
                    {socials.map((s, i) => (
                      <a key={i} href={s.href} className="h-10 w-10 flex items-center justify-center rounded-xl bg-foreground/5 text-foreground/60">
                        <s.icon className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}