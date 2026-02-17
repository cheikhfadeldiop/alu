import { Suspense } from "react";
import { AdBanner } from "@/components/ui/AdBanner";
import {
  WordPressNewsWrapper,
  LiveChannelsWrapper,
  DernieresEditionsWrapper,
  EditorialChoiceWrapper,
  RegionalCategoriesWrapper,
  CategoryWithAdWrapper,
  ShortsCarouselWrapper,
  CorporateNewsWrapper,
  PromoAntenneWrapper
} from "@/components/home/HomeWrappers";
import {
  WordPressNewsShimmer,
  LiveChannelsShimmer,
  DernieresEditionsShimmer,
  EditorialChoiceShimmer,
  RegionalCategoriesShimmer,
  CategoryWithAdShimmer,
  ShortsShimmer,
  CorporateShimmer
} from "@/components/ui/shimmer/HomeShimmers";

export default function HomePage() {
  return (
    <div className="crtv-page-enter space-y-12 max-w-[1400px] mx-auto px-4 py-8">
      {/* WordPress News Section
      <Suspense fallback={<WordPressNewsShimmer />}>
        <WordPressNewsWrapper />
      </Suspense>
 */}

      {/* Live Channels Section */}
      <Suspense fallback={<LiveChannelsShimmer />}>
        <LiveChannelsWrapper />
      </Suspense>

      {/* Ad Banner */}
      <AdBanner />

      {/* Editor's Choice */}
      <Suspense fallback={<EditorialChoiceShimmer />}>
        <EditorialChoiceWrapper />
      </Suspense>

      {/* Shorts Carousel */}
      <Suspense fallback={<ShortsShimmer />}>
        <ShortsCarouselWrapper />
      </Suspense>


      {/* Replays Section
      <Suspense fallback={<DernieresEditionsShimmer />}>
        <DernieresEditionsWrapper />
      </Suspense>
       */}


  
      {/* Regional Categories  */}
      <Suspense fallback={<RegionalCategoriesShimmer />}>
        <RegionalCategoriesWrapper />
      </Suspense>

    {/* Promo d'antenne */}
      <Suspense fallback={<div className="h-40 bg-muted/5 animate-pulse rounded-lg" />}>
        <PromoAntenneWrapper />
      </Suspense>

      {/* News with Ad Section */}
      <Suspense fallback={<CategoryWithAdShimmer />}>
        <CategoryWithAdWrapper />
      </Suspense>


      {/* Corporate News */}
      <Suspense fallback={<CorporateShimmer />}>
        <CorporateNewsWrapper />
      </Suspense>
    </div>
  );
}
