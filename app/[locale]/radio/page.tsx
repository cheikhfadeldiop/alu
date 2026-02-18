import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { RadioPageShimmer } from "@/components/ui/shimmer/RadioShimmers";
import { Metadata } from "next";
import { SITE_CONFIG } from "@/constants/site-config";
import { RadioPageClient } from "@/components/radio/RadioPageClient";
import {
  getLiveRadios,
  getLiveChannels,
  getEPGAll,
  getEPGNow,
  getLatestAOD,
  getSiteAbsoluteUrl,
  ensureAbsoluteUrl
} from "@/services/api";

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

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ channel?: string }> }): Promise<Metadata> {
  const { channel } = await searchParams;
  const radiosData = await getLiveRadios().catch(() => ({ allitems: [] }));
  const radios = radiosData.allitems || [];
  const selected = (channel ? radios.find(r => (r.id || r.slug) === channel) : null) || radios[0];

  if (!selected) return { title: "Radio - CRTV" };

  const imageUrl = ensureAbsoluteUrl(selected.hd_logo || selected.logo) || getSiteAbsoluteUrl(SITE_CONFIG.theme.placeholders.radio);

  return {
    title: `${selected.title} - Radio CRTV`,
    description: selected.desc || `Écoutez ${selected.title} en direct sur CRTV Web`,
    openGraph: {
      title: selected.title,
      description: selected.desc || `Écoutez ${selected.title} en direct sur CRTV Web`,
      images: [{
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: selected.title
      }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: selected.title,
      description: selected.desc || `Écoutez ${selected.title} en direct sur CRTV Web`,
      images: [imageUrl],
    }
  };
}

export default async function RadioPage() {
  const t = await getTranslations("pages.radio");

  return (
    <div className="crtv-page-enter space-y-8 md:space-y-12 max-w-[1400px] mx-auto px-4 py-8">

      <Suspense fallback={<RadioPageShimmer />}>
        <RadioPageContent />
      </Suspense>
    </div>
  );
}
