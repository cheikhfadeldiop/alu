"use client";

import { useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { WordPressPost } from "../../types/api";
import { NewsHeroShimmer } from "@/components/ui/shimmer/NewsShimmers";
import { SITE_CONFIG } from "@/constants/site-config";
import { useWordPressNews } from "@/hooks/useData";
import { decodeHtmlEntities } from "@/utils/text";
import { AdBannerH } from "../ui/AdBanner";
import { AdBanV2 } from "../ui/AdBannerV";

const figmaNewsAssets = {
    featured: "https://www.figma.com/api/mcp/asset/4ea31ee3-0ad0-4876-a993-9086489f4e88",
    top2a: "https://www.figma.com/api/mcp/asset/4cc5309d-7e07-4d44-a7f3-7fc163b80924",
    top2b: "https://www.figma.com/api/mcp/asset/3b7fdf3b-97cb-4c85-869c-495e2bcf952e",
    row2a: "https://www.figma.com/api/mcp/asset/97a73237-6261-4e57-8e8d-c4ba737f7d74",
    row2b: "https://www.figma.com/api/mcp/asset/48fa15e1-67a3-4fd7-bfb6-b11ad67613f9",
    row2c: "https://www.figma.com/api/mcp/asset/5c2ad2f9-f9c8-4415-bc7f-ae5a6e3e54b0",
    more1: "https://www.figma.com/api/mcp/asset/5cd6bbdc-3339-4ec5-9a8f-5f1cc60b8f12",
    more2: "https://www.figma.com/api/mcp/asset/baf9a76f-7707-450e-b17f-94bf8ec909e4",
    most1: "https://www.figma.com/api/mcp/asset/43f6a2df-53e7-464e-9ae3-6c183f67e2aa",
    most2: "https://www.figma.com/api/mcp/asset/b4ee0912-b1c2-47af-ab99-5ef4a5465eb6",
    most3: "https://www.figma.com/api/mcp/asset/0456ad17-505c-42e8-97ba-3d2734d53f4d",
    most4: "https://www.figma.com/api/mcp/asset/c3b9cc3a-e31f-4f6d-adf8-1450e0c458fd",
    comm1: "https://www.figma.com/api/mcp/asset/82d805c2-617f-4b20-8331-5446c95a31ed",
};

const figmaFallbackTitles = [
    "Sabon Shugaban Karamar Hukumar Kebbe Alh. Musa Garba Kuci Ya Lashe Takobin Kawo",
    "Sabon Shugaban Karamar Hukumar Kebbe Alh. Musa Garba Kuci Ya Lashe Takobin Kawo",
    "Sabon Shugaban Karamar Hukumar Kebbe Alh. Musa Garba Kuci Ya Lashe Takobin Kawo",
    "Sabon Shugaban Karamar Hukumar Kebbe Alh. Musa Garba Kuci Ya Lashe Takobin Kawo",
];

function figmaFirstSrc(figma: string, api?: string) {
    return { primary: figma, fallback: api || SITE_CONFIG.theme.placeholders.news };
}

function FigmaImage({
    figmaSrc,
    fallbackSrc,
    alt,
    className
}: {
    figmaSrc: string;
    fallbackSrc?: string;
    alt: string;
    className: string;
}) {
    return (
        <img
            src={figmaSrc}
            alt={alt}
            className={className}
            onError={(e) => {
                const target = e.currentTarget;
                if (fallbackSrc && target.src !== fallbackSrc) target.src = fallbackSrc;
            }}
        />
    );
}

function MetaRow({ date, featured = false, compact = false }: { date?: string; featured?: boolean; compact?: boolean }) {
    const formatted = date
        ? new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
        : "15 juin 2024";
    return (
        <div className={`mt-2 flex items-center gap-[10px] ${featured ? "text-[#A4A4A4]" : compact ? "text-[#8E8E8E]" : "text-[var(--fig-text-secondary)]"}`}>
            <span className={featured ? "text-[14px] leading-[21px]" : compact ? "text-[10px] leading-[15px]" : "text-[12px] leading-[18px]"}>{formatted}</span>
            <span className={`inline-block rounded-full ${featured ? "h-[5.86px] w-[5.86px] bg-[#A4A4A4]" : compact ? "h-[3.86px] w-[3.86px] bg-[#8E8E8E]" : "h-[4px] w-[4px] bg-[var(--fig-text-secondary)]/80"}`} />
            <span className={compact ? "text-[10px] leading-[15px]" : "text-[12px] leading-[18px]"}>15:47</span>
        </div>
    );
}

function CategoryPill({
    label = "Religion",
    tone = "var(--fig-tag-religion)",
    featured = false
}: {
    label?: string;
    tone?: string;
    featured?: boolean;
}) {
    return (
        <span
            className={`inline-flex items-center justify-center rounded-full border text-[8px] leading-[12px] ${featured ? "h-[21px] w-[52px] text-white" : "h-[15px] min-w-[46px] px-2 text-[var(--fig-text-secondary)]"}`}
            style={{ borderColor: tone }}
        >
            {label}
        </span>
    );
}

function getTitle(item: WordPressPost | null | undefined, fallback: string) {
    return decodeHtmlEntities(item?.title?.rendered || fallback);
}

function getHref(item: WordPressPost | null | undefined) {
    return item ? `/news/${item.slug || item.id}` : "#";
}

function fillSlots(pool: WordPressPost[], size: number) {
    if (!pool.length) return Array.from({ length: size }, () => null as WordPressPost | null);
    return Array.from({ length: size }, (_, index) => pool[index % pool.length] || null);
}

export function NewsPageClient() {
    const activeCategoryId = SITE_CONFIG.categories.news.alaune;

    const { data: articles = [], isLoading } = useWordPressNews(activeCategoryId, 20);

    const featured = useMemo<WordPressPost | null>(() => {
        return articles[0] || null;
    }, [articles]);

    const pool = useMemo(() => {
        if (!featured) return [];
        return articles.filter((item) => item.id !== featured.id);
    }, [articles, featured]);

    const topRowMain = useMemo(() => {
        return fillSlots(pool, 2);
    }, [pool]);

    const secondRow = useMemo(() => {
        return fillSlots(pool.slice(2), 3);
    }, [pool]);

    const moreStoriesHero = useMemo(() => {
        return fillSlots(pool.slice(5), 2);
    }, [pool]);

    const moreStoriesList = useMemo(() => {
        return fillSlots(pool.slice(7), 6);
    }, [pool]);

    const mostPopular = useMemo(() => {
        return fillSlots(pool.slice(13), 4);
    }, [pool]);

    const communication = useMemo(() => {
        return fillSlots(pool.slice(17), 4);
    }, [pool]);

    return (
        <div className="w-full bg-[var(--fig-bg)]">
            <div className="mx-auto w-full max-w-[1280px] px-4 pb-8 pt-[16px] xl:px-0">

            {(isLoading || !featured) ? (
                <div className="mt-10">
                    <NewsHeroShimmer />
                </div>
            ) : (
                <>
                    {/* TOP STORIES */}
                    <section className="mt-[24px]">
                        <div className="grid gap-[20px] xl:grid-cols-[566px_694px]">
                            <Link href={`/news/${featured.slug || featured.id}`} className="group">
                                <div className="relative h-[462px] overflow-hidden rounded-[10px]">
                                    <FigmaImage
                                        figmaSrc={figmaFirstSrc(figmaNewsAssets.featured, featured.acan_image_url).primary}
                                        fallbackSrc={figmaFirstSrc(figmaNewsAssets.featured, featured.acan_image_url).fallback}
                                        alt={decodeHtmlEntities(featured.title?.rendered || "")}
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
                                    <div className="absolute bottom-[30px] left-[23px] right-[23px]">
                                        <h2 className="fig-h10 line-clamp-3 text-[var(--primary-text-light)]">{getTitle(featured, figmaFallbackTitles[0])}</h2>
                                        <div className="mt-[30px] flex items-center justify-between">
                                            <MetaRow date={featured.date} featured />
                                            <CategoryPill tone="#059cf4" label="Economy" featured />
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            <div className="grid gap-[17px] sm:grid-cols-2">
                                {topRowMain.map((item, idx) => (
                                    <Link key={`${item?.id || "top"}-${idx}`} href={getHref(item)} className="block">
                                        <div className="h-[292px] overflow-hidden rounded-[10px]">
                                            <FigmaImage
                                                figmaSrc={idx === 0 ? figmaNewsAssets.top2a : figmaNewsAssets.top2b}
                                                fallbackSrc={item?.acan_image_url || SITE_CONFIG.theme.placeholders.news}
                                                alt={getTitle(item, figmaFallbackTitles[idx] || figmaFallbackTitles[0])}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <h3 className="fig-h10 mt-2 line-clamp-2 text-[var(--fig-text-primary)]">{getTitle(item, figmaFallbackTitles[idx] || figmaFallbackTitles[0])}</h3>
                                        <div className="mt-2 flex items-center justify-between">
                                            <MetaRow date={item?.date} />
                                            <CategoryPill />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="mt-[25px] grid gap-[25px] sm:grid-cols-2 xl:grid-cols-3">
                            {secondRow.map((item, idx) => (
                                <Link key={`${item?.id || "row"}-${idx}`} href={getHref(item)} className="block">
                                    <div className="h-[230px] overflow-hidden rounded-[10px]">
                                        <FigmaImage
                                            figmaSrc={idx === 0 ? figmaNewsAssets.row2a : idx === 1 ? figmaNewsAssets.row2b : figmaNewsAssets.row2c}
                                            fallbackSrc={item?.acan_image_url || SITE_CONFIG.theme.placeholders.news}
                                            alt={getTitle(item, figmaFallbackTitles[idx] || figmaFallbackTitles[0])}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <h3 className="fig-h10 mt-2 line-clamp-2 text-[var(--fig-text-primary)]">{getTitle(item, figmaFallbackTitles[idx] || figmaFallbackTitles[0])}</h3>
                                    <div className="mt-2 flex items-center justify-between">
                                        <MetaRow date={item?.date} />
                                        <CategoryPill tone={idx % 2 === 0 ? "var(--fig-tag-religion)" : "var(--fig-tag-sport)"} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    <div className="mt-[43px]">
                        <AdBannerH className="mx-auto max-w-[1280px]" />
                    </div>

                    {/* MORE STORIES */}
                    <section className="mt-[50px]">
                        <div className="grid items-center gap-[26px] xl:grid-cols-[789px_465px]">
                            <div>
                                <div className="flex flex-col gap-[1px]">
                                    <h2 className="fig-h9 uppercase text-[var(--fig-text-primary)]">More stories</h2>
                                    <div className="h-0 border-t [border-color:#9A74B7]/60" />
                                </div>
                                <div className="mt-[19px] grid gap-[19px] md:grid-cols-2">
                                    {[0, 1].map((col) => (
                                        <div key={col} className="flex h-[757px] flex-col gap-[17px]">
                                            <Link href={getHref(moreStoriesHero[col])}>
                                                <article className="h-[340px]">
                                                    <div className="h-[235px] w-full overflow-hidden rounded-[10px]">
                                                        <FigmaImage
                                                            figmaSrc={col === 0 ? figmaNewsAssets.more1 : figmaNewsAssets.more2}
                                                            fallbackSrc={moreStoriesHero[col]?.acan_image_url || SITE_CONFIG.theme.placeholders.news}
                                                            alt={getTitle(moreStoriesHero[col], figmaFallbackTitles[col] || figmaFallbackTitles[0])}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="mx-auto mt-[13px] w-[345px]">
                                                        <h3 className="fig-h10 line-clamp-2 text-[var(--fig-text-primary)]">{getTitle(moreStoriesHero[col], figmaFallbackTitles[col] || figmaFallbackTitles[0])}</h3>
                                                        <div className="mt-[15px] flex items-center justify-between">
                                                            <MetaRow date={moreStoriesHero[col]?.date} compact />
                                                            <CategoryPill />
                                                        </div>
                                                    </div>
                                                </article>
                                            </Link>

                                            <div className="no-scrollbar flex-1 space-y-[17px] overflow-y-auto pr-1">
                                            {moreStoriesList.slice(col * 3, col * 3 + 3).map((item, idx) => (
                                                <Link key={`${item?.id || "more"}-${col}-${idx}`} href={getHref(item)} className="block h-[120px] rounded-[10px] bg-white px-[3px] py-[5px] pl-[5px]">
                                                    <div className="flex h-[107px] items-end gap-2">
                                                        <div className="h-[107px] w-[103px] overflow-hidden rounded-[10px]">
                                                            <FigmaImage
                                                                figmaSrc={figmaNewsAssets.more1}
                                                                fallbackSrc={item?.acan_image_url || SITE_CONFIG.theme.placeholders.news}
                                                                alt={getTitle(item, figmaFallbackTitles[(col * 3 + idx) % figmaFallbackTitles.length])}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex h-[92px] w-[256px] flex-col gap-[15px]">
                                                            <h4 className="line-clamp-2 text-[14px] leading-[21px] text-[var(--fig-text-primary)]">
                                                                {getTitle(item, figmaFallbackTitles[(col * 3 + idx) % figmaFallbackTitles.length])}
                                                            </h4>
                                                            <div className="flex items-center justify-between">
                                                                <MetaRow date={item?.date} compact />
                                                                <CategoryPill tone={idx % 3 === 0 ? "#059CF4" : idx % 3 === 1 ? "#F48805" : "#F4DC05"} label={idx % 3 === 0 ? "Economy" : idx % 3 === 1 ? "Culture" : "Sports"} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="h-[824px] w-full overflow-hidden rounded-[10px] xl:w-[465px]">
                                <AdBanV2 />
                            </div>
                        </div>
                    </section>

                    {/* SIMILAR CONTENT */}
                    <section className="mt-[58px] flex flex-col gap-[41px]">
                        <div className="flex flex-col gap-[1px]">
                            <h2 className="fig-h9 uppercase text-[var(--fig-text-primary)]">Most popular</h2>
                            <div className="h-0 border-t [border-color:#9A74B7]/60" />
                        </div>
                        <div className="no-scrollbar flex snap-x snap-mandatory gap-[20px] overflow-x-auto pb-2">
                            {mostPopular.map((item, idx) => (
                                <Link key={`${item?.id || "popular"}-${idx}`} href={getHref(item)} className="flex w-[356px] shrink-0 snap-start flex-col items-center gap-[25px]">
                                    <div className="h-[200px] w-[356px] overflow-hidden rounded-[10px]">
                                        <FigmaImage
                                            figmaSrc={[figmaNewsAssets.most1, figmaNewsAssets.most2, figmaNewsAssets.most3, figmaNewsAssets.most4][idx] || figmaNewsAssets.most1}
                                            fallbackSrc={item?.acan_image_url || SITE_CONFIG.theme.placeholders.news}
                                            alt={getTitle(item, figmaFallbackTitles[idx % figmaFallbackTitles.length])}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="w-[345px]">
                                        <h3 className="fig-h10 line-clamp-2 text-[var(--fig-text-primary)]">{getTitle(item, figmaFallbackTitles[idx % figmaFallbackTitles.length])}</h3>
                                        <div className="mt-[15px] flex items-center justify-between">
                                            <MetaRow date={item?.date} compact />
                                            <CategoryPill />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* COMMUNICATION ANNOUNCEMENT */}
                    <section className="mt-[90px] flex flex-col gap-[48px]">
                        <div className="flex flex-col gap-[1px]">
                            <h2 className="fig-h9 uppercase text-[var(--fig-text-primary)]">Communication and announcement</h2>
                            <div className="h-0 border-t [border-color:#9A74B7]/60" />
                        </div>
                        <div className="no-scrollbar flex snap-x snap-mandatory gap-[20px] overflow-x-auto pb-2">
                            {communication.map((item, idx) => (
                                <article key={`${item?.id || "com"}-${idx}`} className="flex h-[218px] w-[366px] shrink-0 snap-start flex-col justify-center rounded-[5px] bg-white p-[7px]">
                                    <Link href={getHref(item)} className="mx-auto flex h-[174px] w-[345px] flex-col gap-[15px]">
                                        <h3 className="line-clamp-4 text-[16px] leading-[24px] text-[var(--fig-text-primary)]">
                                            {getTitle(item, figmaFallbackTitles[idx % figmaFallbackTitles.length])}
                                        </h3>
                                        <div className="mt-auto flex items-center justify-between">
                                            <MetaRow date={item?.date} compact />
                                            <CategoryPill label="Religion" tone="var(--fig-tag-religion)" />
                                        </div>
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </section>
                </>
            )}
        </div>
        </div>
    );
}