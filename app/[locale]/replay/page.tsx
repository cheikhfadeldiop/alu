import {
  getLiveChannels,
  getEPGNow,
  getLatestAggregateReplays,
  getVODShows,
  getReplaysByShowAggregated
} from "../../../services/api";
import { LiveDirectSection } from "../../../components/replay/LiveDirectSection";
import { DernieresEditionsCarousel } from "../../../components/replay/DernieresEditionsCarousel";
import { MissedAiringSection } from "../../../components/replay/MissedAiringSection";
import { EmissionsSlider } from "../../../components/replay/EmissionsSlider";
import { AdBanner } from "@/components/ui/AdBanner";
import { Suspense } from "react";
import { PromoAntenneWrapper } from "@/components/home/HomeWrappers";

export default async function ReplayPage() {
  // Fetch all data for the replay main page
  const [liveChannelsData, epgData, replays, showsData] = await Promise.all([
    getLiveChannels().catch(() => ({ allitems: [] })),
    getEPGNow().catch(() => ({ allitems: [] })),
    getLatestAggregateReplays().catch(() => []),
    getVODShows().catch(() => ({ allitems: [] })),
  ]);

  const liveChannels = liveChannelsData.allitems || [];
  const epgItems = epgData.allitems || [];
  const shows = showsData.allitems || [];

  return (
    <div className="py-8 space-y-8 md:space-y-12">
      {/* 1. Live Direct Section */}
      <div className="max-w-[1400px] mx-auto px-4">
        <LiveDirectSection
          channels={liveChannels}
          epgItems={epgItems}
        />
      </div>
      <AdBanner />

      {/* 2. Replay Carousel */}
      <DernieresEditionsCarousel videos={replays} liveChannels={liveChannels} />

      {/* 3. Missed Airing Section */}
      <MissedAiringSection initialVideos={replays} liveChannels={liveChannels} />

      <AdBanner />

      {/* 4. Nos Émissions Section */}
      <EmissionsSlider shows={shows} />

      {/* 5. Promo Antenne */}
      <Suspense fallback={<div className="h-40 bg-muted/5 animate-pulse rounded-lg" />}>
        <PromoAntenneWrapper
          titre="CAPSULES VIDEOS CRTVWeb"
          showMetadata={true}
        />
      </Suspense>
    </div>
  );
}
