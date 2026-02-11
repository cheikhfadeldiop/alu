import Link from "next/link";
import Image from "next/image";
import { WordPressPost } from "../../types/api";
import { SectionTitle } from "../ui/SectionTitle";

interface WordPressCategoryColumnProps {
    title: string;
    title2: string;
    items: WordPressPost[];
    enter?: boolean;
    categorySlug: string;
}

import { SITE_CONFIG } from "@/constants/site-config";

export function WordPressCategoryColumn({ title, title2, items, enter, categorySlug }: WordPressCategoryColumnProps) {
    if (!items || items.length === 0) return null;

    const featuredItem = items[0];
    const listItems = items.slice(1, 8);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    return (
        <div className="space-y-2">
            {/* Header */}
            <SectionTitle title={title} title2={title2} actionHref={`/news/${categorySlug}`} />

            {/* Featured Item */}
            {featuredItem && !enter && (
                <Link href={featuredItem.link} className="group block space-y-3 border-b dark:border-muted/30">
                    <div className="relative aspect-video overflow-hidden bg-white/5">
                        <Image
                            src={featuredItem.acan_image_url || SITE_CONFIG.theme.placeholders.news}
                            alt={featuredItem.title.rendered}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                    <h4 className="text-lg font-bold leading-tight group-hover:underline line-clamp-2">
                        {featuredItem.title.rendered}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 pb-5">
                        <span>{formatDate(featuredItem.date)}</span>
                        <span className="w-1.5 h-1.5 bg-[color:var(--success)] rounded-full" />
                        <span className="font-medium">{SITE_CONFIG.strings.editorialTeam}</span>
                    </div>
                </Link>
            )}

            {/* List Items */}
            <div className="space-y-5 pt-2 ">
                {listItems.map((item) => (
                    <Link key={item.id} href={item.link} className="group flex gap-4 items-start">
                        <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden bg-white/5">
                            <Image
                                src={item.acan_image_url || SITE_CONFIG.theme.placeholders.news}
                                alt={item.title.rendered}
                                fill
                                sizes="80px"
                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                        </div>
                        <div className="flex-1 min-w-0 py-0.5">
                            <h5 className="text-[12px] font-bold uppercase leading-[1.5] group-hover:underline line-clamp-3 mb-2 tracking-tight">
                                {item.title.rendered}
                            </h5>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                <span>{formatDate(item.date)}</span>
                                <span className="w-1 h-1 bg-[color:var(--success)] rounded-full" />
                                <span>{SITE_CONFIG.strings.editorialTeam}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
