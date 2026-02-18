"use client";

import { Link } from "@/i18n/navigation";
import { SectionTitle } from "../ui/SectionTitle";
import { WordPressPost } from "../../types/api";
import { SITE_CONFIG } from "@/constants/site-config";
import { useTranslations } from "next-intl";
import { SafeImage } from "../ui/SafeImage";
import Image from "next/image";
import { useChannelResolver } from "@/hooks/useData";
import { ensureAbsoluteUrl } from "@/services/api";

interface EditorialChoiceProps {
    items: WordPressPost[];
    title: string;
    title2?: string;
    actionLabel?: string;
}

export function EditorialChoice({ items, title, title2, actionLabel }: EditorialChoiceProps) {
    const t = useTranslations("common");
    const { resolveLogo } = useChannelResolver();

    if (!items || items.length === 0) return null;

    // Use only the latest 7 items as requested
    const displayItems = items.slice(0, 7);
    const featuredItem = displayItems[0];
    const sideItems = displayItems.slice(1, 3);
    const gridItems = displayItems.slice(3, 7);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    return (
        <section className="space-y-6 ">
            <div className="flex items-center justify-between ">
                <SectionTitle title={title + " " + title2} title2='' actionHref={'/news'} className="font-bold" />
                <Link href="/news" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 decoration-gray-300">
                    {t("seeMore")}
                </Link>
            </div>

            {/* Row 1: Layout 30% / 40% / 30% */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-center">
                {/* 30% Left: Metadata of Item 0 */}
                <div className="lg:col-span-3 space-y-4 group-hover:scale-[1.02] transition-transform ">
                    {featuredItem && (
                        <Link href={`/news?id=${featuredItem.id}`} className="group block">
                            <h2 className="text-xl lg:text-2xl font-bold leading-tight  mb-4">
                                {featuredItem.title.rendered}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-6">
                                {featuredItem.excerpt?.rendered.replace(/<[^>]*>/g, '').slice(0, 150)}...
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{formatDate(featuredItem.date)}</span>
                                <span className="w-1 h-1 bg-[color:var(--success)] rounded-full" />
                                <span>{SITE_CONFIG.strings.editorialTeam}</span>
                            </div>
                        </Link>
                    )}
                </div>

                {/* 40% Middle: Image of Item 0 */}
                <div className="lg:col-span-4 relative  hover:scale-[1.02] transition-transform">
                    {featuredItem && (() => {
                        const channelLogo = resolveLogo(featuredItem);
                        return (
                            <Link href={`/news?id=${featuredItem.id}`}
                                className="block relative aspect-video  overflow-hidden bg-white/5 group">
                                <SafeImage
                                    src={featuredItem.acan_image_url || SITE_CONFIG.theme.placeholders.news}
                                    alt={featuredItem.title.rendered}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 40vw"
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />

                                {/* Play Icon Overlay - Top Left */}
                                <div className="absolute top-3 left-3 z-10 pointer-events-none">
                                    <Image
                                        src={'/assets/placeholders/play_overlay.png'}
                                        alt="Play"
                                        width={48}
                                        height={48}
                                        className="object-contain"
                                    />
                                </div>

                                {/* Channel Logo Overlay - Top Right */}
                                {channelLogo && (
                                    <div className="absolute top-3 right-3 z-10 w-16 h-12 overflow-hidden">
                                        <SafeImage
                                            src={ensureAbsoluteUrl(channelLogo)}
                                            alt="Channel Logo"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                )}
                            </Link>
                        );
                    })()}
                </div>

                {/* 30% Right: Side Items 1 & 2 */}
                <div className="lg:col-span-3 space-y-6 group-hover:scale-[1.02] transition-transform">
                    {sideItems.map((item) => (
                        <Link key={item.id} href={`/news?id=${item.id}`} className="group flex gap-4 items-start hover:scale-[1.02] transition-transform">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold leading-tight mb-2 line-clamp-3">
                                    {item.title.rendered}
                                </h3>
                                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                    <span>{formatDate(item.date)}</span>
                                    <span className="w-1 h-1 bg-[color:var(--success)] rounded-full" />
                                    <span>{SITE_CONFIG.strings.editorialTeam}</span>
                                </div>
                            </div>
                            <div className="relative w-24 h-24 flex-shrink-0  overflow-hidden bg-white/5">
                                <SafeImage
                                    src={item.acan_image_url || SITE_CONFIG.theme.placeholders.news}
                                    alt={item.title.rendered}
                                    fill
                                    sizes="96px"
                                    className="object-cover group-hover:scale-110 transition-transform"
                                />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Row 2: Grid of 4 Items (3, 4, 5, 6) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 group-hover:scale-[1.02] transition-transform">
                {gridItems.map((item) => (
                    <Link key={item.id} href={`/news?id=${item.id}`} className="group block space-y-3">
                        <div className="relative aspect-[16/10] overflow-hidden bg-white/5">
                            <SafeImage
                                src={item.acan_image_url || SITE_CONFIG.theme.placeholders.news}
                                alt={item.title.rendered}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        <h4 className="text-sm font-bold leading-tight line-clamp-2 ">
                            {item.title.rendered}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                            <span>{formatDate(item.date)}</span>
                            <span className="w-1 h-1 bg-[color:var(--success)] rounded-full" />
                            <span>{SITE_CONFIG.strings.editorialTeam}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
