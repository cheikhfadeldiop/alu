import { getAppTerms } from "@/services/api";
import { PageContainer } from "@/components/layout/PageContainer";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function TermsPage() {
    // Fetch specifically from terms endpoint
    const termsData = await getAppTerms();
    const ti = await getTranslations("pages.info");
    const tc = await getTranslations("common");

    // Ultimate aggressive cleaner for broken MS Word HTML
    const cleanContent = (html: string) => {
        if (!html) return [];

        let text = html
            .replace(/<(style|script)[^>]*>[\s\S]*?<\/\1>/gi, '')
            .replace(/<!--[\s\S]*?-->/g, '')
            .replace(/<[^>]+>?/g, '\n')
            .replace(/&nbsp;/gi, ' ')
            .replace(/&[a-z0-9#]+;/gi, ' ')
            .replace(/[a-z-]+\s*[:=]\s*[^;"]+[;"]/gi, ' ')
            .replace(/mso-[^:]+:[^;"]+;?/gi, ' ')
            .replace(/font-(family|size|weight):[^;"]+;?/gi, ' ')
            .replace(/color:[^;"]+;?/gi, ' ')
            .replace(/letter-spacing:[^;"]+;?/gi, ' ')
            .replace(/msonormal|helvetica|sans-serif|gothic|times|roman|normam|style=/gi, ' ')
            .replace(/["'{}[\]]/g, ' ');

        return text
            .split(/\n+/)
            .map(s => s.trim())
            .filter(s => s.length > 20);
    };

    const sections = cleanContent(termsData.app_description);

    return (
        <div className="py-12 md:py-24 crtv-page-enter">
            <div className="max-w-4xl mx-auto">
                <div className="mb-20 text-center space-y-4">
                    <div className="inline-block px-6 py-2 bg-accent/5 text-accent rounded-full text-xs font-black tracking-widest uppercase border border-accent/10">
                        {ti("termsRules")}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-tight italic">
                        {ti("termsHero")}
                    </h1>
                    <div className="mt-8 h-1 w-24 bg-accent mx-auto rounded-full" />
                </div>

                <div className="relative p-8 md:p-12 border-l-4 border-accent">
                    <div className="space-y-10">
                        {sections.map((section, i) => {
                            const isHeading = section.length < 100 && (section === section.toUpperCase());
                            if (isHeading) {
                                return (
                                    <div key={i} className="pt-10 first:pt-0">
                                        <h2 className="text-2xl font-black text-foreground border-b-2 border-accent/20 pb-2 inline-block">
                                            {section}
                                        </h2>
                                    </div>
                                );
                            }
                            return (
                                <p key={i} className="text-muted leading-relaxed text-lg font-medium hover:text-foreground transition-colors">
                                    {section}
                                </p>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <Link href="/contact" className="inline-flex items-center gap-2 text-accent font-bold hover:underline">
                        Besoin d'aide ? Contactez-nous {tc("contact")}
                    </Link>
                </div>
            </div>
        </div>
    );
}
