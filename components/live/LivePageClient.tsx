"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { LiveSelectionCarousel } from "./LiveSelectionCarousel";
import { LivePlayerSection } from "./LivePlayerSection";
import { UpcomingProgramsTimeline } from "../radio/UpcomingProgramsTimeline";
import { RadioPlayerSection } from "../radio/RadioPlayerSection";
import { RadioAudiosSection } from "../radio/RadioAudiosSection";
import { LiveChannel, EPGItem, FullEPGChannel, AODItem } from "../../types/api";

interface LivePageClientProps {
    initialChannels: LiveChannel[];
    epgData: EPGItem[];
    fullEpg: FullEPGChannel[];
    aodItems: AODItem[];
}

export function LivePageClient({ initialChannels, epgData, fullEpg, aodItems }: LivePageClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const channelParam = searchParams.get('channel');

    // Default to first TV channel or channel from URL parameter
    const getDefaultChannel = () => {
        if (channelParam) {
            const paramChannel = initialChannels.find(c => c.slug === channelParam || c.id === channelParam);
            if (paramChannel) return paramChannel;
        }
        return initialChannels.find(c => c.type === 'TV') || initialChannels[0];
    };

    const [selectedChannel, setSelectedChannel] = useState<LiveChannel>(getDefaultChannel());
    const [selectedCarouselId, setSelectedCarouselId] = useState<string>(getDefaultChannel()?.slug || getDefaultChannel()?.id || '');

    // Update selected channel when URL parameter changes
    useEffect(() => {
        if (channelParam) {
            const paramChannel = initialChannels.find(c => c.slug === channelParam || c.id === channelParam);
            if (paramChannel) {
                setSelectedChannel(paramChannel);
                setSelectedCarouselId(paramChannel.slug || paramChannel.id);
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
        setSelectedCarouselId(channel.slug || channel.id);
        setSelectedChannel(channel);
        router.replace(`${pathname}?channel=${channel.slug || channel.id}`, { scroll: false });
    };

    if (!selectedChannel) {
        return <div className="text-center text-white py-20">Aucune chaîne disponible</div>;
    }

    return (
        <div className="space-y-8 md:space-y-12">
            {/* 1. Carousel with Tabs */}
            <LiveSelectionCarousel
                channels={initialChannels}
                epgItems={currentPrograms}
                fullEpg={fullEpg}
                onSelectChannel={handleChannelSelect}
                selectedChannelId={selectedCarouselId}
            />

            {/* 2. Player Section */}
            {selectedChannel.type === 'TV' ? (
                <LivePlayerSection
                    channel={selectedChannel}
                    currentProgram={currentPrograms.find(p => p.channel_id === selectedChannel.id)}
                />
            ) : (
                <RadioPlayerSection
                    channel={selectedChannel}
                    currentProgram={currentPrograms.find(p => p.channel_id === selectedChannel.id)}
                />
            )}

            {/* 3. Info & Grid Section */}
            {selectedChannel.type === 'TV' ? (
                <>
                    {fullEpg.length > 0 && (
                        <UpcomingProgramsTimeline
                            epgData={fullEpg}
                            currentChannelId={selectedChannel.id}
                            currentChannelLogo={selectedChannel.logo_url || selectedChannel.logo}
                        />
                    )}
                </>
            ) : (
                <RadioAudiosSection items={aodItems} />
            )}
        </div>
    );
}
