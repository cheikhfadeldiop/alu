"use client";

import * as React from "react";
import Image from "next/image";
import { Link } from "../../i18n/navigation";
import { ShowReplayGroup, SliderVideoItem } from "../../services/api";
import { getRelatedItems } from "../../services/api";
import { SectionTitle } from "../ui/SectionTitle";

import { useTranslations } from "next-intl";

interface CrossedNavigationSectionProps {
    data: ShowReplayGroup[];
}

export function CrossedNavigationSection({ data: initialData }: CrossedNavigationSectionProps) {
    const t = useTranslations("common");
    // Start at a large number to allow infinite scrolling in both directions
    const [virtualIndex, setVirtualIndex] = React.useState(1000);
    const [shows, setShows] = React.useState<ShowReplayGroup[]>(initialData);
    const [loadingMap, setLoadingMap] = React.useState<Record<number, boolean>>({});
    const [isMobile, setIsMobile] = React.useState(false);

    // Detect mobile for visibility logic
    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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
                const seenSlugs = new Set(show.videos.map(v => v.slug));
                const uniqueNewVideos = nextVideos.filter(v => !seenSlugs.has(v.slug));

                if (uniqueNewVideos.length > 0) {
                    setShows(prev => {
                        const newShows = [...prev];
                        newShows[index] = {
                            ...newShows[index],
                            videos: [...newShows[index].videos, ...uniqueNewVideos],
                        };
                        return newShows;
                    });
                } else {
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

    const [viewportSize, setViewportSize] = React.useState({ width: 0, height: 0 });

    // Handle wheel, touch, and resize events
    React.useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleResize = () => {
            if (container) {
                setViewportSize({
                    width: container.offsetWidth,
                    height: container.offsetHeight
                });
            }
        };

        let touchStartY = 0;

        const handleWheelEvent = (e: WheelEvent) => {
            if (e.cancelable) {
                e.preventDefault();
                e.stopPropagation();
            }

            // [IMPROVED] Handle horizontal scroll (trackpad 2-fingers or Shift+Scroll)
            const isHorizontalInput = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;

            if (isHorizontalInput) {
                const el = rowRefs.current[activeIndex];
                if (el) {
                    const scrollDelta = e.shiftKey ? e.deltaY : e.deltaX;
                    el.scrollBy({
                        left: scrollDelta * 2,
                        behavior: 'auto'
                    });
                }
                return;
            }

            // Handle vertical navigation (emitters change)
            if (Math.abs(e.deltaY) > 5) {
                const direction = e.deltaY > 0 ? 'down' : 'up';
                const now = Date.now();
                const lastTime = (container as any).lastScrollTime || 0;
                if (now - lastTime < 130) return;
                (container as any).lastScrollTime = now;
                setVirtualIndex(prev => direction === 'up' ? prev - 1 : prev + 1);
            }
        };

        const handleTouchStart = (e: TouchEvent) => {
            touchStartY = e.touches[0].clientY;
        };

        const handleTouchMove = (e: TouchEvent) => {
            const touchY = e.touches[0].clientY;
            const deltaY = touchStartY - touchY;

            if (Math.abs(deltaY) > 40) {
                const direction = deltaY > 0 ? 'down' : 'up';
                const now = Date.now();
                const lastTime = (container as any).lastScrollTime || 0;
                if (now - lastTime < 300) return;
                (container as any).lastScrollTime = now;
                setVirtualIndex(prev => direction === 'up' ? prev - 1 : prev + 1);
                touchStartY = touchY;
                if (e.cancelable) e.preventDefault();
            }
        };

        container.addEventListener('wheel', handleWheelEvent, { passive: false });
        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('resize', handleResize);

        handleResize();

        return () => {
            container.removeEventListener('wheel', handleWheelEvent);
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('resize', handleResize);
        };
    }, [shows.length, activeIndex]);

    if (!shows || shows.length === 0) return null;

    // [PROPORTIONAL SCALING SYSTEM]
    const currentVH = viewportSize.height || (isMobile ? 420 : 600);
    const scale = currentVH / 600;
    const itemHeight = isMobile ? currentVH * 0.6 : currentVH * 0.5;
    const itemGap = currentVH * 0.05;
    const totalItemStep = itemHeight + itemGap;
    const centeringOffset = (currentVH - itemHeight) / 2;

    const cardWidth = isMobile ? itemHeight * 1.1 : itemHeight * 1.0;
    const horizontalGap = 24 * scale;

    return (
        <section className="w-full max-w-[1400px] mx-auto px-4 py-8 overflow-hidden">
            <div className="flex items-center justify-between" style={{ marginBottom: `${32 * scale}px` }}>
                <SectionTitle title={t("archives")} title2={t("shows")} />
            </div>

            <div
                ref={containerRef}
                className="flex flex-col md:flex-row items-center relative transition-all duration-700 select-none outline-none w-full aspect-[16/10] md:aspect-[21/9]"
                style={{ gap: `${isMobile ? 12 : 32 * scale}px` }}
                tabIndex={0}
            >
                <div className="flex-1 w-full h-full relative overflow-hidden">
                    <div
                        className="transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] will-change-transform"
                        style={{ transform: `translateY(${centeringOffset - virtualIndex * totalItemStep}px)` }}
                    >
                        {Array.from({ length: 2000 }).map((_, i) => {
                            const showIndex = i % shows.length;
                            const show = shows[showIndex];
                            const isCurrent = i === virtualIndex;
                            const distance = Math.abs(i - virtualIndex);

                            const maxVisibleDistance = isMobile ? 1 : 2;
                            if (distance > maxVisibleDistance) {
                                return <div key={i} style={{ height: `${totalItemStep}px` }} className="opacity-0" />;
                            }

                            return (
                                <div
                                    key={i}
                                    style={{ height: `${itemHeight}px`, marginBottom: `${itemGap}px` }}
                                    className={`w-full transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] flex flex-col justify-center transform-gpu ${isCurrent
                                        ? 'opacity-100 scale-100 pointer-events-auto z-10'
                                        : distance === 1
                                            ? 'opacity-30 scale-90 blur-[1px] grayscale'
                                            : 'opacity-0 scale-75 blur-[4px]'
                                        }`}
                                >
                                    <div
                                        ref={el => { rowRefs.current[showIndex] = el; }}
                                        onScroll={(e) => handleHorizontalScroll(e, showIndex)}
                                        className="flex overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden h-full items-center"
                                        style={{ gap: `${horizontalGap}px`, paddingLeft: `${40 * scale}px`, paddingRight: `${40 * scale}px` }}
                                    >
                                        {show.videos.map((video, vIdx) => (
                                            <VideoItem key={`${video.slug}-${vIdx}`} video={video} scale={scale} width={`${cardWidth}px`} />
                                        ))}

                                        {loadingMap[showIndex] && (
                                            <div className="shrink-0 flex flex-col items-center justify-center animate-pulse"
                                                style={{ width: `${80 * scale}px`, gap: `${8 * scale}px` }}>
                                                <div className="rounded-full border-2 border-red-600 border-t-transparent animate-spin"
                                                    style={{ width: `${24 * scale}px`, height: `${24 * scale}px` }} />
                                                <span className="uppercase font-black tracking-widest text-red-600"
                                                    style={{ fontSize: `${8 * scale}px` }}>{t("loading")}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-col items-center w-full md:w-auto z-40" style={{ gap: `${16 * scale}px` }}>
                    <div className="relative bg-foreground/5 backdrop-blur-3xl rounded-[2rem] md:rounded-[2.5rem] border border-white/5 "
                        style={{ padding: `${16 * scale}px` }}>
                        <div className="relative flex items-center justify-center bg-black/40 rounded-full border-2 md:border-4 border-white/5 "
                            style={{ width: `${140 * scale}px`, height: `${140 * scale}px` }}>
                            <div className="absolute inset-0 rounded-full pointer-events-none">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-red-600/20 blur-xl opacity-100"
                                    style={{ width: `${40 * scale}px`, height: `${20 * scale}px` }} />
                            </div>

                            <div className="grid grid-cols-3 grid-rows-3 relative z-10"
                                style={{ gap: `${4 * scale}px`, width: `${110 * scale}px`, height: `${110 * scale}px` }}>
                                <div />
                                <NavButton direction="up" onClick={() => navigate('up')} scale={scale} />
                                <div />

                                <NavButton direction="left" onClick={() => navigate('left')} scale={scale} />
                                <div className="flex items-center justify-center">
                                    <div className="rounded-full bg-gradient-to-br from-red-500 to-red-800 shadow-[0_0_20px_rgba(220,38,38,0.8)] border border-white/20"
                                        style={{ width: `${16 * scale}px`, height: `${16 * scale}px` }} />
                                </div>
                                <NavButton direction="right" onClick={() => navigate('right')} scale={scale} />

                                <div />
                                <NavButton direction="down" onClick={() => navigate('down')} scale={scale} />
                                <div />
                            </div>
                        </div>

                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-red-600 rounded-full font-black text-white uppercase tracking-widest shadow-lg whitespace-nowrap"
                            style={{ fontSize: `${8 * scale}px` }}>{t("controls")}</div>
                    </div>

                    <div className="flex flex-col items-center transition-all duration-700" style={{ gap: `${8 * scale}px` }}>
                        <h4 className="font-black italic tracking-tighter uppercase flex items-center"
                            style={{ fontSize: `${12 * scale}px`, gap: `${8 * scale}px` }}>
                            <span className="rounded-full bg-red-600 animate-ping"
                                style={{ width: `${6 * scale}px`, height: `${6 * scale}px` }} />
                            <span className="line-clamp-1">{activeChannel.title}</span>
                        </h4>
                    </div>
                </div>
            </div>
        </section>
    );
}

function NavButton({ direction, onClick, scale }: { direction: 'up' | 'down' | 'left' | 'right', onClick: () => void, scale: number }) {
    const arrows = {
        up: "M5 15l7-7 7 7", down: "M19 9l-7 7-7-7",
        left: "M15 19l-7-7 7-7", right: "M9 5l7 7-7 7"
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
            <svg className="text-white/34 group-hover:text-white transition-transform group-hover:scale-110"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                style={{ width: `${24 * scale}px`, height: `${24 * scale}px` }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={arrows[direction]} />
            </svg>
        </button>
    );
}

function VideoItem({ video, scale, width }: { video: SliderVideoItem, scale: number, width: string }) {
    const t = useTranslations("common");
    const initialImage = video.logo_url && video.logo_url !== "null" ? video.logo_url : video.logo;
    const [imgSrc, setImgSrc] = React.useState(initialImage);

    React.useEffect(() => {
        const newImage = video.logo_url && video.logo_url !== "null" ? video.logo_url : video.logo;
        setImgSrc(newImage);
    }, [video.logo_url, video.logo]);

    return (
        <Link
            href={`/replay/${video.slug}`}
            className="shrink-0 group block"
            style={{ width, gap: `${12 * scale}px`, display: 'flex', flexDirection: 'column' }}
        >
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-white/5 shadow-2xl border border-white/5">
                {imgSrc && imgSrc !== "null" ? (
                    <Image
                        src={imgSrc || "/assets/logo/logo.png"} alt={video.title} fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, 300px"
                        onError={() => setImgSrc("/assets/logo/logo.png")}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-foreground/5 italic uppercase tracking-widest font-bold text-center"
                        style={{ fontSize: `${8 * scale}px`, padding: `${8 * scale}px` }}>
                        {t("previewUnavailable")}
                        <Image src="/assets/logo/logo.png" alt="Fallback" fill className="object-cover opacity-20" />
                    </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="rounded-full border-2 border-white/50 flex items-center justify-center backdrop-blur-md scale-75 group-hover:scale-100 transition-transform"
                        style={{ width: `${40 * scale}px`, height: `${40 * scale}px` }}>
                        <div className="w-0 h-0 border-t-transparent border-white border-b-transparent"
                            style={{ borderTopWidth: `${6 * scale}px`, borderBottomWidth: `${6 * scale}px`, borderLeftWidth: `${10 * scale}px`, marginLeft: `${2 * scale}px` }} />
                    </div>
                </div>
                <div className="absolute font-black text-white border border-white/10 uppercase tracking-tighter shadow-xl bg-red-600/90 backdrop-blur-md"
                    style={{ top: `${8 * scale}px`, left: `${8 * scale}px`, padding: `${2 * scale}px ${6 * scale}px`, fontSize: `${7 * scale}px`, borderRadius: `${2 * scale}px` }}>
                    {video.date}
                </div>
            </div>
            <div style={{ gap: `${4 * scale}px`, display: 'flex', flexDirection: 'column', padding: `0 ${4 * scale}px` }}>
                <h4 className="font-black leading-tight line-clamp-2 group-hover:text-red-500 transition-colors uppercase tracking-tight"
                    style={{ fontSize: `${11 * scale}px` }}>
                    {video.title}
                </h4>
                <div className="flex items-center font-black text-foreground/30 uppercase tracking-widest group-hover:text-foreground/50 transition-colors"
                    style={{ gap: `${6 * scale}px`, fontSize: `${7 * scale}px` }}>
                    <span className="text-red-600">{t("replayTag")}</span>
                    <span className="rounded-full bg-foreground/20" style={{ width: `${3 * scale}px`, height: `${3 * scale}px` }} />
                    <span className="line-clamp-1">{video.desc || `CRTV ${t("archives")}`}</span>
                </div>
            </div>
        </Link>
    );
}
