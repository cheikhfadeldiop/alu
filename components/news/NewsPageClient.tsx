"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";

import { NewsTabs } from "./NewsTabs";
import { NewsGrid } from "./NewsGrid";
import { NewsDetailedLayout } from "./NewsDetailedLayout";
import { WordPressPost } from "../../types/api";
import {
    NewsHeroShimmer,
    NewsGridShimmer,
    NewsDetailShimmer
} from "@/components/ui/shimmer/NewsShimmers";
import { SITE_CONFIG } from "@/constants/site-config";
import { useWordPressNews, useWordPressPost } from "@/hooks/useData";
import { AdBanner } from "@/components/ui/AdBanner";
import { getPostAuthor } from "@/utils/text";
import { useEPGAll } from "@/hooks/useData";
import { PromoAntenne } from "../home/PromoAntenne";
import ArticlesGrid from "./voiraussi";

const BackIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
);

function PromoAntenneClient({ titre, showMetadata = false }: { titre?: string, showMetadata?: boolean }) {
    const { data: epgData = [], isLoading } = useEPGAll();

    if (isLoading) return null;

    // Flatten programs similar to UpcomingProgramsTimeline logic
    const allPrograms = epgData.flatMap(channel => {
        const { matin = [], soir = [] } = channel.subitems || {};
        return [...matin, ...soir].map(prog => ({
            ...prog,
            channelName: channel.titre,
            channelLogo: channel.logo
        }));
    }).toReversed().slice(0, 4);

    return (
        <PromoAntenne
            programs={allPrograms}
            title={titre || "PROMO D'ANTENNE"}
            showMetadata={showMetadata}
        />
    );
}

