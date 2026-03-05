"use client";

import * as React from "react";
import { AODItem, FullEPGProgram } from "../../types/api";
import { MediaCard } from "../ui/MediaCard";
import { SectionTitle } from "../ui/SectionTitle";
import { useTranslations } from "next-intl";
import { formatDate } from "@/utils/text";

interface RadioAudiosSectionProps {
    items: AODItem[];
    promoPrograms?: FullEPGProgram[];
}

export function RadioAudiosSection({ items = [], promoPrograms = [] }: RadioAudiosSectionProps) {
    const t = useTranslations("common");
    const [visibleCount, setVisibleCount] = React.useState(8);

    // Fallback to promo programs if audio items are empty
    const displayItems: AODItem[] = items.length > 0 ? items : promoPrograms.slice(0, 32).map(prog => ({
        id: prog.slug || Math.random().toString(),
        title: prog.title,
        desc: prog.description || "",
        image: prog.logo || "",
        image_url: prog.logo || "",
        audio_url: "",
        duration: "",
        published_at: new Date().toISOString(), // Fallback date
        category: "Promo",
        slug: prog.slug,
        channel_name: prog.channelName, // Custom field for mapped items
    } as any)); // Type assertion to bypass missing fields if needed

    const hasItems = displayItems.length > 0;

    if (!hasItems) {
        return null;
    }

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 8);
    };

    return (
        <section className="space-y-8 sm:space-y-12 py-8 sm:py-16">
            <SectionTitle
                title="AUDIOS"
                actionHref="/radio/audios"
                className="h4 font-black italic tracking-tighter"
            />

            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
                {displayItems.slice(0, visibleCount).map((item) => (
                    <MediaCard
                        key={item.id}
                        href={`/audio/${item.slug || item.id}`}
                        title={item.title}
                        imageSrc={item.logo || item.image || "/assets/placeholders/radio_icon_sur_card.png"}
                        meta={formatDate(item.published_at)}
                        author={item.category || item.channel_name || "Audio"}
                        aspect="1/1"
                        showPlayIcon={false}
                        showAudioIcon={true}
                        target={false}
                        className="rounded-sm overflow-hidden shadow-sm"
                    />
                ))}
            </div>

            {visibleCount < displayItems.length && (
                <div className="flex justify-center pt-8">
                    <button
                        onClick={handleLoadMore}
                        className="group relative flex items-center gap-3 px-8 sm:px-10 py-3 rounded-xl border border-border hover:border-accent transition-all duration-300 bg-surface/50 hover:bg-surface-2 shadow-sm"
                    >
                        <span className="text-xs sm:b4 font-black uppercase tracking-widest text-muted group-hover:text-accent transition-colors">
                            {t("loadMore") || "Tout voir"}
                        </span>

                    </button>
                </div>
            )}
        </section>
    );
}
