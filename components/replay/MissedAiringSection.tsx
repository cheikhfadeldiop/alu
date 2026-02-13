"use client";

import * as React from "react";
import Image from "next/image";
import { Link } from "../../i18n/navigation";
import { SliderVideoItem } from "../../types/api";
import { SectionTitle } from "../ui/SectionTitle";
import { useReplayFetcher } from "../../hooks/useReplayFetcher";
import { useTranslations } from "next-intl";
import { SafeImage } from "../ui/SafeImage";

interface MissedAiringSectionProps {
    initialVideos: SliderVideoItem[];
    liveChannels?: import("../../types/api").LiveChannel[];
}

interface Block {
    type: "A" | "B";
    videos: SliderVideoItem[];
}

export function MissedAiringSection({ initialVideos, liveChannels = [] }: MissedAiringSectionProps) {
    const t = useTranslations("common");
    const [blocks, setBlocks] = React.useState<Block[]>([]);
    const { replays, loading, hasMore, loadMore: fetchMoreFromChannels } = useReplayFetcher(initialVideos, liveChannels, 3);
    const [shownCount, setShownCount] = React.useState(0);

    React.useEffect(() => {
        if (shownCount === 0 && replays.length > 0) {
            const firstBatch = replays.slice(0, 7);
            if (firstBatch.length > 0) {
                setBlocks([{ type: "A", videos: firstBatch }]);
                setShownCount(firstBatch.length);
            }
        }
    }, [replays, shownCount]);

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
            } else {
                setIsExpanding(false);
            }
        }
    }, [replays, shownCount, isExpanding]);

    const onTriggerLoadMore = async () => {
        setIsExpanding(true);
        if (replays.length - shownCount < 7 && hasMore) {
            await fetchMoreFromChannels();
        }
    };

    if (blocks.length === 0) return null;

    return (
        <section className=" w-full max-w-[1400px] mx-auto px-4 ">
            <SectionTitle title={t("missed")} title2={t("onAir")} actionIcon={true} />
            <div className="space-y-16">
                {blocks.map((block, blockIdx) => (
                    <div key={blockIdx} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {block.type === "A" ? (
                            <>
                                <div className="lg:col-span-2">{block.videos[0] && <BigCard video={block.videos[0]} />}</div>
                                <div>{block.videos[1] && <SmallCard video={block.videos[1]} />}</div>
                                <div>{block.videos[2] && <SmallCard video={block.videos[2]} />}</div>
                            </>
                        ) : (
                            <>
                                <div>{block.videos[1] && <SmallCard video={block.videos[1]} />}</div>
                                <div>{block.videos[2] && <SmallCard video={block.videos[2]} />}</div>
                                <div className="lg:col-span-2">{block.videos[0] && <BigCard video={block.videos[0]} />}</div>
                            </>
                        )}
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
                    <button onClick={onTriggerLoadMore} disabled={loading} className="group relative flex items-center gap-1 px-10 py-2 rounded-full border border-gray-200 dark:border-white/10 hover:border-red-600 transition-all duration-300 bg-background/30 backdrop-blur-md shadow-sm hover:shadow-md disabled:opacity-50">
                        <span className="text-sm font-bold uppercase tracking-[0.2em] ">{loading ? t("loading") : t("loadMore")}</span>
                    </button>
                </div>
            )}
        </section>
    );
}

function BigCard({ video }: { video: SliderVideoItem }) {
    const channelLogo = video.channel_logo;
    return (
        <Link href={`/replay/${video.slug}`} className="group relative block aspect-video overflow-hidden rounded-sm hover:scale-105 transition-transform hover:z-10 ">
            <SafeImage src={video.logo_url || video.logo} alt={video.title} fill className="object-cover transition-transform duration-700 " sizes="(max-width: 1024px) 100vw, 50vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 z-20">
                <Image src="/assets/placeholders/play_overlay.png" alt="Play" width={40} height={40} />
            </div>
            {channelLogo && (
                <div className="absolute bottom-6 right-6 z-20 w-14 h-12 rounded-sm bg-background/30 backdrop-blur-md p-0.5 shadow-md">
                    <SafeImage src={channelLogo} alt="Channel" fill className="object-contain" />
                </div>
            )}
            <div className="absolute inset-x-0 bottom-0 p-6 pl-20 space-y-1 z-10">
                <h3 className="text-lg md:text-xl font-bold text-white line-clamp-2 leading-tight ">{video.title}</h3>
                <div className="flex items-center gap-4 text-xs text-white/60 font-medium">
                    <span className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{video.time || "2min 27s"}</span>
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-white/40" />{video.date}</span>
                </div>
            </div>
        </Link>
    );
}

function SmallCard({ video }: { video: SliderVideoItem }) {
    const channelLogo = video.channel_logo;
    return (
        <Link href={`/replay/${video.slug}`} className="group block space-y-4 hover:scale-105 transition-transform hover:z-10 ">
            <div className="relative aspect-video overflow-hidden rounded-sm bg-white/5">
                <SafeImage src={video.logo_url || video.logo} alt={video.title} fill className="object-cover transition-transform duration-500" sizes="(max-width: 768px) 100vw, 50vw" />
                <div className="absolute bottom-3 left-3">
                    <Image src="/assets/placeholders/play_overlay.png" alt="Play" width={32} height={32} />
                </div>
                {channelLogo && (
                    <div className="absolute bottom-2 right-2 z-20 w-12 h-10 rounded-sm bg-background/30 backdrop-blur-md p-0.5 shadow-md">
                        <SafeImage src={channelLogo} alt="Channel" fill className="object-contain" />
                    </div>
                )}
            </div>
            <div className="space-y-2 justify-between">
                <h4 className="font-bold text-sm line-clamp-2 leading-snug">{video.title}</h4>
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-tight">
                    <span className="flex items-center gap-1 text-foreground/40"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{video.time || "2min 27s"}</span>
                    <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                    <span className="flex items-center gap-1 text-foreground/40"><span className="w-1 h-1 rounded-full bg-white/20" />{video.date}</span>
                </div>
            </div>
        </Link>
    );
}
