"use client";

import * as React from "react";
import { WordPressPost } from "../../types/api";
import { SectionTitle } from "../ui/SectionTitle";
import { useTranslations } from "next-intl";
import { getWordPressLatestPosts } from "../../services/api";
import { AdBannerV } from "../ui/AdBannerV";
import { AdBanner } from "../ui/AdBanner";
import { Link } from "@/i18n/navigation";

interface CorporateNewsPageClientProps {
    initialPosts: WordPressPost[];
}

export function CorporateNewsPageClient({ initialPosts }: CorporateNewsPageClientProps) {
    const t = useTranslations("common");
    const tNav = useTranslations("nav");
    const [posts, setPosts] = React.useState<WordPressPost[]>(initialPosts);
    const [page, setPage] = React.useState(1);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasMore, setHasMore] = React.useState(initialPosts.length >= 9);

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

    return (
        <div className="max-w-[1400px] mx-auto px-4 py-12 space-y-12">
            {/* Ad Banner - 30% */}
            <div className="">
                <div className="sticky top-24 w-full">
                    <AdBanner />
                </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Content - 70% */}
                <div className=" space-y-8">
                    <SectionTitle
                        title={tNav("corporate") || "Corporate news"}
                        title2=""
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/news?id=${post.id}`}
                                className="group backdrop-blur-sm bg-background/30 border border-gray-100 dark:border-muted/30 rounded-2xl p-8 flex flex-col h-full hover:shadow-xl hover:border-[color:var(--accent)]/20 transition-all duration-300"
                            >
                                {/* Communiqué Label */}
                                <div className="text-[color:var(--accent)] text-xs font-black uppercase tracking-widest mb-4">
                                    {t("pressRelease")}
                                </div>

                                {/* Title */}
                                <h3 className="text-lg font-bold leading-tight mb-4 group-hover:text-[color:var(--accent)] transition-colors line-clamp-3">
                                    {post.title.rendered}
                                </h3>

                                {/* Excerpt */}
                                <div
                                    className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow"
                                    dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                                />

                                {/* Link */}
                                <div className="mt-auto flex items-center gap-2 text-sm font-bold text-foreground group-hover:gap-3 transition-all">
                                    <span>{t("readRelease")}</span>
                                    <span className="text-[color:var(--accent)]">→</span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {hasMore && (
                        <div className="flex justify-center pt-8">
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
            </div>
        </div>
    );
}
