"use client";

import { useEffect, useMemo, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { WordPressPost } from "../../types/api";
import { NewsHeroShimmer } from "@/components/ui/shimmer/NewsShimmers";
import { SITE_CONFIG } from "@/constants/site-config";
import { fetchWordPressNewsBundleData, useWordPressCategories, useWordPressNewsBundle } from "@/hooks/useData";
import { decodeHtmlEntities, formatDate, getPostAuthor, parseToDate } from "@/utils/text";
import { AdBannerH, AdBannerH2 } from "../ui/AdBanner";
import { AdBanV2 } from "../ui/AdBannerV";
import { SafeImage } from "../ui/SafeImage";
import { mutate } from "swr";
import { clearPendingNewsCategoryId, getPendingNewsCategoryId } from "./newsClientState";
const NEWS_INITIAL_CATEGORY_COUNT = 20;
const NEWS_INITIAL_FILL_COUNT = 20;
const NEWS_INITIAL_LATEST_COUNT = 20;
const NEWS_BACKGROUND_CATEGORY_COUNT = 20;
const NEWS_BACKGROUND_FILL_COUNT = 20;
const NEWS_BACKGROUND_LATEST_COUNT = 40;

function normalizeImageUrl(url?: string) {
    if (!url) return "";
    return url.replace(/^http:\/\//i, "https://");
}

function getPostImage(post: WordPressPost | null | undefined) {
    if (!post) return "";
    return normalizeImageUrl(post.acan_image_url || post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || SITE_CONFIG.theme.placeholders.logo);
}

function sortByDateDesc(items: WordPressPost[]) {
    return [...items].sort((a, b) => {
        const ta = a?.date ? new Date(a.date).getTime() : 0;
        const tb = b?.date ? new Date(b.date).getTime() : 0;
        return tb - ta;
    });
}

function safeCategoryLabel(post: WordPressPost | null | undefined) {
  const raw = (getPostAuthor(post) || "").trim();
  if (!raw) return "News";
  if (raw.toLowerCase() === "uncategorized") return "News";
  return raw;
}

function formatDisplayTime(date?: string) {
    const parsed = parseToDate(date);
    if (!parsed) return "--:--";
    return parsed.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function MetaRow({ date, featured = false, compact = false }: { date?: string; featured?: boolean; compact?: boolean }) {
    const formatted = date ? formatDate(date) : formatDate(new Date());
    return (
        <div className={`inline-flex shrink-0 items-center gap-[10px] whitespace-nowrap ${featured ? "text-[#A4A4A4]" : compact ? "text-[#8E8E8E]" : "text-[var(--fig-text-secondary)]"}`}>
            <span className={featured ? "text-[14px] leading-none" : compact ? "text-[10px] leading-none" : "text-[12px] leading-none"}>{formatted}</span>
            <span className={`inline-block rounded-full ${featured ? "h-[5.86px] w-[5.86px] bg-[#A4A4A4]" : compact ? "h-[3.86px] w-[3.86px] bg-[#8E8E8E]" : "h-[4px] w-[4px] bg-[var(--fig-text-secondary)]/80"}`} />
            <span className={compact ? "text-[10px] leading-none" : "text-[12px] leading-none"}>{formatDisplayTime(date)}</span>
        </div>
    );
}

function CategoryPill({
    label = "News",
    tone = "var(--fig-tag-religion)",
    featured = false
}: {
    label?: string;
    tone?: string;
    featured?: boolean;
}) {
    return (
        <span
            className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border text-[8px] leading-[12px] ${featured ? "h-[21px] w-[72px] text-white" : "h-[15px] min-w-[46px] px-2 text-[var(--fig-text-secondary)]"}`}
            style={{ borderColor: tone }}
        >
            {label}
        </span>
    );
}

function getTitle(item: WordPressPost | null | undefined, fallback: string) {
    return decodeHtmlEntities(item?.title?.rendered || fallback || "");
}

function getHref(item: WordPressPost | null | undefined) {
    return item ? `/news/${item.slug || item.id}` : "#";
}

function takeUnique(pool: WordPressPost[], count: number, used: Set<number>) {
    const out: WordPressPost[] = [];
    for (const item of pool) {
        if (!item?.id || used.has(item.id)) continue;
        used.add(item.id);
        out.push(item);
        if (out.length >= count) break;
    }
    return out;
}

function mergeUniqueById(primary: WordPressPost[], secondary: WordPressPost[]) {
    const out: WordPressPost[] = [];
    const seen = new Set<number>();
    for (const item of [...primary, ...secondary]) {
        if (!item?.id || seen.has(item.id)) continue;
        seen.add(item.id);
        out.push(item);
    }
    return out;
}

type NewsPageSnapshot = {
    activeCategoryId: number;
    featured: WordPressPost | null;
    topRowMainItems: WordPressPost[];
    secondRowItems: WordPressPost[];
    moreStoriesHeroItems: WordPressPost[];
    moreStoriesListItems: WordPressPost[];
    mostPopularItems: WordPressPost[];
    communicationItems: WordPressPost[];
};

type NewsBundleData = {
    activeCategoryId: number;
    categoryArticles: WordPressPost[];
    allArticles: WordPressPost[];
    latestArticles: WordPressPost[];
};

function buildPriorityCategoryIds(activeCategoryId: number, validIds: number[], limit: number) {
    if (!validIds.length) return [activeCategoryId];
    const activeIndex = Math.max(0, validIds.indexOf(activeCategoryId));
    const ordered = [...validIds.slice(activeIndex), ...validIds.slice(0, activeIndex)];
    return ordered.slice(0, Math.max(1, limit));
}

function buildNewsPageSnapshot(activeCategoryId: number, activePool: WordPressPost[], allPool: WordPressPost[]): NewsPageSnapshot {
    const primaryPool = activePool.length ? activePool : allPool;
    const fallbackPool = allPool.filter((item) => !activePool.some((a) => a.id === item.id));
    const orderedPool = mergeUniqueById(primaryPool, fallbackPool);
    const used = new Set<number>();
    const featured =
        primaryPool.find((item) => Boolean(item?.id)) ||
        orderedPool.find((item) => Boolean(item?.id)) ||
        null;

    if (featured?.id) {
        used.add(featured.id);
    }

    return {
        activeCategoryId,
        featured,
        topRowMainItems: takeUnique(orderedPool, 2, used),
        secondRowItems: takeUnique(orderedPool, 3, used),
        moreStoriesHeroItems: takeUnique(orderedPool, 2, used),
        moreStoriesListItems: takeUnique(orderedPool, 6, used),
        mostPopularItems: takeUnique(orderedPool, 4, used),
        // Keep the same priority rule: active category first, then fallback.
        communicationItems: takeUnique(orderedPool, 4, used),
    };
}

export function NewsPageClient({
    initialCategories,
    initialBundle,
    initialCategoryId,
}: {
    initialCategories?: any[];
    initialBundle?: NewsBundleData;
    initialCategoryId?: number;
}) {
    const t = useTranslations("pages.news");
    const { data: wpCategories = [], isLoading: categoriesLoading } = useWordPressCategories(initialCategories);
    const validCategories = useMemo(
        () =>
            (wpCategories || []).filter(
                (cat: any) =>
                    Number(cat?.count || 0) > 0 &&
                    String(cat?.name || "").toLowerCase() !== "uncategorized" &&
                    String(cat?.slug || "").toLowerCase() !== "uncategorized"
            ),
        [wpCategories]
    );

    const defaultCategoryId = Number(validCategories[0]?.id || 0);
    const validIds = validCategories.map((c: any) => Number(c.id));
    const requestedCategory = Number(initialCategoryId || defaultCategoryId);
    const activeCategoryId = validIds.includes(requestedCategory) ? requestedCategory : requestedCategory || defaultCategoryId;
    const categoryCacheLimit = SITE_CONFIG.cacheLimit || 5;
    const prioritizedCategoryIds = useMemo(
        () => buildPriorityCategoryIds(activeCategoryId, validIds, categoryCacheLimit),
        [activeCategoryId, validIds, categoryCacheLimit]
    );
    const allCategoryIds = prioritizedCategoryIds.join(",");

    const {
        data: newsBundle,
        error: newsBundleError,
        isLoading: newsBundleLoading,
    } = useWordPressNewsBundle(activeCategoryId, allCategoryIds, {
        categoryCount: NEWS_INITIAL_CATEGORY_COUNT,
        allCount: NEWS_INITIAL_FILL_COUNT,
        latestCount: NEWS_INITIAL_LATEST_COUNT,
        latestPage: 1,
    }, initialBundle);

    const categoryArticles = newsBundle?.categoryArticles ?? [];
    const allArticles = newsBundle?.allArticles ?? [];
    const latestArticles = newsBundle?.latestArticles ?? [];
    const bundleMatchesActiveCategory = newsBundle?.activeCategoryId === activeCategoryId;
    const shouldForceCategoryShimmer = getPendingNewsCategoryId() === activeCategoryId && !bundleMatchesActiveCategory;

    useEffect(() => {
        if (!validIds.length || !newsBundle) return;

        const visibleKey = `wordpressNewsBundle:${activeCategoryId}:${allCategoryIds}:${NEWS_INITIAL_CATEGORY_COUNT}:${NEWS_INITIAL_FILL_COUNT}:${NEWS_INITIAL_LATEST_COUNT}:1`;
        const run = () =>
            mutate(
                visibleKey,
                fetchWordPressNewsBundleData(
                    activeCategoryId,
                    allCategoryIds,
                    NEWS_BACKGROUND_CATEGORY_COUNT,
                    NEWS_BACKGROUND_FILL_COUNT,
                    NEWS_BACKGROUND_LATEST_COUNT,
                    1
                ),
                { populateCache: true, revalidate: false }
            );

        if (typeof window !== "undefined" && "requestIdleCallback" in globalThis) {
            const idleId = globalThis.requestIdleCallback(() => {
                void run();
            });
            return () => globalThis.cancelIdleCallback(idleId);
        }

        const timeoutId = globalThis.setTimeout(() => {
            void run();
        }, 200);

        return () => globalThis.clearTimeout(timeoutId);
    }, [activeCategoryId, allCategoryIds, newsBundle, validIds]);

    useEffect(() => {
        if (initialBundle?.activeCategoryId === activeCategoryId || bundleMatchesActiveCategory) {
            clearPendingNewsCategoryId(activeCategoryId);
        }
    }, [activeCategoryId, bundleMatchesActiveCategory, initialBundle?.activeCategoryId]);

    const activePool = useMemo(() => sortByDateDesc(categoryArticles), [categoryArticles]);
    const allPool = useMemo(() => {
        const dedup = new Map<number, WordPressPost>();
        for (const item of [...allArticles, ...latestArticles]) {
            if (!item?.id || dedup.has(item.id)) continue;
            dedup.set(item.id, item);
        }
        return sortByDateDesc(Array.from(dedup.values()));
    }, [allArticles, latestArticles]);

    const isLoading = categoriesLoading || newsBundleLoading || !bundleMatchesActiveCategory;
    const hasError = Boolean(newsBundleError);

    const computedSnapshot = useMemo(
        () => buildNewsPageSnapshot(activeCategoryId, activePool, allPool),
        [activeCategoryId, activePool, allPool]
    );

    const snapshotRef = useRef<NewsPageSnapshot | null>(null);

    useEffect(() => {
        // Snapshot update only when we have a stable featured post.
        // This prevents brief "featured=null" phases during revalidation from blanking the page.
        if (!isLoading && computedSnapshot.featured?.id) {
            snapshotRef.current = computedSnapshot;
        }
    }, [isLoading, computedSnapshot]);

    const hasSnapshot = Boolean(snapshotRef.current);
    const usingSnapshot = hasSnapshot && isLoading && !shouldForceCategoryShimmer;
    const snapshot = shouldForceCategoryShimmer ? null : usingSnapshot ? snapshotRef.current : computedSnapshot;

    const featuredForView = snapshot?.featured || null;
    const activeCategoryIdForView = snapshot?.activeCategoryId ?? activeCategoryId;
    const topRowMainItemsForView = snapshot?.topRowMainItems ?? [];
    const secondRowItemsForView = snapshot?.secondRowItems ?? [];
    const moreStoriesHeroItemsForView = snapshot?.moreStoriesHeroItems ?? [];
    const moreStoriesListItemsForView = snapshot?.moreStoriesListItems ?? [];
    const mostPopularItemsForView = snapshot?.mostPopularItems ?? [];
    const communicationItemsForView = snapshot?.communicationItems ?? [];

    return (
        <div className="w-full ">
            <div className="mx-auto w-full max-w-[1280px] px-4 pb-8 pt-[16px] xl:px-0">

            {featuredForView ? (
                <>
                    {/* TOP STORIES */}
                    <section className="mt-[24px]">
                        <div className="grid gap-[20px] xl:grid-cols-[566px_694px]">
                            <Link href={`/news/${featuredForView.slug || featuredForView.id}?cat=${activeCategoryIdForView}`} className="group block rounded-[10px] hover-lift-primary">
                                <div className="relative h-[462px] overflow-hidden rounded-[10px]">
                                    <SafeImage
                                        src={getPostImage(featuredForView)}
                                        alt={decodeHtmlEntities(featuredForView.title?.rendered || "")}
                                        className="h-full w-full object-cover"
                                        width={566}
                                        height={462}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
                                    <div className="absolute bottom-[30px] left-[23px] right-[23px]">
                                        <h2 className="fig-h10 line-clamp-3 text-[var(--primary-text-light)]">{getTitle(featuredForView, "")}</h2>
                                        <div className="mt-[30px] flex items-center justify-between gap-3">
                                            <MetaRow date={featuredForView.date} featured />
                                            <CategoryPill tone="#059cf4" label={safeCategoryLabel(featuredForView)} featured />
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            <div className="grid gap-[15px] grid-cols-2 sm:grid-cols-2">
                                {topRowMainItemsForView.map((item: WordPressPost, idx: number) => (
                                    <Link key={`${item?.id || "top"}-${idx}`} href={item ? `/news/${item.slug || item.id}?cat=${activeCategoryIdForView}` : "#"} className="block rounded-[10px] hover-lift-primary">
                                        <div className="flex flex-col justify-between">
                                        <div className="h-[120px] md:h-[292px] overflow-hidden rounded-[10px]">
                                            <SafeImage
                                                src={getPostImage(item)}
                                                alt={getTitle(item, "")}
                                                className="h-full w-full object-cover"
                                                width={339}
                                                height={292}
                                            />
                                        </div>
                                        <div className="px-1 md:px-2 flex flex-col justify-between">
                                        <h3 className="text-[13px] md:fig-h10 mt-2 line-clamp-2 text-[var(--fig-text-primary)] leading-tight">{getTitle(item, "")}</h3>
                                        <div className="mt-2 flex items-center justify-between gap-1 md:gap-3">
                                                <MetaRow date={item?.date} compact />
                                                <CategoryPill label={safeCategoryLabel(item)} />
                                            </div>
                                        </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                        </div>

                        <div className="mt-[25px] grid gap-[15px] grid-cols-2 sm:grid-cols-2 xl:grid-cols-3">
                            {secondRowItemsForView.map((item: WordPressPost, idx: number) => (
                                <Link key={`${item?.id || "row"}-${idx}`} href={item ? `/news/${item.slug || item.id}?cat=${activeCategoryIdForView}` : "#"} className="block rounded-[10px] hover-lift-primary">
                                    <div className="h-[120px] md:h-[230px] overflow-hidden rounded-[10px]">
                                        <SafeImage
                                            src={getPostImage(item)}
                                            alt={getTitle(item, "")}
                                            className="h-full w-full object-cover"
                                            width={400}
                                            height={230}
                                        />
                                    </div>
                                    <div className="px-1 md:px-2 pb-2 justify-between">
                                    <h3 className="text-[13px] md:fig-h10 mt-2 line-clamp-2 text-[var(--fig-text-primary)] leading-tight">{getTitle(item, "")}</h3>
                                    <div className="mt-2 flex items-center justify-between gap-1 md:gap-3">
                                        <MetaRow date={item?.date} compact />
                                        <CategoryPill label={safeCategoryLabel(item)} />
                                    </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                    </section>

                    <div className="mt-[43px]">
                        <AdBannerH2 className="mx-auto max-w-[1280px]" />
                    </div>

                    {/* MORE STORIES */}
                    <section className="mt-[50px]">
                        <div className="grid items-center gap-[26px] xl:grid-cols-[789px_465px]">
                            <div>
                                <div className="flex flex-col gap-[1px]">
                                    <h2 className="fig-h9 uppercase text-[var(--fig-text-primary)]">{t("moreStories")}</h2>
                                    <div className="h-0 border-t [border-color:#9A74B7]/60" />
                                </div>
                                <div className="mt-[19px] grid gap-[19px] grid-cols-1 md:grid-cols-2">
                                    {moreStoriesHeroItemsForView.map((heroItem: WordPressPost, col: number) => (
                                        <div key={col} className="flex h-auto md:h-[757px] flex-col gap-[17px]">
                                            <Link href={heroItem ? `/news/${heroItem.slug || heroItem.id}?cat=${activeCategoryIdForView}` : "#"} className="block rounded-[10px] hover-lift-primary">
                                                <article className="h-auto md:h-[340px]">
                                                    <div className="h-[200px] md:h-[225px] w-full overflow-hidden rounded-[10px]">
                                                        <SafeImage
                                                            src={getPostImage(heroItem || null)}
                                                            alt={getTitle(heroItem || null, "")}
                                                            className="h-full w-full object-cover"
                                                            width={380}
                                                            height={235}
                                                        />
                                                    </div>
                                                    <div className="mt-[10px] px-2 md:mx-auto md:w-[345px]">
                                                        <h3 className="text-[16px] md:fig-h10 line-clamp-2 text-[var(--fig-text-primary)]">{getTitle(heroItem || null, "")}</h3>
                                                        <div className="mt-3 md:mt-[15px] flex items-center justify-between gap-3">
                                                            <MetaRow date={heroItem?.date} compact />
                                                            <CategoryPill label={safeCategoryLabel(heroItem || null)} />
                                                        </div>
                                                    </div>
                                                </article>
                                            </Link>

                                            <div className="no-scrollbar flex-1 space-y-[17px] overflow-visible md:overflow-y-auto pr-1">
                                            {moreStoriesListItemsForView.slice(col * 3, col * 3 + 3).map((item: WordPressPost, idx: number) => (
                                                <Link key={`${item?.id || "more"}-${col}-${idx}`} href={item ? `/news/${item.slug || item.id}?cat=${activeCategoryIdForView}` : "#"} className="block md:ml-2 h-auto md:h-[120px] rounded-[10px] px-1 md:px-[3px] py-[5px] hover-lift-primary border border-[var(--fig-border-soft)] md:border-none">
                                                    <div className="flex items-center md:items-end gap-3 md:gap-2">
                                                        <div className="h-[80px] w-[80px] md:h-[107px] md:w-[103px] overflow-hidden rounded-[10px] shrink-0">
                                                            <SafeImage
                                                                src={getPostImage(item)}
                                                                alt={getTitle(item, "")}
                                                                className="h-full w-full object-cover"
                                                                width={103}
                                                                height={107}
                                                            />
                                                        </div>
                                                        <div className="flex flex-col gap-2 md:gap-[15px] flex-1">
                                                            <h4 className="line-clamp-2 text-[13px] md:text-[14px] leading-tight md:leading-[21px] text-[var(--fig-text-primary)] font-medium">
                                                                {getTitle(item, "")}
                                                            </h4>
                                                            <div className="flex items-center justify-between gap-3">
                                                                <MetaRow date={item?.date} compact />
                                                                <CategoryPill label={safeCategoryLabel(item)} />
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
                                <h2 className="fig-h9 uppercase text-[var(--fig-text-primary)]">{t("mostPopular")}</h2>
                            <div className="h-0 border-t [border-color:#9A74B7]/60" />
                        </div>
                        <div className="no-scrollbar  pt-5 pl-2 flex snap-x snap-mandatory gap-[20px] overflow-x-auto pb-2 ">
                            {mostPopularItemsForView.map((item: WordPressPost, idx: number) => (
                                <Link key={`${item?.id || "popular"}-${idx}`} href={item ? `/news/${item.slug || item.id}?cat=${activeCategoryIdForView}` : "#"} className="hover-lift-primary  flex w-[356px] shrink-0 snap-start flex-col items-center gap-[25px] rounded-[10px] ">
                                    <div className="h-[200px] w-[356px]  overflow-hidden rounded-[10px]">
                                        <SafeImage
                                            src={getPostImage(item)}
                                            alt={getTitle(item, "")}
                                            className="h-full w-full object-cover"
                                            width={356}
                                            height={200}
                                        />
                                    </div>
                                    <div className="w-[345px] px-2 pb-2 justify-between">
                                        <h3 className="fig-h10 line-clamp-2 text-[var(--fig-text-primary)]">{getTitle(item, "")}</h3>
                                        <div className="mt-[15px] flex items-center justify-between gap-3">
                                            <MetaRow date={item?.date} compact />
                                            <CategoryPill label={safeCategoryLabel(item)} />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* COMMUNICATION ANNOUNCEMENT */}
                    <section className="mt-[90px] flex flex-col gap-[48px]">
                        <div className="flex flex-col gap-[1px]">
                            <h2 className="fig-h9 uppercase text-[var(--fig-text-primary)]">{t("communicationAnnouncement")}</h2>
                            <div className="h-0 border-t [border-color:#9A74B7]/60" />
                        </div>
                        <div className="no-scrollbar flex snap-x snap-mandatory gap-[20px] overflow-x-auto pb-2">
                            {communicationItemsForView.map((item: WordPressPost, idx: number) => (
                                <article key={`${item?.id || "com"}-${idx}`} className="flex h-[218px] hover-lift-primary mt-2 ml-2 w-[366px] shrink-0 snap-start flex-col justify-center rounded-[5px] bg-surface p-[7px]">
                                    <Link href={item ? `/news/${item.slug || item.id}?cat=${activeCategoryIdForView}` : "#"} className="mx-auto flex h-[174px] w-[345px] flex-col gap-[15px] rounded-[5px] ">
                                        <h2 className="line-clamp-2 text-bold text-unpacase  fig-h11 text-[16px] leading-[24px] ">
                                            {getTitle(item, "")}
                                        </h2>
                                        <div className="mt-auto flex items-center justify-between gap-3">
                                            <MetaRow date={item?.date} compact />
                                            <CategoryPill label={safeCategoryLabel(item)} tone="var(--fig-tag-religion)" />
                                        </div>
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </section>
                </>
            ) : (
                <div className="mt-10">
                    {/* Don't show an empty state while revalidating cached data (prevents “arrive vide”). */}
                    {(isLoading || hasError || !validCategories.length || shouldForceCategoryShimmer) ? <NewsHeroShimmer /> : <div className="mt-10 text-center text-[var(--fig-text-secondary)]">{t("noRecentArticles")}</div>}
                </div>
            )}
        </div>
        </div>
    );
}
