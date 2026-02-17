import { getAppDescription } from "@/services/api";
import { PageContainer } from "@/components/layout/PageContainer";
import { getTranslations } from "next-intl/server";

export default async function LegalPage() {
    // Fetch specifically from description endpoint
    const descriptionData = await getAppDescription();
    const ti = await getTranslations("pages.info");

    // Aggressive cleaner for consistency
    const cleanContent = (html: string) => {
        if (!html) return [];
        let text = html
            .replace(/<(style|script)[^>]*>[\s\S]*?<\/\1>/gi, '')
            .replace(/<!--[\s\S]*?-->/g, '')
            .replace(/<[^>]+>?/g, '\n')
            .replace(/&nbsp;/gi, ' ')
            .replace(/&[a-z0-9#]+;/gi, ' ')
            .replace(/[a-z-]+\s*[:=]\s*[^;"]+[;"]/gi, ' ')
            .split(/\n+/)
            .map(s => s.trim())
            .filter(s => s.length > 20);
        return text;
    };

    const paragraphs = cleanContent(descriptionData.app_description);

    return (
        <div className="py-12 md:py-24 crtv-page-enter">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-block px-6 py-2 bg-accent/10 text-accent rounded-full text-xs font-bold tracking-widest uppercase border border-accent/20">
                        {ti("legalTransparency")}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-tight italic">
                        {ti("legalHero")}
                    </h1>
                    <div className="mt-8 h-1 w-24 bg-accent mx-auto rounded-full" />
                </div>

                <div className="relative">
                    <div className="space-y-12">
                        {paragraphs.slice(0, 2).map((p, i) => (
                            <p key={i} className="text-foreground leading-relaxed text-2xl italic font-serif border-l-4 border-accent pl-10 py-4">
                                {p}
                            </p>
                        ))}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                            <div className="p-10 border-l border-border group hover:border-accent transition-colors">
                                <div className="text-accent font-black mb-4 uppercase text-xs tracking-[0.2em]">{ti("legalEditor")}</div>
                                <h3 className="text-2xl font-bold mb-4">CRTV Group</h3>
                                <p className="text-muted leading-relaxed text-lg">
                                    Mballa II, B.P. 1634<br />
                                    Yaoundé, Cameroun<br />
                                    Tel: (+237) 222 21 40 88
                                </p>
                            </div>
                            <div className="p-10 border-l border-border group hover:border-accent transition-colors">
                                <div className="text-accent font-black mb-4 uppercase text-xs tracking-[0.2em]">{ti("legalHosting")}</div>
                                <h3 className="text-2xl font-bold mb-4">aCAN Group</h3>
                                <p className="text-muted leading-relaxed text-lg">
                                    Expertise en solutions numériques<br />
                                    et plateformes haute disponibilité.<br />
                                    www.acan.group
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
