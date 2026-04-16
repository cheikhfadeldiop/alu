"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LiveChannel, EPGItem, FullEPGChannel, AODItem, SliderVideoItem } from "../../types/api";
import { Link } from "@/i18n/navigation";
import { SafeImage } from "../ui/SafeImage";
import { AdBannerH, AdBannerHD } from "../ui/AdBanner";
import { LivePlayerSection } from "./LivePlayerSection";
import { formatDate, parseToDate } from "@/utils/text";
import { SITE_CONFIG } from "@/constants/site-config";

interface LivePageClientProps {
    initialChannels: LiveChannel[];
    initialChannelVideos: SliderVideoItem[];
    epgData: EPGItem[];
    fullEpg: FullEPGChannel[];
    aodItems: AODItem[];
}

function displayTime(date?: string, fallbackTime?: string) {
    if (fallbackTime && fallbackTime.trim()) return fallbackTime;
    const parsed = parseToDate(date);
    if (!parsed) return "--:--";
    return parsed.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function LivePageClient({ initialChannels, initialChannelVideos, epgData, fullEpg, aodItems: _aodItems }: LivePageClientProps) {
    const searchParams = useSearchParams();
    const channelParam = searchParams.get('channel');
    const [visibleLatestCount, setVisibleLatestCount] = useState(8);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const selectedChannel = useMemo(() => {
        if (channelParam) {
            const paramChannel = initialChannels.find(c => c.slug === channelParam || c.id === channelParam);
            if (paramChannel) return paramChannel;
        }
        return initialChannels.find(c => c.type === 'TV') || initialChannels[0];
    }, [channelParam, initialChannels]);

    const currentProgram = useMemo(() => {
        if (!selectedChannel) return undefined;
        return epgData.find((item) => item.channel_id === selectedChannel.id && item.is_current) || epgData[0];
    }, [epgData, selectedChannel]);

    const latestVideos = useMemo(() => initialChannelVideos, [initialChannelVideos]);
    const visibleLatestVideos = useMemo(() => latestVideos.slice(0, visibleLatestCount), [latestVideos, visibleLatestCount]);
    const hasMoreLatestVideos = visibleLatestCount < latestVideos.length;
    const programs = useMemo(() => initialChannelVideos.slice(0, 4), [initialChannelVideos]);

    const getVideoTitle = (video: SliderVideoItem) => {
        const raw = (video.title || "").trim();
        if (raw) return raw;
        const descBased = (video.desc || "").split("\n")[0]?.trim();
        return descBased || "";
    };

    const handleLoadMoreLatestVideos = () => {
        if (!hasMoreLatestVideos || isLoadingMore) return;
        setIsLoadingMore(true);
        setTimeout(() => {
            setVisibleLatestCount((prev) => Math.min(prev + 4, latestVideos.length));
            setIsLoadingMore(false);
        }, 600);
    };

    if (!selectedChannel) {
        return <div className="text-center text-white py-20">Aucune chaîne disponible</div>;
    }

    return (
        <div className="space-y-[45px] text-white">
            <LivePlayerSection channel={selectedChannel} currentProgram={currentProgram} />

            <section className="mx-auto w-full max-w-[1280px] space-y-[50px]">
                <div className="news-section-header">
                    <h2 className="fig-h9 uppercase text-white">Latest videos</h2>
                    <div className="news-section-line" />
                </div>
                <div className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
                    {visibleLatestVideos.map((video, index) => (
                        <Link key={`${video.id}-${index}`} href={`/replay/${video.slug || video.id}`} className="block space-y-2 rounded-[10px] hover-lift-primary">
                            <div className="h-[172px] overflow-hidden rounded-[10px]">
                                <SafeImage
                                    src={video.logo_url || video.logo || SITE_CONFIG.theme.placeholders.video}
                                    alt={getVideoTitle(video)}
                                    width={306}
                                    height={172}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <h3 className="line-clamp-3 text-[16px] leading-[24px] text-white">
                                {getVideoTitle(video)}
                            </h3>
                            <div className="flex items-center gap-[10px] text-[12px] leading-[18px] text-[#8E8E8E]">
                                <span>{video.date ? formatDate(video.date) : formatDate(new Date())}</span>
                                <span className="h-[3.86px] w-[3.86px] rounded-full bg-[#8E8E8E]" />
                                <span>{displayTime(video.date, video.time)}</span>
                            </div>
                        </Link>
                    ))}
                    {isLoadingMore && (
                        <>
                            {[0, 1].map((idx) => (
                                <article key={`latest-shimmer-${idx}`} className="space-y-2 animate-pulse">
                                    <div className="h-[172px] overflow-hidden rounded-[10px] bg-[#2a2a2a]" />
                                    <div className="h-5 w-4/5 rounded bg-[#2a2a2a]" />
                                    <div className="h-4 w-2/3 rounded bg-[#2a2a2a]" />
                                </article>
                            ))}
                        </>
                    )}
                </div>
                {hasMoreLatestVideos && (
                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={handleLoadMoreLatestVideos}
                            disabled={isLoadingMore}
                            className="h-[40px] rounded-[60px] border border-[#777777] px-5 text-[14px] font-semibold uppercase text-white disabled:opacity-60"
                        >
                            {isLoadingMore ? "Loading..." : "Load more"}
                        </button>
                    </div>
                )}
            </section>

            <div className="mx-auto w-full max-w-[1280px]">
                <AdBannerHD className="mx-auto max-w-[1280px] py-16" />
            </div>

            <section className="mx-auto w-full max-w-[1280px] space-y-[42px]">
                <div className="news-section-header">
                    <h2 className="fig-h9 uppercase text-white">Programs TV</h2>
                    <div className="news-section-line" />
                </div>
                <div className="grid gap-[20px] sm:grid-cols-2 xl:grid-cols-4">
                    {programs.map((program, idx) => (
                        <Link key={`${program.id}-${idx}`} href={`/replay/${program.slug || program.id}`} className="block space-y-4 rounded-[12px] hover-lift-primary">
                            <div className="h-[440px] overflow-hidden rounded-[15px] bg-[#333333]">
                                <SafeImage
                                    src={program.logo_url || program.logo || "/assets/placeholders/live_tv_frame.png"}
                                    alt={getVideoTitle(program)}
                                    width={343}
                                    height={440}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <h3 className="fig-h9 uppercase text-white line-clamp-2">{getVideoTitle(program)}</h3>
                            <div className="flex items-center gap-[10px] text-[12px] leading-[18px] text-[#8E8E8E]">
                                <span>{program.date ? formatDate(program.date) : formatDate(new Date())}</span>
                                <span className="h-[3.86px] w-[3.86px] rounded-full bg-[#8E8E8E]" />
                                <span>{displayTime(program.date, program.time)}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
