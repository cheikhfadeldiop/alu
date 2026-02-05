import * as React from "react";
import { getTranslations } from "next-intl/server";

import { SectionTitle } from "../../../components/ui/SectionTitle";
import { RadioPageClient } from "../../../components/radio/RadioPageClient";

import { getLiveRadios, getLiveChannels, getEPGAll } from "../../../services/api";

export default async function RadioPage() {
  const t = await getTranslations("pages.radio");

  // Fetch both TV channels and radios, plus EPG data
  const [radiosData, channelsData, epgAllData] = await Promise.all([
    getLiveRadios().catch(() => ({ allitems: [] })),
    getLiveChannels().catch(() => ({ allitems: [] })),
    getEPGAll().catch(() => ({ allitems: [] })),
  ]);

  const radios = radiosData.allitems || [];
  const channels = channelsData.allitems || [];
  const epgItems = epgAllData.allitems || [];

  // Combine radios and channels for carousel
  const allItems = [...radios, ...channels];

  return (
    <div className="crtv-page-enter space-y-10">
      <div className="flex items-center justify-between mb-2">
        <SectionTitle title="NOS RADIOS" title2="EN DIRECT" />
      </div>

      <RadioPageClient
        initialRadios={radios}
        allChannels={allItems}
        epgData={epgItems}
      />
    </div>
  );
}
