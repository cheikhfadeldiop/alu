"use client";

import * as React from "react";
import Image from "next/image";
import { Link } from "../../i18n/navigation";
import { SliderVideoItem } from "../../types/api";
import { SectionTitle } from "../ui/SectionTitle";
import { getRelatedItems } from "../../services/api";
import { useReplayFetcher } from "../../hooks/useReplayFetcher";

interface MissedAiringSectionProps {
    initialVideos: SliderVideoItem[];
    liveChannels?: import("../../types/api").LiveChannel[];
}

interface Block {
    type: "A" | "B"; // A: Big on left, B: Big on right (or other variations)
    videos: SliderVideoItem[];
}

export function MissedAiringSection({ initialVideos, liveChannels = [] }: MissedAiringSectionProps) {
    const [blocks, setBlocks] = React.useState<Block[]>([]);

    // We use the hook to manage the full list of available replays (initial + fetched)
    const { replays, loading, hasMore, loadMore: fetchMoreFromChannels } = useReplayFetcher(initialVideos, liveChannels, 3);

    // We keep track of how many items strictly from 'replays' we have shown in blocks
    const [shownCount, setShownCount] = React.useState(0);

    // Update blocks when 'replays' changes or when we ask for more
    React.useEffect(() => {
        // If we have more replays than currently shown, we should try to fill next blocks
        // But we want to do it only when specific actions happen or initialization
        if (shownCount === 0 && replays.length > 0) {
            // Initial load
            const firstBatch = replays.slice(0, 7);
            if (firstBatch.length > 0) {
                setBlocks([{ type: "A", videos: firstBatch }]);
                setShownCount(firstBatch.length);
            }
        }
    }, [replays, shownCount]);



    // Effect to handle "pending" load more actions? 
    // Actually simpler: 
    // If we click Load More, we check if we have enough. If not, fetch.
    // When fetch completes, 'replays' grows. 
    // We need a way to know "we wanted to show more".

    // Or even simpler:
    // Always try to have a buffer.

    // Let's stick to the user's "append" logic.

    const [isExpanding, setIsExpanding] = React.useState(false);

    React.useEffect(() => {
        if (isExpanding) {
            const remaining = replays.length - shownCount;
            if (remaining >= 7) {
                const nextBatch = replays.slice(shownCount, shownCount + 7);
                const types: ("A" | "B")[] = ["A", "B"];
                const randomType = types[Math.floor(Math.random() * types.length)];

                setBlocks(prev => [...prev, { type: randomType, videos: nextBatch }]);
                setShownCount(prev => prev + 7);
                setIsExpanding(false);
            } else if (!hasMore && remaining > 0) {
                // Show what's left if no more channels
                // But maybe 7 is strict? User said "append 7".
                // Let's strict for now or show smaller block.
                // For now, only show full blocks of 7 to maintain grid.
                setIsExpanding(false);
            } else if (!hasMore && remaining === 0) {
                setIsExpanding(false);
            }
        }
    }, [replays, shownCount, isExpanding, hasMore]);


    const onTriggerLoadMore = async () => {
        setIsExpanding(true);
        const remaining = replays.length - shownCount;
        if (remaining < 7 && hasMore) {
            await fetchMoreFromChannels();
        }
    };

    if (blocks.length === 0) return null;

    return (
        <section className=" w-full max-w-[1400px] mx-auto px-4 ">
            <SectionTitle title="Ce que vous avez raté" title2="à l'antenne" actionIcon={true} />

            <div className="space-y-16">
                {blocks.map((block, blockIdx) => (
                    <div key={blockIdx} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* ROW 1: 1 Big (2 cols) + 2 Small (1 col each) */}
                        {block.type === "A" ? (
                            <>
                                {/* Big Item Left */}
                                <div className="lg:col-span-2">
                                    {block.videos[0] && <BigCard video={block.videos[0]} />}
                                </div>
                                <div>{block.videos[1] && <SmallCard video={block.videos[1]} />}</div>
                                <div>{block.videos[2] && <SmallCard video={block.videos[2]} />}</div>
                            </>
                        ) : (
                            <>
                                {/* Big Item Right variation or shifted */}
                                <div>{block.videos[1] && <SmallCard video={block.videos[1]} />}</div>
                                <div>{block.videos[2] && <SmallCard video={block.videos[2]} />}</div>
                                <div className="lg:col-span-2">
                                    {block.videos[0] && <BigCard video={block.videos[0]} />}
                                </div>
                            </>
                        )}

                        {/* ROW 2: 4 Small Items */}
                        <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {block.videos.slice(3, 7).map((video, idx) => (
                                <SmallCard key={idx} video={video} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {(replays.length > shownCount || hasMore) && (
                <div className="flex justify-center pt-10">
                    <button
                        onClick={onTriggerLoadMore}
                        disabled={loading}
                        className="group relative flex items-center gap-1 px-10 py-2 rounded-full border border-gray-200 dark:border-white/10 hover:border-red-600 transition-all duration-300 bg-background/30 backdrop-blur-md shadow-sm hover:shadow-md disabled:opacity-50"
                    >
                        <span className="text-sm font-bold uppercase tracking-[0.2em] ">
                            {loading ? "Chargement..." : "Charger +"}
                        </span>
                    </button>
                </div>
            )}
        </section>
    );
}

function PlayIconCustom({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
    return (
        <Image src="/assets/placeholders/play_overlay.png" alt="Play" width={40} height={40} />
    )
}

function BigCard({ video }: { video: SliderVideoItem }) {
    const [imgSrc, setImgSrc] = React.useState(video.logo_url);
    const [channelLogoSrc, setChannelLogoSrc] = React.useState(video.channel_logo);

    React.useEffect(() => {
        setImgSrc(video.logo_url);
        setChannelLogoSrc(video.channel_logo);
    }, [video.logo_url, video.channel_logo]);

    return (
        <Link href={`/replay/${video.slug}`} className="group relative block aspect-video overflow-hidden rounded-sm hover:scale-105 transition-transform hover:z-10 ">
            <Image
                src={imgSrc || "/assets/logo/logo.png"}
                alt={video.title}
                fill
                className="object-cover transition-transform duration-700 "
                sizes="(max-width: 1024px) 100vw, 50vw"
                onError={() => setImgSrc("/assets/logo/logo.png")}
            />
            {/* Content Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

            {/* Play Icon Bottom Left */}
            <div className="absolute bottom-6 left-6 z-20">
                <PlayIconCustom size="md" />
            </div>

            {/* Channel Logo Bottom Right */}
            {channelLogoSrc && (
                <div className="absolute bottom-6 right-6 z-20 w-14 h-12 rounded-sm bg-background/30 backdrop-blur-md p-0.5 shadow-md">
                    <Image
                        src={channelLogoSrc}
                        alt="Channel"
                        width={40}
                        height={40}
                        className="w-full h-full object-contain"
                        onError={() => setChannelLogoSrc(undefined)}
                    />
                </div>
            )}

            {/* Content Area - Shifted to make room for icon */}
            <div className="absolute inset-x-0 bottom-0 p-6 pl-20 space-y-1 z-10">
                <h3 className="text-lg md:text-xl font-bold text-white line-clamp-2 leading-tight ">
                    {video.title}
                </h3>
                <div className="flex items-center gap-4 text-xs text-white/60 font-medium">
                    <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {video.time || "2min 27s"}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                        {video.date}
                    </span>
                </div>
            </div>
        </Link>
    );
}

function SmallCard({ video }: { video: SliderVideoItem }) {
    const [imgSrc, setImgSrc] = React.useState(video.logo_url);
    const [channelLogoSrc, setChannelLogoSrc] = React.useState(video.channel_logo);

    React.useEffect(() => {
        setImgSrc(video.logo_url);
        setChannelLogoSrc(video.channel_logo);
    }, [video.logo_url, video.channel_logo]);

    return (
        <Link href={`/replay/${video.slug}`} className="group block space-y-4 hover:scale-105 transition-transform hover:z-10 ">
            <div className="relative aspect-video overflow-hidden rounded-sm bg-white/5">
                <Image
                    src={imgSrc || "/assets/logo/logo.png"}
                    alt={video.title}
                    fill
                    className="object-cover transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    onError={() => setImgSrc("/assets/logo/logo.png")}
                />
                {/* Play Icon Bottom Left */}
                <div className="absolute bottom-3 left-3">
                    <PlayIconCustom size="sm" />
                </div>

                {/* Channel Logo Bottom Right */}
                {channelLogoSrc && (
                    <div className="absolute bottom-2 right-2 z-20 w-12 h-10 rounded-sm bg-background/30 backdrop-blur-md p-0.5 shadow-md">
                        <Image
                            src={channelLogoSrc}
                            alt="Channel"
                            width={38}
                            height={38}
                            className="w-full h-full object-contain"
                            onError={() => setChannelLogoSrc(undefined)}
                        />
                    </div>
                )}
            </div>

            <div className="space-y-2 justify-between">
                <h4 className="font-bold text-sm line-clamp-2 leading-snug">
                    {video.title}
                </h4>
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-tight">
                    <span className="flex items-center gap-1 text-foreground/40">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {video.time || "2min 27s"}
                    </span>
                    <span
                        className="w-2 h-2 rounded-full bg-gray-300"
                    ></span>
                    <span className="flex items-center gap-1 text-foreground/40">
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        {video.date}
                    </span>
                </div>
            </div>
        </Link>
    );
}
