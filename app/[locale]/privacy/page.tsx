import { getAppPrivacy } from "@/services/api";
import { PageContainer } from "@/components/layout/PageContainer";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function PrivacyPage() {
    // Fetch specifically from privacy endpoint for accuracy
    const privacyData = await getAppPrivacy();
    const ti = await getTranslations("pages.info");
    const tc = await getTranslations("common");

    // Ultimate aggressive cleaner for broken MS Word HTML
    const cleanContent = (html: string) => {
        if (!html) return [];

        let text = html
            .replace(/<(style|script)[^>]*>[\s\S]*?<\/\1>/gi, '') // Remove styles/scripts
            .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
            .replace(/<[^>]+>?/g, '\n') // Remove ALL tags, even broken ones, replace with newline
            .replace(/&nbsp;/gi, ' ')
            .replace(/&[a-z0-9#]+;/gi, ' ') // Strip other entities
            // Remove leaked CSS junk
            .replace(/[a-z-]+\s*[:=]\s*[^;"]+[;"]/gi, ' ')
            .replace(/mso-[^:]+:[^;"]+;?/gi, ' ')
            .replace(/font-(family|size|weight):[^;"]+;?/gi, ' ')
            .replace(/color:[^;"]+;?/gi, ' ')
            .replace(/letter-spacing:[^;"]+;?/gi, ' ')
            // Remove common remnants of broken tags
            .replace(/msonormal|helvetica|sans-serif|gothic|times|roman|normam|style=/gi, ' ')
            .replace(/["'{}[\]]/g, ' '); // Strip leftover syntax

        return text
            .split(/\n+/)
            .map(s => s.trim())
            .filter(s => s.length > 20); // Only keep real sentences/paragraphs
    };

    const sections = cleanContent(privacyData.app_privacy);

    return (
        <div className="py-12 md:py-24 crtv-page-enter">
            <div className="max-w-4xl mx-auto">
                {/* Hero Section */}
                <div className="relative mb-20 text-center">
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-accent/10 text-accent text-xs font-black uppercase tracking-widest mb-6 border border-accent/20">
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        {ti("dataProtection")}
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-tight">
                        {ti("privacyHero")}
                    </h1>
                    <div className="mt-8 h-1 w-24 bg-accent mx-auto rounded-full" />
                </div>

                {/* Content Section */}
                <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-accent/50 via-border to-transparent hidden md:block" />

                    <div className="space-y-12 md:pl-12">
                        {sections.map((section, i) => {
                            // HEADING DETECTION: All caps and relatively short
                            const isHeading = section.length < 100 && (section === section.toUpperCase());

                            if (isHeading) {
                                return (
                                    <div key={i} className="relative pt-8 first:pt-0">
                                        <div className="absolute -left-[53px] top-[46px] w-4 h-4 rounded-full bg-background border-4 border-accent hidden md:block" />
                                        <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight uppercase italic border-b-2 border-accent/20 pb-2 inline-block">
                                            {section}
                                        </h2>
                                    </div>
                                );
                            }

                            return (
                                <div key={i} className="group relative">
                                    <p className="text-muted leading-relaxed text-lg md:text-xl font-medium transition-all group-hover:text-foreground">
                                        {section}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Support Card */}
                <div className="mt-24 p-12 border-t-2 border-accent flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-3">
                        <h3 className="text-3xl font-black italic tracking-tight">{ti("dataQuestion")}</h3>
                        <p className="text-muted text-lg">{ti("dataDPO")}</p>
                    </div>
                    <Link href="/contact" className="px-10 py-5 bg-accent text-white font-bold rounded-2xl hover:scale-105 transition-all shadow-lg active:scale-95 text-center whitespace-nowrap">
                        {tc("contact")}
                    </Link>
                </div>
            </div>
        </div>
    );
}
