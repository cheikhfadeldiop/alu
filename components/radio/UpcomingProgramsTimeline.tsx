"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import Image from "next/image";
import { FullEPGChannel, FullEPGProgram } from "../../types/api";
import { useTranslations } from "next-intl";
import { SITE_CONFIG } from "../../constants/site-config";
import { SafeImage } from "../ui/SafeImage";

const ChevronLeftIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
);

const ChevronRightIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
);

const LocationPinIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-[color:var(--accent)] shadow-xl">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
);

interface UpcomingProgramsTimelineProps {
    epgData: FullEPGChannel[];
    currentChannelId?: string;
    currentChannelLogo?: string;
}

export function UpcomingProgramsTimeline({ epgData, currentChannelId, currentChannelLogo }: UpcomingProgramsTimelineProps) {
    const t = useTranslations("pages.radio");
    const tCommon = useTranslations("common");
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [scrollLeft, setScrollLeft] = useState(0);
    const [viewportWidth, setViewportWidth] = useState(0);

    const CARD_WIDTH = viewportWidth > 0 && viewportWidth < 640 ? 200 : 400;

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 30000);
        return () => clearInterval(timer);
    }, []);

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            setScrollLeft(scrollContainerRef.current.scrollLeft);
        }
    };

    useEffect(() => {
        const updateWidth = () => {
            if (scrollContainerRef.current) {
                setViewportWidth(scrollContainerRef.current.offsetWidth);
                setScrollLeft(scrollContainerRef.current.scrollLeft);
            }
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    const allPrograms = useMemo(() => {
        const flattened: (FullEPGProgram & { startSec: number, endSec: number, channelLogo?: string, channelName: string })[] = [];

        // Filter by current channel if provided
        const filteredChannels = currentChannelId
            ? epgData.filter(ch => ch.id === currentChannelId)
            : epgData;

        filteredChannels.forEach(channel => {
            const { matin = [], soir = [] } = channel.subitems || {};
            const combined = [...matin, ...soir];
            combined.forEach(prog => {
                const [sH, sM] = prog.startTime.split(':').map(Number);
                const [eH, eM] = prog.endTime.split(':').map(Number);
                const startSec = sH * 3600 + sM * 60;
                let endSec = eH * 3600 + eM * 60;
                if (endSec < startSec) endSec += 24 * 3600;
                flattened.push({
                    ...prog,
                    channelLogo: channel.logo || SITE_CONFIG.theme.placeholders.logo,
                    channelName: channel.titre,
                    startSec,
                    endSec
                });
            });
        });
        return flattened.sort((a, b) => a.startSec - b.startSec);
    }, [epgData, currentChannelId]);

    const contentWidth = allPrograms.length * CARD_WIDTH;

    const getNowProjectedX = () => {
        if (allPrograms.length === 0) return 0;
        const nowSec = currentTime.getHours() * 3600 + currentTime.getMinutes() * 60;

        // Find current or next program
        const index = allPrograms.findIndex(p => nowSec >= p.startSec && nowSec < p.endSec);
        if (index !== -1) {
            const prog = allPrograms[index];
            const progress = (nowSec - prog.startSec) / (prog.endSec - prog.startSec);
            return (index * CARD_WIDTH) + (progress * CARD_WIDTH);
        }
        const nextIndex = allPrograms.findIndex(p => p.startSec > nowSec);
        if (nextIndex === 0) return 0;
        if (nextIndex === -1) return contentWidth;
        return nextIndex * CARD_WIDTH;
    };

    const nowX = getNowProjectedX();

    // Auto-scroll on mount and when nowX changes
    useEffect(() => {
        if (scrollContainerRef.current && viewportWidth > 0) {
            const center = viewportWidth / 2;
            const maxScroll = Math.max(0, contentWidth - viewportWidth);
            const targetX = nowX + (CARD_WIDTH / 2);
            const targetScroll = targetX - center;
            scrollContainerRef.current.scrollTo({
                left: Math.min(Math.max(0, targetScroll), maxScroll),
                behavior: "auto" // Jump initially on mount
            });
        }
    }, [nowX, viewportWidth, contentWidth, allPrograms.length]); // Added length to re-run if filtering changes

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === "left" ? -CARD_WIDTH : CARD_WIDTH;
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    if (allPrograms.length === 0) return null;

    const brandLogo = currentChannelLogo || epgData[0]?.logo || SITE_CONFIG.theme.placeholders.logo;

    return (
        <div className="w-full space-y-6 sm:space-y-10 py-6 sm:py-10 relative overflow-hidden">
            {/* Title Header */}
            <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-8 pt-2">
                <h2 className="text-lg sm:text-2xl font-black tracking-tighter uppercase italic">{t("upNext")}</h2>
                <div className="relative w-4 h-4 sm:w-6 sm:h-6">
                    <Image src={SITE_CONFIG.theme.placeholders.arrow} alt="" fill className="object-contain" />
                </div>
            </div>

            {/* Main Timeline Component */}
            <div className="flex flex-col sm:flex-row px-4 sm:px-8 items-stretch gap-4 sm:gap-1">
                {/* Channel Logo Block - Visible on desktop, adapted for mobile if needed */}
                <div className="hidden lg:flex w-36 xl:w-44 h-[120px] md:h-[135px] shrink-0 aspect-square items-end justify-center p-4 bg-foreground/10 backdrop-blur-md border border-white/5 relative z-30 self-end rounded-l-2xl">
                    <div className="relative w-full h-full">
                        <SafeImage src={brandLogo} alt="Channel" fill className="object-contain" />
                    </div>
                </div>

                {/* Mobile Channel Badge */}
                <div className="lg:hidden flex items-center gap-3 mb-2 px-2">
                    <div className="relative w-10 h-10 shrink-0">
                        <SafeImage src={brandLogo} alt="Channel" fill className="object-contain" />
                    </div>
                    <span className="text-xs font-bold text-foreground/60 uppercase tracking-widest">{epgData[0]?.titre}</span>
                </div>

                {/* Right Content Engine */}
                <div className="flex-1 min-w-0 flex flex-col justify-end">
                    {/* Top Row: Navigation + Ticks */}
                    <div className="flex items-center h-10 mb-2 sm:mb-1 relative">
                        <button
                            onClick={() => scroll("left")}
                            className="bg-foreground/5 p-1.5 sm:p-1 rounded-lg border border-white/5 text-foreground/40 hover:text-[color:var(--accent)] transition-all transform active:scale-95 mr-2"
                        >
                            <ChevronLeftIcon />
                        </button>

                        <div className="flex-1 overflow-hidden h-full relative">
                            <div
                                className="flex h-full transition-transform duration-300 ease-out"
                                style={{ transform: `translateX(-${scrollLeft}px)` }}
                            >
                                {allPrograms.map((program, index) => (
                                    <div key={`ticks-${index}`} style={{ width: CARD_WIDTH }} className="flex-shrink-0 relative h-full flex items-end pb-1 pr-1">
                                        <div className="absolute left-1 bottom-0 ml-4 sm:ml-10 flex flex-col items-center">
                                            <span className="text-[10px] sm:text-[13px] font-bold text-foreground opacity-60 sm:opacity-100">{program.startTime}</span>
                                            <div className="w-px h-4 sm:h-6 bg-foreground/40 sm:bg-foreground" />
                                        </div>
                                        <div className="absolute right-2 bottom-0 mr-4 sm:mr-20 flex flex-col items-center">
                                            <span className="text-[10px] sm:text-[13px] font-bold text-foreground opacity-60 sm:opacity-100">{program.endTime}</span>
                                            <div className="w-px h-4 sm:h-6 bg-foreground/40 sm:bg-foreground" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => scroll("right")}
                            className="bg-foreground/5 p-1.5 sm:p-1 rounded-lg border border-white/5 text-foreground/40 hover:text-[color:var(--accent)] transition-all transform active:scale-95 ml-2"
                        >
                            <ChevronRightIcon />
                        </button>
                    </div>

                    {/* Bottom Row: Cards */}
                    <div
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                        className="overflow-x-auto no-scrollbar scroll-smooth"
                    >
                        <div className="flex gap-1 w-max">
                            {allPrograms.map((program, index) => {
                                const nowSec = currentTime.getHours() * 3600 + currentTime.getMinutes() * 60;
                                const isLive = nowSec >= program.startSec && nowSec < program.endSec;

                                return (
                                    <div
                                        key={`${program.slug}-${index}`}
                                        style={{ width: CARD_WIDTH }}
                                        className={`flex-shrink-0 p-4 sm:p-5 relative group flex items-center transition-all duration-300 border backdrop-blur-sm ${isLive
                                            ? 'bg-[color:var(--accent)]/10 border-[color:var(--accent)]/30 shadow-[0_0_40px_rgba(209,18,31,0.15)]'
                                            : 'bg-foreground/5 border-white/5 hover:bg-[color:var(--accent)]/5'
                                            } ${index === 0 && 'sm:rounded-tl-none'} last:rounded-r-2xl`}
                                    >
                                        <div className="flex gap-3 sm:gap-6 w-full items-center">
                                            <div className="relative w-16 sm:w-32 xl:w-40 aspect-video shrink-0 bg-foreground/10 overflow-hidden shadow-xl border border-white/5 rounded-lg sm:rounded-none">
                                                <SafeImage
                                                    src={program.logo || SITE_CONFIG.theme.placeholders.video}
                                                    alt=""
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            </div>

                                            <div className="flex flex-col justify-center min-w-0">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    {isLive && (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                                                    )}
                                                    <p className={`text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] ${isLive ? 'text-red-500' : 'text-foreground/40'}`}>
                                                        {isLive ? 'En Direct' : 'À venir'}
                                                    </p>
                                                </div>
                                                <p className="text-[10px] sm:text-[12px] font-medium text-foreground/50 mb-0.5 sm:mb-1">
                                                    {program.startTime} - {program.endTime}
                                                </p>
                                                <h3 className="text-[12px] sm:text-[16px] font-black text-foreground leading-tight line-clamp-1 sm:line-clamp-2">
                                                    {program.title}
                                                </h3>
                                            </div>
                                        </div>

                                        {isLive && (
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-foreground/5">
                                                <div
                                                    className="h-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all duration-1000 ease-linear"
                                                    style={{ width: `${Math.min(100, Math.max(0, ((nowSec - program.startSec) / (program.endSec - program.startSec)) * 100))}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes rpWave {
                    0% { transform: scaleY(1); }
                    100% { transform: scaleY(1.8); }
                }
                @keyframes rpPulseRing {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    100% { transform: scale(2.4); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
