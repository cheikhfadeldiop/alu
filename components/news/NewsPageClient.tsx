"use client";

import { useEffect, useMemo, useRef } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { WordPressPost } from "../../types/api";
import { NewsHeroShimmer } from "@/components/ui/shimmer/NewsShimmers";
import { SITE_CONFIG } from "@/constants/site-config";
import { useWordPressCategories, useWordPressLatestNews, useWordPressNews } from "@/hooks/useData";
import { decodeHtmlEntities, formatDate, getPostAuthor, parseToDate } from "@/utils/text";
import { AdBannerH, AdBannerH2 } from "../ui/AdBanner";
import { AdBanV2 } from "../ui/AdBannerV";
import { SafeImage } from "../ui/SafeImage";
const TWO_YEARS_MS = 1000 * 60 * 60 * 24 * 365 * 2;

function normalizeImageUrl(url?: string) {
    if (!url) return "";
    return url.replace(/^http:\/\//i, "https://");
}

function getPostImage(post: WordPressPost | null | undefined) {
    if (!post) return "";
    return normalizeImageUrl(post.acan_image_url || post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || SITE_CONFIG.theme.placeholders.logo);
}

function isRecentPost(post: WordPressPost | null | undefined) {
  // If WP doesn't provide `date`, don't exclude the post (prevents “empty page” glitches).
  if (!post?.date) return true;
  const t = new Date(post.date).getTime();
  if (!Number.isFinite(t)) return false;
  return Date.now() - t <= TWO_YEARS_MS;
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
        <div className={`mt-2 flex items-center gap-[10px] ${featured ? "text-[#A4A4A4]" : compact ? "text-[#8E8E8E]" : "text-[var(--fig-text-secondary)]"}`}>
            <span className={featured ? "text-[14px] leading-[21px]" : compact ? "text-[10px] leading-[15px]" : "text-[12px] leading-[18px]"}>{formatted}</span>
            <span className={`inline-block rounded-full ${featured ? "h-[5.86px] w-[5.86px] bg-[#A4A4A4]" : compact ? "h-[3.86px] w-[3.86px] bg-[#8E8E8E]" : "h-[4px] w-[4px] bg-[var(--fig-text-secondary)]/80"}`} />
            <span className={compact ? "text-[10px] leading-[15px]" : "text-[12px] leading-[18px]"}>{formatDisplayTime(date)}</span>
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
            className={`inline-flex items-center justify-center rounded-full border text-[8px] leading-[12px] ${featured ? "h-[21px] w-[72px] text-white" : "h-[15px] min-w-[46px] px-2 text-[var(--fig-text-secondary)]"}`}
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

export function NewsPageClient() {
    const t = useTranslations("pages.news");
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: wpCategories = [] } = useWordPressCategories();
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

    const defaultCategoryId = Number(validCategories[0]?.id || SITE_CONFIG.categories.news.alaune);
    const rawCat = searchParams.get("cat");
    const requestedCategory = rawCat && !Number.isNaN(Number(rawCat)) ? Number(rawCat) : defaultCategoryId;
    const validIds = validCategories.map((c: any) => Number(c.id));
    const activeCategoryId = validIds.includes(requestedCategory) ? requestedCategory : defaultCategoryId;
    const allCategoryIds = validIds.length ? validIds.join(",") : String(activeCategoryId);

    const { data: categoryArticles = [], error: categoryError, isLoading: categoryLoading } = useWordPressNews(activeCategoryId, 80);
    const { data: allArticles = [], error: allError, isLoading: allLoading } = useWordPressNews(allCategoryIds, 100);
    const { data: latestArticles = [], error: latestError, isLoading: latestLoading } = useWordPressLatestNews(100, 1);

    useEffect(() => {
        if (!validIds.length) return;
        // Only redirect when an explicit (and invalid) category is provided.
        // Avoid redirect loops when there is no query param (improves responsiveness).
        if (rawCat && !validIds.includes(Number(rawCat))) {
            router.replace(`/news?cat=${validIds[0]}`);
        }
    }, [rawCat, router, validIds]);

    const activeRecent = useMemo(
        () =>
            categoryArticles
                .filter((item) => isRecentPost(item))
                .sort((a, b) => new Date(b?.date || 0).getTime() - new Date(a?.date || 0).getTime()),
        [categoryArticles]
    );
    const allRecent = useMemo(() => {
        const dedup = new Map<number, WordPressPost>();
        for (const item of [...allArticles, ...latestArticles]) {
            if (!item?.id || dedup.has(item.id)) continue;
            dedup.set(item.id, item);
        }
        return Array.from(dedup.values())
            .filter((item) => isRecentPost(item))
            .sort((a, b) => new Date(b?.date || 0).getTime() - new Date(a?.date || 0).getTime());
    }, [allArticles, latestArticles]);

    const primaryPool = activeRecent.length ? activeRecent : allRecent;
    const fallbackPool = allRecent.filter((item) => !activeRecent.some((a) => a.id === item.id));
    const orderedPool = mergeUniqueById(primaryPool, fallbackPool);
    const used = useMemo(() => new Set<number>(), [activeCategoryId, primaryPool.length]);
    const featured = orderedPool[0] || null;
    if (featured?.id) used.add(featured.id);
    const topRowMainItems = takeUnique(orderedPool, 2, used);
    const secondRowItems = takeUnique(orderedPool, 3, used);
    const moreStoriesHeroItems = takeUnique(orderedPool, 2, used);
    const moreStoriesListItems = takeUnique(orderedPool, 6, used);
    const mostPopularItems = takeUnique(orderedPool, 4, used);
    const communicationItems = takeUnique(allRecent, 4, used);
    const isLoading = categoryLoading || allLoading || latestLoading;
    const hasError = Boolean(categoryError || allError || latestError);

    type Snapshot = {
        activeCategoryId: number;
        featured: WordPressPost | null;
        topRowMainItems: WordPressPost[];
        secondRowItems: WordPressPost[];
        moreStoriesHeroItems: WordPressPost[];
        moreStoriesListItems: WordPressPost[];
        mostPopularItems: WordPressPost[];
        communicationItems: WordPressPost[];
    };

    const computedSnapshot = useMemo<Snapshot>(
        () => ({
            activeCategoryId,
            featured,
            topRowMainItems,
            secondRowItems,
            moreStoriesHeroItems,
            moreStoriesListItems,
            mostPopularItems,
            communicationItems,
        }),
        [
            activeCategoryId,
            featured,
            topRowMainItems,
            secondRowItems,
            moreStoriesHeroItems,
            moreStoriesListItems,
            mostPopularItems,
            communicationItems,
        ]
    );

    const snapshotRef = useRef<Snapshot | null>(null);

    useEffect(() => {
        // Snapshot update only when we have a stable featured post.
        // This prevents brief "featured=null" phases during revalidation from blanking the page.
        if (!isLoading && computedSnapshot.featured?.id) {
            snapshotRef.current = computedSnapshot;
        }
    }, [isLoading, computedSnapshot]);

    const hasSnapshot = Boolean(snapshotRef.current);
    const usingSnapshot = hasSnapshot && isLoading;
    const snapshot = usingSnapshot ? snapshotRef.current : computedSnapshot;

    const featuredForView = snapshot?.featured || null;
    const activeCategoryIdForView = snapshot?.activeCategoryId ?? activeCategoryId;
    const topRowMainItemsForView = snapshot?.topRowMainItems ?? topRowMainItems;
    const secondRowItemsForView = snapshot?.secondRowItems ?? secondRowItems;
    const moreStoriesHeroItemsForView = snapshot?.moreStoriesHeroItems ?? moreStoriesHeroItems;
    const moreStoriesListItemsForView = snapshot?.moreStoriesListItems ?? moreStoriesListItems;
    const mostPopularItemsForView = snapshot?.mostPopularItems ?? mostPopularItems;
    const communicationItemsForView = snapshot?.communicationItems ?? communicationItems;

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
                                        <div className="mt-[30px] flex items-center justify-between">
                                            <MetaRow date={featuredForView.date} featured />
                                            <CategoryPill tone="#059cf4" label={safeCategoryLabel(featuredForView)} featured />
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            <div className="grid gap-[17px]  sm:grid-cols-2">
                                {topRowMainItemsForView.map((item, idx) => (
                                    <Link key={`${item?.id || "top"}-${idx}`} href={item ? `/news/${item.slug || item.id}?cat=${activeCategoryIdForView}` : "#"} className="block rounded-[10px] hover-lift-primary">
                                        <div className="flex flex-col justify-between">
                                        <div className="h-[292px] overflow-hidden rounded-[10px]">
                                            <SafeImage
                                                src={getPostImage(item)}
                                                alt={getTitle(item, "")}
                                                className="h-full w-full object-cover"
                                                width={339}
                                                height={292}
                                            />
                                        </div>
                                        <div className="px-2 flex flex-col justify-between">
                                        <h3 className="fig-h10 mt-2  line-clamp-2 text-[var(--fig-text-primary)]">{getTitle(item, "")}</h3>
                                        <div className="mt-2 flex items-center justify-between">
                                                <MetaRow date={item?.date} />
                                                <CategoryPill label={safeCategoryLabel(item)} />
                                            </div>
                                        </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="mt-[25px] grid gap-[25px] sm:grid-cols-2 xl:grid-cols-3">
                            {secondRowItemsForView.map((item, idx) => (
                                <Link key={`${item?.id || "row"}-${idx}`} href={item ? `/news/${item.slug || item.id}?cat=${activeCategoryIdForView}` : "#"} className="block rounded-[10px] hover-lift-primary">
                                    <div className="h-[230px] overflow-hidden rounded-[10px]">
                                        <SafeImage
                                            src={getPostImage(item)}
                                            alt={getTitle(item, "")}
                                            className="h-full w-full object-cover"
                                            width={400}
                                            height={230}
                                        />
                                    </div>
                                    <div className=" px-2 pb-2 justify-between">
                                    <h3 className="fig-h10 mt-2 line-clamp-2 text-[var(--fig-text-primary)]">{getTitle(item, "")}</h3>
                                    <div className="mt-2 flex items-center justify-between">
                                        <MetaRow date={item?.date} />
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
                                <div className="mt-[19px] grid gap-[19px] md:grid-cols-2">
                                    {moreStoriesHeroItemsForView.map((heroItem, col) => (
                                        <div key={col} className="flex h-[757px] flex-col gap-[17px]">
                                            <Link href={heroItem ? `/news/${heroItem.slug || heroItem.id}?cat=${activeCategoryIdForView}` : "#"} className="block rounded-[10px] hover-lift-primary">
                                                <article className="h-[340px]">
                                                    <div className="h-[225px] w-full overflow-hidden rounded-[10px]">
                                                        <SafeImage
                                                            src={getPostImage(heroItem || null)}
                                                            alt={getTitle(heroItem || null, "")}
                                                            className="h-full w-full object-cover"
                                                            width={380}
                                                            height={235}
                                                        />
                                                    </div>
                                                    <div className="mx-auto mt-[6px]  w-[345px]">
                                                        <h3 className="fig-h10 line-clamp-2 text-[var(--fig-text-primary)]">{getTitle(heroItem || null, "")}</h3>
                                                        <div className="mt-[15px] flex items-center justify-between">
                                                            <MetaRow date={heroItem?.date} compact />
                                                            <CategoryPill label={safeCategoryLabel(heroItem || null)} />
                                                        </div>
                                                    </div>
                                                </article>
                                            </Link>

                                            <div className="no-scrollbar flex-1 space-y-[17px] overflow-y-auto pr-1">
                                            {moreStoriesListItemsForView.slice(col * 3, col * 3 + 3).map((item, idx) => (
                                                <Link key={`${item?.id || "more"}-${col}-${idx}`} href={item ? `/news/${item.slug || item.id}?cat=${activeCategoryIdForView}` : "#"} className="ml-2 block h-[120px] rounded-[10px]  px-[3px] py-[5px] pl-[5px] hover-lift-primary">
                                                    <div className="flex h-[107px] items-end gap-2">
                                                        <div className="h-[107px] w-[103px] overflow-hidden rounded-[10px]">
                                                            <SafeImage
                                                                src={getPostImage(item)}
                                                                alt={getTitle(item, "")}
                                                                className="h-full w-full object-cover"
                                                                width={103}
                                                                height={107}
                                                            />
                                                        </div>
                                                        <div className="flex h-[92px] w-[256px] flex-col gap-[15px]">
                                                            <h4 className="line-clamp-2 text-[14px] leading-[21px] text-[var(--fig-text-primary)]">
                                                                {getTitle(item, "")}
                                                            </h4>
                                                            <div className="flex items-center justify-between">
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
                            {mostPopularItemsForView.map((item, idx) => (
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
                                        <div className="mt-[15px] flex items-center justify-between">
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
                            {communicationItemsForView.map((item, idx) => (
                                <article key={`${item?.id || "com"}-${idx}`} className="flex h-[218px] hover-lift-primary mt-2 ml-2 w-[366px] shrink-0 snap-start flex-col justify-center rounded-[5px] bg-surface p-[7px]">
                                    <Link href={item ? `/news/${item.slug || item.id}?cat=${activeCategoryIdForView}` : "#"} className="mx-auto flex h-[174px] w-[345px] flex-col gap-[15px] rounded-[5px] ">
                                        <h2 className="line-clamp-2 text-bold text-unpacase  fig-h11 text-[16px] leading-[24px] ">
                                            {getTitle(item, "")}
                                        </h2>
                                        <div className="mt-auto flex items-center justify-between">
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
                    {(isLoading || hasError) ? <NewsHeroShimmer /> : <div className="mt-10 text-center text-[var(--fig-text-secondary)]">{t("noRecentArticles")}</div>}
                </div>
            )}
        </div>
        </div>
    );
}