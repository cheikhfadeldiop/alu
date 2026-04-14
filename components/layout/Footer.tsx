import { SafeImage } from "../ui/SafeImage";
import { SITE_CONFIG } from "@/constants/site-config";

export function Footer() {
  return (
    <footer className="mt-[50px] w-full px-4 pb-[50px]">
      <div className="mx-auto max-w-[1812px] rounded-[55px] bg-[var(--fig-surface)] px-6 py-[43px] md:px-[120px]">
        <div className="mx-auto max-w-[1284px] ">
        <div className="grid items-start gap-10 md:grid-cols-[364px_1fr_281px] justify-between">
              <div className="space-y-[14px]">
              <SafeImage src={SITE_CONFIG.theme.placeholders.logo} alt={SITE_CONFIG.name} width={119} height={57} className="h-[57px] w-[119px] object-contain" />
              <p className="fig-b3 text-[var(--fig-text-primary)]">
                {SITE_CONFIG.description}
              </p>
            </div>

            <div>
              <h3 className="fig-h10 text-[var(--fig-text-primary)]">Contact</h3>
              <div className="mt-[22px] space-y-5 text-[16px] leading-[24px] text-[var(--fig-text-primary)]">
                <p>{SITE_CONFIG.contact.address}</p>
                <p>{SITE_CONFIG.contact.phones}</p>
                <p>{SITE_CONFIG.contact.email}</p>
              </div>
            </div>

            <div>
              <h3 className="fig-h10 text-[var(--fig-text-primary)]">Download the app</h3>
              <div className="mt-[30px] flex gap-[7px]">
                <a href={SITE_CONFIG.apps.appleStore} target="_blank" rel="noopener noreferrer" className="block w-[137px]">
                  <SafeImage src="/assets/backgrounds/apple.png" alt="App Store" width={137} height={40} className="w-full object-contain" />
                </a>
                <a href={SITE_CONFIG.apps.googlePlay} target="_blank" rel="noopener noreferrer" className="block w-[137px]">
                  <SafeImage src="/assets/backgrounds/store.webp" alt="Google Play" width={137} height={40} className="w-full object-contain" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-[56px] border-t pt-[19px] [border-color:var(--fig-border)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[24px] text-[13px] text-[var(--fig-text-primary)]">
                <a href={SITE_CONFIG.social.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
                <a href={SITE_CONFIG.social.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
                <a href={SITE_CONFIG.social.twitter} target="_blank" rel="noopener noreferrer">X</a>
                <a href={SITE_CONFIG.social.youtube} target="_blank" rel="noopener noreferrer">YouTube</a>
              </div>
              <p className="text-[14px] text-[var(--fig-text-primary)]">
                ©2026 All Rights Reserved@aCANGroup
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

