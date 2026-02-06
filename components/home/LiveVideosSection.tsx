"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LiveChannel } from "../../types/api";

interface LiveVideosSectionProps {
    tvChannels: LiveChannel[];
    radioChannels: LiveChannel[];
}

type TabType = "tv" | "radio";

export function LiveVideosSection({ tvChannels, radioChannels }: LiveVideosSectionProps) {
    const [activeTab, setActiveTab] = useState<TabType>("tv");

    const currentItems = activeTab === "tv" ? tvChannels : radioChannels;
    const featuredItem = currentItems[0];
    const listItems = currentItems.slice(1); // Display all remaining items

    // Helper function to get image URL from live channel
    const getImageUrl = (channel: LiveChannel): string => {
        if (channel.affiche_url) {
            return channel.affiche_url;
        }
        if (channel.logo_url) {
            return channel.logo_url;
        }
        if (channel.logo) {
            return channel.logo;
        }
        return "/assets/placeholders/actu_regional_469x246.png";
    };

    return (
        <section className="w-full">
            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Side - Featured Channel */}
                <div className="w-full col-span-2">
                    {featuredItem && (
                        <Link
                            href={`/live/${featuredItem.slug}`}
                            className="group relative block w-full h-[520px] rounded-lg overflow-hidden"
                        >
                            {/* Image */}
                            <div className="absolute inset-0">
                                <Image
                                    src={getImageUrl(featuredItem)}
                                    alt={featuredItem.title}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    className="object-cover"
                                />
                            </div>

                            {/* Dark gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                            {/* Live Badge */}
                            <div className="absolute top-4 left-4">
                                <div className="flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-md">
                                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                                    <span className="text-white text-xs font-bold uppercase">En Direct</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                <h2 className="text-xl font-bold leading-tight mb-3 group-hover:underline">
                                    {featuredItem.title}
                                </h2>

                                <div className="flex items-center gap-3 text-sm text-white/90">
                                    <span>{activeTab === "tv" ? "Chaîne TV" : "Radio"}</span>
                                    <span className="w-1 h-1 rounded-full bg-green-500"></span>
                                    <span>{featuredItem.desc || "En direct"}</span>
                                </div>
                            </div>
                        </Link>
                    )}
                </div>

                {/* Right Side - Tabs + Channels List */}
                <div className="w-full border rounded-lg p-2 border-muted/20 pl-4">
                    {/* Tabs Container - Rectangular Frame */}
                    <div className="bg-surface w-full rounded-lg p-1 justify-between inline-flex mb-4">
                        <button
                            onClick={() => setActiveTab("tv")}
                            className={`px-6 py-2 w-1/2 rounded-md text-xl font-medium transition-all ${activeTab === "tv"
                                    ? "bg-background dark:bg-background shadow-sm"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                }`}
                        >
                            TV
                        </button>
                        <button
                            onClick={() => setActiveTab("radio")}
                            className={`px-6 py-2 w-1/2 rounded-md text-xl font-medium transition-all ${activeTab === "radio"
                                    ? "bg-background dark:bg-background shadow-sm"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                }`}
                        >
                            Radio
                        </button>
                    </div>

                    {/* Channels List - Scrollable with visible indicator */}
                    <div className="h-[440px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-800 dark:scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-track-gray-800 hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500">
                        {listItems.map((item) => (
                            <Link
                                key={item.id}
                                href={`/live/${item.slug}`}
                                className="group flex gap-4 items-start hover:bg-muted/10 p-3 rounded-lg transition-colors"
                            >
                                {/* Thumbnail */}
                                <div className="relative w-24 h-20 flex-shrink-0 rounded overflow-hidden">
                                    <Image
                                        src={getImageUrl(item)}
                                        alt={item.title}
                                        fill
                                        sizes="96px"
                                        className="object-cover"
                                    />
                                    {/* Live indicator on thumbnail */}
                                    <div className="absolute top-1 right-1 bg-red-600 px-1.5 py-0.5 rounded text-[10px] font-bold text-white">
                                        LIVE
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 space-x-2">
                                    <h3 className="text-sm font-semibold leading-snug line-clamp-3 group-hover:underline mb-2">
                                        {item.title}
                                    </h3>

                                    <div className="flex items-center gap-5 text-xs text-gray-500 dark:text-gray-400">
                                        <span>{activeTab === "tv" ? "Chaîne TV" : "Radio"}</span>
                                        <span className="w-1 h-1 rounded-full bg-green-500"></span>
                                        <span>En direct</span>
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
