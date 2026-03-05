"use client";

import * as React from "react";
import { Link } from "../../i18n/navigation";
import { SliderVideoItem } from "../../types/api";
import { SectionTitle } from "../ui/SectionTitle";
import { useTranslations } from "next-intl";
import { SafeImage } from "../ui/SafeImage";
import { getPostAuthor, formatDate } from "@/utils/text";

interface EmissionsSliderProps {
    shows: SliderVideoItem[];
}

export function EmissionsSlider({ shows }: EmissionsSliderProps) {
    const t = useTranslations();
    const scrollerRef = React.useRef<HTMLDivElement | null>(null);

    const scrollBy = (direction: 'left' | 'right') => {
        const el = scrollerRef.current;
        if (!el) return;

        const scrollAmount = el.offsetWidth * 0.8;
        el.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: "smooth"
        });
    };

    if (!shows || shows.length === 0) return null;

    return (
        <section className="w-full mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <SectionTitle title={t("pages.replay.ourShows") + " " + t("pages.replay.tvSubtitle")} className="font-bold" title2="" />
                <div className="flex gap-3">
                    <button onClick={() => scrollBy('left')} className="w-6 h-6 border border-border bg-surface hover:bg-accent hover:border-accent transition-all flex items-center justify-center rounded-lg group shadow-sm hover:shadow-md hover:scale-105 active:scale-95">
                        <svg className="w-5 h-5 text-muted group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button onClick={() => scrollBy('right')} className="w-6 h-6 border border-border bg-surface hover:bg-accent hover:border-accent transition-all flex items-center justify-center rounded-lg group shadow-sm hover:shadow-md hover:scale-105 active:scale-95">
                        <svg className="w-5 h-5 text-muted group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            <div ref={scrollerRef} className="flex gap-6 overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth">
                {shows.map((show, idx) => (
                    <ShowCard key={`${show.slug}-${idx}`} show={show} />
                ))}
            </div>
        </section>
    );
}

function ShowCard({ show }: { show: SliderVideoItem }) {
    const channelLogo = show.chaine_logo || show.channel_logo;

    return (
        <Link
            href={`/replay/${show.slug || show.title.toLowerCase().replace(/\s+/g, '-')}`}
            className="shrink-0 w-[240px] sm:w-[280px] group block space-y-4 hover:scale-[1.02] transition-all duration-300"
        >
            <div className="relative aspect-square overflow-hidden rounded-sm bg-surface  shadow-sm group-hover:shadow-xl group-hover:border-accent/30 transition-all duration-500">
                <SafeImage
                    src={show.logo_url || show.logo}
                    alt={show.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 300px"
                />

                {channelLogo && (
                    <div className="absolute top-4 right-4 z-10 w-14 h-10 transform group-hover:scale-110 transition-transform duration-500">
                        <SafeImage
                            src={channelLogo}
                            alt={show.chaine_name || "Channel"}
                            fill
                            className="object-contain"
                        />
                    </div>
                )}
            </div>

            <div className="space-y-2 px-1">
                <h3 className="b2 font-black uppercase tracking-tight line-clamp-1  transition-colors">
                    {show.title}
                </h3>

                <div className="flex items-center gap-4 text-[10px] font-bold text-muted uppercase tracking-[0.1em] w-full">
                    <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 " fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(show.date)}
                    </span>
                    {/*tiret grey*/}
                    <div className="w-2 h-0.5 bg-muted/30"></div>
                    
                    <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 " fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {show.time || "10h 45"}
                    </span>
                </div>
            </div>
        </Link>
    );
}
