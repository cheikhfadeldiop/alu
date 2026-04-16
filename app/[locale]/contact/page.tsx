import { useTranslations } from "next-intl";
import { SITE_CONFIG } from "@/constants/site-config";
import { MapLocation } from "@/components/ui/carte_map";

function IconPin(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 21c-3-3-6-7-6-11a6 6 0 1 1 12 0c0 4-3 8-6 11Z" />
      <path d="M12 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
    </svg>
  );
}
function IconPhone(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.5 2.6a2 2 0 0 1 1.1 1.3c.1.4.2.9.3 1.4.1.5.1 1 .1 1.5a2 2 0 0 1-.6 1.4l-1.3 1.3a15.9 15.9 0 0 0 6 6l1.3-1.3a2 2 0 0 1 1.4-.6 15.3 15.3 0 0 0 1.5.1c.5 0 1 0 .1.3 1.4.1.4.2.9.3 1.4a2 2 0 0 1 1.1 1.1c.8.2 1.7.4 2.6.5a2 2 0 0 1 1.7 2Z" />
    </svg>
  );
}
//icon fax 

function IconFax(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.5 2.6a2 2 0 0 1 1.1 1.3c.1.4.2.9.3 1.4.1.5.1 1 .1 1.5a2 2 0 0 1-.6 1.4l-1.3 1.3a15.9 15.9 0 0 0 6 6l1.3-1.3a2 2 0 0 1 1.4-.6 15.3 15.3 0 0 0 1.5.1c.5 0 1 0 .1.3 1.4.1.4.2.9.3 1.4a2 2 0 0 1 1.1 1.1c.8.2 1.7.4 2.6.5a2 2 0 0 1 1.7 2Z" />
    </svg>
  );
}

