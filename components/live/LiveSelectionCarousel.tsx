"use client";

import { useState, useRef } from "react";
import { LiveChannel, EPGItem, FullEPGChannel } from "../../types/api";
import { useTranslations } from "next-intl";
import { SITE_CONFIG } from "@/constants/site-config";
import { SafeImage } from "../ui/SafeImage";
import { SectionTitle } from "../ui/SectionTitle";

interface LiveSelectionCarouselProps {
    channels: LiveChannel[];
    epgItems: EPGItem[];
    fullEpg?: FullEPGChannel[];
    onSelectChannel: (channel: LiveChannel) => void;
    selectedChannelId?: string;
}

export function LiveSelectionCarousel({
    channels,
    epgItems,
    fullEpg = [],
    onSelectChannel,
    selectedChannelId,
}: LiveSelectionCarouselProps) {
    const tt = useTranslations("pages.live");

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
        el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: "smooth" });
    };


    return (
        <div className="w-full space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4 px-2 sm:px-[10px] min-h-[58px]">
                {/* Title */}
                <div className="flex flex-row items-center flex-shrink-0">
                    <SectionTitle title={tt("title")} title2={tt("titleSuffix")} />
                </div>

                {/* Tabs Row */}
                <div className="flex flex-row items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar w-full sm:w-auto pb-2 sm:pb-0">
                    {(["ALL", "TV", "RADIO"] as const).map((tab) => {
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`h-8 px-4 rounded-full transition-all duration-300 text-xs sm:text-sm font-bold border whitespace-nowrap ${isActive
                                    ? "border-accent text-accent bg-accent/5 shadow-sm"
                                    : "border-transparent text-muted hover:text-foreground hover:bg-surface-2"
                                    }`}
                            >
                                {tab === "ALL" ? t("all") : tab === "TV" ? tf("tv") : tf("radio")}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div ref={scrollerRef} className="px-2 pt-2 flex gap-4 sm:gap-6 overflow-x-auto pb-6 no-scrollbar scroll-smooth">
                {filteredChannels.map((channel) => {
                    const currentEPGItem = epgItems.find((epg) => epg.channel_id === channel.id && epg.is_current);

                    // Find detailed program from fullEpg
                    const channelFullEpg = fullEpg.find(ch => ch.id === channel.id);
                    let progDetails = null;
                    if (channelFullEpg) {
                        const now = new Date();
                        const nowSec = now.getHours() * 3600 + now.getMinutes() * 60;
                        const { matin = [], soir = [] } = channelFullEpg.subitems || {};
                        const combined = [...matin, ...soir];
                        progDetails = combined.find(prog => {
                            const [sH, sM] = prog.startTime.split(':').map(Number);
                            const [eH, eM] = prog.endTime.split(':').map(Number);
                            const startSec = sH * 3600 + sM * 60;
                            let endSec = eH * 3600 + eM * 60;
                            if (endSec < startSec) endSec += 24 * 3600;
                            return nowSec >= startSec && nowSec < endSec;
                        });
                    }

                    const effectiveTitle = progDetails?.title || currentEPGItem?.program_title || channel.title;
                    const channelLogo = channel.logo_url || channel.logo || channel.hd_logo || channel.sd_logo;
                    const effectiveLogo = progDetails?.logo || channelLogo;
                    const startTime = progDetails?.startTime || currentEPGItem?.start_time;
                    const endTime = progDetails?.endTime || currentEPGItem?.end_time;

                    let progressPercentage = 0;
                    if (startTime && endTime) {
                        const now = new Date();
                        const [startHour, startMinute] = startTime.split(":").map(Number);
                        const [endHour, endMinute] = endTime.split(":").map(Number);
                        const startDate = new Date(); startDate.setHours(startHour, startMinute, 0, 0);
                        const endDate = new Date(); endDate.setHours(endHour, endMinute, 0, 0);
                        if (endDate < startDate) endDate.setDate(endDate.getDate() + 1);
                        const totalDuration = endDate.getTime() - startDate.getTime();
                        const elapsed = now.getTime() - startDate.getTime();
                        if (totalDuration > 0) progressPercentage = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
                    } else {
                        const safeId = channel.id ? String(channel.id) : "unknown";
                        const seed = safeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                        progressPercentage = 15 + (seed % 75);
                    }

                    const channelKey = channel.slug || channel.id;
                    const isSelected = selectedChannelId === channelKey;
                    const isRadio = channel.type === "RADIO";

                    return (
                        <button
                            key={channelKey}
                            onClick={() => onSelectChannel(channel)}
                            className={`group relative flex flex-col shrink-0 transition-all duration-300 border overflow-hidden w-[220px] xs:w-[250px] sm:w-[270px] h-[210px] sm:h-[240px] rounded-xl cursor-pointer p-0 ${isSelected ? "border-accent shadow-lg scale-[1.02] z-10" : "border-transparent hover:border-border hover:shadow-md"
                                }`}
                        >
                            <div className="relative h-[60%] sm:h-[65%] w-full bg-background/20 ">
                                <SafeImage
                                    src={effectiveLogo || SITE_CONFIG.theme.placeholders.video}
                                    alt={effectiveTitle}
                                    fill
                                    className="object-cover opacity-90 transition-opacity group-hover:opacity-100 rounded-t-xl"
                                />
                                <div className="absolute inset-0 rounded-t-xl" style={{
                                    background: "linear-gradient(180deg, rgba(0,0,0,0) 22.61%, rgba(0,0,0,0.8) 92.04%)"
                                }} />

                                {channelLogo && (
                                    <div className="absolute bottom-2 right-2 w-8 h-8 sm:w-10 sm:h-10 ">
                                        <SafeImage src={channelLogo} alt="logo" fill className="object-contain" />
                                    </div>
                                )}

                                {isSelected && (
                                    <div className="absolute flex flex-col justify-center items-center z-10 right-2 top-2 px-3 py-1 bg-white/90 rounded-full shadow-sm">
                                        <div className="flex flex-row items-center gap-1.5">
                                            <div className="relative w-3.5 h-3.5">
                                                <div className="absolute inset-0 rounded-full bg-red-600/20 animate-ping" />
                                                <div className="absolute inset-[3px] rounded-full bg-[#FF0000]" />
                                            </div>
                                            <span className="text-xs sm:text-sm text-[#333333] font-medium leading-none">
                                                {t("live")}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="absolute bottom-2 left-2">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 relative drop-shadow-lg opacity-80 group-hover:opacity-100 transition-opacity">
                                        <SafeImage src={isRadio ? SITE_CONFIG.theme.placeholders.radio : SITE_CONFIG.theme.placeholders.video} alt={isRadio ? "Radio" : "Live TV"} fill className="object-contain" />
                                    </div>
                                </div>
                            </div>

                            <div className="w-full flex-1 p-3 sm:p-4 flex flex-col justify-between overflow-hidden">
                                <div className="space-y-1.5 sm:space-y-1">
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className="text-sm sm:text-base font-bold text-foreground tracking-wide line-clamp-1 group-hover:text-accent transition-colors text-left flex-1">
                                            {effectiveTitle}
                                        </h3>
                                        <div className="min-w-[40px] sm:min-w-[56px] h-1 bg-border/30 rounded-full overflow-hidden shrink-0">
                                            <div
                                                className="h-full bg-accent rounded-full transition-all duration-1000"
                                                style={{ width: `${progressPercentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-row items-start xs:items-center justify-between gap-2 w-full">
                                    <div className="flex items-center gap-1.5 overflow-hidden ">
                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0 opacity-40">
                                            <rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                            <path d="M5 2V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            <path d="M11 2V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            <path d="M2 7H14" stroke="currentColor" strokeWidth="1.5" />
                                        </svg>
                                        <span className="text-[10px] sm:text-[11px] font-medium text-muted truncate">
                                            {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0 opacity-40">
                                            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                                            <path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                        <span className="text-[10px] sm:text-[11px] font-medium text-muted truncate">
                                            {startTime && endTime ? `${startTime} - ${endTime}` : (startTime ?? new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
