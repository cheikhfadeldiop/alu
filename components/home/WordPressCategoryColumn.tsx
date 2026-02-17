import Link from "next/link";
import Image from "next/image";
import { WordPressPost } from "../../types/api";
import { SectionTitle } from "../ui/SectionTitle";
import { SITE_CONFIG } from "@/constants/site-config";
import { SafeImage } from "../ui/SafeImage";

interface WordPressCategoryColumnProps {
    title: string;
    title2: string;
    items: WordPressPost[];
    enter?: boolean;
    categorySlug: string;
    type?: 'radio' | 'tv';
}

import { ensureAbsoluteUrl } from "@/services/api";
import dynamic from "next/dynamic";

export function WordPressCategoryColumn({ title, title2, items, enter, categorySlug, type }: WordPressCategoryColumnProps) {
    if (!items || items.length === 0) return null;

    const getDisplayData = (item: any) => {
        // WordPressPost mapping
        if (item.title && typeof item.title === 'object' && item.title.rendered) {
            return {
                id: item.id,
                title: item.title.rendered,
                image: ensureAbsoluteUrl(item.acan_image_url || item._embedded?.['wp:featuredmedia']?.[0]?.source_url) || SITE_CONFIG.theme.placeholders.news,
                link: `/news/${item.id}`,
                date: item.date,
                author: SITE_CONFIG.strings.editorialTeam
            };
        }
        // SliderVideoItem (Replays) mapping
        if (item.video_url || (item.slug && !item.type)) {
            return {
                id: item.slug,
                title: item.title,
                image: ensureAbsoluteUrl(item.logo_url || item.logo) || SITE_CONFIG.theme.placeholders.news,
                link: `/replay/${item.slug}`,
                date: item.date || item.start_time || item.end_time || item.duration,
                author: SITE_CONFIG.strings.editorialTeam
            };
        }
        // LiveChannel (Radios/TV) mapping
        return {
            id: item.id,
            title: item.title,
            image: ensureAbsoluteUrl(item.logo_url || item.logo || item.hd_logo || item.sd_logo) || SITE_CONFIG.theme.placeholders.news,
            link: item.type === 'RADIO' || type === 'radio' ? `/radio` : `/live`,
            date: item.date || item.start_time || item.end_time || item.duration || new Date().toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' }),
            author: "La rédaction"
        };
    };

    const formatDate = (dateStr: string | null): string | null => {
        if (!dateStr) return null;

        // Trim sécurité
        const value = dateStr.trim();

        // Si c'est déjà une date "lisible" (ex: 8 octobre 2024)
        // On vérifie qu'elle contient des lettres ET des espaces
        if (/^[\d\s]+[a-zA-Zéûôîàèùç]+\s\d{4}$/i.test(value)) {
            return value;
        }

        const d = new Date(value);

        // Si date invalide → on retourne la valeur originale
        if (isNaN(d.getTime())) {
            return value;
        }

        return d.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };


    const itemsToDisplay = items.slice(0, 4);
    const featuredRaw = itemsToDisplay[0];
    const listRaw = itemsToDisplay.slice(1);
    const listtotal = items.map(item => getDisplayData(item));

    const featured = getDisplayData(featuredRaw);
    const listItems = enter ? listtotal : listRaw.map(item => getDisplayData(item));

    return (
        <div className="space-y-4">
            {/* Header */}
            <SectionTitle title={title} title2={title2} actionHref={categorySlug === 'radio' ? '/radio' : (categorySlug === 'replays' ? '/replay' : `/news`)} className="font-bold" />

            {/* Featured Item */}
            {featured && !enter && (
                <Link href={featured.link} className="group relative block space-y-3 pb-5 after:absolute after:bottom-0 after:left-25 after:right-25 after:border-b after:border-muted/15">
                    <div className="relative aspect-video overflow-hidden bg-white/5 ">
                        <SafeImage
                            src={featured.image}
                            alt={featured.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Type Icon Overlay */}
                        {type && (
                            <div className="absolute bottom-3 left-3 z-10 w-10 h-10 pointer-events-none">
                                <Image
                                    src={type === 'radio' ? SITE_CONFIG.theme.placeholders.radio : '/assets/placeholders/play_overlay.png'}
                                    alt={type}
                                    width={40}
                                    height={40}
                                    className="object-contain"
                                />
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-lg font-bold leading-tight line-clamp-2 group-hover:text-[color:var(--accent)] transition-colors">
                            {featured.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500">
                            {featured.date && (
                                <>
                                    <span>{formatDate(featured.date)}</span>
                                    <span className="w-1.5 h-1.5 bg-[color:var(--success)] rounded-full" />
                                </>
                            )}
                            <span className="font-medium">{featured.author}</span>
                        </div>
                    </div>
                </Link>
            )}

            {/* List Items */}
            <div className="space-y-5">
                {listItems.map((item, idx) => (
                    <Link key={item.id + '-' + idx} href={item.link} className="group relative flex gap-4 items-start pb-5 after:absolute after:bottom-0 after:left-25 after:right-25 after:border-b after:border-muted/15 last:after:hidden">
                        <div className="relative w-24 h-20 flex-shrink-0 overflow-hidden bg-white/5">
                            <SafeImage
                                src={item.image}
                                alt={item.title}
                                fill
                                sizes="96px"
                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            {/* Type Icon Overlay Mini */}
                            {type && (
                                <div className="absolute bottom-1 left-1 z-10 w-6 h-6 pointer-events-none">
                                    <Image
                                        src={type === 'radio' ? SITE_CONFIG.theme.placeholders.radio : '/assets/placeholders/play_overlay.png'}
                                        alt={type}
                                        width={24}
                                        height={24}
                                        className="object-cover"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 py-0.5 space-y-6">
                            <h5 className="text-[13px] font-bold uppercase leading-[1.4] line-clamp-2 group-hover:text-[color:var(--accent)] transition-colors">
                                {item.title}
                            </h5>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                {item.date && (
                                    <>
                                        <span>{formatDate(item.date)}</span>
                                        <span className="w-1 h-1 bg-[color:var(--success)] rounded-full" />
                                    </>
                                )}
                                <span className="font-medium">{item.author}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
