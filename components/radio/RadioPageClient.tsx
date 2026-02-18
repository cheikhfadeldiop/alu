"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { LiveSelectionCarousel } from "../live/LiveSelectionCarousel";
import { RadioPlayerSection } from "./RadioPlayerSection";
import { UpcomingProgramsTimeline } from "./UpcomingProgramsTimeline";
import { LiveChannel, EPGItem, FullEPGChannel, AODItem, FullEPGProgram } from "../../types/api";
import { RadioAudiosSection } from "./RadioAudiosSection";
import { PromoAntenne } from "../home/PromoAntenne";
import { AdBanner } from "../ui/AdBanner";
import { useTranslations } from "next-intl";

interface RadioPageClientProps {
    initialRadios: LiveChannel[];
    allChannels: LiveChannel[]; // Both radios and TV channels
    epgData: EPGItem[];
    fullEpgData: FullEPGChannel[];
    audiosData?: AODItem[];
    promoPrograms?: FullEPGProgram[];
}

export function RadioPageClient({ initialRadios, allChannels, epgData, fullEpgData, audiosData = [], promoPrograms = [] }: RadioPageClientProps) {
    const t = useTranslations("pages.radio");
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const channelParam = searchParams.get('channel');

    // Default to first radio or radio from URL parameter
    const getDefaultRadio = () => {
        if (channelParam) {
            const paramRadio = initialRadios.find(r => (r.id || r.slug) === channelParam);
            if (paramRadio) return paramRadio;
        }
        return initialRadios[0];
    };

    const [selectedRadio, setSelectedRadio] = useState<LiveChannel>(getDefaultRadio());
    const [selectedCarouselId, setSelectedCarouselId] = useState<string>((getDefaultRadio()?.id || getDefaultRadio()?.slug) || '');

    // Current EPG items for all channels (for carousel info)
    const currentPrograms = useMemo(() => {
        return epgData.filter(item => item.is_current);
    }, [epgData]);

    // Update selected radio when URL parameter changes
    useEffect(() => {
        if (channelParam) {
            const paramRadio = initialRadios.find(r => (r.id || r.slug) === channelParam);
            if (paramRadio) {
                setSelectedRadio(paramRadio);
                setSelectedCarouselId(paramRadio.id || paramRadio.slug);
            }
        }
    }, [channelParam, initialRadios]);

    // Handle channel/radio selection
    const handleItemSelect = (item: LiveChannel) => {
        const itemKey = item.id || item.slug;
        setSelectedCarouselId(itemKey);

        // If it's a TV channel, navigate to live page with this channel
        if (item.type === 'TV') {
            router.push(`/live?channel=${itemKey}`);
        } else {
            // Radio: Update state and URL
            setSelectedRadio(item);
            router.replace(`${pathname}?channel=${itemKey}`, { scroll: false });
        }
    };

    // Current program for the selected radio
    const currentRadioProgram = useMemo(() => {
        if (!selectedRadio) return undefined;
        return currentPrograms.find(p => p.channel_id === selectedRadio.id);
    }, [selectedRadio, currentPrograms]);

    if (!selectedRadio) {
        return <div className="text-center text-foreground py-20">{t("noRadioAvailable")}</div>;
    }

    return (
        <div className="space-y-8 md:space-y-12">
            {/* 1. Carousel with Tabs - Shows both radios and TV channels */}
            <LiveSelectionCarousel
                channels={allChannels}
                epgItems={currentPrograms}
                onSelectChannel={handleItemSelect}
                selectedChannelId={selectedCarouselId}
            />

            {/* 2. Radio Player Section - Only plays radios */}
            <RadioPlayerSection
                channel={selectedRadio}
                currentProgram={currentRadioProgram}
                onNextChannel={() => {
                    const currentIndex = initialRadios.findIndex(r => (r.id || r.slug) === (selectedRadio.id || selectedRadio.slug));
                    const nextIndex = (currentIndex + 1) % initialRadios.length;
                    handleItemSelect(initialRadios[nextIndex]);
                }}
                onPrevChannel={() => {
                    const currentIndex = initialRadios.findIndex(r => (r.id || r.slug) === (selectedRadio.id || selectedRadio.slug));
                    const prevIndex = (currentIndex - 1 + initialRadios.length) % initialRadios.length;
                    handleItemSelect(initialRadios[prevIndex]);
                }}
            />

            <AdBanner />

            <div className="space-y-10 md:space-y-16">
                {/* 3. Audios Section */}
                <RadioAudiosSection items={audiosData} promoPrograms={promoPrograms} />

                {/* 4. Promo Section matches Home design */}
            </div>

        </div>
    );
}