function IconSend(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

export default function ContactPage() {
  const t = useTranslations("pages.contact");
  const tc = useTranslations("common");

  return (
    <div className="crtv-page-enter mx-auto flex w-full max-w-[1293px] flex-col gap-[38px] pt-[45px]">
      <section className="h-[350px] w-full overflow-hidden rounded-[10px] border border-[var(--fig-border)] bg-[var(--surface)]">
        <div className="h-full w-full">
          <MapLocation
            latitude={SITE_CONFIG.contact.map.latitude}
            longitude={SITE_CONFIG.contact.map.longitude}
            zoom={SITE_CONFIG.contact.map.zoom}
            title={SITE_CONFIG.name}
            address={SITE_CONFIG.officialName}
          />
        </div>
      </section>

      <section className="w-full rounded-[30px]  bg-[var(--surface)] px-0 pb-10 pt-[75px]">
        <div className="mx-auto flex w-full max-w-[1195px] items-start justify-center gap-[52px]">
          <div className="flex w-[426px] flex-col items-end gap-[27px]">
            <div className="h-[233px] w-full rounded-[10px] border border-[var(--fig-border)] px-[20px] py-[10px]">
              <div className="flex h-full w-full flex-col justify-center gap-[20px]">
                <div className="flex flex-col gap-[6px]">
                  <div className="flex items-center gap-[9px]">
                    <IconPin className="h-6 w-6 text-[#118A39]" />
                    <span className="text-[16px] font-normal uppercase leading-[24px] text-[var(--fig-text-secondary)]">{t("address")}</span>
                  </div>
                  <p className="text-[18px] font-medium leading-[27px] text-[var(--fig-text-primary)]">{SITE_CONFIG.contact.address}</p>
                </div>

                <div className="flex flex-col gap-[4px]">
                  <div className="flex items-center gap-[9px]">
                    <IconPhone className="h-6 w-6 text-[#118A39]" />
                    <span className="text-[16px] font-normal uppercase leading-[24px] text-[var(--fig-text-secondary)]">{t("phone")}</span>
                  </div>
                  <p className="text-[18px] font-medium leading-[27px] text-[var(--fig-text-primary)]">{SITE_CONFIG.contact.phones}</p>
                </div>

                
              </div>
            </div>
          </div>

          <section className="flex w-[717px] flex-col gap-[42px]">
            <form className="flex w-full flex-col gap-[28px]">
              <div className="flex w-full flex-col gap-[20px]">
                <h2 className="text-[22px] font-bold uppercase leading-[33px] text-[var(--fig-text-primary)]">{t("formTitle")}</h2>

                <div className="flex w-full gap-[13px]">
                  <label className="flex w-[352px] flex-col gap-2">
                    <span className="text-[14px] font-normal leading-[21px] text-[var(--fig-text-primary)]">{t("firstName")}</span>
                    <input className="h-[38px] rounded-[5px] border border-[var(--fig-border)] bg-[var(--surface)] px-[11px] text-[10px] leading-[15px] text-[var(--fig-text-primary)] outline-none placeholder:text-[var(--fig-text-secondary)]" placeholder={t("placeholders.firstName")} />
                  </label>
                  <label className="flex w-[352px] flex-col gap-2">
                    <span className="text-[14px] font-normal leading-[21px] text-[var(--fig-text-primary)]">{t("lastName")}</span>
                    <input className="h-[38px] rounded-[5px] border border-[var(--fig-border)] bg-[var(--surface)] px-[14px] text-[10px] leading-[15px] text-[var(--fig-text-primary)] outline-none placeholder:text-[var(--fig-text-secondary)]" placeholder={t("placeholders.lastName")} />
                  </label>
                </div>

                <div className="flex w-full gap-[13px]">
                  <label className="flex w-[353px] flex-col gap-2">
                    <span className="text-[14px] font-normal leading-[21px] text-[var(--fig-text-primary)]">{t("email")}</span>
                    <input type="email" className="h-[38px] rounded-[5px] border border-[var(--fig-border)] bg-[var(--surface)] px-[14px] text-[10px] leading-[15px] text-[var(--fig-text-primary)] outline-none placeholder:text-[var(--fig-text-secondary)]" placeholder={t("placeholders.email")} />
                  </label>
                  <label className="flex w-[353px] flex-col gap-2">
                    <span className="text-[14px] font-normal leading-[21px] text-[var(--fig-text-primary)]">{t("phone")}</span>
                    <input className="h-[38px] rounded-[5px] border border-[var(--fig-border)] bg-[var(--surface)] px-[11px] text-[10px] leading-[15px] text-[var(--fig-text-primary)] outline-none placeholder:text-[var(--fig-text-secondary)]" placeholder={t("placeholders.phone")} />
                  </label>
                </div>

                <label className="flex w-full flex-col gap-2">
                  <span className="text-[14px] font-normal leading-[21px] text-[var(--fig-text-primary)]">{t("subject")}</span>
                  <select className="h-[38px] rounded-[5px] border border-[var(--fig-border)] bg-[var(--surface)] px-[14px] text-[10px] leading-[15px] text-[var(--fig-text-secondary)] outline-none" defaultValue="">
                    <option value="" disabled>{t("placeholders.subject")}</option>
                    <option>{t("options.partnership")}</option>
                    <option>{t("options.support")}</option>
                    <option>{t("options.other")}</option>
                  </select>
                </label>

                <label className="flex w-full flex-col gap-2">
                  <span className="text-[14px] font-normal leading-[21px] text-[var(--fig-text-primary)]">{t("message")}</span>
                  <textarea className="h-[128px] resize-none rounded-[5px] border border-[var(--fig-border)] bg-[var(--surface)] px-[14px] py-[14px] text-[10px] leading-[15px] text-[var(--fig-text-primary)] outline-none placeholder:text-[var(--fig-text-secondary)]" placeholder={t("placeholders.message")} />
                </label>
              </div>

              <p className="text-[14px] leading-[21px] text-[var(--fig-text-primary)]">* {t("requiredHint")}</p>

              <button type="button" className="flex h-[53px] w-full items-center justify-center gap-3 rounded-[5px] bg-[#774791] px-4 text-[18px] font-medium leading-[27px] text-white">
                {tc("send")}
                <IconSend className="h-5 w-5" />
              </button>
            </form>
          </section>
        </div>
      </section>
    </div>
  );
}

