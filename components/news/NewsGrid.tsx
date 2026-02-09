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
}

export function NewsGrid({
    items,
    loadingMore,
    hasMore,
    onLoadMore,
    title = "plus d'",
    title2 = "ACTUELLES",
}: NewsGridProps) {
    // Helper to get image URL (duplicated from page for autonomy, or could be moved to utils)
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
                        href={a.link}
                        title={decodeHtmlEntities(a.title.rendered)}
                        imageSrc={getImageUrl(a)}
                        meta={`${new Date(a.date).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })}`}
                        aspect="16/9"
                        showPlayIcon={false}
                    />
                ))}
            </div>

            {hasMore && (
                <div className="flex justify-center pt-12">
                    <button
                        onClick={onLoadMore}
                        disabled={loadingMore}
                        className="group relative flex items-center gap-1 px-10 py-2 rounded-full border border-gray-200 dark:border-white/10 hover:border-red-600 transition-all duration-300 bg-white dark:bg-transparent shadow-sm hover:shadow-md disabled:opacity-50"
                    >
                        <span className="text-sm font-bold uppercase tracking-[0.2em] group-hover:text-red-600 transition-colors">
                            {loadingMore ? "Chargement..." : "Charger +"}
                        </span>
                        {!loadingMore && (
                            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse group-hover:scale-125 transition-transform" />
                        )}
                    </button>
                </div>
            )}
        </section>
    );
}
