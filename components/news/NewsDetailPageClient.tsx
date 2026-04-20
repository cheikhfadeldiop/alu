"use client";

import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { mutate } from "swr";
import { fetchWordPressNewsBundleData, useWordPressNewsBundle, useWordPressPost } from "@/hooks/useData";
import { SITE_CONFIG } from "@/constants/site-config";
import { AdBanV } from "../ui/AdBannerV";
import { decodeHtmlEntities, formatDate, getPostAuthor, parseToDate } from "@/utils/text";
import { NewsDetailShimmer } from "@/components/ui/shimmer/NewsShimmers";
import { useRouter } from "@/i18n/navigation";
import { SafeImage } from "../ui/SafeImage";
import { useWordPressCategories } from "@/hooks/useData";
import { useTranslations } from "next-intl";
import { Skeleton } from "../ui/shimmer/Skeleton";
const TWO_YEARS_MS = 1000 * 60 * 60 * 24 * 365 * 2;
const NEWS_DETAIL_INITIAL_CATEGORY_COUNT = 20;
const NEWS_DETAIL_INITIAL_FILL_COUNT = 20;
const NEWS_DETAIL_INITIAL_LATEST_COUNT = 20;
const NEWS_DETAIL_BACKGROUND_CATEGORY_COUNT = 20;
const NEWS_DETAIL_BACKGROUND_FILL_COUNT = 20;
const NEWS_DETAIL_BACKGROUND_LATEST_COUNT = 40;

