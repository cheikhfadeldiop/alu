import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { LivePageClient } from "@/components/live/LivePageClient";
import { SectionTitle } from "@/components/ui/SectionTitle";
import {
  getLiveChannels,
  getLiveRadios,
  getEPGAll,
  getEPGNow
} from "@/services/api";
import { LivePageShimmer } from "@/components/ui/shimmer/LiveShimmers";

async function LivePageContent() {
  const [liveTVData, liveRadioData, fullEpgData, epgNowData] = await Promise.all([
    getLiveChannels().catch(() => ({ allitems: [] })),
    getLiveRadios().catch(() => ({ allitems: [] })),
    getEPGAll().catch(() => []),
    getEPGNow().catch(() => ({ allitems: [] })),
  ]);

  const liveTV = liveTVData.allitems || [];
  const liveRadios = liveRadioData.allitems || [];
  const allChannels = [...liveTV, ...liveRadios];
  const fullEpg = fullEpgData || [];
  const epgNowItems = epgNowData.allitems || [];

  return (
    <LivePageClient
      initialChannels={allChannels}
      epgData={epgNowItems}
      fullEpg={fullEpg}
    />
  );
}

export default async function LivePage() {
  const t = await getTranslations("pages.live");

  return (
    <div className="crtv-page-enter space-y-10 max-w-[1400px] mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-2">
        <SectionTitle title={t("title")} title2={t("titleSuffix")} />
      </div>

      <Suspense fallback={<LivePageShimmer />}>
        <LivePageContent />
      </Suspense>
    </div>
  );
}