export function NewsPageClient() {
    const t = useTranslations("pages.news");
    const searchParams = useSearchParams();
    const router = useRouter();
    const idParam = searchParams.get("id");
    const slugParam = searchParams.get("slug");
    const articleIdentifier = slugParam || idParam;

    const [activeCategoryId, setActiveCategoryId] = useState<string | number>(SITE_CONFIG.categories.news.alaune);
    const [activeCategoryName, setActiveCategoryName] = useState("");
    const [visibleCount, setVisibleCount] = useState(17);
    const [selectedArticle, setSelectedArticle] = useState<WordPressPost | null>(null);
    const [isCategoryTransitioning, setIsCategoryTransitioning] = useState(false);

    const { data: routeArticle, isLoading: isPostLoading } = useWordPressPost(articleIdentifier || "");

    // Verify routeArticle matches current URL to avoid SWR keepPreviousData "ghosting"
    useEffect(() => {
        if (articleIdentifier) {
            if (routeArticle) {
                const matches =
                    routeArticle.slug === articleIdentifier ||
                    routeArticle.id.toString() === articleIdentifier;

                if (matches) {
                    setSelectedArticle(routeArticle);
                } else {
                    setSelectedArticle(null); // Identifier changed, clear old data to show shimmer
                }
            } else {
                // We have an identifier but no data yet
                setSelectedArticle(null);
            }
        } else {
            setSelectedArticle(null);
        }
    }, [routeArticle, articleIdentifier]);


    const isDetailedLayout = ["politique", "international", "société", "économie"].some(
        cat => activeCategoryName.toLowerCase().includes(cat)
    );

    const { data: articles = [], isLoading, isValidating, error } = useWordPressNews(
        activeCategoryId,
        isDetailedLayout ? 10 : visibleCount + 2
    );

    // ✅ RÉCUPÉRER LES DERNIERS ARTICLES "À LA UNE"
    const { data: latestArticles = [] } = useWordPressNews(
        SITE_CONFIG.categories.news.alaune,
        8
    );

    // Handle category transition state
    useEffect(() => {
        if (!isLoading && !isValidating) {
            setIsCategoryTransitioning(false);
        }
        if (error) {
            console.error("News Fetch Error:", error);
            setIsCategoryTransitioning(false);
        }
    }, [isLoading, isValidating, error]);

    const fetchNews = (categoryId: number | string, categoryName: string) => {
        setActiveCategoryId(categoryId);
        setActiveCategoryName(categoryName);
        setIsCategoryTransitioning(true); // Trigger shimmer
        setVisibleCount(9);
        setSelectedArticle(null);
        if (idParam || slugParam) router.push('/news', { scroll: false });
    };

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 8);
    };

    const handleArticleClick = (article: WordPressPost) => {
        setSelectedArticle(article);
        router.push(`/news?slug=${article.slug || article.id}`, { scroll: false });
    };

    const handleBack = () => {
        setSelectedArticle(null);
        router.push('/news', { scroll: false });
    };



    // ✅ TRANSFORMER LES ARTICLES POUR ArticlesGrid
    const transformedArticles = latestArticles
        .filter(article => article.id !== selectedArticle?.id)
        .slice(0, 8)
        .map(article => ({
            id: article.id.toString(),
            title: article.title.rendered,
            image: article.acan_image_url ||
                article._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
                '/assets/placeholders/news-placeholder.jpg',
            date: new Date(article.date).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            }),
            author: getPostAuthor(article),
            slug: article.slug,
        }));

    const gridItems = articles.slice(2);
    // Determine if we are strictly loading a new category
    const isCategoryLoading = isLoading && articles.length === 0;

    return (
        <div className="crtv-page-enter py-xxl space-y-xxl flex flex-col items-center">
            <div className="w-full">
                <NewsTabs onFilterChange={fetchNews} />
            </div>

            <div className="w-full space-y-xxl md:space-y-4xl">
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

                {/* 1. Main Banner (Always Visible) */}
                <AdBanner />

                {/* 2. Content Area with Surgical Shimmers */}
                {articleIdentifier ? (
                    // ── DETAIL VIEW LOADING ──
                    (!selectedArticle || isPostLoading && selectedArticle.slug !== articleIdentifier && selectedArticle.id.toString() !== articleIdentifier) ? (
                        <NewsDetailShimmer />
                    ) : (
                        <>
                            <NewsDetailedLayout
                                featuredItem={selectedArticle}
                                sideItems={articles.filter(a => a.id !== selectedArticle.id).slice(0, 5)}
                                onItemClick={handleArticleClick}
                            />

                            {/* ✅ AFFICHER LES DERNIERS ARTICLES */}
                            {transformedArticles.length > 0 && (
                                <ArticlesGrid
                                    title="VOIR AUSSI"
                                    articles={transformedArticles}
                                    onViewMore={() => router.push('/news')}
                                />
                            )}
                        </>
                    )
                ) : (
                    // ── CATEGORY VIEW LOADING ──
                    (isCategoryTransitioning || (isLoading && articles.length === 0)) && !error ? (
                        <>
                            <NewsHeroShimmer />
                            <NewsGridShimmer />
                        </>
                    ) : (
                        <>
                            {isDetailedLayout ? (
                                <>
                                    <NewsDetailedLayout
                                        featuredItem={articles[0]}
                                        sideItems={articles.slice(1, 6)}
                                        onItemClick={handleArticleClick}
                                    />
                                    <PromoAntenneClient
                                        titre="VOIR AUSSI"
                                        showMetadata={true}
                                    />
                                </>
                            ) : (
                                <>
                                    <NewsGrid
                                        items={gridItems}
                                        loadingMore={isValidating && articles.length > 0}
                                        hasMore={articles.length >= visibleCount + 2}
                                        onLoadMore={handleLoadMore}
                                        title={activeCategoryName || t("moreOf") + t("newsTitle")}
                                        title2=""
                                        onItemClick={handleArticleClick}
                                    />
                                    <AdBanner />
                                </>
                            )}
                        </>
                    )
                )}

                {articles.length === 0 && !isLoading && (
                    <div className="py-6xl text-center space-y-2xl">
                        <div className="text-6xl opacity-10">📰</div>
                        <p className="b1 font-medium text-muted max-w-md mx-auto">
                            {t("noArticles")}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}