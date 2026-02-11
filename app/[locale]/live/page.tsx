import { getTranslations } from "next-intl/server";
import { LivePageClient } from "@/components/live/LivePageClient";
import { SectionTitle } from "@/components/ui/SectionTitle";
import {
  getLiveChannels,
  getLiveRadios,
  getEPGAll,
  getEPGNow
} from "@/services/api";

export default async function LivePage() {
  const t = await getTranslations("pages.live");

  // Fetch Data: Live TV, Radios, Full EPG (timeline), and Current EPG (carousel)
  const [liveTVData, liveRadioData, fullEpgData, epgNowData] = await Promise.all([
    getLiveChannels().catch(() => ({ allitems: [] })),
    getLiveRadios().catch(() => ({ allitems: [] })),
    getEPGAll().catch(() => []),
    getEPGNow().catch(() => ({ allitems: [] })),
  ]);

  const liveTV = liveTVData.allitems || [];
  const liveRadios = liveRadioData.allitems || [];

  // Combine all channels
  const allChannels = [...liveTV, ...liveRadios];
  const fullEpg = fullEpgData || [];
  const epgNowItems = epgNowData.allitems || [];

  return (
    <div className="crtv-page-enter space-y-10">
      <div className="flex items-center justify-between mb-2">
        <SectionTitle title={t("title")} title2={t("titleSuffix")} />
      </div>

      <LivePageClient
        initialChannels={allChannels}
        epgData={epgNowItems}
        fullEpg={fullEpg}
      />
    </div>
  );
}