function normalizeImageUrl(url?: string) {
  if (!url) return "";
  return url.replace(/^http:\/\//i, "https://");
}

function getPostImage(post: any) {
  if (!post) return "";
  return normalizeImageUrl(post.acan_image_url || post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || SITE_CONFIG.theme.placeholders.logo);
}

function isRecentPost(post: any) {
  // If WP doesn't provide `date`, don't exclude the post (prevents “empty sidebar” glitches).
  if (!post?.date) return true;
  const t = new Date(post.date).getTime();
  if (!Number.isFinite(t)) return false;
  return Date.now() - t <= TWO_YEARS_MS;
}

function safeCategoryLabel(post: any) {
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

function stripHtml(text?: string) {
  return (text || "").replace(/<[^>]*>/g, "").trim();
}

function getTitle(text: string | undefined, idx = 0) {
  return decodeHtmlEntities(text || "");
}

function buildPriorityCategoryIds(activeCategoryId: number, validIds: number[], limit: number) {
  if (!validIds.length) return [activeCategoryId];
  const activeIndex = Math.max(0, validIds.indexOf(activeCategoryId));
  const ordered = [...validIds.slice(activeIndex), ...validIds.slice(0, activeIndex)];
  return ordered.slice(0, Math.max(1, limit));
}

function MetaRow({ date }: { date?: string }) {
  const formatted = date ? formatDate(date) : formatDate(new Date());
  return (
    <div className="fig-b3 inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-[var(--fig-text-secondary)]">
      <span className="text-[12px] leading-none">{formatted}</span>
      <span className="inline-block h-[4px] w-[4px] shrink-0 rounded-full bg-[var(--fig-text-secondary)]/80" />
      <span className="text-[12px] leading-none">{formatDisplayTime(date)}</span>
    </div>
  );
}

export function NewsDetailPageClient({
  slug,
  initialPost,
  initialCategories,
  initialBundle,
  initialCategoryId,
}: {
  slug: string;
  initialPost?: any;
  initialCategories?: any[];
  initialBundle?: {
    activeCategoryId: number;
    categoryArticles: any[];
    allArticles: any[];
    latestArticles: any[];
  };
  initialCategoryId?: number;
}) {
  const router = useRouter();
  const t = useTranslations("pages.news");
  const [activeSlug, setActiveSlug] = useState(slug);
  const [optimisticPost, setOptimisticPost] = useState<any>(null);
  useEffect(() => setActiveSlug(slug), [slug]);
  useEffect(() => {
    setOptimisticPost(null);
  }, [slug]);

  const { data: post, isLoading: postLoading } = useWordPressPost(activeSlug, initialPost);
  const lastPostRef = useRef<any>(null);
  useEffect(() => {
    if (post) lastPostRef.current = post;
  }, [post]);

  const postForView = post ?? optimisticPost ?? lastPostRef.current;
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
  const activeCategoryId = Number(initialCategoryId || defaultCategoryId);
  const categoryCacheLimit = SITE_CONFIG.cacheLimit || 5;
  const prioritizedCategoryIds = useMemo(
    () => buildPriorityCategoryIds(activeCategoryId, validCategories.map((c: any) => Number(c.id)), categoryCacheLimit),
    [activeCategoryId, validCategories, categoryCacheLimit]
  );
  const allCategoryIds = prioritizedCategoryIds.join(",");
  // Sidebar must remain stable for a given category, independent of the current post.
  const { data: newsBundle, isLoading: newsBundleLoading } = useWordPressNewsBundle(activeCategoryId, allCategoryIds, {
    categoryCount: NEWS_DETAIL_INITIAL_CATEGORY_COUNT,
    allCount: NEWS_DETAIL_INITIAL_FILL_COUNT,
    latestCount: NEWS_DETAIL_INITIAL_LATEST_COUNT,
    latestPage: 1,
  }, initialBundle);

  const categoryArticles = newsBundle?.categoryArticles ?? [];
  const latestArticles = [...(newsBundle?.allArticles ?? []), ...(newsBundle?.latestArticles ?? [])];
  const bundleMatchesActiveCategory = newsBundle?.activeCategoryId === activeCategoryId;

  const categoryRecent = useMemo(() => categoryArticles.filter((item) => isRecentPost(item)), [categoryArticles]);
  const latestRecent = useMemo(() => latestArticles.filter((item) => isRecentPost(item)), [latestArticles]);

  const sameCategoryPool = useMemo(() => {
    if (!postForView) return [];
    
    // Sort active category items by date
    const activeSorted = [...categoryRecent].sort((a, b) => new Date(b?.date || 0).getTime() - new Date(a?.date || 0).getTime());
    // Sort fallback items by date
    const fallbackSorted = [...latestRecent].sort((a, b) => new Date(b?.date || 0).getTime() - new Date(a?.date || 0).getTime());

    const out: any[] = [];
    const dedup = new Set<number>();
    
    if (postForView.id) {
        dedup.add(postForView.id); // exclude the currently viewed post
    }

    // 1. Fill exclusively with active category items first
    for (const item of activeSorted) {
        if (item?.id && !dedup.has(item.id)) {
            dedup.add(item.id);
            out.push(item);
        }
    }

    // 2. Only if we need more, complete the rest with fallback items
    for (const item of fallbackSorted) {
        if (item?.id && !dedup.has(item.id)) {
            dedup.add(item.id);
            out.push(item);
        }
    }

    return out;
  }, [postForView, categoryRecent, latestRecent]);

  const sideItems = useMemo(() => {
    if (!postForView) return [];
    const others = sameCategoryPool.slice(0, 4);
    return [postForView, ...others];
  }, [sameCategoryPool, postForView]);
  const similarItems = useMemo(() => {
    if (!postForView) return [];
    const dedup = new Map<number, any>();
    for (const item of latestRecent) {
      if (item?.id && item.id !== postForView.id && !dedup.has(item.id)) dedup.set(item.id, item);
    }
    const sorted = Array.from(dedup.values()).sort((a, b) => new Date(b?.date || 0).getTime() - new Date(a?.date || 0).getTime());
    return sorted.slice(0, 4);
  }, [latestRecent, postForView]);
  const showSideSkeletons = (!bundleMatchesActiveCategory || newsBundleLoading || categoriesLoading) && sameCategoryPool.length === 0;
  const showSimilarSkeletons = (!bundleMatchesActiveCategory || newsBundleLoading || categoriesLoading) && similarItems.length === 0;

  useEffect(() => {
    if (!newsBundle || !validCategories.length) return;

    const visibleKey = `wordpressNewsBundle:${activeCategoryId}:${allCategoryIds}:${NEWS_DETAIL_INITIAL_CATEGORY_COUNT}:${NEWS_DETAIL_INITIAL_FILL_COUNT}:${NEWS_DETAIL_INITIAL_LATEST_COUNT}:1`;
    const run = () =>
      mutate(
        visibleKey,
        fetchWordPressNewsBundleData(
          activeCategoryId,
          allCategoryIds,
          NEWS_DETAIL_BACKGROUND_CATEGORY_COUNT,
          NEWS_DETAIL_BACKGROUND_FILL_COUNT,
          NEWS_DETAIL_BACKGROUND_LATEST_COUNT,
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
  }, [activeCategoryId, allCategoryIds, newsBundle, validCategories.length]);

  // Initial load (or fetch failure with no cached data): show full shimmer.
  // For slug changes, SWR keeps previous data so `post` should remain available most of the time.
  if (!postForView) {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-4 py-8 xl:px-0">
        <NewsDetailShimmer />
      </div>
    );
  }
  const articleText = stripHtml(postForView.content?.rendered || postForView.excerpt?.rendered);
  const openDetail = (item: any) => {
    if (!item) return;
    const target = String(item.slug || item.id);
    mutate(`wordpressPost:${target}`, item, false);
    setOptimisticPost(item);
    setActiveSlug(target);

    startTransition(() => {
      router.replace(`/news/${target}?cat=${activeCategoryId}`);
    });
  };
  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
      return;
    }
    router.push(`/news?cat=${activeCategoryId}`);
  };

  return (
    <div className="w-full bg-[var(--fig-bg)]">
      <div className="news-page-wrap px-4 pb-8 pt-[8px] xl:px-0">
        <div className="mb-[10px] mt-[2px]">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-[13px] text-[var(--fig-text-secondary)] hover:text-[var(--fig-text-primary)]"
          >
            <span>←</span>
            <span>{t("back")}</span>
          </button>
        </div>

        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[781px_1fr] lg:gap-[47px] mt-[6px]">
          <div>
            <div className="h-[220px] md:h-[445px] overflow-hidden rounded-[10px]">
              <SafeImage
                src={getPostImage(postForView)}
                alt={decodeHtmlEntities(postForView.title?.rendered || "News")}
                className="h-full w-full object-cover"
                width={781}
                height={445}
              />
            </div>

            <h1 className="mt-6 md:mt-[39px] text-[22px] md:text-[28px] font-bold leading-tight md:leading-[42px] text-[var(--fig-text-primary)]">
              {decodeHtmlEntities(postForView.title?.rendered || "")}
            </h1>
            <div className="mt-3">
              <MetaRow date={postForView.date} />
            </div>

            <div className="mt-8 md:mt-[34px] space-y-5 md:space-y-6">
              {articleText
                .split("\n")
                .filter(Boolean)
                .slice(0, 25)
                .map((p, index) => (
                  <p key={index} className="text-justify text-[16px] md:text-[20px] leading-relaxed md:leading-[32px] tracking-tight md:tracking-[-0.05em] text-[var(--fig-text-primary)]">
                    {p}
                  </p>
                ))}
            </div>
          </div>


          <aside className="mt-4 md:mt-0">
            <div className="news-section-header">
              <h2 className="text-[18px] md:fig-h9 uppercase text-[var(--fig-text-primary)] font-bold">{t("latestInSameCategory")}</h2>
              <div className="news-section-line" />
            </div>
            <div className="mt-4 space-y-[12px]">
              {showSideSkeletons ? (
                Array.from({ length: 5 }, (_, index) => (
                  <Skeleton key={`side-skeleton-${index}`} className="h-[115px] w-full rounded-[5px]" />
                ))
              ) : sideItems.map((item, idx) => (
                <Link
                  key={`${item?.id || "side"}-${idx}`}
                  href={item ? `/news/${item.slug || item.id}` : "#"}
                  onClick={(e) => {
                    e.preventDefault();
                    openDetail(item);
                  }}
                  className="block h-auto md:h-[115px] rounded-[5px] bg-[var(--fig-surface)] p-3 md:p-[7px] hover-lift-primary border border-[var(--fig-border-soft)] md:border-none"
                >
                  <h3 className="line-clamp-2 md:pt-2 text-[14px] md:text-[16px] leading-tight md:leading-[24px] text-[var(--fig-text-primary)] font-medium">
                    {getTitle(item?.title?.rendered, idx)}
                  </h3>
                  <div className="mt-3 md:mt-2 flex items-center justify-between gap-3">
                    <MetaRow date={item?.date} />
                    <span className="inline-flex h-[15px] shrink-0 items-center whitespace-nowrap rounded-full border px-2 text-[8px] leading-[12px] text-[var(--fig-text-secondary)] [border-color:var(--fig-tag-religion)]">
                      {safeCategoryLabel(item)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10 overflow-hidden rounded-[10px] hidden md:block">
              <AdBanV />
            </div>
          </aside>
        </div>


      <section className="mt-[93px] flex flex-col gap-[41px]">
  
  {/* Header */}
  <div className="news-section-header">
    <h2 className="fig-h9 uppercase text-[var(--fig-text-primary)]">{t("similarContent")}</h2>
    <div className="news-section-line" />
  </div>

  {/* Scroll */}
  <div className="overflow-x-auto no-scrollbar pb-2 pl-5 pt-5 pr-5">
    <div className="flex gap-[20px]">

      {showSimilarSkeletons ? Array.from({ length: 4 }, (_, index) => (
        <div key={`similar-skeleton-${index}`} className="w-[356px] shrink-0 space-y-3">
          <Skeleton className="h-[200px] w-full rounded-[10px]" />
          <Skeleton className="h-6 w-5/6 rounded-md" />
          <Skeleton className="h-4 w-2/3 rounded-md" />
        </div>
      )) : similarItems.map((item, idx) => (
        <article
          key={`${item?.id || "similar"}-${idx}`}
          className="w-[356px] shrink-0"
        >
          <Link
            href={item ? `/news/${item.slug || item.id}` : "#"}
            onClick={(e) => {
              e.preventDefault();
              openDetail(item);
            }}
            className="block rounded-[10px] hover-lift-primary"
          >
            <div className="flex flex-col h-[300px] overflow-hidden rounded-[10px]">

              {/* Image */}
              <SafeImage
                src={getPostImage(item)}
                alt={getTitle(item?.title?.rendered, idx)}
                className="h-[200px] w-full object-cover rounded-[10px]"
                width={356}
                height={200}
              />

              {/* Content */}
              <div className="h-[100px] px-[10px] pt-[10px] pb-2 flex flex-col justify-between">
                
                <h3 className="fig-h10 line-clamp-2 text-[var(--fig-text-primary)]">
                  {getTitle(item?.title?.rendered, idx)}
                </h3>

                <div className="flex items-center justify-between gap-3">
                  <MetaRow date={item?.date} />
                  <span className="inline-flex h-[15px] shrink-0 items-center whitespace-nowrap rounded-full border px-2 text-[8px] leading-[12px] text-[var(--fig-text-secondary)] [border-color:var(--fig-tag-religion)]">
                    {safeCategoryLabel(item)}
                  </span>
                </div>

              </div>
            </div>
          </Link>
        </article>
      ))}

    </div>
  </div>
</section>
      </div>
    </div>
  );
}
