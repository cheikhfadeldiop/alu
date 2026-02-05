import { getTranslations } from "next-intl/server";
import { LivePageClient } from "@/components/live/LivePageClient";
import { SectionTitle } from "@/components/ui/SectionTitle";
import {
  getLiveChannels,
  getLiveRadios,
  getEPGAll
} from "@/services/api";

export default async function LivePage() {
  const t = await getTranslations("pages.live");

  // Fetch Data: Live TV, Radios, and Full EPG for today
  const [liveTVData, liveRadioData, epgAllData] = await Promise.all([
    getLiveChannels().catch(() => ({ allitems: [] })),
    getLiveRadios().catch(() => ({ allitems: [] })),
    getEPGAll().catch(() => ({ allitems: [] })),
  ]);

  const liveTV = liveTVData.allitems || [];
  const liveRadios = liveRadioData.allitems || [];

  // Combine all channels
  const allChannels = [...liveTV, ...liveRadios];
  const epgItems = epgAllData.allitems || [];

  return (
    <div className="crtv-page-enter space-y-10">
      <div className="flex items-center justify-between mb-2">
        <SectionTitle title="NOS CHAÎNES" title2="EN DIRECT" />
      </div>

      <LivePageClient
        initialChannels={allChannels}
        epgData={epgItems}
      />
    </div>
  );
}
