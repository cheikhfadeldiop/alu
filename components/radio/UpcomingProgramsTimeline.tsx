"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import Image from "next/image";
import { FullEPGChannel, FullEPGProgram } from "../../types/api";

const ChevronLeftIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
);

const ChevronRightIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
);

const LocationPinIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-red-600 shadow-xl">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
);

const CARD_WIDTH = 320; // Internal card slot width

interface UpcomingProgramsTimelineProps {
    epgData: FullEPGChannel[];
}

export function UpcomingProgramsTimeline({ epgData }: UpcomingProgramsTimelineProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [scrollLeft, setScrollLeft] = useState(0);
    const [viewportWidth, setViewportWidth] = useState(0);

    // Update time
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 10000);
        return () => clearInterval(timer);
    }, []);

    // Sync scroll position for indicator calculation
    const handleScroll = () => {
        if (scrollContainerRef.current) {
            setScrollLeft(scrollContainerRef.current.scrollLeft);
        }
    };

    // Initialize/Update viewport width
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

    // Flatten and process programs
    const allPrograms = useMemo(() => {
        const flattened: (FullEPGProgram & { startSec: number, endSec: number })[] = [];

        epgData.forEach(channel => {
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
                    channelLogo: channel.logo || channel.logo_url,
                    channelName: channel.titre,
                    startSec,
                    endSec
                });
            });
        });

        return flattened.sort((a, b) => a.startSec - b.startSec);
    }, [epgData]);

    const contentWidth = allPrograms.length * CARD_WIDTH;

    // Projected X relative to the start of the content (X=0 is the first pixel of the first card)
    const getNowProjectedX = () => {
        if (allPrograms.length === 0) return 0;
        const nowSec = currentTime.getHours() * 3600 + currentTime.getMinutes() * 60 + currentTime.getSeconds();

        const index = allPrograms.findIndex(p => nowSec >= p.startSec && nowSec < p.endSec);

        if (index !== -1) {
            const prog = allPrograms[index];
            const progress = (nowSec - prog.startSec) / (prog.endSec - prog.startSec);
            // Center the pin on the card width by adding CARD_WIDTH/2
            return (index * CARD_WIDTH) + (progress * CARD_WIDTH);
        }

        const nextIndex = allPrograms.findIndex(p => p.startSec > nowSec);
        if (nextIndex === 0) return 0;
        if (nextIndex === -1) return contentWidth;
        return nextIndex * CARD_WIDTH;
    };

    const nowX = getNowProjectedX();

    // Auto-scroll logic: Keep nowX centered IF POSSIBLE
    useEffect(() => {
        if (scrollContainerRef.current && viewportWidth > 0) {
            const center = viewportWidth / 2;
            const maxScroll = Math.max(0, contentWidth - viewportWidth);
            // Offset to center the PIN on the SCREEN relative to the CARD center
            // We want nowX + CARD_WIDTH/2 to be at 'center' on screen.
            const targetX = nowX + 160;
            const targetScroll = targetX - center;

            scrollContainerRef.current.scrollTo({
                left: Math.min(Math.max(0, targetScroll), maxScroll),
                behavior: "smooth"
            });
        }
    }, [nowX, viewportWidth, contentWidth]);

    // Indicator screen position: nowX (content) - scrollLeft + offset
    // This allows it to move L-0 -> Center at start and Center -> R-0 at end
    const indicatorScreenX = nowX - scrollLeft + 160;

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === "left" ? -CARD_WIDTH : CARD_WIDTH;
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    if (allPrograms.length === 0) return null;

    return (
        <div className="w-full space-y-8 py-12 relative overflow-hidden">
            <div className="flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">
                        PROGRAMMES À VENIR
                    </h2>
                    <div className="flex text-red-600 animate-pulse">
                        <ChevronRightIcon />
                        <ChevronRightIcon />
                    </div>
                </div>

                <div className="flex gap-2">
                    <button onClick={() => scroll("left")} className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all transform active:scale-95">
                        <ChevronLeftIcon />
                    </button>
                    <button onClick={() => scroll("right")} className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all transform active:scale-95">
                        <ChevronRightIcon />
                    </button>
                </div>
            </div>

            <div className="relative">
                {/* Fixed Indicator Overlay (Moves relative to screen) */}
                <div
                    className="absolute top-0 z-50 pointer-events-none flex flex-col items-center transition-all duration-1000 ease-linear"
                    style={{
                        left: `${indicatorScreenX}px`,
                        transform: 'translateX(-50%)'
                    }}
                >
                    <div className="relative mb-2">
                        <div className="absolute inset-0 bg-red-600/40 rounded-full animate-ping scale-110" />
                        <div className="relative z-10 filter drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">
                            <LocationPinIcon />
                        </div>
                    </div>
                    <div className="w-0.5 h-[230px] bg-gradient-to-b from-red-600 via-red-600/30 to-transparent" />
                </div>

                {/* Scrollable Container (No padding-X anymore) */}
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="overflow-x-auto no-scrollbar relative min-h-[300px]"
                >
                    <div className="relative flex w-max pt-16 pb-4">
                        {allPrograms.map((program, index) => {
                            const nowSec = currentTime.getHours() * 3600 + currentTime.getMinutes() * 60;
                            const isLive = nowSec >= program.startSec && nowSec < program.endSec;

                            return (
                                <div key={`${program.slug}-${index}`} className="flex-shrink-0 w-100 h-100 flex flex-col px-4 group">
                                    <div className="flex flex-col items-center mb-6">
                                        <span className={`text-sm font-bold transition-colors ${isLive ? 'text-white' : 'text-white/20'}`}>
                                            {program.startTime}
                                        </span>
                                        <div className={`w-px h-6 bg-gradient-to-b ${isLive ? 'from-white/40' : 'from-white/10'} to-transparent`} />
                                    </div>

                                    <div className={`relative w-full rounded-2xl p-4 flex gap-4 transition-all duration-300 border backdrop-blur-sm
                                        ${isLive ? 'bg-red-600/10 border-red-600/30 shadow-[0_0_40px_rgba(220,38,38,0.15)]' : 'bg-white/5 border-white/5 hover:bg-white/[0.08]'}`}>

                                        <div className="relative w-34 h-30 rounded-xl overflow-hidden shadow-2xl shrink-0">
                                            <Image src={program.logo || "/assets/placeholders/radio_icon_sur_card.png"} alt={program.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" unoptimized />
                                            <div className="absolute bottom-1 left-1 w-8 h-8 rounded bg-black/60 backdrop-blur-md p-1 border border-white/10">
                                                <img src={program.channelLogo} alt={program.channelName} className="w-full h-full object-contain" />
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-center min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {isLive ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">LIVE</span>
                                                    </div>
                                                ) : <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">NEXT</span>}
                                            </div>
                                            <h3 className="text-sm font-bold text-white truncate leading-tight mb-1">{program.title}</h3>
                                            <h3 className="text-sm font-bold text-white truncate leading-tight mb-1">{program.startTime} - {program.endTime}</h3>
                                            <div className="text-[11px] font-medium text-white/40 uppercase tracking-tighter">{program.channelName}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
