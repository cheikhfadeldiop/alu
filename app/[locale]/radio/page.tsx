import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { RadioPageClient } from "@/components/radio/RadioPageClient";
import { getLiveRadios, getLiveChannels, getEPGAll, getEPGNow, getLatestAOD } from "@/services/api";
import { RadioPageShimmer } from "@/components/ui/shimmer/RadioShimmers";

async function RadioPageContent() {
  const [radiosData, channelsData, fullEpgData, epgNowData, aodData] = await Promise.all([
    getLiveRadios().catch(() => ({ allitems: [] })),
    getLiveChannels().catch(() => ({ allitems: [] })),
    getEPGAll().catch(() => []),
    getEPGNow().catch(() => ({ allitems: [] })),
    getLatestAOD().catch(() => ({ allitems: [] })),
  ]);

  const radios = radiosData.allitems || [];
  const channels = channelsData.allitems || [];
  const fullEpg = fullEpgData || [];
  const epgNowItems = epgNowData.allitems || [];
  const aodItems = aodData.allitems || [];

  const allItems = [...radios, ...channels];

  // Flatten programs for promo fallback
  const promoPrograms = fullEpg.flatMap(channel => {
    const { matin = [], soir = [] } = channel.subitems || {};
    return [...matin, ...soir].map(prog => ({
      ...prog,
      channelName: channel.titre,
      channelLogo: channel.logo
    }));
  }).toReversed().slice(0, 8);

  return (
    <RadioPageClient
      initialRadios={radios}
      allChannels={allItems}
      epgData={epgNowItems}
      fullEpgData={fullEpg}
      audiosData={aodItems}
      promoPrograms={promoPrograms}
    />
  );
}

export default async function RadioPage() {
  const t = await getTranslations("pages.radio");

  return (
    <div className="crtv-page-enter space-y-10 max-w-[1400px] mx-auto px-4 py-8">

      <Suspense fallback={<RadioPageShimmer />}>
        <RadioPageContent />
      </Suspense>
    </div>
  );
}
