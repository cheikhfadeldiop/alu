"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { NewsTabs } from "../../../components/news/NewsTabs";
import { NewsHero } from "../../../components/news/NewsHero";
import { NewsGrid } from "../../../components/news/NewsGrid";
import { ReplaySection } from "../../../components/news/ReplaySection";
import { SliderVideoItem } from "../../../types/api";
import { NewsHeroShimmer, NewsGridShimmer, ReplaySectionShimmer } from "@/components/ui/shimmer/NewsShimmers";
import { SITE_CONFIG } from "@/constants/site-config";
import { useData, useWordPressNews } from "@/hooks/useData";

export default function NewsPage() {
  const t = useTranslations("pages.news");
  const [activeCategoryId, setActiveCategoryId] = useState<string | number>(SITE_CONFIG.categories.news.alaune);
  const [activeCategoryName, setActiveCategoryName] = useState("");
  const [visibleCount, setVisibleCount] = useState(18);

  // Use SWR for primary articles - shared cache with NewsHero
  const { data: articles = [], isLoading, isValidating } = useWordPressNews(
    activeCategoryId,
    visibleCount + 2 // 2 hero + grid
  );

  // Use generic useData for allchannel replays
  const { data: replaysData, isLoading: replaysLoading } = useData<{ allitems: SliderVideoItem[] }>("sliderVideos", "standard");
  const replays = replaysData?.allitems || [];

  const fetchNews = (categoryId: number | string, categoryName: string) => {
    setActiveCategoryId(categoryId);
    setActiveCategoryName(categoryName);
    setVisibleCount(9); // Reset count on tab change
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 9);
  };

  const heroItems = articles.slice(0, 2);
  const gridItems = articles.slice(2);

  const mainLoading = isLoading && articles.length === 0;

  return (
    <div className="crtv-page-enter max-w-[1400px] mx-auto px-4 py-8 space-y-20">
      <div className="bg-transparent">
        <NewsTabs onFilterChange={fetchNews} />
      </div>

      <div className="space-y-12">
        {mainLoading ? (
          <>
            <NewsHeroShimmer />
            <NewsGridShimmer />
          </>
        ) : (
          <>
            {/* Main Feature Section (NewsHero) */}
            <NewsHero items={heroItems} categoryName={activeCategoryName} />

            {/* Secondary Feed - 3-Column Grid Component */}
            <NewsGrid
              items={gridItems}
              loadingMore={isValidating && articles.length > 0}
              hasMore={articles.length >= visibleCount + 2}
              onLoadMore={handleLoadMore}
              title={t("moreOf")}
              title2={t("newsTitle")}
            />
          </>
        )}

        {/* Replay Section - Load separately */}
        {replaysLoading && replays.length === 0 ? (
          <ReplaySectionShimmer />
        ) : (
          <ReplaySection videos={replays} />
        )}

        {articles.length === 0 && !isLoading && (
          <div className="py-24 text-center space-y-6">
            <div className="text-6xl opacity-10">📰</div>
            <p className="text-xl font-medium text-gray-400 max-w-md mx-auto">
              {t("noArticles")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

