"use client";

import Link from "next/link";
import Image from "next/image";
import * as React from "react";
import { SectionTitle } from "../ui/SectionTitle";
import { LiveChannel, EPGItem } from "../../types/api";
import { LiveCarousel } from "../shared/LiveCarousel";
import { useTranslations } from "next-intl";
import { SITE_CONFIG } from "@/constants/site-config";
import { SafeImage } from "../ui/SafeImage";
import { useLiveChannels, useEPGNow } from "@/hooks/useData";

interface LiveChannelsGridProps {
    channels: LiveChannel[];
    epgItems: EPGItem[];
    title: string;
    title2: string;
    actionLabel: string;
}

export function LiveChannelsGrid({ channels: initialChannels, epgItems: initialEpg, title, title2, actionLabel }: LiveChannelsGridProps) {
    const t = useTranslations("common");

    // Real-time status sync via Robust SWR Cache with fallback data for instant display
    const { data: channelsRes } = useLiveChannels({ allitems: initialChannels } as any);
    const { data: epgRes } = useEPGNow({ allitems: initialEpg } as any);

    const channels = channelsRes?.allitems || initialChannels;
    const epgItems = epgRes?.allitems || initialEpg;

    if (!channels || channels.length === 0) return null;

    return (
        <section className="">
            <SectionTitle title={title} title2={title2} actionHref="/live" />

            <LiveCarousel>
                {channels.map((channel, index) => {
                    // Get current program for this channel from EPG
                    const currentProgram = epgItems.find(
                        (epg) => epg.channel_id === channel.id && epg.is_current
                    );

                    // Calculate progress percentage
                    let progressPercentage = 0;
                    if (currentProgram && currentProgram.start_time && currentProgram.end_time) {
                        const now = new Date();
                        const [startHour, startMinute] = currentProgram.start_time.split(":").map(Number);
                        const [endHour, endMinute] = currentProgram.end_time.split(":").map(Number);
                        const startDate = new Date(); startDate.setHours(startHour, startMinute, 0, 0);
                        const endDate = new Date(); endDate.setHours(endHour, endMinute, 0, 0);
                        if (endDate < startDate) endDate.setDate(endDate.getDate() + 1);
                        const totalDuration = endDate.getTime() - startDate.getTime();
                        const elapsed = now.getTime() - startDate.getTime();
                        if (totalDuration > 0) {
                            progressPercentage = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
                        }
                    } else {
                        const safeId = channel.id ? String(channel.id) : "unknown";
                        const seed = safeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                        progressPercentage = 15 + (seed % 75);
                    }

                    return (
                        <Link
                            key={index}
                            href={`/live?channel=${channel.slug}`}
                            className="group relative flex flex-col w-[220px] sm:w-[270px] h-[180px] sm:h-[220px] 
                                overflow-hidden rounded-xl border border-white/5
                                text-left transition-all duration-300 
                                hover:scale-[1.02]"
                        >
                            <div className="relative h-[65%] w-full
                            ">
                                <SafeImage
                                    src={channel.logo_url || channel.logo || SITE_CONFIG.theme.placeholders.video}
                                    alt={channel.title}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="object-cover opacity-60"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

                                <div className="absolute top-3 right-3">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white backdrop-blur-sm text-black text-xs shadow-lg">
                                        <span className="w-2 h-2 bg-[color:var(--accent)] rounded-full animate-pulse" />
                                        {t("direct")}
                                    </span>
                                </div>

                                <div className="absolute bottom-3 right-3">
                                    <div className="w-20 h-12 p-1">
                                        <SafeImage
                                            src={channel.logo_url || channel.logo}
                                            alt={channel.title}
                                            fill
                                            className="object-contain w-full h-full"
                                        />
                                    </div>
                                </div>

                                <div className="absolute bottom-3 left-3">
                                    <div className="w-8 h-8 relative drop-shadow-lg opacity-80 group-hover:opacity-100 transition-opacity">
                                        <SafeImage
                                            src={SITE_CONFIG.theme.placeholders.video}
                                            alt="Live TV"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="h-[35%] w-full backdrop-blur-sm px-3 py-2 flex flex-col justify-between">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-sm line-clamp-1 flex-shrink min-w-0">
                                        {channel.title}
                                    </h3>
                                    <div className="flex-1 h-1.5 bg-surface-2 rounded-full overflow-hidden min-w-[40px]">
                                        <div
                                            className="h-full bg-[color:var(--accent)] rounded-full transition-all"
                                            style={{ width: `${progressPercentage}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-[10px] dark:text-gray-400  ">
                                    {/* Calendar Icon */}
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-gray-500 text-sm">{currentProgram?.start_time ?? new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', })}</span>
                                    <span className="text-gray-400 dark:text-white/90  text-xs">-</span>
                                    {/* Clock Icon */}
                                    <svg className="w-5 h-5 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-gray-500 text-sm">{currentProgram?.end_time || new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </LiveCarousel>
        </section>
    );
}
