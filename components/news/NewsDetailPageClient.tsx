"use client";

import { useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { useWordPressNews, useWordPressPost } from "@/hooks/useData";
import { SITE_CONFIG } from "@/constants/site-config";
import { AdBanV } from "../ui/AdBannerV";
import { decodeHtmlEntities } from "@/utils/text";
import { NewsHeroShimmer } from "@/components/ui/shimmer/NewsShimmers";
import { useRouter } from "@/i18n/navigation";

const figmaDetailAssets = {
  featured: "https://www.figma.com/api/mcp/asset/82d805c2-617f-4b20-8331-5446c95a31ed",
  sim1: "https://www.figma.com/api/mcp/asset/f7c708b5-f853-40d3-bd77-c19972e4123b",
  sim2: "https://www.figma.com/api/mcp/asset/4cac7e06-6bfd-4ac0-8fd0-e3ea2f2edc46",
  sim3: "https://www.figma.com/api/mcp/asset/9c3a9e17-5201-4e6d-a6d8-be19d847b6d5",
  sim4: "https://www.figma.com/api/mcp/asset/5b39e458-42ec-4702-acfb-5cad5b14a309",
};

const fallbackHeadlines = [
  ". Le JP de Sport de 08h00 du 11 Mars 2024. Le JP de Sport de 08h00 du 11 Mars 2024",
  "Le JP de Sport de 08h00 du 11 Mars 2024. Le JP de Sport de 08h00 du 11 Mars 2024. Le JP de Sport de 08h00 du 11 Mars 2024",
  "Politude du 09 Mars 2024. Le JP de Sport de 08h00 du 11 Mars 2024",
  "Cameroon Calling of March 3, 2024",
];

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

function stripHtml(text?: string) {
  return (text || "").replace(/<[^>]*>/g, "").trim();
}

function getTitle(text: string | undefined, idx = 0) {
  return decodeHtmlEntities(text || fallbackHeadlines[idx % fallbackHeadlines.length]);
}

function fillSlots<T>(pool: T[], size: number) {
  if (!pool.length) return Array.from({ length: size }, () => null as T | null);
  return Array.from({ length: size }, (_, index) => pool[index % pool.length] || null);
}

function MetaRow({ date }: { date?: string }) {
  const formatted = date
    ? new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
    : "15 juin 2024";
  return (
    <div className="fig-b3 mt-2 flex items-center gap-2 text-[var(--fig-text-secondary)]">
      <span>{formatted}</span>
      <span className="inline-block h-[4px] w-[4px] rounded-full bg-[var(--fig-text-secondary)]/80" />
      <span>15:47</span>
    </div>
  );
}

export function NewsDetailPageClient({ slug }: { slug: string }) {
  const router = useRouter();
  const { data: post, isLoading: postLoading } = useWordPressPost(slug);
  const { data: articles = [], isLoading: listLoading } = useWordPressNews(SITE_CONFIG.categories.news.alaune, 20);

  const sideItems = useMemo(() => {
    if (!post) return [];
    return fillSlots(articles.filter((item) => item.id !== post.id), 4);
  }, [articles, post]);

  const similarItems = useMemo(() => {
    if (!post) return [];
    return fillSlots(articles.filter((item) => item.id !== post.id).slice(4), 4);
  }, [articles, post]);

  if (postLoading || listLoading || !post) {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-4 py-8 xl:px-0">
        <NewsHeroShimmer />
      </div>
    );
  }

  const articleText = stripHtml(post.content?.rendered || post.excerpt?.rendered);
  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
      return;
    }
    router.push("/news");
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
            <FigmaImage
              figmaSrc={figmaDetailAssets.featured}
              fallbackSrc={post.acan_image_url || SITE_CONFIG.theme.placeholders.news}
              alt={decodeHtmlEntities(post.title?.rendered || "News")}
              className="h-full w-full object-cover"
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
                <p key={index} className="text-justify text-[20px] leading-[32px] tracking-[-0.05em] text-black">
                  {p}
                </p>
              ))}
          </div>
        </div>

        <aside>
          <div className="news-section-header">
            <h2 className="fig-h9 uppercase text-[var(--fig-text-primary)]">Communication and announcement</h2>
            <div className="news-section-line" />
          </div>
          <div className="mt-3 space-y-[10px]">
            {sideItems.map((item, idx) => (
              <Link key={`${item?.id || "side"}-${idx}`} href={item ? `/news/${item.slug || item.id}` : "#"} className="block h-[115px] rounded-[5px] bg-[var(--fig-surface)] p-[7px]">
                <h3 className="line-clamp-2 pt-2 text-[16px] leading-[24px] text-[var(--fig-text-primary)]">
                  {getTitle(item?.title?.rendered, idx)}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                  <MetaRow date={item?.date} />
                  <span className="inline-flex h-[15px] items-center rounded-full border px-2 text-[8px] leading-[12px] text-[var(--fig-text-secondary)] [border-color:var(--fig-tag-religion)]">
                    Religion
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
              <Link href={item ? `/news/${item.slug || item.id}` : "#"}>
                <div className="h-[200px] overflow-hidden rounded-[10px]">
                  <FigmaImage
                    figmaSrc={[figmaDetailAssets.sim1, figmaDetailAssets.sim2, figmaDetailAssets.sim3, figmaDetailAssets.sim4][idx] || figmaDetailAssets.sim1}
                    fallbackSrc={item?.acan_image_url || SITE_CONFIG.theme.placeholders.news}
                    alt={getTitle(item?.title?.rendered, idx)}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-[25px] w-[345px]">
                  <h3 className="fig-h10 line-clamp-2 text-[var(--fig-text-primary)]">
                    {getTitle(item?.title?.rendered, idx)}
                  </h3>
                  <div className="mt-[15px] flex items-center justify-between">
                    <MetaRow date={item?.date} />
                    <span className="inline-flex h-[15px] items-center rounded-full border px-2 text-[8px] leading-[12px] text-[var(--fig-text-secondary)] [border-color:var(--fig-tag-religion)]">
                      Religion
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
