import { Suspense } from "react";
import { RadioPageShimmer } from "@/components/ui/shimmer/RadioShimmers";
import { Metadata } from "next";
import { SITE_CONFIG } from "@/constants/site-config";
import { RadioPageClient } from "@/components/radio/RadioPageClient";
import {
  getLiveRadios,
  getEPGNow,
  getSiteAbsoluteUrl,
  ensureAbsoluteUrl
} from "@/services/api";

async function RadioPageContent() {
  const [radiosData, epgNowData] = await Promise.all([
    getLiveRadios().catch(() => ({ allitems: [] })),
    getEPGNow().catch(() => ({ allitems: [] })),
  ]);

  const radios = radiosData.allitems || [];
  const epgNowItems = epgNowData.allitems || [];

  return (
    <RadioPageClient
      initialRadios={radios}
      epgData={epgNowItems}
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
  return (
    <div className="crtv-page-enter space-y-8 md:space-y-12 max-w-[1400px] mx-auto px-4 py-8">

      <Suspense fallback={<RadioPageShimmer />}>
        <RadioPageContent />
      </Suspense>
    </div>
  );
}
