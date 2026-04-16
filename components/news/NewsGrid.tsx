import * as React from "react";
import { Link } from "../../i18n/navigation";
import { WordPressPost } from "../../types/api";
import { SectionTitle } from "../ui/SectionTitle";
import { SafeImage } from "../ui/SafeImage";
import { SITE_CONFIG } from "@/constants/site-config";
import { decodeHtmlEntities, getPostAuthor, formatDate } from "../../utils/text";
import { useTranslations } from "next-intl";

interface NewsGridProps {
    items: WordPressPost[];
    loadingMore: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    title?: string;
    title2?: string;
    onItemClick?: (item: WordPressPost) => void;
}

export function NewsGrid({
    items,
    loadingMore,
    hasMore,
    onLoadMore,
    title,
    title2,
    onItemClick,
}: NewsGridProps) {
    const t = useTranslations("common");
    const newsT = useTranslations("pages.news");
    const resolvedTitle = title ?? `${newsT("moreOf")} `;
    const resolvedTitle2 = title2 ?? newsT("newsTitle");

    const getImageUrl = (post: WordPressPost) =>
        post.acan_image_url ||
        post._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
        "/assets/placeholders/news_wide.png";

    if (items.length === 0) {
        return (
            <section className="flex flex-col items-center w-full py-6 sm:py-10">
                <div className="w-full max-w-[1400px] mx-auto">
                    {/* HEADER */}
                    {(resolvedTitle || resolvedTitle2) && (
                        <div className="flex flex-row items-center justify-between w-full mb-6 sm:mb-10">
                            <SectionTitle
                                title={resolvedTitle}
                                title2={resolvedTitle2}
                                className="font-bold"
                            />
                        </div>
                    )}

                    {/* Empty State */}
                    <div className="flex flex-col items-center justify-center w-full py-16 sm:py-24 gap-6 sm:gap-8">
                        {/* Icon */}
                        <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-surface-2 border border-border">
                            <svg
                                className="w-9 h-9 sm:w-11 sm:h-11 text-muted/40"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a4 4 0 0 1-4 4z" />
                                <path d="M8 2v4" />
                                <path d="M12 7h4" />
                                <path d="M12 11h4" />
                                <path d="M12 15h4" />
                            </svg>
                            {/* Decorative dot */}
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent/20 border-2 border-background" />
                        </div>

                        {/* Text */}
                        <div className="flex flex-col items-center gap-2 text-center max-w-sm">
                            <h3 className="text-lg sm:text-xl font-bold uppercase text-foreground tracking-wide">
                                {newsT("noArticlesAvailableTitle")}
                            </h3>
                            <p className="text-sm sm:text-base text-muted leading-relaxed">
                                {newsT("noArticlesAvailableDesc")}
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="w-12 h-[2px] rounded-full bg-accent/30" />

                        {/* Back hint */}
                        <p className="flex items-center gap-2 text-xs sm:text-sm text-muted/60 font-medium uppercase tracking-wider">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                            {newsT("selectAnotherCategoryHint")}
                        </p>
                    </div>
                </div>
            </section>
        );
    }


    // ── ArticleInfo réutilisable ──
    const ArticleInfo = ({ post }: { post: WordPressPost }) => (
        <div className="flex flex-row items-center gap-2 sm:gap-[10px] h-auto sm:h-[23px]">
            <span className="text-xs sm:text-sm text-muted/80">
                {formatDate(post.date)}
            </span>
            <div className="flex flex-row items-center gap-2 sm:gap-[10px]">
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#118A39]" />
                <span className="text-xs sm:text-sm text-muted font-medium">
                    {getPostAuthor(post)}
                </span>
            </div>
        </div>
    );

    // ── Article card standard (rows 2-4) ──
    const ArticleCard = ({ post }: { post: WordPressPost }) => {
        const content = (
            <div className="group flex flex-col items-start w-full gap-2 sm:gap-[10px]">
                {/* Article Image */}
                <div className="relative w-full aspect-[16/9] sm:aspect-[455/242] overflow-hidden rounded-sm">
                    <SafeImage
                        src={getImageUrl(post)}
                        alt={decodeHtmlEntities(post.title.rendered)}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 455px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </div>

                {/* Article Content */}
                <div className="flex flex-col items-start w-full gap-1 sm:gap-[5px]">
                    <h3 className="line-clamp-2 sm:line-clamp-3 text-base sm:text-lg md:text-[22px] font-bold uppercase text-foreground leading-tight sm:leading-[26px] md:leading-[33px]">
                        {decodeHtmlEntities(post.title.rendered)}
                    </h3>
                    <ArticleInfo post={post} />
                </div>
            </div>
        );

        if (onItemClick) {
            return <div className="cursor-pointer w-full" onClick={() => onItemClick(post)}>{content}</div>;
        }
        return (
            <Link href={`/news?slug=${post.slug || post.id}`} className="w-full">
                {content}
            </Link>
        );
    };

    // Split items
    const heroFeatured = items[0];
    const heroSidebar = items[1];
    const gridItems = items.slice(2);

    return (
        <section className="flex flex-col items-center w-full  py-6 sm:py-10">
            <div className="w-full max-w-[1400px] mx-auto">
                {/* HEADER */}
                <div className="flex flex-row items-center justify-between w-full mb-4 sm:mb-6 md:mb-[30px]">
                    <SectionTitle
                        title={resolvedTitle}
                        title2={resolvedTitle2}
                        actionHref="/news"
                        actionIcon
                        className="font-bold"
                    />
                </div>

                <div className="flex flex-col gap-6 sm:gap-10 md:gap-[70px] w-full">
                    {/* ── ROW 1 HERO ── */}
                    {heroFeatured && (
                        <div className="flex flex-col lg:flex-row items-start w-full gap-4 sm:gap-6 lg:gap-[41px]">
                            {/* Left block: Featured content */}
                            <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-6 lg:gap-[20px] flex-[2.2] w-full">
                                {(() => {
                                    const Wrapper = onItemClick
                                        ? ({ children }: { children: React.ReactNode }) =>
                                            <div className="cursor-pointer w-full md:flex-1 order-2 md:order-1" onClick={() => onItemClick(heroFeatured)}>{children}</div>
                                        : ({ children }: { children: React.ReactNode }) =>
                                            <Link href={`/news?slug=${heroFeatured.slug || heroFeatured.id}`} className="w-full md:flex-1 order-2 md:order-1">{children}</Link>;
                                    return (
                                        <Wrapper>
                                            <div className="group flex flex-col items-start gap-3 sm:gap-4 lg:gap-[14px] w-full">
                                                <h2 className="text-xl sm:text-2xl lg:text-[22px] line-clamp-2 sm:line-clamp-3 text-foreground font-bold uppercase leading-tight sm:leading-[33px]">
                                                    {decodeHtmlEntities(heroFeatured.title.rendered)}
                                                </h2>
                                                <p className="hidden md:block text-sm sm:text-base lg:text-[18px] text-foreground line-clamp-4 lg:line-clamp-6 group-hover:opacity-80 transition-opacity leading-relaxed sm:leading-[27px]">
                                                    {decodeHtmlEntities(heroFeatured.excerpt.rendered)}
                                                </p>
                                                <ArticleInfo post={heroFeatured} />
                                            </div>
                                        </Wrapper>
                                    );
                                })()}

                                {/* Hero image */}
                                {(() => {
                                    const Wrapper = onItemClick
                                        ? ({ children }: { children: React.ReactNode }) =>
                                            <div className="cursor-pointer w-full md:flex-[1.8] order-1 md:order-2" onClick={() => onItemClick(heroFeatured)}>{children}</div>
                                        : ({ children }: { children: React.ReactNode }) =>
                                            <Link href={`/news?slug=${heroFeatured.slug || heroFeatured.id}`} className="w-full md:flex-[1.8] order-1 md:order-2">{children}</Link>;
                                    return (
                                        <Wrapper>
                                            <div className="group relative overflow-hidden w-full aspect-[16/9] md:aspect-[587/390] rounded-sm">
                                                <SafeImage
                                                    src={getImageUrl(heroFeatured)}
                                                    alt={decodeHtmlEntities(heroFeatured.title.rendered)}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 60vw, 587px"
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                        </Wrapper>
                                    );
                                })()}
                            </div>

                            {/* Sidebar item */}
                            {heroSidebar && (() => {
                                const Wrapper = onItemClick
                                    ? ({ children }: { children: React.ReactNode }) =>
                                        <div className="cursor-pointer w-full lg:flex-1" onClick={() => onItemClick(heroSidebar)}>{children}</div>
                                    : ({ children }: { children: React.ReactNode }) =>
                                        <Link href={`/news?slug=${heroSidebar.slug || heroSidebar.id}`} className="w-full lg:flex-1">{children}</Link>;
                                return (
                                    <Wrapper>
                                        <div className="group flex flex-col items-start gap-2 sm:gap-3 lg:gap-[5px] w-full">
                                            {/* Sidebar thumbnail */}
                                            <div className="relative w-full aspect-[16/9] sm:aspect-[427/245] overflow-hidden rounded-sm">
                                                <SafeImage
                                                    src={getImageUrl(heroSidebar)}
                                                    alt={decodeHtmlEntities(heroSidebar.title.rendered)}
                                                    fill
                                                    sizes="(max-width: 1024px) 100vw, 427px"
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                            {/* Sidebar text */}
                                            <div className="flex flex-col items-start w-full gap-1 sm:gap-2 lg:gap-[5px]">
                                                <h3 className="text-base sm:text-lg lg:text-[17px] font-bold uppercase text-foreground leading-tight sm:leading-[26px] lg:leading-[33px] line-clamp-2 sm:line-clamp-3">
                                                    {decodeHtmlEntities(heroSidebar.title.rendered)}
                                                </h3>
                                                <ArticleInfo post={heroSidebar} />
                                            </div>
                                        </div>
                                    </Wrapper>
                                );
                            })()}
                        </div>
                    )}

                    {/* ── ROWS 2+ ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-[20px] w-full">
                        {gridItems.map((post) => (
                            <ArticleCard key={post.id} post={post} />
                        ))}
                    </div>
                </div>
            </div>

            {/* ── LOAD MORE ── */}
            {hasMore && (
                <button
                    onClick={onLoadMore}
                    disabled={loadingMore}
                    className="flex items-center justify-center disabled:opacity-50 border border-border rounded-full px-6 sm:px-8 py-2 sm:py-3 hover:border-accent hover:bg-surface-2 transition-all duration-300 my-6 sm:my-10 md:my-[70px] bg-transparent"
                >
                    <span className="text-sm sm:text-base lg:text-lg font-medium text-muted">
                        {loadingMore ? t("loading") : t("loadMore")}
                    </span>
                </button>
            )}
        </section>
    );
}