"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { WordPressPost } from "../../types/api";

interface WordPressNewsSectionProps {
    alauneItems: WordPressPost[];
    trendingItems: WordPressPost[];
}

type TabType = "alaune" | "trending";

export function WordPressNewsSection({ alauneItems, trendingItems }: WordPressNewsSectionProps) {
    const [activeTab, setActiveTab] = useState<TabType>("alaune");

    const currentItems = activeTab === "alaune" ? alauneItems : trendingItems;
    const featuredItem = currentItems[0];
    const listItems = currentItems.slice(1); // Display all remaining articles (up to 19)

    // Helper function to get image URL from WordPress post
    const getImageUrl = (post: WordPressPost): string => {
        if (post.acan_image_url) {
            return post.acan_image_url;
        }
        if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
            return post._embedded['wp:featuredmedia'][0].source_url;
        }
        return "/assets/placeholders/actu_regional_469x246.png";
    };

    // Helper function to strip HTML tags from excerpt
    const stripHtml = (html: string): string => {
        return html.replace(/<[^>]*>/g, '').replace(/&hellip;/g, '...');
    };

    return (
        <section className="w-full">
            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Side - Featured Article */}
                <div className="w-full col-span-2">
                    {featuredItem && (
                        <Link
                            href={featuredItem.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative block w-full h-[520px] rounded-lg overflow-hidden"
                        >
                            {/* Image */}
                            <div className="absolute inset-0">
                                <Image
                                    src={getImageUrl(featuredItem)}
                                    alt={featuredItem.title.rendered}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    className="object-cover"
                                />
                            </div>

                            {/* Dark gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                <h2 className="text-xl font-bold leading-tight mb-3 group-hover:underline">
                                    {featuredItem.title.rendered}
                                </h2>

                                <div className="flex items-center gap-3 text-sm text-white/90">
                                    <span>
                                        {new Date(featuredItem.date).toLocaleDateString("fr-FR", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric"
                                        })}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-green-500"></span>
                                    <span>La rédaction</span>
                                </div>
                            </div>
                        </Link>
                    )}
                </div>

                {/* Right Side - Tabs + Articles List */}
                <div className="w-full border rounded-lg p-2 border-muted/20 pl-4">
                    {/* Tabs Container - Rectangular Frame */}
                    <div className="bg-surface w-full rounded-lg p-1 justify-between inline-flex mb-4">
                        <button
                            onClick={() => setActiveTab("alaune")}
                            className={`px-6 py-2 w-1/2 rounded-md text-xl font-medium transition-all ${activeTab === "alaune"
                                ? "bg-background dark:bg-background shadow-sm"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                }`}
                        >
                            À la une
                        </button>
                        <button
                            onClick={() => setActiveTab("trending")}
                            className={`px-6 py-2 w-1/2 rounded-md text-xl font-medium transition-all ${activeTab === "trending"
                                ? "bg-background dark:bg-background shadow-sm"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                }`}
                        >
                            Trending news
                        </button>
                    </div>

                    {/* Articles List - Scrollable with visible indicator */}
                    <div className="h-[440px]  overflow-y-auto pr-2 space-y-2 
                    scrollbar-thin 
                        [&::-webkit-scrollbar]:w-1 
                        [&::-webkit-scrollbar-track]:bg-transparent 
                        [&::-webkit-scrollbar-thumb]:bg-red-600 
                        [&::-webkit-scrollbar-thumb]:rounded-full 
                        hover:[&::-webkit-scrollbar-thumb]:bg-red-400
                    ">
                        {listItems.map((item) => (
                            <Link
                                key={item.id}
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex gap-4 items-start hover:bg-muted/10  p-3 rounded-lg transition-colors"
                            >
                                {/* Thumbnail */}
                                <div className="relative w-24 h-20 flex-shrink-0 rounded overflow-hidden">
                                    <Image
                                        src={getImageUrl(item)}
                                        alt={item.title.rendered}
                                        fill
                                        sizes="96px"
                                        className="object-cover"
                                    />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 space-x-2">
                                    <h3 className="text-sm font-semibold leading-snug line-clamp-3 group-hover:underline mb-2">
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
                                        <span className="w-1 h-1 rounded-full bg-green-500"></span>
                                        <span>La rédaction</span>
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
