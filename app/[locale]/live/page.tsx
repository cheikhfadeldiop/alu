import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { LivePageClient } from "@/components/live/LivePageClient";
import { SectionTitle } from "@/components/ui/SectionTitle";
import {
  getAluLiveChannels,
  getYouTubeLatestVideosPage
} from "@/services/api";
import { LivePageShimmer } from "@/components/ui/shimmer/LiveShimmers";
import { Metadata } from "next";
import { SITE_CONFIG } from "@/constants/site-config";
import { getSiteAbsoluteUrl, ensureAbsoluteUrl } from "@/services/api";

async function LivePageContent() {
  const allChannelsRes = await getAluLiveChannels().catch(() => ({ allitems: [] }));
  const allChannels = allChannelsRes.allitems || [];
  const { items: channelVideos, nextPageToken } = await getYouTubeLatestVideosPage({ maxResults: 24, ttlKey: "realtime" }).catch(() => ({
    items: [],
    nextPageToken: null,
  }));

  return (
    <LivePageClient
      initialChannels={allChannels}
      initialChannelVideos={channelVideos}
      initialNextPageToken={nextPageToken}
      epgData={[]}
      fullEpg={[]}
      aodItems={[]}
    />
  );
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ channel?: string }> }): Promise<Metadata> {
  const { channel } = await searchParams;
  const liveTVData = await getAluLiveChannels().catch(() => ({ allitems: [] }));
  const channels = (liveTVData.allitems || []).filter((c) => c.type === "TV");
  const selected = (channel ? channels.find(c => c.id === channel) : null) || channels[0];

  if (!selected) return { title: `Direct TV - ${SITE_CONFIG.name}` };

  const imageUrl = ensureAbsoluteUrl(selected.hd_logo || selected.logo) || getSiteAbsoluteUrl(SITE_CONFIG.theme.placeholders.video);

  return {
    title: `${selected.title} - Direct TV ${SITE_CONFIG.name}`,
    description: selected.desc || `Regardez ${selected.title} en direct sur ${SITE_CONFIG.name} Web`,
    openGraph: {
      title: selected.title,
      description: selected.desc || `Regardez ${selected.title} en direct sur ${SITE_CONFIG.name} Web`,
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
      description: selected.desc || `Regardez ${selected.title} en direct sur ${SITE_CONFIG.name} Web`,
      images: [imageUrl],
    }
  };
}

export default async function LivePage() {

  return (
    <div className="crtv-page-enter space-y-8 md:space-y-12 max-w-[1400px] mx-auto px-4 py-8 bg-[#171717] text-[#E8E8E8] rounded-[20px]">

      <Suspense fallback={<LivePageShimmer />}>
        <LivePageContent />
      </Suspense>
    </div>
  );
}
