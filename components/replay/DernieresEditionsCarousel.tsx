"use client";

import * as React from "react";
import { SliderVideoItem } from "../../types/api";
import { MediaCard } from "../ui/MediaCard";
import { SectionTitle } from "../ui/SectionTitle";
import { useReplayFetcher } from "../../hooks/useReplayFetcher";
import { useTranslations } from "next-intl";

interface DernieresEditionsCarouselProps {
    videos: SliderVideoItem[];
}

export function DernieresEditionsCarousel({ videos: initialVideos, liveChannels = [] }: { videos: SliderVideoItem[], liveChannels?: import("../../types/api").LiveChannel[] }) {
    const t = useTranslations();
    const scrollerRef = React.useRef<HTMLDivElement | null>(null);
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [isPaused, setIsPaused] = React.useState(false);
    const [scrollProgress, setScrollProgress] = React.useState(0);

    const { replays: videos, loading, hasMore, loadMore } = useReplayFetcher(initialVideos, liveChannels, 3);

    const scrollBy = (direction: 'left' | 'right') => {
        const el = scrollerRef.current;
        if (!el) return;

        const scrollAmount = el.offsetWidth * 0.8;
        el.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: "smooth"
        });
    };

    // Auto-slide logic: Increment by 1 item
    React.useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            const el = scrollerRef.current;
            if (!el) return;

            const items = el.children;
            if (items.length > 0) {
                const firstItem = items[0] as HTMLElement;
                const gap = 24; // gap-6
                const itemWidth = firstItem.offsetWidth + gap;

                if (el.scrollLeft + el.offsetWidth >= el.scrollWidth - 10) {
                    if (hasMore) {
                        loadMore();
                    } else {
                        el.scrollTo({ left: 0, behavior: "smooth" });
                    }
                } else {
                    el.scrollBy({ left: itemWidth, behavior: "smooth" });
                }
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [isPaused, hasMore, loadMore]);

    // Handle scroll to update progress
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        const maxScroll = el.scrollWidth - el.offsetWidth;
        const progress = maxScroll > 0 ? el.scrollLeft / maxScroll : 0;
        setScrollProgress(progress);

        // Load more when reaching end
        if (progress > 0.7 && hasMore && !loading) {
            console.log("Carousel reached end, loading more...");
            loadMore();
        }

        // Update active index for other potential uses
        const newIndex = Math.round(progress * (videos.length - 1));
        setActiveIndex(newIndex);
    };

    if (!videos || videos.length === 0) return null;

    return (
        <section
            className="space-y-6 w-full "
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="max-w-[1400px] mx-auto px-4">
                <SectionTitle
                    title={t("pages.replay.latest")}
                    title2={t("pages.replay.editions")}
                    actionIcon={true}
                />
            </div>

            <div className="relative group w-full ">
                {/* Navigation Buttons */}
                <button
                    onClick={() => scrollBy('left')}
                    className="absolute left-6 top-[35%] -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[color:var(--accent)] hover:scale-110"
                    aria-label="Previous"
                >
                    <span className="text-2xl text-white">‹</span>
                </button>
                <button
                    onClick={() => scrollBy('right')}
                    className="absolute right-6 top-[35%] -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[color:var(--accent)] hover:scale-110"
                    aria-label="Next"
                >
                    <span className="text-2xl text-white">›</span>
                </button>

                {/* Scroller */}
                <div
                    ref={scrollerRef}
                    onScroll={handleScroll}
                    className="flex gap-6 overflow-x-auto pb-10 px-4 md:px-[calc((100vw-1400px)/2+1rem)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
                    style={{
                        scrollSnapType: "x mandatory",
                    }}
                >
                    {videos.map((video: SliderVideoItem, idx: number) => (
                        <div
                            key={`${video.slug}-${idx}`}
                            className="shrink-0 w-[240px] sm:w-[320px] lg:w-[400px]"
                            style={{ scrollSnapAlign: "start" }}
                        >
                            <MediaCard
                                href={`/replay/${video.slug}`}
                                title={video.title}
                                imageSrc={video.logo_url}
                                meta={`${video.date} • ${video.time || 'Replay'}`}
                                aspect="16/9"
                                showPlayIcon
                                channelLogo={video.channel_logo}
                            />
                        </div>
                    ))}
                </div>

                {/* Progress Bar Indicator: 20% width background, moving red bar */}
                <div className="flex justify-center mt-8">
                    <div className="w-1/5 min-w-[150px] h-[2px] bg-foreground/10 relative rounded-full overflow-hidden">
                        <div
                            className="absolute top-0 left-0 h-full bg-[color:var(--accent)] transition-all duration-150 rounded-full"
                            style={{
                                left: `${scrollProgress * 80}%`, // Moves within the 80% remaining space
                                width: '20%'
                            }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
