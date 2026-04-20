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
import { useTranslations } from "next-intl";

interface LivePageClientProps {
    initialChannels: LiveChannel[];
    initialChannelVideos: SliderVideoItem[];
    initialNextPageToken?: string | null;
    epgData: EPGItem[];
    fullEpg: FullEPGChannel[];
    aodItems: AODItem[];
}

const LIVE_GRID_ROW_SIZE = 4;
const LIVE_FETCH_BATCH_SIZE = 8;
const INITIAL_VISIBLE_LATEST_COUNT = LIVE_GRID_ROW_SIZE * 3; // 3 lignes

function uniqVideos(items: SliderVideoItem[]) {
    const seen = new Set<string>();
    return items.filter((item) => {
        const key = String(item.slug || item.id || "");
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

async function fetchMoreVideoRows(nextToken: string, loadedVideos: SliderVideoItem[], minimumCount: number) {
    let token: string | null = nextToken;
    let merged = loadedVideos;

    while (token && merged.length < minimumCount) {
        const response = await fetch(
            `/api/youtube/latest-videos?maxResults=${LIVE_FETCH_BATCH_SIZE}&pageToken=${encodeURIComponent(token)}`
        );
        if (!response.ok) {
            throw new Error("Failed to fetch more videos");
        }

        const data = (await response.json()) as { items?: SliderVideoItem[]; nextPageToken?: string | null };
        merged = uniqVideos([...(merged || []), ...((data.items || []) as SliderVideoItem[])]);
        token = data.nextPageToken || null;
    }

    return { merged, nextPageToken: token };
}

function displayTime(date?: string, fallbackTime?: string) {
    if (fallbackTime && fallbackTime.trim()) return fallbackTime;
    const parsed = parseToDate(date);
    if (!parsed) return "--:--";
    return parsed.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function LivePageClient({ initialChannels, initialChannelVideos, initialNextPageToken, epgData, fullEpg, aodItems: _aodItems }: LivePageClientProps) {
    const t = useTranslations("common");
    const searchParams = useSearchParams();
    const channelParam = searchParams.get('channel');
    const initialLoadedLatestVideos = useMemo(() => uniqVideos(initialChannelVideos), [initialChannelVideos]);
    const [loadedLatestVideos, setLoadedLatestVideos] = useState(() => initialLoadedLatestVideos);
    const [visibleLatestCount, setVisibleLatestCount] = useState(() =>
        Math.min(INITIAL_VISIBLE_LATEST_COUNT, initialLoadedLatestVideos.length)
    );
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [nextPageToken, setNextPageToken] = useState<string | null>(initialNextPageToken || null);

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

    const latestVideos = useMemo(() => loadedLatestVideos, [loadedLatestVideos]);
    const visibleLatestVideos = useMemo(() => latestVideos.slice(0, visibleLatestCount), [latestVideos, visibleLatestCount]);
    const hasMoreLatestVideos = visibleLatestCount < latestVideos.length || Boolean(nextPageToken);
    const programs = useMemo(() => latestVideos.slice(0, 4), [latestVideos]);

    const getVideoTitle = (video: SliderVideoItem) => {
        const raw = (video.title || "").trim();
        if (raw) return raw;
        const descBased = (video.desc || "").split("\n")[0]?.trim();
        return descBased || "";
    };

    const handleLoadMoreLatestVideos = async () => {
        if (!hasMoreLatestVideos || isLoadingMore) return;
        // On ne met le loading/skeleton que si on fait un vrai fetch (pagination).
        if (!nextPageToken) {
            setVisibleLatestCount((prev) => Math.min(prev + LIVE_GRID_ROW_SIZE * 2, latestVideos.length));
            return;
        }

        setIsLoadingMore(true);
        try {
            // Si on a une prochaine page, on la fetch toujours (append/déduplique).
            if (nextPageToken) {
                const data = await fetchMoreVideoRows(
                    nextPageToken,
                    latestVideos,
                    visibleLatestCount + LIVE_GRID_ROW_SIZE * 2
                );

                setLoadedLatestVideos(data.merged);
                setNextPageToken(data.nextPageToken);
                setVisibleLatestCount((prev) => Math.min(prev + LIVE_GRID_ROW_SIZE * 2, data.merged.length));
                return;
            }
        } finally {
            setIsLoadingMore(false);
        }
    };

    if (!selectedChannel) {
        return <div className="text-center text-white py-20">{t("scheduleUnavailable")}</div>;
    }

    return (
        <div className="space-y-[45px] text-white">
            <LivePlayerSection channel={selectedChannel} currentProgram={currentProgram} />

            <section className="mx-auto w-full max-w-[1280px] space-y-[50px]">
                <div className="news-section-header">
                    <h2 className="fig-h9 uppercase text-white">{t("latestVideos")}</h2>
                    <div className="news-section-line" />
                </div>
                <div className="grid gap-[15px] grid-cols-2 sm:grid-cols-2 xl:grid-cols-4">
                    {visibleLatestVideos.map((video, index) => (
                        <Link key={`${video.id}-${index}`} href={`/replay/${video.slug || video.id}`} className="block space-y-2 rounded-[10px] hover-lift-primary">
                            <div className="h-[100px] md:h-[172px] overflow-hidden rounded-[10px]">
                                <SafeImage
                                    src={video.logo_url || video.logo || SITE_CONFIG.theme.placeholders.video}
                                    alt={getVideoTitle(video)}
                                    width={306}
                                    height={172}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="px-1 md:px-2">
                            <h3 className="line-clamp-2 text-[13px] md:text-[16px] leading-tight md:leading-[24px] text-white font-medium">
                                {getVideoTitle(video)}
                            </h3>
                            <div className="mt-1 flex flex-wrap items-center gap-[5px] md:gap-[10px] text-[10px] md:text-[12px] leading-[18px] text-[#8E8E8E]">
                                <span>{video.date ? formatDate(video.date) : formatDate(new Date())}</span>
                                <span className="hidden md:inline-block h-[3.86px] w-[3.86px] rounded-full bg-[#8E8E8E]" />
                                <span>{displayTime(video.date, video.time)}</span>
                            </div>
                            </div>
                        </Link>
                    ))}
                    {isLoadingMore && (
                        <>
                            {Array.from({ length: 2 }, (_, idx) => (
                                <article key={`latest-shimmer-${idx}`} className="space-y-2 animate-pulse">
                                    <div className="h-[100px] md:h-[172px] overflow-hidden rounded-[10px] bg-[#2a2a2a]" />
                                    <div className="h-4 md:h-5 w-4/5 rounded bg-[#2a2a2a]" />
                                    <div className="h-3 md:h-4 w-2/3 rounded bg-[#2a2a2a]" />
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
                            {isLoadingMore ? t("loading") : t("loadMore")}
                        </button>
                    </div>
                )}
            </section>

            <div className="mx-auto w-full max-w-[1280px]">
                <AdBannerHD className="mx-auto max-w-[1280px] py-16" />
            </div>

            <section className="mx-auto w-full max-w-[1280px] space-y-[42px]">
                <div className="news-section-header">
                    <h2 className="fig-h9 uppercase text-white">{t("tvSchedule")}</h2>
                    <div className="news-section-line" />
                </div>
                <div className="grid gap-[15px] grid-cols-2 sm:grid-cols-2 xl:grid-cols-4">
                    {programs.map((program, idx) => (
                        <Link key={`${program.id}-${idx}`} href={`/replay/${program.slug || program.id}`} className="block space-y-3 rounded-[12px] hover-lift-primary">
                            <div className="h-[240px] md:h-[440px] overflow-hidden rounded-[15px] bg-[#333333]">
                                <SafeImage
                                    src={program.logo_url || program.logo || "/assets/placeholders/live_tv_frame.png"}
                                    alt={getVideoTitle(program)}
                                    width={343}
                                    height={440}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="px-1 md:px-2 pb-2">
                            <h3 className="text-[13px] md:fig-h9 uppercase text-white line-clamp-2 font-medium leading-tight">{getVideoTitle(program)}</h3>
                            <div className="mt-2 flex flex-wrap items-center gap-[5px] md:gap-[10px] text-[10px] md:text-[12px] text-[#8E8E8E]">
                                <span>{program.date ? formatDate(program.date) : formatDate(new Date())}</span>
                                <span className="hidden md:inline-block h-[3.86px] w-[3.86px] rounded-full bg-[#8E8E8E]" />
                                <span>{displayTime(program.date, program.time)}</span>
                            </div>
                            </div>
                        </Link>
                    ))}
                </div>

            </section>
        </div>
    );
}
