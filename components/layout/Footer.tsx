import Image from "next/image";
import { SafeImage } from "../ui/SafeImage";
import { useTranslations } from "next-intl";

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
    <svg viewBox="0 0 24 24"  fill="none"  {...props}>
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

import { SITE_CONFIG } from "@/constants/site-config";
import { Link } from "@/i18n/navigation";


export function Footer() {
  const t = useTranslations();

  return (
    <footer className="w-full border-t border-[color:var(--border)] bg-foreground/3 backdrop-blur-sm  ">
      <div className="mx-auto max-w-[1440px] px-2xl py-4xl sm:px-xxl lg:px-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4xl">
          {/* Column 1: Office info */}
          <div className="space-y-xxl">
            <div className="space-y-l">
              <Link href="/" className="inline-block">
                <SafeImage
                  src={SITE_CONFIG.theme.placeholders.logo}
                  alt="CRTV"
                  width={154}
                  height={34}
                  className="object-contain"
                />
              </Link>
              <div className="text-[12px] font-bold text-foreground/80 leading-relaxed uppercase max-w-[200px]">
                Office de Radiodiffusion Télévision Camerounaise
              </div>
            </div>

            <div className="space-y-xxs text-[13px] text-foreground/60">
              <p>Tel: {SITE_CONFIG.contact.phones}</p>
              <p>Fax: {SITE_CONFIG.contact.fax}</p>
              <p>BP / PO BOX : 1634 Yaoundé</p>
            </div>

            <div className="flex items-center gap-xs">
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
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-foreground hover:bg-[color:var(--accent)] hover:text-white transition-all duration-300"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Ressources */}
          <div className="space-y-6">
            <h3 className="text-[14px] font-black uppercase tracking-widest text-foreground/40">
              {t("footer.resources")}
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/", label: t("nav.home") },
                { href: "/live", label: t("nav.live") },
                { href: "/replay", label: t("nav.replay") },
                { href: "/radio", label: t("nav.radio") },
                { href: "/news", label: t("nav.news") },
                { href: "/corporate", label: t("nav.corporate") },
                { href: "/contact", label: t("nav.contact") },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="text-[14px] font-medium text-foreground/60 hover:text-[color:var(--accent)] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Commitments */}
          <div className="space-y-6">
            <h3 className="text-[14px] font-black uppercase tracking-widest text-foreground/40">
              {t("footer.commitments")}
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/commitments", label: t("footer.links.quality") },
                { href: "/terms", label: t("footer.links.terms") },
                { href: "/privacy", label: t("footer.links.data") },
                { href: "/advertising", label: t("footer.links.legal") }, // Using legal/advertising for Partenariat if needed or just adding it
              ].map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="text-[14px] font-medium text-foreground/60 hover:text-[color:var(--accent)] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/contact" className="text-[14px] font-medium text-foreground/60 hover:text-[color:var(--accent)] transition-colors">
                  Partenariat
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Apps */}
          <div className="space-y-6">
            <h3 className="text-[14px] font-black uppercase tracking-widest text-foreground/40">
              Download our apps from
            </h3>
            <div className="flex flex-col gap-4">
              <a href={SITE_CONFIG.apps.appleStore} target="_blank" rel="noopener noreferrer" className="block w-[180px]">
                <SafeImage src="/assets/backgrounds/apple.png" alt="App Store" width={180} height={54} className="w-full" />
              </a>
              <a href={SITE_CONFIG.apps.googlePlay} target="_blank" rel="noopener noreferrer" className="block w-[180px]">
                <SafeImage src="/assets/backgrounds/store.webp" alt="Google Play" width={180} height={54} className="w-full" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6xl space-y-l">
          <div className="flex flex-wrap items-center justify-center gap-x-4xl gap-y-2xl text-[12px] font-black uppercase tracking-widest text-foreground/40">
            <Link href="/" className="hover:text-[color:var(--accent)] transition-colors">{t("footer.strip.crtv")}</Link>
            <Link href="/live?channel=crtv-sport" className="hover:text-[color:var(--accent)] transition-colors">{t("footer.strip.crtvSport")}</Link>
            <Link href="/radio?channel=poste-national" className="hover:text-[color:var(--accent)] transition-colors">{t("footer.strip.posteNational")}</Link>
            <Link href="/live" className="hover:text-[color:var(--accent)] transition-colors">{t("footer.strip.crtvReligion")}</Link>
            <Link href="/live?channel=crtv-news" className="hover:text-[color:var(--accent)] transition-colors">{t("footer.strip.crtvNews")}</Link>
          </div>
          <p className=" pt-5 border-t border-foreground/5 text-center text-[11px] font-medium text-foreground/30">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}

