"use client";

import Link from "next/link";
import Image from "next/image";
import { SliderVideoItem } from "../../types/api";

interface LiveVideosSectionProps {
    videos: SliderVideoItem[];
}

export function DernieresEditions({ videos }: LiveVideosSectionProps) {
    // Ensure we have videos
    if (!videos || videos.length === 0) return null;

    const featuredVideo = videos[0];
    const listVideos = videos.slice(1); // Show all remaining items in the scrollable list

    return (
        <section className="w-full max-w-[1400px] mx-auto bg-surface/50 backdrop-blur-sm rounded-lg p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold uppercase tracking-wide">
                        Nos dernières éditions
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
                    href="/live"
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline"
                >
                    Voir plus
                </Link>
            </div>

            {/* Content Grid */}
            <div className="flex lg:flex-row flex-col justify-between gap-x-6">
                {/* Left Side - Featured Video (60%) */}
                <div className="w-full lg:w-3/5 pb-6">
                    {featuredVideo && (
                        <Link
                            href={featuredVideo.video_url || '#'}
                            className="group relative block w-full overflow-hidden "
                        >
                            {/* Image Container */}
                            <div className="relative w-full aspect-video bg-surface-2 bg-gray-100">
                                <Image
                                    src={featuredVideo.logo_url}
                                    alt={featuredVideo.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 60vw"
                                    className="object-cover z-0"
                                />

                                {/* Play Button Overlay - Center (Design a gauche) */}
                                <div className="absolute inset-0 flex items-center justify-center transition-transform group-hover:scale-110">
                                    <Image
                                        src={'/assets/placeholders/play_overlay.png'}
                                        alt="Play"
                                        width={64}
                                        height={64}
                                        className="object-contain z-10"
                                    />
                                </div>

                                {/* Channel Logo - Top Right (Design a gauche) */}
                                {featuredVideo.channel_logo && (
                                    <div className="absolute top-3 right-3 z-10">
                                        <div className="w-20 h-16 rounded-lg p-1.5 ">
                                            <Image
                                                src={featuredVideo.channel_logo}
                                                alt="Channel Logo"
                                                width={58}
                                                height={58}
                                                className="object-contain w-full h-full"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Description Band - Below Image */}
                            <div className="relative p-4  bg-background z-10 mt-[-22] ml-20 mr-20 ">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs text-red-600 font-semibold">{featuredVideo.time}</span>
                                    <span className="text-xs text-red-600 font-semibold">Regardez maintenant</span>
                                </div>
                                <h3 className="text-base font-bold mb-2 group-hover:underline">
                                    {featuredVideo.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {featuredVideo.desc || "Regardez les dernières vidéos que vous avez manquées"}
                                </p>
                            </div>
                        </Link>
                    )}
                </div>

                {/* Right Side - Scrollable List (40%) */}
                <div className="w-full lg:w-2/5">
                    <div className="space-y-3 w-full max-h-[500px] pr-2 overflow-y-auto scrollbar-thin 
                        [&::-webkit-scrollbar]:w-1 
                        [&::-webkit-scrollbar-track]:bg-transparent 
                        [&::-webkit-scrollbar-thumb]:bg-red-600 
                        [&::-webkit-scrollbar-thumb]:rounded-full 
                        hover:[&::-webkit-scrollbar-thumb]:bg-red-400">
                        {listVideos.map((video, index) => (
                            <Link
                                key={`${video.slug}-${index}`}
                                href={video.video_url || '#'}
                                className="group flex gap-3 hover:bg-muted/10 p-2 transition-colors w-full"
                            >
                                {/* Thumbnail with overlays */}
                                <div className="relative w-32 h-20 flex-shrink-0  overflow-hidden bg-gray-100">
                                    <Image
                                        src={video.logo_url}
                                        alt={video.title}
                                        fill
                                        sizes="128px"
                                        className="object-cover"
                                    />

                                    {/* Play icon inside thumbnail - Bottom Left */}
                                    <div className="absolute bottom-1 left-1 z-10">
                                        <Image
                                            src={'/assets/placeholders/play_overlay.png'}
                                            alt="Play"
                                            width={24}
                                            height={24}
                                            className="object-contain"
                                        />
                                    </div>

                                    {/* Channel logo inside thumbnail - Bottom Right */}
                                    {video.channel_logo && (
                                        <div className="absolute bottom-1 right-1 z-10">
                                            <div className="w-6 h-6 bg-white rounded p-0.5 shadow-sm">
                                                <Image
                                                    src={video.channel_logo}
                                                    alt="Channel"
                                                    width={20}
                                                    height={20}
                                                    className="object-contain w-full h-full"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Content - Right Side */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    {/* Time */}
                                    <div className="text-xs text-gray-500 dark:text-red-400 mb-1">
                                        {video.time}
                                    </div>

                                    {/* Title */}
                                    <h4 className="text-sm font-semibold leading-tight line-clamp-2 group-hover:underline mb-1">
                                        {video.title}
                                    </h4>

                                    {/* Meta Info */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="text-red-400 font-semibold">Replay</span>
                                        <span className="text-red-600 ">•</span>
                                        <span className="text-red-400 dark:text-red-400">{video.date}</span>
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