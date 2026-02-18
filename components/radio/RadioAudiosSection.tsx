"use client";

import * as React from "react";
import { AODItem, FullEPGProgram } from "../../types/api";
import { MediaCard } from "../ui/MediaCard";
import { SectionTitle } from "../ui/SectionTitle";
import { useTranslations } from "next-intl";

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
        <section className="space-y-8 pt-12 pb-16">
            <SectionTitle title="AUDIOS" actionHref="/radio/audios" className="text-xl" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayItems.slice(0, visibleCount).map((item) => (
                    <MediaCard
                        key={item.id}
                        href="#"
                        title={item.title}
                        imageSrc={item.image_url || item.image || "/assets/placeholders/radio_icon_sur_card.png"}
                        meta={new Date(item.published_at).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })}
                        aspect="1/1"
                        showPlayIcon={false}
                        showAudioIcon={true}
                        target={false}
                        onClick={() => {
                            // Handler for playing audio (can be extended)
                            console.log("Open audio", item);
                        }}
                    />
                ))}
            </div>

            {
                // visibleCount <
                displayItems.length && (
                    <div className="flex justify-center pt-8">
                        <button
                            onClick={handleLoadMore}
                            className="group relative flex items-center gap-2 px-8 py-2.5 rounded-full border border-foreground/45 hover:border-red-500 transition-all duration-300 bg-white/5 hover:bg-white/10"
                        >
                            <span className="text-sm font-medium uppercase tracking-widest  group-hover:text-red-500 transition-colors">
                                {t("loadMore") || "Charger"}
                            </span>
                        </button>
                    </div>
                )}
        </section>
    );
}
