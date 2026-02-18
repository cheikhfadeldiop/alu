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
    if (!featuredItem || !featuredItem.title) return null;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    // Function to format content, highlight words, and split long paragraphs
    const formatContent = (html: string) => {
        let processed = html;

        // 1. Highlight sensitive/important keywords in red
        const keywords = ["CRTV", "Paul Biya", "Président", "République", "Décision", "Décret", "Cameroun", "Nomination", "Gouvernement", "Ministre", "Sécurité", "Urgent"];
        keywords.forEach(word => {
            const regex = new RegExp(`(${word})`, "gi");
            processed = processed.replace(regex, '<span class="text-[color:var(--accent)] font-bold">$1</span>');
        });

        // 2. Sentence splitting: Insert a break after every 3 sentences in long text blocks
        let sentenceCount = 0;
        processed = processed.replace(/(\.\s+)([A-Z])/g, (match, p1, p2) => {
            sentenceCount++;
            if (sentenceCount % 3 === 0) {
                return `${p1}<br/><br/>${p2}`;
            }
            return match;
        });

        return processed;
    };

    // Extract citations (blockquotes) if they exist
    const extractCitation = (html: string) => {
        const match = html.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
        if (match) {
            return {
                citation: match[1],
                cleanHtml: html.replace(match[0], '')
            };
        }
        return { citation: null, cleanHtml: html };
    };

    const { citation, cleanHtml } = extractCitation(featuredItem.content?.rendered || "");

    const getParagraphs = (html: string) => {
        if (!html) return [];
        const matches = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
        if (!matches) {
            return html.split(/\n\n+/).filter(p => p.trim().length > 10);
        }
        return matches.map(p => p.trim()).filter(p => p.length > 20);
    };

    const paragraphs = getParagraphs(cleanHtml);

    // If no blockquote was found, we take the 3rd paragraph as a "fallback" quote
    const finalQuote = citation || (paragraphs.length > 2 ? paragraphs[2] : "");
    const remainingParagraphs = citation ? paragraphs : paragraphs.filter((_, i) => i !== 2);

    const block1 = remainingParagraphs.slice(0, 2).join("");
    const block2 = remainingParagraphs.slice(2, 4).join("");
    const highlightTxt = remainingParagraphs.slice(4, 6).join("");
    const block3 = remainingParagraphs.slice(6).join("");

    const highlightTitle = (featuredItem.title?.rendered || "").split(' ').slice(0, 4).join(' ') + "...";

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
                        alt={featuredItem.title?.rendered || "News"}
                        fill
                        priority
                        className="object-cover"
                    />
                </div>

                <div className="space-y-4 border-b border-foreground/30">
                    <h1 className="text-3xl md:text-4xl font-black leading-tight text-foreground tracking-tighter">
                        {decodeHtmlEntities(featuredItem.title?.rendered || "")}
                    </h1>

                    <div className="flex items-center gap-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-4">
                        <span>{formatDate(featuredItem.date)}</span>
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span>{SITE_CONFIG.strings.editorialTeam}</span>
                    </div>
                </div>

                <div className="space-y-10 text-justify text-foreground/80 leading-[1.8] text-base md:text-[17px]">
                    {block1 && <div className="prose-p:mb-10 text-justify" dangerouslySetInnerHTML={{ __html: formatContent(block1) }} />}
                    {finalQuote && (
                        <div className="flex justify-end w-full py-4">
                            <div className="w-[85%] md:w-[75%] border-2 border-yellow-400 p-1 md:p-8 relative bg-yellow-400/5">
                                <p className="text-base md:text-[18px] italic text-center text-foreground leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: formatContent(finalQuote.replace(/<p[^>]*>/i, '').replace(/<\/p>/i, '')) }} />
                                <div className="absolute -top-4 -left-4 text-4xl text-yellow-500 font-serif opacity-50">"</div>
                            </div>
                        </div>
                    )}
                    {block2 && <div className="prose-p:mb-10 text-justify" dangerouslySetInnerHTML={{ __html: formatContent(block2) }} />}
                    {highlightTxt && (
                        <div className="flex justify-end w-full py-4">
                            <div className="w-[85%] md:w-[75%] bg-background/90 p-8 md:p-10 border-l-[3px] border-[#a1232b] relative shadow-sm">
                                <h4 className="text-lg font-black text-foreground mb-4 leading-tight">{decodeHtmlEntities(highlightTitle)}</h4>
                                <div className="text-xm md:text-base italic opacity-80 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatContent(highlightTxt) }} />
                            </div>
                        </div>
                    )}
                    {block3 && <div className="prose-p:mb-10 opacity-90" dangerouslySetInnerHTML={{ __html: formatContent(block3) }} />}
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
