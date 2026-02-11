"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { LiveChannel, EPGItem } from "../../types/api";

interface LiveSelectionCarouselProps {
    channels: LiveChannel[];
    epgItems: EPGItem[];
    onSelectChannel: (channel: LiveChannel) => void;
    selectedChannelId?: string;
}

import { useTranslations } from "next-intl";
import { SITE_CONFIG } from "@/constants/site-config";

export function LiveSelectionCarousel({
    channels,
    epgItems,
    onSelectChannel,
    selectedChannelId,
}: LiveSelectionCarouselProps) {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<"ALL" | "TV" | "RADIO">("ALL");
    const t = useTranslations("common");
    const tf = useTranslations("footer.links");

    const filteredChannels = channels.filter((channel) => {
        if (activeTab === "ALL") return true;
        return channel.type === activeTab;
    });

    const scrollBy = (direction: 'left' | 'right') => {
        const el = scrollerRef.current;
        if (!el) return;

        const scrollAmount = el.offsetWidth * 0.8;
        el.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: "smooth"
        });
    };

    return (
        <div className="w-full space-y-6">
            {/* Header with Tabs and Controls */}
            <div className="flex items-center justify-between px-1">
                {/* Tabs (Left aligned to replace Title) */}
                <div className="flex items-center gap-2">
                    {(["ALL", "TV", "RADIO"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`h-9 rounded-sm border border-[color:var(--border)] px-4 text-sm font-bold tracking-wide transition-all uppercase ${activeTab === tab
                                ? "bg-[color:var(--accent)] text-white border-[color:var(--accent)]"
                                : "bg-foreground/5 text-foreground/60 border-transparent hover:border-[color:var(--accent)] hover:text-foreground"
                                }`}
                        >
                            {tab === "ALL" ? t("all") : tab === "TV" ? tf("tv") : tf("radio")}
                        </button>
                    ))}
                </div>

                {/* Navigation Buttons (Rectangular - Replay Style) */}
                <div className="flex gap-2">
                    <button
                        onClick={() => scrollBy('left')}
                        className="w-10 h-10 border border-white/10 bg-foreground/5 hover:bg-[color:var(--accent)] transition-colors flex items-center justify-center rounded-sm group"
                        aria-label="Previous"
                    >
                        <svg className="w-5 h-5 text-foreground/60 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={() => scrollBy('right')}
                        className="w-10 h-10 border border-white/10 bg-foreground/5 hover:bg-[color:var(--accent)] transition-colors flex items-center justify-center rounded-sm group"
                        aria-label="Next"
                    >
                        <svg className="w-5 h-5 text-foreground/60 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Scroller */}
            <div
                ref={scrollerRef}
                className="flex gap-6 overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
            >
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
                        const safeId = channel.id ? String(channel.id) : "unknown";
                        const seed = safeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                        progressPercentage = 15 + (seed % 75);
                    }

                    // Use slug as fallback identifier if id is undefined
                    const channelKey = channel.id || channel.slug;
                    const isSelected = selectedChannelId === channelKey;
                    const isRadio = channel.type === "RADIO";

                    return (
                        <button
                            key={channelKey}
                            onClick={() => onSelectChannel(channel)}
                            className={`group relative flex flex-col shrink-0 w-[260px] sm:w-[300px] h-[220px] 
                                overflow-hidden rounded-sm 
                                bg-background/35 backdrop-blur-sm text-left transition-all duration-300 
                                border-2 
                                hover:translate-y-1 hover:scale-[1.02]
                            ${isSelected
                                    ? "border-[color:var(--accent)] scale-[1.02]"
                                    : "border-transparent hover:border-[color:var(--accent)]"
                                }`}

                        >
                            {/* Image Section (65% Height) */}
                            <div className="relative h-[65%] w-full bg-background/20">
                                <Image
                                    src={channel.logo_url || channel.logo || channel.hd_logo || channel.sd_logo || SITE_CONFIG.theme.placeholders.video}
                                    alt={channel.title}
                                    fill
                                    className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                                {/* Channel Logo (bottom right) */}
                                {channel.logo_url && (
                                    <div className="absolute bottom-2 right-2 w-10 h-10 bg-background/10 backdrop-blur-md rounded-sm p-1 border border-white/20">
                                        <Image
                                            src={channel.logo_url}
                                            alt="logo"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                )}

                                {/* Direct Badge (Top Right) */}
                                <div className="absolute top-2 right-2 px-2 py-1 bg-[color:var(--accent)] text-white text-[9px] font-bold uppercase tracking-widest rounded-sm flex items-center gap-1.5 shadow-lg">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                    {t("live")}
                                </div>

                                {/* Type Icon (Bottom Left of Image) */}
                                <div className="absolute bottom-2 left-2">
                                    {isRadio ? (
                                        <div className="w-8 h-8 relative drop-shadow-lg opacity-80 group-hover:opacity-100 transition-opacity">
                                            <Image
                                                src={SITE_CONFIG.theme.placeholders.radio}
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
                                            <div className="w-8 h-8 hidden items-center justify-center bg-black/50 rounded-full border border-white/20">
                                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 relative drop-shadow-lg opacity-80 group-hover:opacity-100 transition-opacity">
                                            <Image
                                                src={SITE_CONFIG.theme.placeholders.video}
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
                                            <div className="w-8 h-8 hidden items-center justify-center bg-black/50 rounded-full border border-white/20">
                                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Meta Section (35% Height) */}
                            <div className="h-[35%] w-full bg-background/5 backdrop-blur-sm px-4 py-3 flex flex-col justify-between border-t border-white/5">
                                {/* First Line: Title + Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-4">
                                        <h3 className="font-bold text-sm tracking-wide  line-clamp-1 group-hover:text-[color:var(--accent)] transition-colors">
                                            {channel.title}
                                        </h3>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full h-1 bg-forground/40 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[color:var(--accent)] rounded-full transition-all duration-1000"
                                            style={{ width: `${progressPercentage}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Second Line: Date/Time with Icons */}
                                <div className="flex items-center justify-between text-[10px] font-medium text-forground/20 uppercase tracking-wider">
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-3 h-3 text-[color:var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {currentProgram?.start_time || t("direct")}
                                    </span>
                                    <span>
                                        {currentProgram?.end_time || "24/7"}
                                    </span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
