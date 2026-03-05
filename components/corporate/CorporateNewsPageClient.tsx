"use client";

import * as React from "react";
import { WordPressPost } from "../../types/api";
import { SectionTitle } from "../ui/SectionTitle";
import { useTranslations } from "next-intl";
import { getWordPressLatestPosts, getWordPressPost } from "../../services/api";
import { AdBanner } from "../ui/AdBanner";
import { Link } from "@/i18n/navigation";
import { useSearchParams, useRouter } from "next/navigation";
import { CorporateNewsDetail } from "./CorporateNewsDetail";
import { CorporatePageShimmer } from "../ui/shimmer/CorporateShimmer";

interface CorporateNewsPageClientProps {
    initialPosts: WordPressPost[];
}

export function CorporateNewsPageClient({ initialPosts }: CorporateNewsPageClientProps) {
    const t = useTranslations("common");
    const tNav = useTranslations("nav");
    const searchParams = useSearchParams();
    const router = useRouter();
    const idParam = searchParams.get("id");
    const slugParam = searchParams.get("slug");

    const [posts, setPosts] = React.useState<WordPressPost[]>(initialPosts);
    const [page, setPage] = React.useState(1);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasMore, setHasMore] = React.useState(initialPosts.length >= 9);
    const [selectedArticle, setSelectedArticle] = React.useState<WordPressPost | null>(null);
    const [isArticleLoading, setIsArticleLoading] = React.useState(false);

    const articleIdentifier = slugParam || idParam;

    // Initial load of article from identifier (ID or Slug)
    React.useEffect(() => {
        const fetchArticle = async (identifier: string) => {
            setIsArticleLoading(true);
            try {
                // Use the new robust getWordPressPost function
                const article = await getWordPressPost(identifier);
                setSelectedArticle(article);
            } catch (error) {
                console.error("Failed to fetch corporate article:", error);
            } finally {
                setIsArticleLoading(false);
            }
        };

        if (articleIdentifier) {
            fetchArticle(articleIdentifier);
        } else {
            setSelectedArticle(null);
        }
    }, [articleIdentifier]);

    const handleLoadMore = async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        try {
            const nextTotal = posts.length + 6;
            const allPosts = await getWordPressLatestPosts(nextTotal).catch(() => []);

            if (allPosts.length <= posts.length) {
                setHasMore(false);
            } else {
                setPosts(allPosts);
                setPage(page + 1);
                if (allPosts.length < nextTotal) setHasMore(false);
            }
        } catch (error) {
            console.error("Failed to load more corporate news:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        setSelectedArticle(null);
        router.push("/corporate", { scroll: false });
    };

    const mainLoading = isArticleLoading && !selectedArticle;

    if (selectedArticle) {
        return (
            <div className={`py-xxl md:py-4xl transition-opacity duration-300 ${isArticleLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <CorporateNewsDetail
                    article={selectedArticle}
                    relatedPosts={initialPosts}
                    onBack={handleBack}
                />
            </div>
        );
    }

    return (
        <div className="py-xxl md:py-4xl space-y-xxl md:space-y-4xl">
            {/* Ad Banner - Top (Always Visible) */}
            <div className="w-full">
                <AdBanner />
            </div>

            {mainLoading ? (
                <CorporatePageShimmer />
            ) : selectedArticle ? (
                <div className={`transition-opacity duration-300 ${isArticleLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <CorporateNewsDetail
                        article={selectedArticle}
                        relatedPosts={posts}
                        onBack={handleBack}
                    />
                </div>
            ) : (
                <div className="space-y-8">
                    <SectionTitle
                        title={tNav("corporate") || "Corporate news"}
                        title2=""
                        actionIcon={false}
                    />

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-l lg:gap-2xl">
                        {posts.map((post) => (
                            <Link
                                key={post.slug}
                                href={`/corporate?slug=${post.slug}`}
                                className="group backdrop-blur-sm bg-background/30 border border-muted/10  rounded-2xl p-l sm:p-xxl flex flex-col h-full hover:shadow-xl hover:border-[color:var(--accent)]/20 transition-all duration-300"
                            >
                                {/* Communiqué Label */}
                                <div className="text-[color:var(--accent)] text-[9px] sm:text-xs font-black uppercase tracking-widest mb-2 sm:mb-4">
                                    {t("pressRelease")}
                                </div>

                                {/* Title */}
                                <h3 className="text-sm sm:text-lg font-bold leading-tight mb-2 sm:mb-4 group-hover:text-[color:var(--accent)] transition-colors line-clamp-3">
                                    {post.title.rendered}
                                </h3>

                                {/* Excerpt */}
                                <div
                                    className="text-muted  text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 line-clamp-2 md:line-clamp-3 flex-grow"
                                    dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                                />

                                {/* Link */}
                                <div className="mt-auto flex items-center gap-2 text-[10px] sm:text-sm font-bold text-foreground group-hover:gap-3 transition-all">
                                    <span>{t("readRelease")}</span>
                                    <span className="text-[color:var(--accent)]">→</span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {hasMore && (
                        <div className="flex justify-center pt-xxl">
                            <button
                                onClick={handleLoadMore}
                                disabled={isLoading}
                                className="group relative flex items-center justify-center px-10 py-3 rounded-full border border-foreground/30 hover:border-[color:var(--accent)] transition-all duration-300 disabled:opacity-50"
                            >
                                <span className="text-sm font-bold uppercase tracking-[0.2em] group-hover:text-[color:var(--accent)] transition-colors">
                                    {isLoading ? t("loading") : "Charger +"}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

