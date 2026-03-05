import * as React from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { WordPressPost } from "../../types/api";
import { SectionTitle } from "../ui/SectionTitle";
import { SITE_CONFIG } from "@/constants/site-config";
import { SafeImage } from "../ui/SafeImage";
import { ensureAbsoluteUrl } from "@/services/api";
import { getPostAuthor, formatDate, decodeHtmlEntities } from "@/utils/text";

interface WordPressCategoryColumnProps {
    title: string;
    title2: string;
    items: WordPressPost[];
    enter?: boolean;
    categorySlug: string;
    type?: 'radio' | 'tv' | 'audio';
    figmaLayout?: boolean;
}

export function WordPressCategoryColumn({
    title,
    title2,
    items,
    enter,
    categorySlug,
    type,
    figmaLayout = false,
}: WordPressCategoryColumnProps) {
    if (!items || items.length === 0) return null;

    const getDisplayData = (item: any) => {
        if (!item) return null;

        // Extract and decode title safely
        let rawTitle = "";
        if (typeof item.title === 'object' && item.title !== null) {
            rawTitle = item.title.rendered || "";
        } else {
            rawTitle = item.title || "";
        }
        const title = decodeHtmlEntities(rawTitle);

        // 1. WordPress Post (Detailed check)
        if (item.title && typeof item.title === 'object' && item.title.rendered) {
            return {
                id: item.id,
                title: title,
                image: ensureAbsoluteUrl(item.acan_image_url || item._embedded?.['wp:featuredmedia']?.[0]?.source_url) || SITE_CONFIG.theme.placeholders.news,
                link: `/news?slug=${item.slug || item.id}`,
                date: item.date,
                author: getPostAuthor(item),
            };
        }

        // 2. VOD / Replay / Video
        if (item.video_url || item.type === 'vod' || categorySlug === 'replays' || (item.slug && !item.type)) {
            return {
                id: item.slug || item.id,
                title: title,
                image: ensureAbsoluteUrl(item.logo_url || item.logo) || SITE_CONFIG.theme.placeholders.news,
                link: `/replay/${item.slug || item.id}`,
                date: item.date || item.start_time || item.end_time || item.duration,
                author: getPostAuthor(item),
            };
        }

        // 3. Audio / Podcast
        if (item.audio_url || type === 'audio') {
            return {
                id: item.slug || item.id,
                title: title,
                image: ensureAbsoluteUrl(item.logo_url || item.logo || item.image_url || item.image) || SITE_CONFIG.theme.placeholders.radio,
                link: `/audio/${item.slug || item.id}`,
                date: item.date || item.published_at || item.duration,
                author: item.channel_name || getPostAuthor(item),
            };
        }

        // 4. Default / Radio
        return {
            id: item.id,
            title: title,
            image: ensureAbsoluteUrl(item.logo_url || item.logo || item.hd_logo || item.sd_logo) || SITE_CONFIG.theme.placeholders.news,
            link: item.type === 'RADIO' || type === 'radio' ? `/audio` : `/live`,
            date: item.date || item.start_time || item.end_time || item.duration || formatDate(new Date()),
            author: getPostAuthor(item),
        };
    };


    const itemsToDisplay = items.slice(0, 8);
    const featuredRaw = itemsToDisplay[0];
    const listRaw = itemsToDisplay.slice(1);
    const listtotal = items.map(item => getDisplayData(item)).filter(Boolean) as any[];

    const featured = getDisplayData(featuredRaw);
    const listItems = (enter ? listtotal : listRaw.map(item => getDisplayData(item))).filter(Boolean) as any[];

    // ── LAYOUT FIGMA PIXEL-PERFECT ──
    if (figmaLayout) {
        const categoryHref = (categorySlug === 'radio' || categorySlug === 'audio') ? '/audio' : (categorySlug === 'replays' ? '/replay' : `/news`);

        // ArticleInfo réutilisable
        const ArticleInfo = ({ date, author }: { date: string | null; author: string }) => (
            // Article Info Container: flex row, items-center, gap-[10px], h-[23px]
            <div className="flex flex-row items-center justify-between w-full" style={{ gap: 10, height: 23 }}>
                {/* Article Date: b4 (12px/400), color #333 */}
                {date && (
                    <span style={{
                        fontFamily: "Inter", fontWeight: 400, fontSize: 12,
                        lineHeight: "18px", color: "var(--foreground)", height: 18,
                        display: "flex", alignItems: "center",
                    }}>
                        {formatDate(date)}
                    </span>
                )}
                {/* Author Container: flex row, items-center, gap-[10px] */}
                {author && (
                    <div className="flex flex-row items-center" style={{ gap: 10 }}>
                        {/* Green dot: 6×6px, #118A39 */}
                        <span className="rounded-full flex-shrink-0"
                            style={{ width: 6, height: 6, background: "#118A39" }} />
                        {/* Author: b4 (12px/400), color #333 */}
                        <span style={{
                            fontFamily: "Inter", fontWeight: 400, fontSize: 12,
                            lineHeight: "18px", color: "var(--foreground)",
                            height: 18, display: "flex", alignItems: "center",
                        }}>
                            {author}
                        </span>
                    </div>
                )}
            </div>
        );

        return (
            <div className="flex flex-col w-full gap-5">

                {/* Title Container */}
                <SectionTitle
                    title={title}
                    title2={title2}
                    actionHref={categoryHref}
                    actionIcon
                    className="font-bold flex-wrap"
                />

                <div className="flex flex-col items-center w-full gap-8">

                    {/* Featured Article Container */}
                    {featured && (
                        <Link
                            href={featured.link}
                            className="group flex flex-col items-start w-full gap-3"
                        >
                            {/* Article Image */}
                            <div
                                className={`relative w-full flex-shrink-0 overflow-hidden ${type === 'tv' ? 'aspect-[700/373]' : 'aspect-[700/367]'}`}
                            >
                                <SafeImage
                                    src={featured.image}
                                    alt={featured.title || ""}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 700px"
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                {type && (
                                    <div className="absolute z-10 pointer-events-none left-4 sm:left-5 bottom-4 sm:bottom-6 w-10 h-10 sm:w-[49px] sm:h-[49px]">
                                        <Image
                                            src={type === 'radio' || type === 'audio' ? SITE_CONFIG.theme.placeholders.radio : '/assets/placeholders/play_overlay.png'}
                                            alt={type}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Article Content */}
                            <div className="flex flex-col items-start w-full ">
                                <p
                                    className="overflow-hidden self-stretch text-base sm:text-lg font-medium leading-relaxed sm:leading-[27px] line-clamp-3 text-foreground"
                                >
                                    {featured.title}
                                </p>
                                <ArticleInfo date={featured.date} author={featured.author} />
                            </div>
                        </Link>
                    )}

                    {/* Sidebar Articles */}
                    <div
                        className="flex flex-col items-center w-full gap-6 sm:gap-[25px]"
                    >
                        {listItems.map((item, idx) => (
                            <React.Fragment key={`${item.id}-${idx}`}>
                                {/* Separator */}
                                <div
                                    className="w-full h-px bg-border/20"
                                />

                                {/* Article Container */}
                                <Link
                                    href={item.link}
                                    className="group flex flex-row items-start self-stretch gap-3 sm:gap-[10px] min-h-[100px] sm:h-[116px]"
                                >
                                    {/* Thumbnail */}
                                    <div
                                        className="relative flex-shrink-0 overflow-hidden w-24 h-24 sm:w-[116px] sm:h-[116px] "
                                    >
                                        <SafeImage
                                            src={item.image}
                                            alt={item.title || ""}
                                            fill
                                            sizes="(max-width: 640px) 96px, 116px"
                                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                        {type && (
                                            <div className="absolute bottom-1 left-1 sm:bottom-[5px] sm:left-[5px] z-10 pointer-events-none w-5 h-5 sm:w-6 sm:h-6">
                                                <Image
                                                    src={type === 'radio' || type === 'audio' ? SITE_CONFIG.theme.placeholders.radio : '/assets/placeholders/play_overlay.png'}
                                                    alt={type}
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Article Content */}
                                    <div
                                        className="flex flex-col items-start flex-1 min-w-0 min-h-[50%] "
                                    >
                                        <p
                                            className="overflow-hidden self-stretch text-sm sm:text-base font-normal uppercase leading-tight sm:leading-[24px] text-foreground transition-colors group-hover:text-accent line-clamp-3 mb-auto"
                                        >
                                            {item.title}
                                        </p>
                                        <ArticleInfo date={item.date} author={item.author} />
                                    </div>
                                </Link>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ── LAYOUT ORIGINAL (inchangé pour les autres usages) ──
    return (
        <div className="space-y-4">
            <SectionTitle title={title} title2={title2} actionHref={(categorySlug === 'radio' || categorySlug === 'audio') ? '/audio' : (categorySlug === 'replays' ? '/replay' : `/news`)} className="font-bold" />
            {featured && !enter && (
                <Link href={featured.link} className="group relative block space-y-2 lg:space-y-3 pb-5 after:absolute after:bottom-0 after:left-25 after:right-25 after:border-b after:border-muted/15">
                    <div className="relative aspect-[2/1] sm:aspect-video overflow-hidden bg-white/5">
                        <SafeImage src={featured.image} alt={featured.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                        {type && (
                            <div className="absolute bottom-2 left-2 lg:bottom-3 lg:left-3 z-10 w-8 h-8 lg:w-10 lg:h-10 pointer-events-none">
                                <Image src={type === 'radio' || type === 'audio' ? SITE_CONFIG.theme.placeholders.radio : '/assets/placeholders/play_overlay.png'} alt={type} width={40} height={40} className="object-contain" />
                            </div>
                        )}
                    </div>
                    <div className="space-y-1.5 lg:space-y-2">
                        <h4 className="text-base lg:text-lg font-bold leading-tight line-clamp-2 group-hover:text-[color:var(--accent)] transition-colors">{featured.title}</h4>
                        <div className="flex items-center justify-between gap-2 text-[11px] text-gray-500 w-full">
                            {featured.date && (<span>{formatDate(featured.date)}</span>)}
                            {featured.author && <span className="font-medium">{featured.author}</span>}
                        </div>
                    </div>
                </Link>
            )}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-0 lg:space-y-5">
                {listItems.map((item, idx) => (
                    <Link key={item.id + '-' + idx} href={item.link} className="group relative flex flex-col lg:flex-row gap-2 lg:gap-4 items-start lg:pb-5 lg:after:absolute lg:after:bottom-0 lg:after:left-25 lg:after:right-25 lg:after:border-b lg:after:border-muted/15 last:after:hidden">
                        <div className="relative w-full lg:w-24 aspect-video lg:h-20 flex-shrink-0 overflow-hidden bg-white/5">
                            <SafeImage src={item.image} alt={item.title} fill sizes="(max-width: 1024px) 150px, 96px" className="object-cover group-hover:scale-110 transition-transform duration-300" />
                            {type && (
                                <div className="absolute bottom-1 left-1 z-10 w-6 h-6 pointer-events-none">
                                    <Image src={type === 'radio' || type === 'audio' ? SITE_CONFIG.theme.placeholders.radio : '/assets/placeholders/play_overlay.png'} alt={type} width={24} height={24} className="object-cover" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 py-0.5 space-y-1 lg:space-y-6">
                            <h5 className="text-[11px] lg:text-[13px] font-bold uppercase leading-tight lg:leading-[1.4] line-clamp-2 group-hover:text-[color:var(--accent)] transition-colors">{item.title}</h5>
                            <div className="flex items-center justify-between gap-1.5 lg:gap-2 text-[8px] lg:text-[10px] text-gray-500 w-full">
                                {item.date && (<span className="line-clamp-1">{formatDate(item.date)}</span>)}
                                {item.author && <span className="font-medium hidden sm:block">{item.author}</span>}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}