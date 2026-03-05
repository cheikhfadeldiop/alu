import { decodeHtmlEntities, getPostAuthor, formatDate } from "../../utils/text";
import { WordPressPost } from "../../types/api";
import { SITE_CONFIG } from "@/constants/site-config";
import { SafeImage } from "../ui/SafeImage";
import { Link } from "@/i18n/navigation";
import { ShareButton } from "../ui/ShareButton";
import { AdBannerV, AdBannerV2 } from "../ui/AdBannerV";

interface NewsDetailedLayoutProps {
    featuredItem: WordPressPost;
    sideItems: WordPressPost[];
    onItemClick?: (item: WordPressPost) => void;
}

export function NewsDetailedLayout({ featuredItem, sideItems, onItemClick }: NewsDetailedLayoutProps) {
    if (!featuredItem || !featuredItem.title) return null;

    const formatContent = (html: string) => {
        let processed = html;
        const keywords = ["CRTV", "Paul Biya", "Président", "République", "Décision", "Décret", "Cameroun", "Nomination", "Gouvernement", "Ministre", "Sécurité", "Urgent"];
        keywords.forEach(word => {
            const regex = new RegExp(`(${word})`, "gi");
            processed = processed.replace(regex, '<span style="color:var(--accent);font-weight:700">$1</span>');
        });
        let sentenceCount = 0;
        processed = processed.replace(/(\.\s+)([A-Z])/g, (match, p1, p2) => {
            sentenceCount++;
            if (sentenceCount % 3 === 0) return `${p1}<br/><br/>${p2}`;
            return match;
        });
        return processed;
    };

    const extractCitation = (html: string) => {
        const match = html.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
        if (match) return { citation: match[1], cleanHtml: html.replace(match[0], '') };
        return { citation: null, cleanHtml: html };
    };

    const { citation, cleanHtml } = extractCitation(featuredItem.content?.rendered || "");

    const getParagraphs = (html: string) => {
        if (!html) return [];
        const matches = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
        if (!matches) return html.split(/\n\n+/).filter(p => p.trim().length > 10);
        return matches.map(p => p.trim()).filter(p => p.length > 20);
    };

    const paragraphs = getParagraphs(cleanHtml);
    const finalQuote = citation || (paragraphs.length > 2 ? paragraphs[2] : "");
    const remainingParagraphs = citation ? paragraphs : paragraphs.filter((_, i) => i !== 2);

    const block1 = remainingParagraphs.slice(0, 2).join("");
    const block2 = remainingParagraphs.slice(2, 4).join("");
    const highlightTxt = remainingParagraphs.slice(4, 6).join("");
    const block3 = remainingParagraphs.slice(6).join("");

    const displaySideItems = sideItems.slice(0, 5);

    const handleItemClick = (e: React.MouseEvent, item: WordPressPost) => {
        if (onItemClick) { e.preventDefault(); onItemClick(item); }
    };

    // ── ArticleInfo réutilisable ──
    const ArticleInfo = ({ post }: { post: WordPressPost }) => (
        <div className="flex flex-row items-center gap-2 sm:gap-[10px] h-auto sm:h-[23px]">
            <span className="text-xs sm:text-sm text-muted/80">
                {formatDate(post.date)}
            </span>
            <div className="flex flex-row items-center gap-2 sm:gap-[10px]">
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full flex-shrink-0 bg-[#118A39]" />
                <span className="text-xs sm:text-sm text-muted font-medium">
                    {getPostAuthor(post)}
                </span>
            </div>
        </div>
    );

    // ── Social icon button ──
    const SocialIcon = ({ children }: { children: React.ReactNode }) => (
        <div className="flex items-center justify-center flex-shrink-0 bg-foreground/30 border border-border rounded-md hover:bg-border transition-colors cursor-pointer w-7 h-7 sm:w-[27px] sm:h-[27px] p-1">
            {children}
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row justify-center items-start w-full gap-6 lg:gap-[38px] max-w-[1446px] mx-auto">

            {/* ── COL GAUCHE ARTICLE ── */}
            <div className="flex flex-col items-start w-full lg:w-[830px] lg:flex-shrink-0 bg-background  sm:px-[34px] py-4 sm:py-[15px] pb-6 sm:pb-[39px] gap-4 sm:gap-6">

                <div className="flex flex-col items-end w-full gap-6 sm:gap-[47px]">

                    {/* Article Image */}
                    <div className="relative w-full aspect-video lg:aspect-[822/533] overflow-hidden ">
                        <SafeImage
                            src={featuredItem.acan_image_url || SITE_CONFIG.theme.placeholders.news}
                            alt={featuredItem.title?.rendered || "News"}
                            fill
                            priority
                            sizes="(max-width: 1024px) 100vw, 822px"
                            className="object-cover"
                        />
                    </div>

                    {/* Content + Meta container */}
                    <div className="flex flex-col items-start w-full gap-2 sm:gap-[10px]">

                        {/* Title */}
                        <h1 className="w-full text-foreground line-clamp-4 text-xl sm:text-2xl lg:text-[24px] font-bold leading-tight sm:leading-[36px]" style={{ fontFamily: "Roboto" }}>
                            {decodeHtmlEntities(featuredItem.title?.rendered || "")}
                        </h1>

                        {/* Meta row */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-3 sm:gap-4 sm:h-[42px]">

                            {/* Date Info */}
                            <div className="flex flex-row items-center gap-4 sm:gap-[38px]">
                                <ArticleInfo post={featuredItem} />
                            </div>

                            {/* Social Media Icons */}
                            <div className="flex flex-row justify-start sm:justify-end items-center gap-3 sm:gap-[20px] h-7 sm:h-[27px]">
                                <ShareButton
                                    title={decodeHtmlEntities(featuredItem.title?.rendered || "")}
                                    text={`Lisez cet article sur CRTV Web`}
                                    className="flex flex-row items-center gap-2 sm:gap-3"
                                >
                                    <SocialIcon>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#1F1E18">
                                            <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                                        </svg>
                                    </SocialIcon>
                                    <SocialIcon>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#1F1E18">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622z" />
                                        </svg>
                                    </SocialIcon>
                                    <SocialIcon>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                                            <rect x="2" y="2" width="20" height="20" rx="5" />
                                            <circle cx="12" cy="12" r="4" />
                                            <circle cx="17.5" cy="6.5" r="1" fill="#1F1E18" />
                                        </svg>
                                    </SocialIcon>
                                    <SocialIcon>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#1F1E18">
                                            <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                                            <circle cx="4" cy="4" r="2" />
                                        </svg>
                                    </SocialIcon>
                                </ShareButton>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── BODY CONTENT ── */}
                <div className="flex flex-col justify-center items-end w-full gap-6 sm:gap-[40px]">

                    {/* Block 1 */}
                    {block1 && (
                        <div className="flex flex-col items-start w-full gap-3 sm:gap-[13px]">
                            <div
                                className="text-justify text-foreground text-sm sm:text-base lg:text-[18px] leading-relaxed sm:leading-[27px] w-full"
                                style={{ fontFamily: "Roboto", fontWeight: 500 }}
                                dangerouslySetInnerHTML={{ __html: formatContent(block1) }}
                            />
                            <div className="w-full h-px bg-border/40" />
                        </div>
                    )}

                    {/* Block 2 */}
                    {block2 && (
                        <div
                            className="text-justify text-foreground/90 text-sm sm:text-base lg:text-[18px] leading-relaxed sm:leading-[21px] w-full"
                            style={{ fontFamily: "Roboto", fontWeight: 400 }}
                            dangerouslySetInnerHTML={{ __html: formatContent(block2) }}
                        />
                    )}

                    {/* Citation */}
                    {finalQuote && (
                        <div className="flex flex-col justify-center items-center w-full max-w-[611px] border border-[#F98D00] bg-accent/5 p-4 sm:p-6 lg:p-[10px] min-h-[120px] sm:min-h-[150px]">
                            <div className="flex flex-row items-start w-full gap-3 sm:gap-4 lg:gap-[16px]">
                                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 lg:w-[68px] lg:h-[68px]">
                                    <svg className="w-full h-full" viewBox="0 0 68 68" fill="none">
                                        <text x="4" y="58" fontSize="72" fontFamily="Georgia" fill="var(--accent)" opacity="0.3">"</text>
                                    </svg>
                                </div>
                                <div
                                    className="italic text-foreground text-justify text-sm sm:text-base lg:text-[17px] leading-relaxed sm:leading-[21px] flex-1"
                                    style={{ fontFamily: "Roboto", fontWeight: 400 }}
                                    dangerouslySetInnerHTML={{
                                        __html: finalQuote.replace(/<p[^>]*>/i, '').replace(/<\/p>/i, '')
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Block 3 */}
                    {block2 && (
                        <div
                            className="text-justify text-foreground/90 text-sm sm:text-base lg:text-[18px] leading-relaxed sm:leading-[21px] w-full"
                            style={{ fontFamily: "Roboto", fontWeight: 400 }}
                            dangerouslySetInnerHTML={{ __html: formatContent(block2) }}
                        />
                    )}

                    {/* Highlight block */}
                    {highlightTxt && (
                        <div className="flex flex-col justify-center items-center w-full max-w-[611px] border-l-2 sm:border-l border-[#9B2B2C] bg-[#F2F1ED] p-4 sm:p-6 lg:p-[25px_34px] min-h-[100px] sm:min-h-[132px]">
                            <div
                                className="font-medium text-justify text-[#1A1913] w-full text-sm sm:text-base lg:text-[18px] leading-relaxed sm:leading-[27px]"
                                style={{ fontFamily: "Roboto", fontWeight: 500 }}
                                dangerouslySetInnerHTML={{ __html: formatContent(highlightTxt) }}
                            />
                        </div>
                    )}

                    {/* Block final */}
                    {block3 && (
                        <div
                            className="text-justify text-foreground/90 w-full text-sm sm:text-base lg:text-[18px] leading-relaxed sm:leading-[21px]"
                            style={{ fontFamily: "Roboto", fontWeight: 400 }}
                            dangerouslySetInnerHTML={{ __html: formatContent(block3) }}
                        />
                    )}
                </div>
            </div>

            {/* ── COL DROITE SIDEBAR ── */}
            <div className="flex flex-col items-start w-full lg:w-[578px] lg:flex-shrink-0 gap-8 sm:gap-12 lg:gap-[72px]">

                {/* ── TOP STORIES ── */}
                <div className="flex flex-col justify-center items-center w-full gap-2 sm:gap-[10px]">
                    <div className="flex flex-col items-start w-full pb-6 sm:pb-[39px] bg-background gap-2 sm:gap-[10px]">

                        {/* Section title */}
                        <div className="flex flex-col items-start w-full border-b border-[rgba(123,34,36,0.15)] h-10 sm:h-[51px] gap-3 sm:gap-5">
                            <span className="flex items-center text-foreground font-bold uppercase h-10 sm:h-[51px] text-lg sm:text-[22px] leading-tight sm:leading-[33px]" style={{ fontFamily: "Inter" }}>
                                TOP NEWS
                            </span>
                        </div>

                        {/* Items list */}
                        <div className="flex flex-col items-start w-full gap-4 sm:gap-6 lg:gap-[40px] mt-3 sm:mt-5">
                            {displaySideItems.map((item, idx) => (
                                <div key={item.id} className="flex flex-col items-start w-full gap-3 sm:gap-4">
                                    <Link
                                        href={`/news?slug=${item.slug || item.id}`}
                                        onClick={(e) => handleItemClick(e, item)}
                                        className="group flex flex-row items-start w-full gap-3 sm:gap-4 lg:gap-[15px]"
                                    >
                                        {/* Text col */}
                                        <div className="flex flex-col items-start flex-1 gap-1 sm:gap-[5px]">
                                            <div className="flex flex-col items-start w-full gap-1">
                                                <p className="font-medium group-hover:opacity-80 transition-opacity text-foreground line-clamp-2 sm:line-clamp-3 text-sm sm:text-base lg:text-[18px] leading-snug sm:leading-[27px]" >
                                                    {decodeHtmlEntities(item.title.rendered)}
                                                </p>
                                            </div>
                                            <div className="flex flex-row items-center h-auto sm:h-[26px]">
                                                <ArticleInfo post={item} />
                                            </div>
                                        </div>

                                        {/* Thumbnail */}
                                        <div className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 lg:w-[111px] lg:h-[114px] overflow-hidden ">
                                            <SafeImage
                                                src={item.acan_image_url || SITE_CONFIG.theme.placeholders.news}
                                                alt={item.title.rendered}
                                                fill
                                                sizes="(max-width: 640px) 80px, (max-width: 1024px) 96px, 111px"
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                    </Link>
                                    {idx < displaySideItems.length - 1 && (
                                        <div className="w-full h-px bg-[#F2F1ED]" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── BANNER PUB ── */}
                <div className="flex flex-col items-center justify-end w-full lg:sticky lg:top-24 overflow-hidden rounded-3xl">
                    <AdBannerV2 />
                </div>
            </div>
        </div>
    );
}