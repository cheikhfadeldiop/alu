"use client";

import { Link } from "@/i18n/navigation";
import { SectionTitle } from "../ui/SectionTitle";
import { WordPressPost } from "../../types/api";
import { SITE_CONFIG } from "@/constants/site-config";
import { useTranslations } from "next-intl";
import { SafeImage } from "../ui/SafeImage";
import Image from "next/image";
import { useChannelResolver } from "@/hooks/useData";
import { ensureAbsoluteUrl } from "@/services/api";
import { decodeHtmlEntities, getPostAuthor, formatDate } from "@/utils/text";

interface EditorialChoiceProps {
    items: WordPressPost[];
    title: string;
    title2?: string;
    actionLabel?: string;
}

export function EditorialChoice({ items, title, title2, actionLabel }: EditorialChoiceProps) {
    const t = useTranslations("common");
    const { resolveLogo } = useChannelResolver();

    if (!items || items.length === 0) return null;

    const displayItems = items.slice(0, 7);
    const featuredItem = displayItems[0];
    const sideItems = displayItems.slice(1, 3);
    const gridItems = displayItems.slice(3, 7);

    const getImageUrl = (post: WordPressPost): string => {
        if (post.acan_image_url) return post.acan_image_url;
        if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
            return post._embedded['wp:featuredmedia'][0].source_url;
        }
        return SITE_CONFIG.theme.placeholders.news;
    };

    // Article Info: date + green dot + author
    const ArticleInfo = ({
        post,
        darkText = false,
    }: {
        post: WordPressPost;
        darkText?: boolean;
    }) => (
        // Article Info Container: flex row, gap-s (10px), items-center, h-[23px]
        <div className="flex flex-row items-center gap-s h-[23px]">
            {/* Article Date: b4, 12px/400, color neutral-1000 (#333) or neutral-700 (#777) */}
            <span
                className="b4"

            >
                {formatDate(post.date)}
            </span>
            {/* Author container: flex row, gap-s, items-center */}
            <div className="flex flex-row items-center gap-s">
                {/* Green dot: 6×6px, #118A39 */}
                <span
                    className="rounded-full flex-shrink-0"
                    style={{ width: 6, height: 6, background: "#118A39" }}
                />
                {/* Article Author: b4 */}
                <span
                    className="b4"

                >
                    {getPostAuthor(post)}
                </span>
            </div>
        </div>
    );

    return (
        <section className="w-full">
            {/* ── HEADER ── flex row, justify-between, items-center */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 md:mb-[60px]">
                <SectionTitle
                    title={title}
                    title2={title2}
                    actionHref="/news"
                    actionIcon
                    className="font-bold"
                />

                <Link
                    href="/news"
                    className="flex items-center justify-center h-[37px] px-0 border-b border-[#8E8E8E]"
                >
                    <span className="b2 font-normal text-sm sm:text-[14px] leading-normal sm:leading-[24px]">
                        {t("seeMore")}
                    </span>
                </Link>
            </div>

            {/* ── CONTENT WRAPPER ── */}
            <div className="flex flex-col gap-8 md:gap-12">
                {/* ── ROW 1 ── */}
                <div className="flex flex-col xl:flex-row items-start gap-8 xl:gap-[32px]">

                    {/* LEFT BLOCK: Featured content */}
                    <div className="flex flex-col md:flex-row items-start gap-6 md:gap-[20px] flex-1 min-w-0 w-full">
                        {featuredItem && (
                            <Link
                                href={`/news?slug=${featuredItem.slug || featuredItem.id}`}
                                className="group flex flex-col justify-start items-start gap-4 flex-1 w-full"
                            >
                                {/* Main Content Title */}
                                <h2
                                    className="text-2xl sm:text-3xl lg:text-[22px] font-bold text-foreground leading-tight uppercase line-clamp-4 ]"
                                >
                                    {decodeHtmlEntities(featuredItem.title.rendered)}
                                </h2>

                                {/* Article Excerpt */}
                                <p
                                    className="b2 text-foreground/80 line-clamp-3"
                                >
                                    {decodeHtmlEntities(featuredItem.excerpt?.rendered || "")
                                        .replace(/<[^>]*>/g, "")
                                        .slice(0, 150)}
                                </p>

                                {/* Article Info */}
                                <ArticleInfo post={featuredItem} darkText />
                            </Link>
                        )}

                        {/* Main Content Video */}
                        {featuredItem && (() => {
                            const channelLogo = resolveLogo(featuredItem);
                            return (
                                <Link
                                    href={`/news?slug=${featuredItem.slug || featuredItem.id}`}
                                    className="relative overflow-hidden flex-[1.5] group bg-white/5 w-full aspect-video sm:aspect-[562/316] rounded-sm"
                                >
                                    <SafeImage
                                        src={getImageUrl(featuredItem)}
                                        alt={decodeHtmlEntities(featuredItem.title.rendered)}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 700px"
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {/* Play icon */}
                                    <div className="absolute top-3 left-3 z-10 pointer-events-none w-8 h-8 sm:w-[33px] sm:h-[33px]">
                                        <Image
                                            src="/assets/placeholders/play_overlay.png"
                                            alt="Play"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    {/* Channel logo */}
                                    {channelLogo && (
                                        <div className="absolute top-[25px] right-[22px] z-10 w-12 sm:w-[57px] h-5">
                                            <SafeImage
                                                src={ensureAbsoluteUrl(channelLogo)}
                                                alt="Channel Logo"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    )}
                                </Link>
                            );
                        })()}
                    </div>

                    {/* SIDEBAR: flex col, items-start, gap-[15px] */}
                    <div className="flex flex-col items-start w-full xl:w-[453px] gap-[20px]">
                        {sideItems.map((item) => (
                            <Link
                                key={item.id}
                                href={`/news?slug=${item.slug || item.id}`}
                                className="group flex flex-row items-start w-full gap-4"
                            >
                                <div className="flex flex-col items-start flex-1 min-w-0 gap-2">
                                    <p className="text-sm font-bold sm:text-[15px] leading-relaxed line-clamp-3 text-foreground transition-colors group-hover:text-accent">
                                        {decodeHtmlEntities(item.title.rendered)}
                                    </p>
                                    <ArticleInfo post={item} darkText={false} />
                                </div>

                                <div className="relative flex-shrink-0 overflow-hidden bg-white/5 w-24 h-24 sm:w-[158px] sm:h-[130px] rounded-sm">
                                    <SafeImage
                                        src={getImageUrl(item)}
                                        alt={decodeHtmlEntities(item.title.rendered)}
                                        fill
                                        sizes="(max-width: 768px) 100px, 158px"
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* ── ROW 2 ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-[20px]">
                    {gridItems.map((item) => (
                        <Link
                            key={item.id}
                            href={`/news?slug=${item.slug || item.id}`}
                            className="group flex flex-col items-start w-full gap-3 md:gap-4"
                        >
                            <div className="relative w-full aspect-[350/186] overflow-hidden bg-white/5 rounded-sm">
                                <SafeImage
                                    src={getImageUrl(item)}
                                    alt={decodeHtmlEntities(item.title.rendered)}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 350px"
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>

                            <div className="flex flex-col items-start w-full gap-2">
                                <p className="text-sm sm:text-base font-bold leading-tight line-clamp-3 text-foreground transition-colors group-hover:text-accent">
                                    {decodeHtmlEntities(item.title.rendered)}
                                </p>
                                <ArticleInfo post={item} darkText />
                            </div>
                        </Link>
                    ))}
                </div>

            </div>
        </section>
    );
}