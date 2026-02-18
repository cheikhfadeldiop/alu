

import Image from "next/image";
import { useTranslations } from "next-intl";

import { SectionTitle } from "../../../components/ui/SectionTitle";
import { MapLocation } from "@/components/ui/carte_map";
import { SITE_CONFIG } from "@/constants/site-config";

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
    <div className="crtv-page-enter space-y-8 md:space-y-12">

      {/* Hero: Header Gradient Premium */}
      <section className="relative overflow-hidden p-10 md:p-14 text-center group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 blur-[120px] pointer-events-none group-hover:bg-red-600/10 transition-colors duration-1000" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 blur-[120px] pointer-events-none group-hover:bg-blue-600/10 transition-colors duration-1000" />

        <div className="relative z-10 flex flex-col items-center space-y-4 py-10">
          <SectionTitle title={t("title")} actionIcon={false} className="font-bold text-3xl" />
          <p className="max-w-2xl text-base md:text-xl text-foreground/60 leading-relaxed font-light">
            {t("intro")}
          </p>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">

        {/* Left Column: Coordinates & Map */}
        <section className="space-y-6">
          {/* Coordinates Card */}
          <div className="p-6 border border-foreground/15 rounded-xl">

            <div className="space-y-2">
              {/* Address */}
              <div className="flex gap-4 group">
                <div className="flex h-12 w-12  justify-start transition-all duration-300 text-green-500">
                  <IconPin className="h-8 w-6" />
                </div>
                <div className="space-y-1 py-1">
                  <div className="text-[10px] font-bold tracking-[0.2em] text-foreground/50 uppercase">
                    {t("address")}
                  </div>
                  <div className="text-base font-bold text-foreground leading-tight group-hover:text-red-500 transition-colors">
                    {SITE_CONFIG.contact.address}
                  </div>
                </div>
              </div>

              {/* Divider */}

              {/* Phone */}
              <div className="flex gap-4 group">
                <div className="flex h-12 w-12 items-center justify-start text-green-500">
                  <IconPhone className="h-6 w-5" />
                </div>
                <div className="space-y-1 py-1">
                  <div className="text-[10px] font-bold tracking-[0.2em] text-foreground/50 uppercase">
                    {t("phone")}
                  </div>
                  <div className="flex flex-col gap-1">
                    <a href={`tel:${SITE_CONFIG.contact.phones.replace(/\s+/g, '')}`} className="text-base font-bold text-foreground leading-tight hover:text-red-500 transition-colors">
                      {SITE_CONFIG.contact.phones}
                    </a>
                  </div>
                </div>
              </div>
              {/*phax*/}
              <div className="flex gap-4 group">
                <div className="flex h-12 w-12 items-center justify-start text-green-500">
                  <IconFax className="h-6 w-5" />
                </div>
                <div className="space-y-1 py-1">
                  <div className="text-[10px] font-bold tracking-[0.2em] text-foreground/50 uppercase">
                    {t("fax")}
                  </div>
                  <div className="flex flex-col gap-1">
                    <a href={`tel:${SITE_CONFIG.contact.fax.replace(/\s+/g, '')}`} className="text-base font-bold text-foreground leading-tight hover:text-red-500 transition-colors">
                      {SITE_CONFIG.contact.fax}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div className="relative overflow-hidden rounded-sm ">
            <div className="absolute inset-0 z-10 border border-white/5 pointer-events-none rounded-sm" />
            <div className="relative aspect-[4/3] w-full grayscale-[0.5] hover:grayscale-0 transition-all duration-700">
              <MapLocation
                latitude={SITE_CONFIG.contact.map.latitude}
                longitude={SITE_CONFIG.contact.map.longitude}
                zoom={SITE_CONFIG.contact.map.zoom}
                title={SITE_CONFIG.name}
                address={SITE_CONFIG.officialName}
              />
            </div>
          </div>
        </section>

        {/* Right Column: Contact Form */}
        <section className="relative  overflow-hidden ">
          {/* Decorative corner */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 mb-8">
            <h2 className="text-2xl  uppercase tracking-widest font-bold">
              {t("formTitle")}
            </h2>
          </div>

          <form className="relative z-10 grid gap-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="grid gap-2 group">
                <span className="text-[14px] font-bold uppercase tracking-widest text-foreground/50 group-focus-within:text-red-500 transition-colors">
                  {t("firstName")} <span >*</span>
                </span>
                <input
                  className="h-12 rounded-sm border border-foreground/10 bg-background/50 px-4 text-sm outline-none  transition-all duration-300"
                  placeholder={t("placeholders.firstName")}
                />
              </label>
              <label className="grid gap-2 group">
                <span className="text-[14px] font-bold uppercase tracking-widest text-foreground/50 group-focus-within:text-red-500 transition-colors">
                  {t("lastName")} <span >*</span>
                </span>
                <input
                  className="h-12 rounded-sm border border-foreground/10 bg-background/50 px-4 text-sm outline-none  transition-all duration-300"
                  placeholder={t("placeholders.lastName")}
                />
              </label>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="grid gap-2 group">
                <span className="text-[14px] font-bold uppercase tracking-widest text-foreground/50 group-focus-within:text-red-500 transition-colors">
                  {t("email")} <span >*</span>
                </span>
                <input
                  type="email"
                  className="h-12 rounded-sm border border-foreground/10 bg-background/50 px-4 text-sm outline-none  transition-all duration-300"
                  placeholder={t("placeholders.email")}
                />
              </label>
              <label className="grid gap-2 group">
                <span className="text-[14px] font-bold uppercase tracking-widest text-foreground/50 group-focus-within:text-red-500 transition-colors">
                  {t("phone")}
                </span>
                <input
                  className="h-12 rounded-sm border border-foreground/10 bg-background/50 px-4 text-sm outline-none  transition-all duration-300"
                  placeholder={t("placeholders.phone")}
                />
              </label>
            </div>

            <label className="grid gap-2 group">
              <span className="text-[14px] font-bold uppercase tracking-widest text-foreground/50 group-focus-within:text-red-500 transition-colors">
                {t("subject")} <span >*</span>
              </span>
              <div className="relative">
                <select
                  className="h-12 w-full appearance-none rounded-sm border border-foreground/10 bg-background/50 px-4 text-sm  outline-none  transition-all duration-300 cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled className="">{t("placeholders.subject")}</option>
                  <option className="">Partenariat</option>
                  <option className="">Support</option>
                  <option className="">Autre</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </label>

            <label className="grid gap-2 group">
              <span className="text-[14px] font-bold uppercase tracking-widest text-foreground/50 group-focus-within:text-red-500 transition-colors">
                {t("message")} <span >*</span>
              </span>
              <textarea
                className="min-h-[300px] rounded-sm border border-foreground/10 bg-background/50 px-4 py-4 text-sm outline-none transition-all duration-300 resize-none"
                placeholder={t("placeholders.message")}
              />
            </label>

            <p className="text-[14px] text-foreground/40 uppercase tracking-wide">
              * {t("requiredHint")}
            </p>

            <button
              type="button"
              className="w-full md:w-auto px-8 py-4 rounded-sm bg-green-600 hover:bg-black hover:text-green-600 hover:border-green-600 border border-transparent font-black text-xs uppercase tracking-[0.2em] text-white transition-all duration-300 shadow-lg hover:shadow-red-600/20 active:scale-95 flex items-center justify-center gap-3"
            >
              {tc("send")}
              <IconSend className="h-4 w-4" />
            </button>

          </form>
        </section>
      </div>
    </div>
  );
}

