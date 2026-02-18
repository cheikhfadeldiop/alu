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
import { Metadata } from "next";
import { SITE_CONFIG } from "@/constants/site-config";
import { getSiteAbsoluteUrl, ensureAbsoluteUrl } from "@/services/api";

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

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ channel?: string }> }): Promise<Metadata> {
  const { channel } = await searchParams;
  const liveTVData = await getLiveChannels().catch(() => ({ allitems: [] }));
  const channels = liveTVData.allitems || [];
  const selected = (channel ? channels.find(c => c.id === channel) : null) || channels[0];

  if (!selected) return { title: "Direct TV - CRTV" };

  const imageUrl = ensureAbsoluteUrl(selected.hd_logo || selected.logo) || getSiteAbsoluteUrl(SITE_CONFIG.theme.placeholders.video);

  return {
    title: `${selected.title} - Direct TV CRTV`,
    description: selected.desc || `Regardez ${selected.title} en direct sur CRTV Web`,
    openGraph: {
      title: selected.title,
      description: selected.desc || `Regardez ${selected.title} en direct sur CRTV Web`,
      images: [{
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: selected.title
      }],
      type: 'video.other',
    },
    twitter: {
      card: 'summary_large_image',
      title: selected.title,
      description: selected.desc || `Regardez ${selected.title} en direct sur CRTV Web`,
      images: [imageUrl],
    }
  };
}

export default async function LivePage() {

  return (
    <div className="crtv-page-enter space-y-8 md:space-y-12 max-w-[1400px] mx-auto px-4 py-8">

      <Suspense fallback={<LivePageShimmer />}>
        <LivePageContent />
      </Suspense>
    </div>
  );
}
