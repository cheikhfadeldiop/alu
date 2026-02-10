"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LiveSelectionCarousel } from "../live/LiveSelectionCarousel";
import { RadioPlayerSection } from "./RadioPlayerSection";
import { UpcomingProgramsTimeline } from "./UpcomingProgramsTimeline";
import { LiveChannel, EPGItem, FullEPGChannel } from "../../types/api";

interface RadioPageClientProps {
    initialRadios: LiveChannel[];
    allChannels: LiveChannel[]; // Both radios and TV channels
    epgData: EPGItem[];
    fullEpgData: FullEPGChannel[];
}

export function RadioPageClient({ initialRadios, allChannels, epgData, fullEpgData }: RadioPageClientProps) {
    const router = useRouter();
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
            // If it's a radio, update the player
            setSelectedRadio(item);
        }
    };

    // Current program for the selected radio
    const currentRadioProgram = useMemo(() => {
        if (!selectedRadio) return undefined;
        return currentPrograms.find(p => p.channel_id === selectedRadio.id);
    }, [selectedRadio, currentPrograms]);

    if (!selectedRadio) {
        return <div className="text-center text-foreground py-20">Aucune radio disponible</div>;
    }

    return (
        <div className="space-y-8">
            {/* 1. Carousel with Tabs - Shows both radios and TV channels */}
            <LiveSelectionCarousel
                channels={allChannels}
                epgItems={currentPrograms}
                onSelectChannel={handleItemSelect}
                selectedChannelId={selectedCarouselId}
            />

            {/* 2. Radio Player Section - Only plays radios */}
            <RadioPlayerSection channel={selectedRadio} currentProgram={currentRadioProgram} />

            {/* 3. Upcoming Programs Timeline */}
            <UpcomingProgramsTimeline epgData={fullEpgData} />
        </div>
    );
}
