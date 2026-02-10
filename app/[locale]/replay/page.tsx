import { getTranslations } from "next-intl/server";

import { SectionTitle } from "../../../components/ui/SectionTitle";
import { MediaCard } from "../../../components/ui/MediaCard";
import { LiveDirectSection } from "../../../components/replay/LiveDirectSection";
import { DernieresEditionsCarousel } from "../../../components/replay/DernieresEditionsCarousel";
import { MissedAiringSection } from "../../../components/replay/MissedAiringSection";
import { EmissionsSlider } from "../../../components/replay/EmissionsSlider";
import { CrossedNavigationSection } from "../../../components/replay/CrossedNavigationSection";
import {
  getLiveChannels,
  getEPGAll,
  getLatestAggregateReplays,
  getVODShows,
  getReplaysByShowAggregated
} from "../../../services/api";
import { SliderVideoItem } from "../../../types/api";

export default async function ReplayPage() {
  const t = await getTranslations("pages.replay");

  // Fetch all required data
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
    <div className="crtv-page-enter py-8 space-y-16">
      {/* 1. Live Direct Section */}
      <div className="max-w-[1400px] mx-auto px-4">
        <LiveDirectSection
          channels={liveChannels}
          epgItems={epgItems}
        />
      </div>

      <DernieresEditionsCarousel videos={replays} liveChannels={liveChannels} />

      {/* 3. Missed Airing Section */}
      <MissedAiringSection initialVideos={replays} liveChannels={liveChannels} />

      {/* 4. Nos Émissions Section */}
      <EmissionsSlider shows={shows} />

      {/* 5. Crossed Navigation Section */}
      <CrossedNavigationSection data={crossedData} />
    </div>
  );
}

