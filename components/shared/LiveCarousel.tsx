"use client";

import * as React from "react";

interface LiveCarouselProps {
    children: React.ReactNode;
    onReachEnd?: () => void;
    title?: string;
    title2?: string;
    actionLabel?: string;
    actionHref?: string;
}

export function LiveCarousel({
    children,
    onReachEnd,
}: LiveCarouselProps) {
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const [showLeftBtn, setShowLeftBtn] = React.useState(false);
    const [showRightBtn, setShowRightBtn] = React.useState(true);

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowLeftBtn(scrollLeft > 10);
        setShowRightBtn(scrollLeft < scrollWidth - clientWidth - 10);

        // Load more check
        if (onReachEnd && scrollLeft >= scrollWidth - clientWidth - 200) {
            onReachEnd();
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return;
        const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
        scrollContainerRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: "smooth"
        });
    };

    React.useEffect(() => {
        const el = scrollContainerRef.current;
        if (el) {
            el.addEventListener('scroll', handleScroll);
            handleScroll();
            return () => el.removeEventListener('scroll', handleScroll);
        }
    }, [children]);

    return (
        <div className="relative group/carousel w-full">
            {/* Rectangular Navigation Buttons */}
            {showLeftBtn && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-20 
                               bg-black/60 hover:bg-[color:var(--accent)] backdrop-blur-xl 
                               text-white w-12 h-20 flex items-center justify-center
                               border-y border-r border-white/20 transition-all duration-300
                               opacity-0 group-hover/carousel:opacity-100 shadow-[5px_0_15px_rgba(0,0,0,0.3)]"
                    aria-label="Previous"
                >
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            )}

            {showRightBtn && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-20 
                               bg-black/60 hover:bg-[color:var(--accent)] backdrop-blur-xl 
                               text-white w-12 h-20 flex items-center justify-center
                               border-y border-l border-white/20 transition-all duration-300
                               opacity-0 group-hover/carousel:opacity-100 shadow-[-5px_0_15px_rgba(0,0,0,0.3)]"
                    aria-label="Next"
                >
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            )}

            {/* Scroll Container */}
            <div
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto pb-6 pt-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {React.Children.map(children, (child) => (
                    <div className="shrink-0">
                        {child}
                    </div>
                ))}
            </div>
        </div>
    );
}
