"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { NewsTabs } from "../../../components/news/NewsTabs";
import { NewsHero } from "../../../components/news/NewsHero";
import { NewsGrid } from "../../../components/news/NewsGrid";
import { ReplaySection } from "../../../components/news/ReplaySection";
import { getWordPressPosts, getAllChannelReplays } from "../../../services/api";
import { WordPressPost, SliderVideoItem } from "../../../types/api";

export default function NewsPage() {
  const t = useTranslations("pages.news");
  const [articles, setArticles] = useState<WordPressPost[]>([]);
  const [replays, setReplays] = useState<SliderVideoItem[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | number>("");
  const [activeCategoryName, setActiveCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [visibleCount, setVisibleCount] = useState(9);

  const fetchNews = async (categoryId: number | string, categoryName: string) => {
    setLoading(true);
    setActiveCategoryId(categoryId);
    setActiveCategoryName(categoryName);
    setPage(1);
    setVisibleCount(9);
    try {
      // Fetch 20 items initially (2 hero + 6 grid + 12 buffer)
      const data = await getWordPressPosts(categoryId, 20, 1);
      setArticles(data);
      setHasMore(data.length === 20);
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    const nextVisibleCount = visibleCount + 9;

    // If we have enough in buffer, just show more
    if (articles.length >= nextVisibleCount + 2) {
      setVisibleCount(nextVisibleCount);
      return;
    }

    // Otherwise fetch next page
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const newData = await getWordPressPosts(activeCategoryId, 12, nextPage);
      if (newData.length < 12) setHasMore(false);

      setArticles((prev) => [...prev, ...newData]);
      setPage(nextPage);
      setVisibleCount(nextVisibleCount);
    } catch (error) {
      console.error("Failed to fetch more news:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    // Initial fetch handled by NewsTabs component

    // Fetch replays once on mount
    const fetchReplays = async () => {
      try {
        const data = await getAllChannelReplays();
        setReplays(data);
      } catch (error) {
        console.error("Failed to fetch replays:", error);
      }
    };
    fetchReplays();
  }, []);

  const heroItems = articles.slice(0, 2);
  const gridItems = articles.slice(2, 5 + visibleCount);

  return (
    <div className="crtv-page-enter max-w-[1400px] mx-auto px-4 py-8 space-y-20">
      <div className="bg-transparent">
        <NewsTabs onFilterChange={fetchNews} />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-gray-100 dark:border-white/5" />
            <div className="absolute inset-0 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">
            {t("loadingNews")}
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Main Feature Section (NewsHero) */}
          <NewsHero items={heroItems} categoryName={activeCategoryName} />

          {/* Secondary Feed - 3-Column Grid Component */}
          <NewsGrid
            items={gridItems}
            loadingMore={loadingMore}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            title={t("moreOf")}
            title2={t("newsTitle")}
          />

          {/* Replay Section */}
          <ReplaySection videos={replays} />

          {articles.length === 0 && !loading && (
            <div className="py-24 text-center space-y-6">
              <div className="text-6xl opacity-10">📰</div>
              <p className="text-xl font-medium text-gray-400 max-w-md mx-auto">
                {t("noArticles")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

