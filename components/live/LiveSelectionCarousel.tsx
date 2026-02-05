"use client";

import { useState } from "react";
import Image from "next/image";
import { Carousel } from "../ui/Carousel";
import { LiveChannel, EPGItem } from "../../types/api";

interface LiveSelectionCarouselProps {
    channels: LiveChannel[];
    epgItems: EPGItem[];
    onSelectChannel: (channel: LiveChannel) => void;
    selectedChannelId?: string;
}

export function LiveSelectionCarousel({
    channels,
    epgItems,
    onSelectChannel,
    selectedChannelId,
}: LiveSelectionCarouselProps) {
    const [activeTab, setActiveTab] = useState<"ALL" | "TV" | "RADIO">("ALL");

    const filteredChannels = channels.filter((channel) => {
        if (activeTab === "ALL") return true;
        return channel.type === activeTab;
    });

    return (
        <div className="space-y-6">
            {/* Tabs - Fixed visibility and positioning */}
            <div className="flex items-center justify-end gap-2 pr-30 mb-2">
                {(["ALL", "TV", "RADIO"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`h-9 rounded-full border border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--surface)_70%,transparent)] px-4 text-sm font-semibold text-[color:var(--muted)] hover:border-red-600 hover:text-foreground hover:cursor-pointer cursor-pointer ${activeTab === tab
                            ? "bg-red-600 text-white border-red-600"
                            : ""
                            }`}
                    >
                        {tab === "ALL" ? "Tous" : tab === "TV" ? "Live TV" : "Radios FM"}
                    </button>
                ))}
            </div>

            {/* Carousel */}
            <Carousel itemClassName="w-[260px] sm:w-[300px] pt-5 pl-5">
                {filteredChannels.map((channel) => {
                    // Get current program if available
                    const currentProgram = epgItems.find(
                        (epg) => epg.channel_id === channel.id && epg.is_current
                    );

                    // Calculate progress
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
                        // Random progress for demo/fallback (deterministic per channel)
                        // FIX: Safe access to channel.id to prevent crash if undefined
                        const safeId = channel.id ? String(channel.id) : "unknown";
                        const seed = safeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                        progressPercentage = 15 + (seed % 75);
                    }

                    // Use slug as fallback identifier if id is undefined (radios don't have id)
                    const channelKey = channel.id || channel.slug;
                    const isSelected = selectedChannelId === channelKey;
                    const isRadio = channel.type === "RADIO";

                    return (
                        <button
                            key={channelKey} // Use channelKey instead of id
                            onClick={() => onSelectChannel(channel)}
                            className={`group relative flex flex-col w-[280px] sm:w-[300px] h-[220px] 
                                overflow-hidden rounded-xl 
                                bg-white dark:bg-gray-900 text-left transition-all duration-300 
                                border-2 backdrop-blur-sm
                            ${isSelected
                                    ? "border-red-600 shadow-lg shadow-red-600/30 scale-[1.02]"
                                    : "border-gray-200 dark:border-white/10 hover:border-red-500 dark:hover:border-red-500"
                                }`}

                        >
                            {/* Image Section (65% Height) */}
                            <div className="relative h-[65%] w-full ">
                                <Image
                                    src={channel.logo_url || channel.logo || channel.hd_logo || channel.sd_logo || "/assets/placeholders/live_tv_frame.png"}
                                    alt={channel.title}
                                    fill
                                    className="object-cover opacity-90"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                                {/* Channel Logo (bottom right) */}
                                {channel.logo_url && (
                                    <div className="absolute bottom-2 right-2 w-12 h-12 bg-black/40 backdrop-blur-sm rounded-lg p-1.5 border border-white/10">
                                        <Image
                                            src={channel.logo_url}
                                            alt="logo"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                )}

                                {/* Direct Badge (Top Right) */}
                                <div className="absolute top-2 right-2">
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider ${isSelected ? "bg-white text-black" : "bg-black/60 text-white"
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-red-600 animate-pulse" : "bg-red-600"}`} />
                                        LIVE
                                    </span>
                                </div>

                                {/* Type Icon (Bottom Left of Image) */}
                                <div className="absolute bottom-2 left-2">
                                    {isRadio ? (
                                        <div className="w-8 h-8 relative drop-shadow-lg">
                                            <Image
                                                src="/assets/placeholders/radio_icon_sur_card.png"
                                                alt="Radio"
                                                width={32}
                                                height={32}
                                                className="object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                                    if (fallback) fallback.style.display = 'flex';
                                                }}
                                            />
                                            <div className="w-8 h-8 hidden items-center justify-center bg-black/50 rounded-full border border-white/20"> {/* Fallback if image fails */}
                                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 relative drop-shadow-lg">
                                            <Image
                                                src="/assets/placeholders/live_tv_frame.png"
                                                alt="Live TV"
                                                width={32}
                                                height={32}
                                                className="object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                                    if (fallback) fallback.style.display = 'flex';
                                                }}
                                            />
                                            <div className="w-8 h-8 hidden items-center justify-center bg-black/50 rounded-full border border-white/20"> {/* Fallback if image fails */}
                                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Meta Section (35% Height) */}
                            <div className="h-[35%] w-full  backdrop-blur-sm px-3 py-2 flex flex-col justify-between">
                                {/* First Line: Title + Progress Bar */}
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-sm line-clamp-1 flex-shrink min-w-0">
                                        {channel.title}
                                    </h3>
                                    {/* Progress Bar next to title */}
                                    <div className="flex-1 h-1.5 bg-gray-300 dark:bg-white/10 rounded-full overflow-hidden min-w-[40px]">
                                        <div
                                            className="h-full bg-red-600 rounded-full transition-all"
                                            style={{ width: `${progressPercentage}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Second Line: Date/Time with Icons */}
                                <div className="flex items-center gap-2 text-[10px] dark:text-gray-400  ">
                                    {/* Calendar Icon */}
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-gray-500 text-sm">{currentProgram?.start_time ?? new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    <span className="text-gray-400 dark:text-white/90  text-xs">-</span>
                                    {/* Clock Icon */}
                                    <svg className="w-5 h-5 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-gray-500 text-sm">{currentProgram?.end_time || new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </Carousel>
        </div>
    );
}
