"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { WordPressPost } from "../../types/api";
import { SITE_CONFIG } from "@/constants/site-config";
import { SafeImage } from "../ui/SafeImage";
import { useWordPressNews } from "@/hooks/useData";

interface WordPressNewsSectionProps {
    alauneItems: WordPressPost[];
    trendingItems: WordPressPost[];
}

type TabType = "alaune" | "trending";

export function WordPressNewsSection({ alauneItems: initialAlaune, trendingItems: initialTrending }: WordPressNewsSectionProps) {
    const t = useTranslations("pages.home");
    const tn = useTranslations("pages.news");
    const [activeTab, setActiveTab] = useState<TabType>("alaune");

    // Use SWR for robust background refresh and instant cache delivery with fallback data
    const { data: alauneItems = initialAlaune } = useWordPressNews(
        SITE_CONFIG.categories.news.alaune,
        20,
        initialAlaune
    );
    const { data: trendingItems = initialTrending } = useWordPressNews(
        SITE_CONFIG.categories.news.trending,
        10,
        initialTrending
    );

    const currentItems = activeTab === "alaune" ? alauneItems : trendingItems;
    const featuredItem = currentItems[0];
    const listItems = currentItems.slice(1);

    const getImageUrl = (post: WordPressPost): string => {
        if (post.acan_image_url) return post.acan_image_url;
        if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
            return post._embedded['wp:featuredmedia'][0].source_url;
        }
        return SITE_CONFIG.theme.placeholders.news;
    };

    return (
        <section className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 rounded-lg">
                <div className="w-full lg:col-span-2">
                    {featuredItem && (
                        <Link
                            href={`/news?id=${featuredItem.id}`}
                            className="group relative block w-full h-[240px] sm:h-[400px] lg:h-[520px] rounded-lg overflow-hidden
                            hover:scale-[1.02] transition-all"
                        >
                            <div className="absolute inset-0">
                                <SafeImage
                                    src={getImageUrl(featuredItem)}
                                    alt={featuredItem.title.rendered}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    className="object-cover"
                                />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                                <h2 className="text-lg sm:text-xl font-bold leading-tight mb-2 sm:mb-3 ">
                                    {featuredItem.title.rendered}
                                </h2>
                                <div className="flex items-center gap-3 text-xs sm:text-sm text-white/90">
                                    <span>
                                        {new Date(featuredItem.date).toLocaleDateString("fr-FR", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric"
                                        })}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-[color:var(--success)]"></span>
                                    <span>{SITE_CONFIG.strings.editorialTeam}</span>
                                </div>
                            </div>
                        </Link>
                    )}
                </div>

                <div className="w-full border rounded-lg p-2 border-muted/20 sm:pl-4">
                    <div className="bg-surface w-full rounded-lg p-1 justify-between inline-flex mb-4">
                        <button
                            onClick={() => setActiveTab("alaune")}
                            className={`px-4 sm:px-6 py-2 w-1/2 rounded-md text-lg sm:text-xl font-medium transition-all ${activeTab === "alaune"
                                ? "bg-background dark:bg-background shadow-sm"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                }`}
                        >
                            {t("hero")}
                        </button>
                        <button
                            onClick={() => setActiveTab("trending")}
                            className={`px-4 sm:px-6 py-2 w-1/2 rounded-md text-lg sm:text-xl font-medium transition-all ${activeTab === "trending"
                                ? "bg-background dark:bg-background shadow-sm"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                }`}
                        >
                            {tn("trending")}
                        </button>
                    </div>

                    <div className="h-[300px] sm:h-[400px] lg:h-[440px]  overflow-y-auto pr-2 space-y-2 px-2
                    scrollbar-thin 
                        [&::-webkit-scrollbar]:w-1 
                        [&::-webkit-scrollbar-track]:bg-transparent 
                        [&::-webkit-scrollbar-thumb]:bg-[color:var(--accent)] 
                        [&::-webkit-scrollbar-thumb]:rounded-full 
                        hover:[&::-webkit-scrollbar-thumb]:bg-[color:var(--accent)]
                        
                    ">
                        {listItems.map((item) => (
                            <Link
                                key={item.id}
                                href={`/news?id=${item.id}`}
                                className="group flex gap-4 items-start hover:bg-muted/10  p-3  transition-colors
                                border-b dark:border-muted/30
                                hover:scale-[1.01] transition-all
                                "
                            >
                                <div className="relative w-24 h-20 flex-shrink-0 rounded overflow-hidden">
                                    <SafeImage
                                        src={getImageUrl(item)}
                                        alt={item.title.rendered}
                                        fill
                                        sizes="96px"
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0 space-x-2">
                                    <h3 className="text-sm font-semibold leading-snug line-clamp-3  mb-2">
                                        {item.title.rendered}
                                    </h3>
                                    <div className="flex items-center gap-5 text-xs text-gray-500 dark:text-gray-400">
                                        <span>
                                            {new Date(item.date).toLocaleDateString("fr-FR", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric"
                                            })}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-[color:var(--success)]"></span>
                                        <span>{SITE_CONFIG.strings.editorialTeam}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
