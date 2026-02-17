import * as React from "react";
import { WordPressPost } from "../../types/api";
import { MediaCard } from "../ui/MediaCard";
import { SectionTitle } from "../ui/SectionTitle";
import { decodeHtmlEntities } from "../../utils/text";

interface NewsGridProps {
    items: WordPressPost[];
    loadingMore: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    title?: string;
    title2?: string;
    onItemClick?: (item: WordPressPost) => void;
}

import { useTranslations } from "next-intl";

export function NewsGrid({
    items,
    loadingMore,
    hasMore,
    onLoadMore,
    title = "plus d'",
    title2 = "ACTUELLES",
    onItemClick,
}: NewsGridProps) {
    const t = useTranslations("common");
    const getImageUrl = (post: WordPressPost) => {
        return post.acan_image_url ||
            post._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
            "/assets/placeholders/news_wide.png";
    };

    if (items.length === 0) return null;

    return (
        <section className="space-y-6 pt-6 border-t-2 border-transparent dark:border-white/5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {items.map((a) => (
                    <MediaCard
                        key={a.id}
                        href={`/news?id=${a.id}`}
                        target={false}
                        title={decodeHtmlEntities(a.title.rendered)}
                        imageSrc={getImageUrl(a)}
                        meta={`${new Date(a.date).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })}`}
                        aspect="16/9"
                        showPlayIcon={false}
                        onClick={onItemClick ? () => onItemClick(a) : undefined}
                    />
                ))}
            </div>
            {/* ... load more ... */}

            {hasMore && (
                <div className="flex justify-center pt-12">
                    <button
                        onClick={onLoadMore}
                        disabled={loadingMore}
                        className="group relative flex items-center gap-1 px-10 py-2 rounded-full border border-gray-200 dark:border-white/10 hover:border-[color:var(--accent)] transition-all duration-300 bg-background/30 backdrop-blur-md shadow-sm hover:shadow-md disabled:opacity-50"
                    >
                        <span className="text-sm  uppercase tracking-[0.2em] group-hover:text-[color:var(--accent)] transition-colors">
                            {loadingMore ? t("loading") : t("loadMore")}
                        </span>

                    </button>
                </div>
            )}
        </section>
    );
}
