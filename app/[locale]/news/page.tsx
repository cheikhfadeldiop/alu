"use client";

import { useEffect, useState, Suspense } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";

import { NewsTabs } from "../../../components/news/NewsTabs";
import { NewsHero } from "../../../components/news/NewsHero";
import { NewsGrid } from "../../../components/news/NewsGrid";
import { NewsDetailedLayout } from "../../../components/news/NewsDetailedLayout";
import { ReplaySection } from "../../../components/news/ReplaySection";
import { WordPressPost, SliderVideoItem } from "../../../types/api";
import { NewsHeroShimmer, NewsGridShimmer, ReplaySectionShimmer } from "@/components/ui/shimmer/NewsShimmers";
import { SITE_CONFIG } from "@/constants/site-config";
import { useData, useWordPressNews, useWordPressPost } from "@/hooks/useData";
import { AdBanner } from "@/components/ui/AdBanner";
const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

function NewsContent() {
  const t = useTranslations("pages.news");
  const searchParams = useSearchParams();
  const router = useRouter();
  const idParam = searchParams.get("id");

  const [activeCategoryId, setActiveCategoryId] = useState<string | number>(SITE_CONFIG.categories.news.alaune);
  const [activeCategoryName, setActiveCategoryName] = useState("");
  const [visibleCount, setVisibleCount] = useState(18);
  const [selectedArticle, setSelectedArticle] = useState<WordPressPost | null>(null);

  // Fetch article if ID is in URL
  const { data: routeArticle } = useWordPressPost(idParam || "");

  useEffect(() => {
    if (routeArticle && routeArticle.title && idParam) {
      setSelectedArticle(routeArticle);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (!idParam) {
      setSelectedArticle(null);
    }
  }, [routeArticle, idParam]);

  // Conditionally use the detailed layout for specific thematic categories
  const isDetailedLayout = ["politique", "international", "société", "économie"].some(
    cat => activeCategoryName.toLowerCase().includes(cat)
  );

  // Use SWR for primary articles
  const { data: articles = [], isLoading, isValidating } = useWordPressNews(
    activeCategoryId,
    isDetailedLayout ? 10 : visibleCount + 2
  );

  const { data: replaysData, isLoading: replaysLoading } = useData<{ allitems: SliderVideoItem[] }>("sliderVideos", "standard");
  const replays = replaysData?.allitems || [];

  const fetchNews = (categoryId: number | string, categoryName: string) => {
    setActiveCategoryId(categoryId);
    setActiveCategoryName(categoryName);
    setVisibleCount(9);
    setSelectedArticle(null); // Reset detail view on tab change
    if (idParam) router.push('/news', { scroll: false });
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 9);
  };

  const handleArticleClick = (article: WordPressPost) => {
    setSelectedArticle(article);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    router.push(`/news?id=${article.id}`, { scroll: false });
  };

  const handleBack = () => {
    setSelectedArticle(null);
    router.push('/news', { scroll: false });
  };

  const heroItems = articles.slice(0, 2);
  const gridItems = articles.slice(2);

  const mainLoading = isLoading && articles.length === 0;

  return (
    <div className="crtv-page-enter max-w-[1400px] mx-auto px-4 py-8 space-y-10">
      <div className="bg-transparent">
        <NewsTabs onFilterChange={fetchNews} />
      </div>

      <div className="space-y-12">
        {selectedArticle && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[color:var(--accent)] hover:opacity-70 transition-opacity"
            >
              <BackIcon />
              Retour News
            </button>
          </div>
        )}

        {mainLoading ? (
          <>
            <AdBanner />
            <NewsHeroShimmer />
            <NewsGridShimmer />
            <AdBanner />
          </>
        ) : (
          <>
            <AdBanner />

            {selectedArticle ? (
              <NewsDetailedLayout
                featuredItem={selectedArticle}
                sideItems={articles.filter(a => a.id !== selectedArticle.id).slice(0, 5)}
                onItemClick={handleArticleClick}
              />
            ) : isDetailedLayout ? (
              <NewsDetailedLayout
                featuredItem={articles[0]}
                sideItems={articles.slice(1, 6)}
                onItemClick={handleArticleClick}
              />
            ) : (
              <>
                <NewsHero items={heroItems} categoryName={activeCategoryName} onItemClick={handleArticleClick} />
                <NewsGrid
                  items={gridItems}
                  loadingMore={isValidating && articles.length > 0}
                  hasMore={articles.length >= visibleCount + 2}
                  onLoadMore={handleLoadMore}
                  title={t("moreOf")}
                  title2={t("newsTitle")}
                  onItemClick={handleArticleClick}
                />
              </>
            )}
          </>
        )}
        <AdBanner />
        {/* ... replays ... */}

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

export default function NewsPage() {
  return (
    <Suspense fallback={<NewsHeroShimmer />}>
      <NewsContent />
    </Suspense>
  );
}

