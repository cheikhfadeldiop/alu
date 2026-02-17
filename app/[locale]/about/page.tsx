import { getAppInfo } from "@/services/api";
import { PageContainer } from "@/components/layout/PageContainer";
import { getTranslations } from "next-intl/server";

export default async function AboutPage() {
    const info = await getAppInfo();
    const t = await getTranslations("pages.about");

    // Unified aggressive cleaner
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
            .replace(/msonormal|helvetica|sans-serif|gothic|times|roman|normam|style=/gi, ' ')
            .replace(/["'{}[\]]/g, ' ');

        return text
            .split(/\n+/)
            .map(s => s.trim())
            .filter(s => s.length > 20);
    };

    const paragraphs = cleanContent(info.app_description);

    return (
        <div className="py-12 md:py-24 crtv-page-enter">
            <div className="max-w-5xl mx-auto">
                {/* Header Section with "Cuts" */}
                <div className="relative mb-20">
                    <div className="absolute -left-10 top-0 w-2 h-full bg-accent opacity-20" />
                    <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter italic leading-none">
                        <span className="block text-foreground">{t("titlePart1")}</span>
                        <span className="block text-accent ml-8 md:ml-16 -mt-2 md:-mt-4">{t("titlePart2")}</span>
                    </h1>
                    <p className="mt-8 text-xl text-muted max-w-2xl font-medium border-l-4 border-accent pl-6">
                        {t("intro")}
                    </p>
                </div>

                {/* Content Grid with "Placement" style */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
                    {/* Highlights / First Paragraph */}
                    <div className="md:col-span-7 space-y-8">
                        {paragraphs.slice(0, 2).map((p, i) => (
                            <div key={i} className="relative p-8 border-l-4 border-accent">
                                <div className="absolute -top-4 -left-4 w-12 h-12 bg-accent text-white flex items-center justify-center font-black rounded-xl rotate-12">
                                    0{i + 1}
                                </div>
                                <p className="text-xl leading-relaxed text-foreground italic font-serif">
                                    "{p}"
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Side decoration / Stats or secondary text */}
                    <div className="md:col-span-5 md:pt-20">
                        <div className="p-8 border-t-4 border-accent">
                            <h3 className="text-2xl font-bold mb-4">{t("commitmentTitle")}</h3>
                            <p className="text-muted leading-relaxed text-lg">
                                {t("commitmentDesc")}
                            </p>
                        </div>
                    </div>

                    {/* Large Text Breakdown */}
                    <div className="md:col-span-12 mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                        {paragraphs.slice(2).map((p, i) => (
                            <div key={i} className={`p-8 border-l-2 border-border hover:border-accent transition-colors ${i % 2 !== 0 ? 'md:mt-12' : ''}`}>
                                <p className="text-muted leading-relaxed text-lg">
                                    {p}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
