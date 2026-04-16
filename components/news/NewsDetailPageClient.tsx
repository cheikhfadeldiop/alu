"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useWordPressNews, useWordPressPost } from "@/hooks/useData";
import { SITE_CONFIG } from "@/constants/site-config";
import { AdBanV } from "../ui/AdBannerV";
import { decodeHtmlEntities, formatDate, getPostAuthor, parseToDate } from "@/utils/text";
import { NewsHeroShimmer } from "@/components/ui/shimmer/NewsShimmers";
import { useRouter } from "@/i18n/navigation";
import { SafeImage } from "../ui/SafeImage";
import { useWordPressCategories } from "@/hooks/useData";
import { useTranslations } from "next-intl";
const TWO_YEARS_MS = 1000 * 60 * 60 * 24 * 365 * 2;

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

function MetaRow({ date }: { date?: string }) {
  const formatted = date ? formatDate(date) : formatDate(new Date());
  return (
    <div className="fig-b3 mt-2 flex items-center gap-2 text-[var(--fig-text-secondary)]">
      <span>{formatted}</span>
      <span className="inline-block h-[4px] w-[4px] rounded-full bg-[var(--fig-text-secondary)]/80" />
      <span>{formatDisplayTime(date)}</span>
    </div>
  );
}

export function NewsDetailPageClient({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("pages.news");
  const [activeSlug, setActiveSlug] = useState(slug);
  useEffect(() => setActiveSlug(slug), [slug]);

  const { data: post, isLoading: postLoading, error: postError } = useWordPressPost(activeSlug);
  const lastPostRef = useRef<any>(null);
  useEffect(() => {
    if (post) lastPostRef.current = post;
  }, [post]);

  const postForView = post ?? lastPostRef.current;
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
  const selectedCat = searchParams.get("cat");
  const activeCategoryId = selectedCat && !Number.isNaN(Number(selectedCat)) ? Number(selectedCat) : defaultCategoryId;
  const allCategoryIds = validCategories.length
    ? validCategories.map((c: any) => Number(c.id)).join(",")
    : String(activeCategoryId);
  // Sidebar must remain stable for a given category, independent of the current post.
  const { data: categoryArticles = [] } = useWordPressNews(activeCategoryId, 40);
  const { data: latestArticles = [] } = useWordPressNews(allCategoryIds, 80);

  const categoryRecent = useMemo(() => categoryArticles.filter((item) => isRecentPost(item)), [categoryArticles]);
  const latestRecent = useMemo(() => latestArticles.filter((item) => isRecentPost(item)), [latestArticles]);

  const sameCategoryPool = useMemo(() => {
    if (!postForView) return [];
    const merged = [...categoryRecent, ...latestRecent];
    const dedup = new Map<number, any>();
    for (const item of merged) {
      if (item?.id && item.id !== postForView.id && !dedup.has(item.id)) dedup.set(item.id, item);
    }
    return Array.from(dedup.values()).sort((a, b) => new Date(b?.date || 0).getTime() - new Date(a?.date || 0).getTime());
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

  // Initial load (or fetch failure with no cached data): show full shimmer.
  // For slug changes, SWR keeps previous data so `post` should remain available most of the time.
  if (!postForView) {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-4 py-8 xl:px-0">
        <NewsHeroShimmer />
      </div>
    );
  }

  const articleText = stripHtml(postForView.content?.rendered || postForView.excerpt?.rendered);
  const openDetail = (item: any) => {
    if (!item) return;
    const target = String(item.slug || item.id);
    setActiveSlug(target);

    // Keep the current route shell without triggering a full navigation (prevents right sidebar flicker).
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", `/news/${target}?cat=${activeCategoryId}`);
    }
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

      <section className="mt-[6px] grid gap-[47px] xl:grid-cols-[781px_465px]">
        <div>
          <div className="h-[445px] overflow-hidden rounded-[10px]">
            <SafeImage
              src={getPostImage(postForView)}
              alt={decodeHtmlEntities(postForView.title?.rendered || "News")}
              className="h-full w-full object-cover"
              width={781}
              height={445}
            />
          </div>

          <h1 className="mt-[39px] text-[28px] font-bold leading-[42px] text-[var(--fig-text-primary)]">
            {decodeHtmlEntities(postForView.title?.rendered || "")}
          </h1>
          <MetaRow date={postForView.date} />

          <div className="mt-[34px] space-y-6">
            {articleText
              .split("\n")
              .filter(Boolean)
              .slice(0, 18)
              .map((p, index) => (
                <p key={index} className="text-justify text-[20px] leading-[32px] tracking-[-0.05em] ">
                  {p}
                </p>
              ))}
          </div>
        </div>

        <aside>
          <div className="news-section-header">
            <h2 className="fig-h9 uppercase text-[var(--fig-text-primary)]">{t("latestInSameCategory")}</h2>
            <div className="news-section-line" />
          </div>
          <div className="mt-3 space-y-[10px]">
            {sideItems.map((item, idx) => (
              <Link
                key={`${item?.id || "side"}-${idx}`}
                href={item ? `/news/${item.slug || item.id}` : "#"}
                onClick={(e) => {
                  e.preventDefault();
                  openDetail(item);
                }}
                className="block h-[115px] rounded-[5px] bg-[var(--fig-surface)] p-[7px] hover-lift-primary"
              >
                <h3 className="line-clamp-2 pt-2 text-[16px] leading-[24px] text-[var(--fig-text-primary)]">
                  {getTitle(item?.title?.rendered, idx)}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                  <MetaRow date={item?.date} />
                  <span className="inline-flex h-[15px] items-center rounded-full border px-2 text-[8px] leading-[12px] text-[var(--fig-text-secondary)] [border-color:var(--fig-tag-religion)]">
                    {safeCategoryLabel(item)}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 overflow-hidden rounded-[10px]">
            <AdBanV />
          </div>
        </aside>
      </section>

      <section className="mt-[93px] flex flex-col gap-[41px]">
  
  {/* Header */}
  <div className="news-section-header">
    <h2 className="fig-h9 uppercase text-[var(--fig-text-primary)]">{t("similarContent")}</h2>
    <div className="news-section-line" />
  </div>

  {/* Scroll */}
  <div className="overflow-x-auto no-scrollbar pb-2 pl-5 pt-5 pr-5">
    <div className="flex gap-[20px]">

      {similarItems.map((item, idx) => (
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

                <div className="flex items-center justify-between">
                  <MetaRow date={item?.date} />
                  <span className="inline-flex h-[15px] items-center rounded-full border px-2 text-[8px] leading-[12px] text-[var(--fig-text-secondary)] [border-color:var(--fig-tag-religion)]">
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
