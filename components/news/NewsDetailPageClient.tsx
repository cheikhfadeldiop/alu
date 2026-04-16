"use client";

import { useEffect, useMemo, useState } from "react";
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
  if (!post?.date) return false;
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
  const [activeSlug, setActiveSlug] = useState(slug);
  useEffect(() => setActiveSlug(slug), [slug]);
  const { data: post, isLoading: postLoading } = useWordPressPost(activeSlug);
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
  const postCategoryId = post?.categories?.[0] || SITE_CONFIG.categories.news.alaune;
  const { data: categoryArticles = [], isLoading: categoryLoading } = useWordPressNews(postCategoryId, 40);
  const { data: latestArticles = [], isLoading: latestLoading } = useWordPressNews(allCategoryIds, 80);

  const categoryRecent = useMemo(() => categoryArticles.filter((item) => isRecentPost(item)), [categoryArticles]);
  const latestRecent = useMemo(() => latestArticles.filter((item) => isRecentPost(item)), [latestArticles]);

  const sameCategoryPool = useMemo(() => {
    if (!post) return [];
    const merged = [...categoryRecent, ...latestRecent];
    const dedup = new Map<number, any>();
    for (const item of merged) {
      if (item?.id && item.id !== post.id && !dedup.has(item.id)) dedup.set(item.id, item);
    }
    return Array.from(dedup.values()).sort((a, b) => new Date(b?.date || 0).getTime() - new Date(a?.date || 0).getTime());
  }, [post, categoryRecent, latestRecent]);

  const sideItems = useMemo(() => {
    if (!post) return [];
    const others = sameCategoryPool.slice(0, 4);
    return [post, ...others];
  }, [sameCategoryPool, post]);
  const similarItems = useMemo(() => {
    const dedup = new Map<number, any>();
    for (const item of latestRecent) {
      if (item?.id && item.id !== post?.id && !dedup.has(item.id)) dedup.set(item.id, item);
    }
    const sorted = Array.from(dedup.values()).sort((a, b) => new Date(b?.date || 0).getTime() - new Date(a?.date || 0).getTime());
    return sorted.slice(0, 4);
  }, [latestRecent, post?.id]);

  if (postLoading || categoryLoading || latestLoading || !post) {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-4 py-8 xl:px-0">
        <NewsHeroShimmer />
      </div>
    );
  }

  const articleText = stripHtml(post.content?.rendered || post.excerpt?.rendered);
  const openDetail = (item: any) => {
    if (!item) return;
    const target = String(item.slug || item.id);
    setActiveSlug(target);
    router.replace(`/news/${target}?cat=${activeCategoryId}`);
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
            <span>Retour</span>
          </button>
        </div>

      <section className="mt-[6px] grid gap-[47px] xl:grid-cols-[781px_465px]">
        <div>
          <div className="h-[445px] overflow-hidden rounded-[10px]">
            <SafeImage
              src={getPostImage(post)}
              alt={decodeHtmlEntities(post.title?.rendered || "News")}
              className="h-full w-full object-cover"
              width={781}
              height={445}
            />
          </div>

          <h1 className="mt-[39px] text-[28px] font-bold leading-[42px] text-[var(--fig-text-primary)]">
            {decodeHtmlEntities(post.title?.rendered || "")}
          </h1>
          <MetaRow date={post.date} />

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
            <h2 className="fig-h9 uppercase text-[var(--fig-text-primary)]">Latest in same category</h2>
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
        <div className="news-section-header">
          <h2 className="fig-h9 uppercase text-[var(--fig-text-primary)]">Similar content</h2>
          <div className="news-section-line" />
        </div>
        <div className="news-hscroll no-scrollbar pb-2">
          {similarItems.map((item, idx) => (
            <article key={`${item?.id || "similar"}-${idx}`} className="w-[356px]">
              <Link
                href={item ? `/news/${item.slug || item.id}` : "#"}
                onClick={(e) => {
                  e.preventDefault();
                  openDetail(item);
                }}
                className="block rounded-[10px] hover-lift-primary"
              >
                <div className="h-[200px] overflow-hidden rounded-[10px]">
                  <SafeImage
                    src={getPostImage(item)}
                    alt={getTitle(item?.title?.rendered, idx)}
                    className="h-full w-full object-cover"
                    width={356}
                    height={200}
                  />
                </div>
                <div className="mt-[25px] w-[345px]">
                  <h3 className="fig-h10 line-clamp-2 text-[var(--fig-text-primary)]">
                    {getTitle(item?.title?.rendered, idx)}
                  </h3>
                  <div className="mt-[15px] flex items-center justify-between">
                    <MetaRow date={item?.date} />
                    <span className="inline-flex h-[15px] items-center rounded-full border px-2 text-[8px] leading-[12px] text-[var(--fig-text-secondary)] [border-color:var(--fig-tag-religion)]">
                      {safeCategoryLabel(item)}
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>
      </div>
    </div>
  );
}
