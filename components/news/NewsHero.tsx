import Link from "next/link";
import Image from "next/image";
import { WordPressPost } from "../../types/api";
import { decodeHtmlEntities } from "../../utils/text";
import { SectionTitle } from "../ui/SectionTitle";

interface NewsHeroProps {
    items: WordPressPost[];
    categoryName?: string;
}

import { SITE_CONFIG } from "@/constants/site-config";

export function NewsHero({ items, categoryName }: NewsHeroProps) {
    if (!items || items.length === 0) return null;

    // Item 0: Spans Col 1 (Meta) and Col 2 (Primary Image)
    const primaryItem = items[0];
    // Item 1: Exclusive to Col 3
    const secondaryItem = items[1];

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    const excerpt = (post: WordPressPost) => {
        // Cleaning HTML and limiting text for the larger hero
        const cleanText = post.excerpt?.rendered.replace(/<[^>]*>/g, '').trim() ||
            post.content?.rendered.replace(/<[^>]*>/g, '').trim();
        return cleanText?.slice(0, 220) + "...";
    };

    return (
        <section className="space-y-6  animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {categoryName && (
                <SectionTitle
                    title="Suivez"
                    title2={decodeHtmlEntities(categoryName)}
                    uppercase={true}
                    actionLabel=""
                    actionHref="/news"
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-10 gap-5  items-stretch min-h-[400px]">
                {/* 30% Left: Metadata (Larger scale) */}

                <div className="lg:col-span-3  flex flex-col justify-between space-y-8 order-2 lg:order-1 px-2">
                    <Link href={primaryItem.link} className="group block space-y-5">
                        <h1 className="text-2xl lg:text-4xl line-clamp-5  font-black leading-[1.05] tracking-tight group-hover:text-[color:var(--accent)] transition-colors duration-300">
                            {decodeHtmlEntities(primaryItem.title.rendered)}
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-5">
                            {excerpt(primaryItem)}
                        </p>
                        <div className="flex items-center gap-4 text-sm font-semibold text-gray-500 pt-4">
                            <span>{formatDate(primaryItem.date)}</span>
                            <span className="w-2 h-2 bg-[color:var(--success)] rounded-full shadow-[0_0_8px_var(--success)]" />
                            <span className="uppercase tracking-[0.2em] text-[11px]">{SITE_CONFIG.strings.editorialTeam}</span>
                        </div>
                    </Link>
                </div>

                {/* 40% Middle: Hero Image */}
                <div className="lg:col-span-4 relative order-1 lg:order-2">
                    <Link href={primaryItem.link} className="block relative h-full min-h-[400px] overflow-hidden group shadow-2xl shadow-black/5 dark:shadow-white/5 rounded-sm">
                        <Image
                            src={primaryItem.acan_image_url || SITE_CONFIG.theme.placeholders.news}
                            alt={primaryItem.title.rendered}
                            fill
                            priority
                            sizes="(max-width: 1024px) 100vw, 40vw"
                            className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </Link>
                </div>

                {/* 30% Right: Vertical Feature (Strict 60% Image height) */}
                <div className="lg:col-span-3 order-3 h-full">
                    {secondaryItem ? (
                        <Link href={secondaryItem.link} className="group flex flex-col h-full bg-surface-2/50 dark:bg-surface-2/10 hover:bg-white dark:hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-gray-100 dark:hover:border-white/10 rounded-sm">
                            <div className="relative h-[60%] w-full overflow-hidden">
                                <Image
                                    src={secondaryItem.acan_image_url || SITE_CONFIG.theme.placeholders.news}
                                    alt={secondaryItem.title.rendered}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 30vw"
                                    className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                            </div>
                            <div className="flex-1 p-6 space-y-4 flex flex-col justify-center border-t border-gray-100 dark:border-white/5">
                                <h3 className="text-2xl font-black leading-tight group-hover:text-[color:var(--accent)] transition-colors duration-300 line-clamp-3">
                                    {decodeHtmlEntities(secondaryItem.title.rendered)}
                                </h3>
                                <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                                    <span>{formatDate(secondaryItem.date)}</span>
                                    <span className="w-1.5 h-1.5 bg-[color:var(--success)] rounded-full" />
                                    <span className="uppercase tracking-[0.15em] text-[10px]">{SITE_CONFIG.strings.editorialTeam}</span>
                                </div>
                            </div>
                        </Link>
                    ) : (
                        <div className="h-full bg-gray-50/50 dark:bg-muted/5 border border-dashed border-gray-200 dark:border-muted/20 flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-12 h-12 mb-4 rounded-full bg-gray-100 dark:bg-white/5 animate-pulse" />
                            <p className="text-gray-400 italic text-sm font-medium tracking-wide">
                                Contenu additionnel en cours de chargement...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
