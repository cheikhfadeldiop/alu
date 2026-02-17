import { decodeHtmlEntities } from "../../utils/text";
import { WordPressPost } from "../../types/api";
import { SITE_CONFIG } from "@/constants/site-config";
import { SafeImage } from "../ui/SafeImage";
import { Link } from "@/i18n/navigation";
import { AdBannerV } from "../ui/AdBannerV";

interface NewsDetailedLayoutProps {
    featuredItem: WordPressPost;
    sideItems: WordPressPost[];
    onItemClick?: (item: WordPressPost) => void;
}

export function NewsDetailedLayout({ featuredItem, sideItems, onItemClick }: NewsDetailedLayoutProps) {
    if (!featuredItem) return null;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    // ... paragraphs logic ...
    const getParagraphs = (html: string) => {
        if (!html) return [];
        const matches = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
        if (!matches) {
            return html.split(/\n\n+/).filter(p => p.trim().length > 10);
        }
        return matches.map(p => p.trim()).filter(p => p.length > 20);
    };

    const paragraphs = getParagraphs(featuredItem.content?.rendered || "");

    const block1 = paragraphs.slice(0, 2).join("");
    const quoteTxt = paragraphs[2] || paragraphs[0];
    const block2 = paragraphs.slice(3, 5).join("");
    const highlightTxt = paragraphs.slice(5, 7).join("");
    const block3 = paragraphs.slice(7).join("");

    const highlightTitle = (featuredItem.title.rendered).split(' ').slice(0, 4).join(' ') + "...";

    const displaySideItems = sideItems.slice(0, 5);

    const handleItemClick = (e: React.MouseEvent, item: WordPressPost) => {
        if (onItemClick) {
            e.preventDefault();
            onItemClick(item);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Article Anatomy (Left Col) */}
            <div className="lg:col-span-8 space-y-12">
                {/* ... hero and content ... */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted/5 shadow-2xl rounded-[2px] group">
                    <SafeImage
                        src={featuredItem.acan_image_url || SITE_CONFIG.theme.placeholders.news}
                        alt={featuredItem.title.rendered}
                        fill
                        priority
                        className="object-cover"
                    />
                </div>

                <div className="space-y-4 border-b border-foreground/30">
                    <h1 className="text-3xl md:text-4xl font-black leading-tight text-foreground tracking-tighter">
                        {decodeHtmlEntities(featuredItem.title.rendered)}
                    </h1>

                    <div className="flex items-center gap-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-4">
                        <span>{formatDate(featuredItem.date)}</span>
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span>{SITE_CONFIG.strings.editorialTeam}</span>
                    </div>
                </div>

                <div className="space-y-10 text-justify text-foreground/80 leading-[1.8] text-base md:text-[17px]">
                    {block1 && <div className="prose-p:mb-6" dangerouslySetInnerHTML={{ __html: block1 }} />}
                    {quoteTxt && (
                        <div className="flex justify-end w-full py-4">
                            <div className="w-[85%] md:w-[75%] border border-orange-400/60 p-8 md:p-12 relative">
                                <p className="text-lg md:text-xl italic font-medium text-center text-foreground/90 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: quoteTxt.replace(/<p[^>]*>/i, '').replace(/<\/p>/i, '') }} />
                            </div>
                        </div>
                    )}
                    {block2 && <div className="prose-p:mb-6" dangerouslySetInnerHTML={{ __html: block2 }} />}
                    {highlightTxt && (
                        <div className="flex justify-end w-full py-4">
                            <div className="w-[85%] md:w-[75%] bg-background/90 p-8 md:p-10 border-l-[3px] border-[#a1232b] relative shadow-sm">
                                <h4 className="text-lg font-black text-foreground mb-4 leading-tight">{decodeHtmlEntities(highlightTitle)}</h4>
                                <div className="text-sm md:text-base italic opacity-80 leading-relaxed" dangerouslySetInnerHTML={{ __html: highlightTxt }} />
                            </div>
                        </div>
                    )}
                    {block3 && <div className="prose-p:mb-6 opacity-90" dangerouslySetInnerHTML={{ __html: block3 }} />}
                </div>
            </div>

            {/* Sidebar (Right Col) */}
            <div className="lg:col-span-4 space-y-12">
                <div className="space-y-6">
                    <div className="border-b-2 border-foreground dark:border-white pb-3">
                        <h2 className="text-xl font-black uppercase tracking-tighter italic">TOP NEWS</h2>
                    </div>

                    <div className="space-y-8">
                        {displaySideItems.map((item) => (
                            <Link
                                key={item.id}
                                href={`/news?id=${item.id}`}
                                onClick={(e) => handleItemClick(e, item)}
                                className="group flex gap-4 items-center p-2 -m-2 hover:bg-foreground/5 rounded-lg transition-all"
                            >
                                <div className="flex-1 space-y-2">
                                    <h3 className="text-[13px] font-bold leading-tight group-hover:text-[color:var(--accent)] transition-colors line-clamp-2">
                                        {decodeHtmlEntities(item.title.rendered)}
                                    </h3>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                        <span>{formatDate(item.date)}</span>
                                        <span className="w-1 h-1 bg-green-500 rounded-full" />
                                        <span>LA RÉDACTION</span>
                                    </div>
                                </div>
                                <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden bg-muted/10 rounded-sm">
                                    <SafeImage
                                        src={item.acan_image_url || SITE_CONFIG.theme.placeholders.news}
                                        alt={item.title.rendered}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="sticky top-24 ">
                    <AdBannerV />
                </div>
            </div>
        </div>
    );
}
