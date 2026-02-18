"use client";

import Link from "next/link";
import Image from "next/image";
import { SliderVideoItem } from "../../types/api";
import { useTranslations } from "next-intl";
import { SafeImage } from "../ui/SafeImage";
import { useSliderVideos, useLiveChannels, useChannelResolver } from "@/hooks/useData";
import { ensureAbsoluteUrl } from "@/services/api";

interface LiveVideosSectionProps {
    videos: SliderVideoItem[];
}

export function DernieresEditions({ videos: initialVideos }: LiveVideosSectionProps) {
    const t = useTranslations("pages.home");
    const tc = useTranslations("common");

    // SWR Cache sync for robust management with fallback data
    const { data: sliderRes } = useSliderVideos({ allitems: initialVideos } as any);
    const { resolveLogo } = useChannelResolver();

    const videos = sliderRes?.allitems || initialVideos;

    // Ensure we have videos
    if (!videos || videos.length === 0) return null;

    const featuredVideo = videos[0];
    const listVideos = videos.slice(1); // Show all remaining items in the scrollable list

    return (
        <section className="w-full max-w-[1400px] mx-auto p-6 rounded-lg bg-foreground/5 backdrop-blur-sl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold uppercase tracking-wide">
                        {t("latestEditions")}
                    </h2>
                    <button className="text-gray-400 flex items-center gap-2">
                        <Image
                            src="/assets/placeholders/arrow2.png"
                            alt=""
                            width={24}
                            height={24}
                        />
                    </button>
                </div>
                <Link
                    href={`/replay`}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline"
                >
                    {tc("seeMore")}
                </Link>
            </div>

            {/* Content Grid */}
            <div className="flex lg:flex-row flex-col justify-between gap-x-6">
                {/* Left Side - Featured Video (60%) */}
                <div className="w-full lg:w-3/5 pb-6">
                    {featuredVideo && (() => {
                        const channelLogo = resolveLogo(featuredVideo);
                        return (
                            <Link
                                href={`/replay/${featuredVideo.slug}`}
                                className="group relative block w-full overflow-hidden 
                                hover:scale-[1.02] transition-all   "
                            >
                                {/* Image Container */}
                                <div className="relative w-full aspect-video bg-surface-2 bg-gray-100">
                                    <SafeImage
                                        src={featuredVideo.logo_url}
                                        alt={featuredVideo.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 60vw"
                                        className="object-cover z-0"
                                    />

                                    {/* Play Button Overlay - Center (Design a gauche) */}
                                    <div className="absolute inset-0 flex items-center justify-center transition-transform group-hover:scale-110 pointer-events-none">
                                        <Image
                                            src={'/assets/placeholders/play_overlay.png'}
                                            alt="Play"
                                            width={64}
                                            height={64}
                                            className="object-contain z-10"
                                        />
                                    </div>

                                    {/* Channel Logo Overlay - Top Right */}
                                    {channelLogo && (
                                        <div className="absolute top-3 right-3 z-10 w-16 h-12 p-1.5 shadow-lg overflow-hidden">
                                            <SafeImage
                                                src={ensureAbsoluteUrl(channelLogo)}
                                                alt="Channel Logo"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Description Band - Below Image */}
                                <div className="relative p-4 sm:p-6 bg-background z-10 sm:-mt-10 mx-4 sm:mx-10 md:mx-20 shadow-xl rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs text-[color:var(--accent)] font-semibold">{featuredVideo.time}</span>
                                        <span className="text-xs text-[color:var(--accent)] font-semibold">{tc("toWatchNow")}</span>
                                    </div>
                                    <h3 className="text-base sm:text-lg font-bold mb-2 ">
                                        {featuredVideo.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                        {featuredVideo.desc || tc("watchMissedFallback")}
                                    </p>
                                </div>
                            </Link>
                        );
                    })()}
                </div>

                {/* Right Side - Scrollable List (40%) */}
                <div className="w-full lg:w-2/5">
                    <div className="space-y-3 w-full max-h-[500px] pr-2 overflow-y-auto scrollbar-thin 
                        [&::-webkit-scrollbar]:w-1 
                        [&::-webkit-scrollbar-track]:bg-transparent 
                        [&::-webkit-scrollbar-thumb]:bg-[color:var(--accent)] 
                        [&::-webkit-scrollbar-thumb]:rounded-full 
                        hover:[&::-webkit-scrollbar-thumb]:bg-[color:var(--accent)]
                        ">
                        {listVideos.map((video, index) => {
                            const channelLogo = resolveLogo(video);
                            return (
                                <Link
                                    key={`${video.slug}-${index}`}
                                    href={`/replay/${video.slug}`}
                                    className="group flex gap-3 hover:bg-muted/10 p-2 transition-colors w-full
                                    hover:scale-[1.02] transition-all "
                                >
                                    {/* Thumbnail with overlays */}
                                    <div className="relative w-32 h-20 flex-shrink-0  overflow-hidden bg-white/5">
                                        <SafeImage
                                            src={video.logo_url}
                                            alt={video.title}
                                            fill
                                            sizes="128px"
                                            className="object-cover"
                                        />

                                        {/* Play icon inside thumbnail - Bottom Left */}
                                        <div className="absolute bottom-1 left-1 z-10 pointer-events-none">
                                            <Image
                                                src={'/assets/placeholders/play_overlay.png'}
                                                alt="Play"
                                                width={24}
                                                height={24}
                                                className="object-contain"
                                            />
                                        </div>

                                        {/* Channel logo inside thumbnail - Bottom Right */}
                                        {channelLogo && (
                                            <div className="absolute bottom-1 right-1 z-10 w-6 h-6 ">
                                                <SafeImage
                                                    src={ensureAbsoluteUrl(channelLogo)}
                                                    alt="Channel"
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content - Right Side */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        {/* Time */}
                                        <div className="text-xs text-gray-500  mb-1">
                                            {video.time}
                                        </div>

                                        {/* Title */}
                                        <h4 className="text-sm font-semibold leading-tight line-clamp-2 mb-1">
                                            {video.title}
                                        </h4>

                                        {/* Meta Info */}
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-[color:var(--accent)] font-semibold">{tc("replayTag")}</span>
                                            <span className="text-[color:var(--accent)] ">•</span>
                                            <span className="text-[color:var(--accent)] dark:text-[color:var(--accent)]">{video.date}</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}