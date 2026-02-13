"use client";

import { useState, useRef } from "react";
import { LiveChannel, EPGItem } from "../../types/api";
import { useTranslations } from "next-intl";
import { SITE_CONFIG } from "@/constants/site-config";
import { SafeImage } from "../ui/SafeImage";

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
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between px-1">
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

                <div className="flex gap-2">
                    <button onClick={() => scrollBy('left')} className="w-10 h-10 border border-white/10 bg-foreground/5 hover:bg-[color:var(--accent)] transition-colors flex items-center justify-center rounded-sm group"><svg className="w-5 h-5 text-foreground/60 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 19l-7-7 7-7" /></svg></button>
                    <button onClick={() => scrollBy('right')} className="w-10 h-10 border border-white/10 bg-foreground/5 hover:bg-[color:var(--accent)] transition-colors flex items-center justify-center rounded-sm group"><svg className="w-5 h-5 text-foreground/60 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" /></svg></button>
                </div>
            </div>

            <div ref={scrollerRef} className="flex gap-6 overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth">
                {filteredChannels.map((channel) => {
                    const currentProgram = epgItems.find((epg) => epg.channel_id === channel.id && epg.is_current);
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
                        if (totalDuration > 0) progressPercentage = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
                    } else {
                        const safeId = channel.id ? String(channel.id) : "unknown";
                        const seed = safeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                        progressPercentage = 15 + (seed % 75);
                    }

                    const channelKey = channel.id || channel.slug;
                    const isSelected = selectedChannelId === channelKey;
                    const isRadio = channel.type === "RADIO";

                    return (
                        <button
                            key={channelKey}
                            onClick={() => onSelectChannel(channel)}
                            className={`group relative flex flex-col shrink-0 w-[260px] sm:w-[300px] h-[220px] overflow-hidden rounded-sm bg-background/35 backdrop-blur-sm text-left transition-all duration-300 border-2 hover:translate-y-1 hover:scale-[1.02] ${isSelected ? "border-[color:var(--accent)] scale-[1.02]" : "border-transparent hover:border-[color:var(--accent)]"}`}
                        >
                            <div className="relative h-[65%] w-full bg-background/20">
                                <SafeImage
                                    src={channel.logo_url || channel.logo || channel.hd_logo || channel.sd_logo || SITE_CONFIG.theme.placeholders.video}
                                    alt={channel.title}
                                    fill
                                    className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                                {channel.logo_url && (
                                    <div className="absolute bottom-2 right-2 w-10 h-10 bg-background/10 backdrop-blur-md rounded-sm p-1 border border-white/20">
                                        <SafeImage src={channel.logo_url} alt="logo" fill className="object-contain" />
                                    </div>
                                )}

                                <div className="absolute top-2 right-2 px-2 py-1 bg-[color:var(--accent)] text-white text-[9px] font-bold uppercase tracking-widest rounded-sm flex items-center gap-1.5 shadow-lg">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                    {t("live")}
                                </div>

                                <div className="absolute bottom-2 left-2">
                                    <div className="w-8 h-8 relative drop-shadow-lg opacity-80 group-hover:opacity-100 transition-opacity">
                                        <SafeImage src={isRadio ? SITE_CONFIG.theme.placeholders.radio : SITE_CONFIG.theme.placeholders.video} alt={isRadio ? "Radio" : "Live TV"} fill className="object-contain" />
                                    </div>
                                </div>
                            </div>

                            <div className="h-[35%] w-full bg-background/5 backdrop-blur-sm px-4 py-3 flex flex-col justify-between border-t border-white/5">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-4">
                                        <h3 className="font-bold text-sm tracking-wide line-clamp-1 group-hover:text-[color:var(--accent)] transition-colors">{channel.title}</h3>
                                    </div>
                                    <div className="w-full h-1 bg-forground/40 rounded-full overflow-hidden">
                                        <div className="h-full bg-[color:var(--accent)] rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }} />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-[10px] font-medium text-forground/20 uppercase tracking-wider">
                                    <span className="flex items-center gap-1.5"><svg className="w-3 h-3 text-[color:var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{currentProgram?.start_time || t("direct")}</span>
                                    <span>{currentProgram?.end_time || "24/7"}</span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
