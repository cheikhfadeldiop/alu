"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LiveSelectionCarousel } from "./LiveSelectionCarousel";
import { LivePlayerSection } from "./LivePlayerSection";
import { EPGScheduleView } from "./EPGScheduleView";
import { UpcomingProgramsTimeline } from "../radio/UpcomingProgramsTimeline";
import { LiveChannel, EPGItem, FullEPGChannel } from "../../types/api";
import { AdBanner } from "../ui/AdBanner";

interface LivePageClientProps {
    initialChannels: LiveChannel[];
    epgData: EPGItem[];
    fullEpg: FullEPGChannel[];
}

export function LivePageClient({ initialChannels, epgData, fullEpg }: LivePageClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const channelParam = searchParams.get('channel');

    // Default to first TV channel or channel from URL parameter
    const getDefaultChannel = () => {
        if (channelParam) {
            const paramChannel = initialChannels.find(c => c.id === channelParam);
            if (paramChannel && paramChannel.type === 'TV') return paramChannel;
        }
        return initialChannels.find(c => c.type === 'TV') || initialChannels[0];
    };

    const [selectedChannel, setSelectedChannel] = useState<LiveChannel>(getDefaultChannel());
    const [selectedCarouselId, setSelectedCarouselId] = useState<string>(getDefaultChannel()?.id || '');

    // Update selected channel when URL parameter changes
    useEffect(() => {
        if (channelParam) {
            const paramChannel = initialChannels.find(c => c.id === channelParam);
            if (paramChannel && paramChannel.type === 'TV') {
                setSelectedChannel(paramChannel);
                setSelectedCarouselId(paramChannel.id);
            }
        }
    }, [channelParam, initialChannels]);

    // Filter EPG for the selected channel (Daily schedule)
    const activeChannelEPG = useMemo(() => {
        if (!selectedChannel) return [];
        return epgData.filter(item => item.channel_id === selectedChannel.id);
    }, [epgData, selectedChannel]);

    // Current EPG items for all channels (for carousel info)
    const currentPrograms = useMemo(() => {
        return epgData.filter(item => item.is_current);
    }, [epgData]);

    // Handle channel selection
    const handleChannelSelect = (channel: LiveChannel) => {
        setSelectedCarouselId(channel.id);

        // If it's a radio, navigate to radio page with this radio
        if (channel.type === 'RADIO') {
            router.push(`/radio?channel=${channel.id}`);
        } else {
            // If it's a TV channel, update the player
            setSelectedChannel(channel);
        }
    };

    if (!selectedChannel) {
        return <div className="text-center text-white py-20">Aucune chaîne disponible</div>;
    }

    return (
        <div className="space-y-8">
            {/* 1. Carousel with Tabs */}
            <LiveSelectionCarousel
                channels={initialChannels}
                epgItems={currentPrograms}
                onSelectChannel={handleChannelSelect}
                selectedChannelId={selectedCarouselId}
            />

            {/* 2. Player Section - Only for TV */}
            {selectedChannel.type === 'TV' && (
                <LivePlayerSection channel={selectedChannel} />
            )}

            {/* 3. Info & EPG Schedule - Only for TV */}
           

            <AdBanner />

            {/* 4. Upcoming Programs Timeline */}
            {fullEpg.length > 0 && <UpcomingProgramsTimeline epgData={fullEpg} />}
        </div>
    );
}
