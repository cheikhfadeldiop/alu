"use client";

import * as React from "react";
import Image from "next/image";
import { Link } from "../../i18n/navigation";
import { ShowReplayGroup } from "../../services/api";
import { getRelatedItems } from "../../services/api";
import { SectionTitle } from "../ui/SectionTitle";

interface CrossedNavigationSectionProps {
    data: ShowReplayGroup[];
}

export function CrossedNavigationSection({ data: initialData }: CrossedNavigationSectionProps) {
    // Start at a large number to allow infinite scrolling in both directions
    const [virtualIndex, setVirtualIndex] = React.useState(1000);
    const [shows, setShows] = React.useState<ShowReplayGroup[]>(initialData);
    const [loadingMap, setLoadingMap] = React.useState<Record<number, boolean>>({});

    const rowRefs = React.useRef<(HTMLDivElement | null)[]>([]);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const activeIndex = virtualIndex % shows.length;
    const activeChannel = shows[activeIndex];

    const navigate = (direction: 'up' | 'down' | 'left' | 'right') => {
        if (direction === 'up') {
            setVirtualIndex(prev => prev - 1);
        } else if (direction === 'down') {
            setVirtualIndex(prev => prev + 1);
        } else if (direction === 'left' || direction === 'right') {
            const el = rowRefs.current[activeIndex];
            if (el) {
                const scrollAmount = el.offsetWidth * 0.6;
                el.scrollBy({
                    left: direction === 'left' ? -scrollAmount : scrollAmount,
                    behavior: 'smooth'
                });
            }
        }
    };

    const loadMore = async (index: number) => {
        const show = shows[index];
        if (!show.nextBatchUrl || loadingMap[index]) return;

        setLoadingMap(prev => ({ ...prev, [index]: true }));

        try {
            const nextVideos = await getRelatedItems(show.nextBatchUrl);
            if (nextVideos && nextVideos.length > 0) {
                // Filter out already seen slugs
                const seenSlugs = new Set(show.videos.map(v => v.slug));
                const uniqueNewVideos = nextVideos.filter(v => !seenSlugs.has(v.slug));

                if (uniqueNewVideos.length > 0) {
                    setShows(prev => {
                        const newShows = [...prev];
                        newShows[index] = {
                            ...newShows[index],
                            videos: [...newShows[index].videos, ...uniqueNewVideos],
                            // Update nextBatchUrl if available in the new batch items' relatedItems 
                            // (API dependent, assuming the same or next URL)
                            // For now, we clear it if no new videos were found to prevent loops
                        };
                        return newShows;
                    });
                } else {
                    // No new unique videos, clear nextBatchUrl
                    setShows(prev => {
                        const newShows = [...prev];
                        newShows[index] = { ...newShows[index], nextBatchUrl: undefined };
                        return newShows;
                    });
                }
            } else {
                setShows(prev => {
                    const newShows = [...prev];
                    newShows[index] = { ...newShows[index], nextBatchUrl: undefined };
                    return newShows;
                });
            }
        } catch (err) {
            console.error("Failed to load more videos:", err);
        } finally {
            setLoadingMap(prev => ({ ...prev, [index]: false }));
        }
    };

    const handleHorizontalScroll = (e: React.UIEvent<HTMLDivElement>, showIndex: number) => {
        const target = e.currentTarget;
        const reachedEnd = target.scrollWidth - target.scrollLeft <= target.clientWidth + 500;

        if (reachedEnd) {
            loadMore(showIndex);
        }
    };

    // Handle mouse wheel for vertical navigation with a non-passive listener
    React.useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheelEvent = (e: WheelEvent) => {
            if (Math.abs(e.deltaY) > 10) {
                // Determine direction
                const direction = e.deltaY > 0 ? 'down' : 'up';

                // Throttle scroll to avoid jumping multiple items too quickly
                const now = Date.now();
                if (now - (container as any).lastScrollTime < 150) return;
                (container as any).lastScrollTime = now;

                setVirtualIndex(prev => direction === 'up' ? prev - 1 : prev + 1);

                // Prevent page scroll
                if (e.cancelable) e.preventDefault();
            }
        };

        container.addEventListener('wheel', handleWheelEvent, { passive: false });
        return () => container.removeEventListener('wheel', handleWheelEvent);
    }, [shows.length]);

    if (!shows || shows.length === 0) return null;

    return (
        <section className="w-full max-w-[1400px] mx-auto px-4 py-8 space-y-12 overflow-hidden">
            <div className="flex items-center justify-between">
                <SectionTitle title="Archives" title2="des Émissions" />
                {/*<Link href="/replay" className="text-xs font-semibold text-foreground/50 hover:text-red-600 transition-colors uppercase tracking-widest">
                    Voir Tout
                </Link>*/}
            </div>

            {/* Container for the whole section to handle global mouse wheel */}
            <div
                ref={containerRef}
                className="flex flex-col md:flex-row gap-12 items-center min-h-[600px] relative transition-all duration-700"
            >

                {/* Content Area - Infinite Tapis Roulant Mode */}
                <div className="flex-1 w-full h-[600px] relative mt-8 md:mt-0 overflow-hidden rounded-[3rem]">

                    <div
                        className="transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] will-change-transform"
                        style={{ transform: `translateY(${150 - virtualIndex * 332}px)` }} // 150 to center in 600px height. 332 = 300(height) + 32(gap)
                    >
                        {/* Render extra items to simulate infinity */}
                        {Array.from({ length: 2000 }).map((_, i) => {
                            const showIndex = i % shows.length;
                            const show = shows[showIndex];
                            const isCurrent = i === virtualIndex;
                            const distance = Math.abs(i - virtualIndex);

                            // Optimization: Only render items near the active viewport
                            if (distance > 3) return <div key={i} className="h-[332px]" />;

                            return (
                                <div
                                    key={i}
                                    className={`w-full h-[300px] mb-8 transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] flex flex-col justify-center transform-gpu ${isCurrent
                                        ? 'opacity-100 scale-100 pointer-events-auto z-10 rotate-x-0'
                                        : 'opacity-20 scale-90 pointer-events-none blur-[2px] z-0 grayscale'
                                        }`}
                                >
                                    <div
                                        ref={el => { if (isCurrent) rowRefs.current[activeIndex] = el; }}
                                        onScroll={(e) => handleHorizontalScroll(e, showIndex)}
                                        className="flex gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth h-full items-center px-12"
                                    >
                                        {show.videos.map((video, vIdx) => (
                                            <VideoItem key={`${video.slug}-${vIdx}`} video={video} />
                                        ))}

                                        {loadingMap[showIndex] && (
                                            <div className="shrink-0 w-[100px] h-full flex flex-col items-center justify-center animate-pulse gap-2">
                                                <div className="w-8 h-8 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
                                                <span className="text-[10px] uppercase font-black tracking-widest text-red-600">Chargement</span>
                                            </div>
                                        )}

                                        {show.videos.length === 0 && !loadingMap[showIndex] && (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-foreground/20 italic gap-4">
                                                <svg className="w-12 h-12 opacity-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 0 00-2 2v8a2 0 002 2z" />
                                                </svg>
                                                <span className="text-xs uppercase tracking-widest font-black">Aucun contenu</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>
                {/* Fixed Joystick - Positioned relative to the active row */}
                <div className="flex flex-col items-center gap-6 w-full md:w-auto z-40">
                    {/* Joystick Control Wrapper */}
                    <div className="relative p-6  bg-foreground/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 transition-transform">
                        {/* Joystick D-Pad */}
                        <div className="relative w-44 h-44 flex items-center justify-center bg-black/40 rounded-full border-4 border-white/5 shadow-inner">
                            {/* Directional Glows */}
                            <div className="absolute inset-0 rounded-full pointer-events-none">
                                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-12 h-6 bg-red-600/20 blur-xl opacity-100`} />
                            </div>

                            {/* Cross Pad Grid */}
                            <div className="grid grid-cols-3 grid-rows-3 gap-2 relative z-10 w-36 h-36 ">
                                <div />
                                <NavButton direction="up" onClick={() => navigate('up')} />
                                <div />

                                <NavButton direction="left" onClick={() => navigate('left')} />
                                <div className="flex items-center justify-center">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-red-800 shadow-[0_0_20px_rgba(220,38,38,0.8)] border border-white/20" />
                                </div>
                                <NavButton direction="right" onClick={() => navigate('right')} />

                                <div />
                                <NavButton direction="down" onClick={() => navigate('down')} />
                                <div />
                            </div>
                        </div>

                        {/* Labels */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-red-600 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-lg">EMISSIONS</div>
                    </div>

                    {/* Active Channel Info */}
                    <div className="flex flex-col items-center gap-3 transition-all duration-700">
                        <h4 className="text-md font-black italic tracking-tighter uppercase flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping line-clamp-1" />
                            {activeChannel.title}
                        </h4>
                    </div>
                </div>

            </div>
        </section>
    );
}

function NavButton({ direction, onClick }: { direction: 'up' | 'down' | 'left' | 'right', onClick: () => void }) {
    const arrows = {
        up: "M5 15l7-7 7 7",
        down: "M19 9l-7 7-7-7",
        left: "M15 19l-7-7 7-7",
        right: "M9 5l7 7-7 7"
    };

    const posClasses = {
        up: "col-start-2 row-start-1 bg-gradient-to-b",
        down: "col-start-2 row-start-3 bg-gradient-to-t",
        left: "col-start-1 row-start-2 bg-gradient-to-r",
        right: "col-start-3 row-start-2 bg-gradient-to-l"
    };

    return (
        <button
            onClick={onClick}
            className={`flex items-center justify-center ${posClasses[direction]} from-white/10 to-transparent hover:from-red-600 hover:to-red-800 transition-all duration-300 rounded-xl border border-white/5 group shadow-lg active:scale-90 active:shadow-inner`}
        >
            <svg className="w-8 h-8 text-white/34 group-hover:text-white transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={arrows[direction]} />
            </svg>
        </button>
    );
}

function VideoItem({ video }: { video: SliderVideoItem }) {
    // Determine the source URL, fallback to logo if logo_url is null
    const displayImage = video.logo_url && video.logo_url !== "null" ? video.logo_url : video.logo;

    return (
        <Link
            href={`/replay/${video.slug}`}
            className="shrink-0 w-[240px] sm:w-[300px] group block space-y-4"
        >
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-white/5 shadow-2xl border border-white/5">
                {displayImage && displayImage !== "null" ? (
                    <Image
                        src={displayImage}
                        alt={video.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, 300px"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-foreground/5 italic text-[10px] text-foreground/20 uppercase tracking-widest font-bold">
                        Aperçu non disponible
                    </div>
                )}

                {/* Play Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 rounded-full border-2 border-white/50 flex items-center justify-center backdrop-blur-md scale-75 group-hover:scale-100 transition-transform">
                        <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1" />
                    </div>
                </div>

                {/* Date Badge */}
                <div className="absolute top-3 left-3 px-2 py-1 bg-red-600/90 backdrop-blur-md rounded text-[9px] font-black text-white border border-white/10 uppercase tracking-tighter shadow-xl">
                    {video.date}
                </div>
            </div>

            <div className="space-y-1.5 px-1 pb-2">
                <h4 className="font-black text-sm leading-tight line-clamp-2 group-hover:text-red-500 transition-colors uppercase tracking-tight">
                    {video.title}
                </h4>

                <div className="flex items-center gap-2 text-[9px] font-black text-foreground/30 uppercase tracking-widest group-hover:text-foreground/50 transition-colors">
                    <span className="text-red-600">Replay</span>
                    <span className="w-1 h-1 rounded-full bg-foreground/20" />
                    <span className="line-clamp-1">{video.desc || "CRTV Archive"}</span>
                </div>
            </div>
        </Link>
    );
}
