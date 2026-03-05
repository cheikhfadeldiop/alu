"use client";

import * as React from "react";
import { SliderVideoItem, getLatestAggregateReplays, getRelatedItems, mapVODToSliderItem } from "../../services/api";
import { SectionTitle } from "../ui/SectionTitle";
import { useTranslations } from "next-intl";
import { SafeImage } from "../ui/SafeImage";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatDate } from "@/utils/text";

interface RelatedReplaysGridProps {
    initialReplays: SliderVideoItem[];
    currentSlug?: string;
    relatedItemsUrl?: string;
}

export function RelatedReplaysGrid({ initialReplays, currentSlug, relatedItemsUrl }: RelatedReplaysGridProps) {
    const t = useTranslations("common");
    const router = useRouter();
    const [allReplays, setAllReplays] = React.useState<SliderVideoItem[]>(initialReplays);
    const [visibleCount, setVisibleCount] = React.useState(8);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasMoreToFetch, setHasMoreToFetch] = React.useState(true);

    // Filter out the current video if slug is provided
    const filteredReplays = React.useMemo(() => {
        if (!currentSlug) return allReplays;
        return allReplays.filter(video => video.slug !== currentSlug);
    }, [allReplays, currentSlug]);

    const handleLoadMore = async () => {
        // If we have more items to show from current data, just increase visible count
        if (visibleCount < filteredReplays.length) {
            setVisibleCount(prev => prev + 8);
            return;
        }

        // If we've shown all current items and there might be more to fetch
        if (hasMoreToFetch && !isLoading) {
            setIsLoading(true);
            try {
                let moreReplays: SliderVideoItem[] = [];

                if (relatedItemsUrl && relatedItemsUrl !== "null") {
                    // Try getting more for this specific show
                    const archives = await getRelatedItems(relatedItemsUrl).catch(() => []);
                    // In a real pagination scenario, we might need an offset, 
                    // but here we just deduplicate against what we have.
                    moreReplays = archives.map(item => mapVODToSliderItem(item));
                }

                // If we didn't get new ones or no show url, get global latest
                if (moreReplays.length === 0 || moreReplays.every(r => allReplays.some(existing => existing.slug === r.slug))) {
                    const globalLatest = await getLatestAggregateReplays();
                    moreReplays = [...moreReplays, ...globalLatest];
                }

                // Only add new replays that we don't already have
                const existingSlugs = new Set(allReplays.map(r => r.slug));
                const newReplays = moreReplays.filter(r => !existingSlugs.has(r.slug));

                if (newReplays.length > 0) {
                    setAllReplays(prev => [...prev, ...newReplays]);
                    setVisibleCount(prev => prev + 8);
                } else {
                    setHasMoreToFetch(false);
                }
            } catch (error) {
                console.error("Failed to load more replays:", error);
                setHasMoreToFetch(false);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleReplayClick = (slug: string) => {
        // Use replace instead of push to avoid navigation chain
        router.replace(`/replay/${slug}`);
    };

    if (filteredReplays.length === 0) return null;

    const showLoadMore = visibleCount < filteredReplays.length || (hasMoreToFetch && !isLoading);

    return (
        <section className="w-full max-w-[1400px] mx-auto px-4">
            <SectionTitle
                title="REPLAYS"
                title2=""
                actionIcon={true}
            />

            {/* 4x2 Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredReplays.slice(0, visibleCount).map((video, idx) => (
                    <ReplayCard
                        key={`${video.slug}-${idx}`}
                        video={video}
                        onClick={() => handleReplayClick(video.slug)}
                    />
                ))}
            </div>

            {/* Load More Button */}
            {showLoadMore && (
                <div className="flex justify-center pt-12">
                    <button
                        onClick={handleLoadMore}
                        disabled={isLoading}
                        className="group relative flex items-center justify-center  px-10 py-3 rounded-full border border-foreground/30 hover:border-red-500 transition-all duration-300  disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="text-sm font-bold uppercase tracking-[0.2em] group-hover:text-red-500 transition-colors">
                            {isLoading ? t("loading") || "Chargement..." : t("loadMore") || "Charger"}
                        </span>
                        {!isLoading && (
                            <svg className="w-4 h-4 text-foreground/30 group-hover:text-red-500 transition-colors" >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                            </svg>
                        )}
                    </button>
                </div>
            )}
        </section>
    );
}

interface ReplayCardProps {
    video: SliderVideoItem;
    onClick: () => void;
}

function ReplayCard({ video, onClick }: ReplayCardProps) {
    const channelLogo = video.channel_logo || video.chaine_logo;

    return (
        <button
            onClick={onClick}
            className="group block space-y-2 lg:space-y-4 hover:scale-105 transition-transform hover:z-10 text-left w-full"
        >
            <div className="relative aspect-video overflow-hidden rounded-sm bg-white/5 border border-white/5">
                <SafeImage
                    src={video.logo_url || video.logo}
                    alt={video.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />

                {/* Play Icon Overlay */}
                <div className="absolute bottom-2 left-2 lg:bottom-3 lg:left-3 z-20">
                    <Image
                        src="/assets/placeholders/play_overlay.png"
                        alt="Play"
                        width={24}
                        height={24}
                        className="lg:w-8 lg:h-8"
                    />
                </div>

                {/* Channel Logo */}
                {channelLogo && (
                    <div className="absolute top-3 right-3 z-20 w-12 h-8  transform group-hover:scale-110 transition-transform duration-500">
                        <SafeImage
                            src={channelLogo}
                            alt="Channel"
                            fill
                            className="object-contain"
                        />
                    </div>
                )}
            </div>

            {/* Text Content */}
            <div className="space-y-1 lg:space-y-2">
                <h4 className="font-bold text-[11px] lg:text-sm line-clamp-2 leading-tight lg:leading-snug transition-colors">
                    {video.title}
                </h4>

                {/* Metadata */}
                <div className="flex items-center justify-between w-full gap-1.5 lg:gap-3 text-[9px] lg:text-[10px] font-bold uppercase tracking-tight">
                    <span className="flex items-center gap-1 text-foreground/40">
                        <svg className="w-2.5 h-2.5 lg:w-3 lg:h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatDate(video.date)}
                    </span>
                    <span className="text-foreground/40">{formatDate(video.time)}</span>
                </div>
            </div>
        </button>
    );
}
