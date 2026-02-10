import {
    getLiveChannels,
    getEPGAll,
    getLatestAggregateReplays,
    getVODShows,
    getReplaysByShowAggregated
} from "../../../services/api";
import { LiveDirectSection } from "../../../components/replay/LiveDirectSection";
import { DernieresEditionsCarousel } from "../../../components/replay/DernieresEditionsCarousel";
import { MissedAiringSection } from "../../../components/replay/MissedAiringSection";
import { EmissionsSlider } from "../../../components/replay/EmissionsSlider";
import { CrossedNavigationSection } from "../../../components/replay/CrossedNavigationSection";

export default async function ReplayLayout({
    children
}: {
    children: React.ReactNode;
}) {
    // Fetch shared data ONCE per "session" or until full refresh
    // Next.js layout will preserve this part of the DOM during [slug] changes
    const [liveChannelsData, epgData, replays, showsData, crossedData] = await Promise.all([
        getLiveChannels().catch(() => ({ allitems: [] })),
        getEPGAll().catch(() => ({ allitems: [] })),
        getLatestAggregateReplays().catch(() => []),
        getVODShows().catch(() => ({ allitems: [] })),
        getReplaysByShowAggregated(10, 10).catch(() => []),
    ]);

    const liveChannels = liveChannelsData.allitems || [];
    const epgItems = epgData.allitems || [];
    const shows = showsData.allitems || [];

    return (
        <div className="py-8 space-y-16">
            {/* 1. Live Direct Section */}
            <div className="max-w-[1400px] mx-auto px-4">
                <LiveDirectSection
                    channels={liveChannels}
                    epgItems={epgItems}
                />
            </div>

            {/* 2. Slot for the Player (Page Content) */}
            {children}

            {/* 3. Replay Carousel */}
            <DernieresEditionsCarousel videos={replays} liveChannels={liveChannels} />

            {/* 4. Missed Airing Section */}
            <MissedAiringSection initialVideos={replays} liveChannels={liveChannels} />

            {/* 5. Nos Émissions Section */}
            <EmissionsSlider shows={shows} />

            {/* 6. Crossed Navigation Section */}
            <CrossedNavigationSection data={crossedData} />
        </div>
    );
}
