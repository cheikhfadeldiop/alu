"use client";

import * as React from "react";
import Image from "next/image";
import { Link } from "../../i18n/navigation";
import { SliderVideoItem } from "../../types/api";
import { SectionTitle } from "../ui/SectionTitle";

interface EmissionsSliderProps {
    shows: SliderVideoItem[];
}

export function EmissionsSlider({ shows }: EmissionsSliderProps) {
    const scrollerRef = React.useRef<HTMLDivElement | null>(null);
    const [scrollProgress, setScrollProgress] = React.useState(0);

    const scrollBy = (direction: 'left' | 'right') => {
        const el = scrollerRef.current;
        if (!el) return;

        const scrollAmount = el.offsetWidth * 0.8;
        el.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: "smooth"
        });
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        const maxScroll = el.scrollWidth - el.offsetWidth;
        const progress = maxScroll > 0 ? el.scrollLeft / maxScroll : 0;
        setScrollProgress(progress);
    };

    if (!shows || shows.length === 0) return null;

    return (
        <section className="w-full max-w-[1400px] mx-auto px-4  space-y-8">
            {/* Header with Title and Custom Navigation */}
            <div className="flex items-center justify-between">
               <SectionTitle title="Nos Émissions de" 
               title2="Télévision"/>

                {/* Top Right Navigation Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => scrollBy('left')}
                        className="w-10 h-10 border border-white/10 bg-foreground/10 hover:bg-red-600 transition-colors flex items-center justify-center rounded-sm group"
                        aria-label="Previous"
                    >
                        <svg className="w-5 h-5 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={() => scrollBy('right')}
                        className="w-10 h-10 border border-white/10 bg-foreground/10 hover:bg-red-600 transition-colors flex items-center justify-center rounded-sm group"
                        aria-label="Next"
                    >
                        <svg className="w-5 h-5  group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Scroller */}
            <div
                ref={scrollerRef}
                onScroll={handleScroll}
                className="flex gap-6 overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
            >
                {shows.map((show, idx) => (
                    <ShowCard key={`${show.slug}-${idx}`} show={show} />
                ))}
            </div>
        </section>
    );
}

function ShowCard({ show }: { show: SliderVideoItem }) {
    return (
        <Link
            href={`/replay/show/${show.slug || show.title.toLowerCase().replace(/\s+/g, '-')}`}
            className="shrink-0 w-[240px] sm:w-[280px] group block space-y-4 hover:scale-105 transition-transform"
        >
            {/* Square Image Container */}
            <div className="relative aspect-square overflow-hidden rounded-sm bg-white/5 border-b-4 border-red-600">
                <Image
                    src={show.logo_url}
                    alt={show.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 300px"
                />

                {/* Channel Overlay Badge if available */}
                {show.chaine_logo && (
                    <div className="absolute top-2 right-2 z-10 w-14 h-12 rounded-sm bg-background/30 backdrop-blur-md p-0.5 shadow-md">
                        <Image
                            src={show.chaine_logo}
                            alt={show.chaine_name || "Channel"}
                            width={42}
                            height={42}
                            className="w-full h-full object-contain"
                        />
                    </div>
                )}
            </div>

            {/* Show Info */}
            <div className="space-y-2">
                <h3 className="font-bold text-base md:text-lg line-clamp-1 group-hover:text-red-500 transition-colors">
                    {show.title}
                </h3>

                <div className="flex items-center gap-4 text-[10px] md:text-xs font-medium text-foreground/50 uppercase tracking-tight">
                    {/* Date with icon */}
                    <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {show.date || "Jeudi -Vendredi"}
                    </span>

                    {/* Time with icon */}
                    <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {show.time || "10:45"}
                    </span>
                </div>
            </div>
        </Link>
    );
}
