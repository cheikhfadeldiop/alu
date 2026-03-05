"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SectionTitle } from '../ui/SectionTitle';

interface Article {
    id: string;
    title: string;
    image: string;
    date: string;
    author: string;
    slug: string;
}

interface ArticlesGridProps {
    title?: string;
    articles: Article[];
    onViewMore?: () => void;
}

export default function ArticlesGrid({
    title = "Actualités",
    articles,
    onViewMore
}: ArticlesGridProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 470; // largeur card (455px) + gap (20px)
            const newScrollLeft = scrollContainerRef.current.scrollLeft +
                (direction === 'right' ? scrollAmount : -scrollAmount);

            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className="w-full max-w-[1460px] mx-auto flex flex-col gap-8 sm:gap-[57px] py-8 sm:py-12 px-4 sm:px-6">
            {/* Title Container */}
            <div className="flex items-center gap-5">
                <SectionTitle title={title} />
            </div>

            {/* Carousel Container */}
            <div className="relative group/carousel">
                {/* Navigation Buttons */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-surface/90 hover:bg-surface shadow-lg rounded-full hidden sm:flex items-center justify-center text-accent opacity-0 group-hover/carousel:opacity-100 transition-all hover:scale-110 border border-border"
                    aria-label="Article précédent"
                >
                    <ChevronLeft className="w-6 h-6" strokeWidth={2} />
                </button>

                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-surface/90 hover:bg-surface shadow-lg rounded-full hidden sm:flex items-center justify-center text-accent opacity-0 group-hover/carousel:opacity-100 transition-all hover:scale-110 border border-border"
                    aria-label="Article suivant"
                >
                    <ChevronRight className="w-6 h-6" strokeWidth={2} />
                </button>

                {/* Scrollable Articles */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-hide scroll-smooth"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch'
                    }}
                >
                    {articles.map((article) => (
                        <div key={article.id} className="flex-none w-[280px] sm:w-[455px]">
                            <ArticleCard article={article} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ArticleCard({ article }: { article: Article }) {
    const href = `/news?slug=${article.slug || article.id}`;

    return (
        <Link href={href} className="flex flex-col gap-[10px] w-full group cursor-pointer">
            {/* Article Image */}
            <div className="relative w-full aspect-[455/242] overflow-hidden rounded-sm bg-surface-2/50">
                <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 640px) 280px, 455px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>

            {/* Article Content */}
            <div className="flex flex-col gap-[5px]">
                {/* Article Title */}
                <h3 className="text-base sm:h7 font-bold uppercase line-clamp-3 transition-colors text-foreground">
                    {article.title}
                </h3>

                {/* Article Info */}
                <div className="flex items-center gap-[10px]">
                    <span className="b4 text-muted/80">
                        {article.date}
                    </span>

                    <div className="flex items-center gap-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#118A39]" />
                        <span className="b4 text-muted font-medium">
                            {article.author}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}