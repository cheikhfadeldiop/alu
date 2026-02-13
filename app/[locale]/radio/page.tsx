import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { RadioPageClient } from "@/components/radio/RadioPageClient";
import { getLiveRadios, getLiveChannels, getEPGAll, getEPGNow } from "@/services/api";
import { RadioPageShimmer } from "@/components/ui/shimmer/RadioShimmers";

async function RadioPageContent() {
  const [radiosData, channelsData, fullEpgData, epgNowData] = await Promise.all([
    getLiveRadios().catch(() => ({ allitems: [] })),
    getLiveChannels().catch(() => ({ allitems: [] })),
    getEPGAll().catch(() => []),
    getEPGNow().catch(() => ({ allitems: [] })),
  ]);

  const radios = radiosData.allitems || [];
  const channels = channelsData.allitems || [];
  const fullEpg = fullEpgData || [];
  const epgNowItems = epgNowData.allitems || [];

  const allItems = [...radios, ...channels];

  return (
    <RadioPageClient
      initialRadios={radios}
      allChannels={allItems}
      epgData={epgNowItems}
      fullEpgData={fullEpg}
    />
  );
}

export default async function RadioPage() {
  const t = await getTranslations("pages.radio");

  return (
    <div className="crtv-page-enter space-y-10 max-w-[1400px] mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-2">
        <SectionTitle title={t("title")} title2={t("titleSuffix")} />
      </div>

      <Suspense fallback={<RadioPageShimmer />}>
        <RadioPageContent />
      </Suspense>
    </div>
  );
}
