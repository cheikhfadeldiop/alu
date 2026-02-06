import { getTranslations } from "next-intl/server";

import { AdBanner } from "../../components/ui/AdBanner";
import {
  HeroSection,
  LiveChannelsGrid,
  ShortsCarousel,
  LatestEditions,
  EditorialChoice,
  CategorySection,
  RegionalNews,
  WordPressNewsSection,
} from "../../components/home";

import {
  getSliderVideos,
  getLiveChannels,
  getAlaune,
  getVODChannels,
  getEPGNow,
  getWordPressAlaunePost,
  getWordPressPosts,
} from "../../services/api";
import { LiveSelectionCarousel } from "@/components/live/LiveSelectionCarousel";

export default async function HomePage() {
  const t = await getTranslations("pages.home");
  const tc = await getTranslations("common");

  // Fetch data from API
  const [sliderVideosData, liveChannelsData, alauneData, vodChannelsData, epgData, wpAlauneData, wpTrendingData] = await Promise.all([
    getSliderVideos().catch(() => ({ allitems: [] })),
    getLiveChannels().catch(() => ({ allitems: [] })),
    getAlaune().catch(() => ({ allitems: [] })),
    getVODChannels().catch(() => ({ allitems: [] })),
    getEPGNow().catch(() => ({ allitems: [] })),
    getWordPressAlaunePost().catch(() => []),
    getWordPressPosts(141, 20).catch(() => []), // Trending news - ACTUELLES category (20 articles)
  ]);

  const sliderVideos = sliderVideosData.allitems || [];
  const liveChannels = liveChannelsData.allitems || [];
  const alauneItems = alauneData.allitems || [];
  const vodChannels = vodChannelsData.allitems || [];
  const epgItems = epgData.allitems || [];
  const wpAlauneItems = wpAlauneData || [];
  const wpTrendingItems = wpTrendingData || [];

  // Data preparation for components
  const hero = alauneItems[0];
  const trendingNews = alauneItems.slice(0, 4);
  const latestEditionsItems = alauneItems; // Pass all items, component handles slicing
  const editorialItems = alauneItems.slice(5); // Adjust slice as needed based on API data logic

  // Simulated category filtering (in real app, use specific API calls or filtering)
  const educationItems = alauneItems.slice(14, 18);
  const cultureItems = alauneItems.slice(18, 22);
  const sportItems = alauneItems.slice(22, 26);
  const regionalItems = alauneItems.slice(26, 32);

  return (
    <div className="crtv-page-enter space-y-8 max-w-[1400px] mx-auto px-4">
      {/* WordPress News Section */}
      <WordPressNewsSection
        alauneItems={wpAlauneItems}
        trendingItems={wpTrendingItems}
      />



      <LiveChannelsGrid
        channels={liveChannels}
        epgItems={epgItems}
        title="NOS CHAÎNES EN DIRECT"
        actionLabel="Voir tout"
      />

      {/* Latest Editions */}
      <LatestEditions
        items={latestEditionsItems}
        title="DERNIÈRES ÉDITIONS"
        actionLabel="Voir tout"
      />

      {/* Shorts Carousel */}
      <ShortsCarousel
        videos={sliderVideos}
        title="L'actu en Resumé #CrtvShorts"
        actionLabel="VOIR PLUS"
      />

      {/* Ad Banner */}
      <AdBanner />

      {/* Editorial Choice */}
      <EditorialChoice
        items={editorialItems}
        title="CHOIX DE LA RÉDACTION"
        actionLabel="Voir plus"
      />

      {/* Categories Grid */}
      <section className="grid gap-8 lg:grid-cols-3">
        <CategorySection
          items={educationItems}
          title="ÉDUCATION"
          category="education"
          actionLabel="Voir plus"
        />
        <CategorySection
          items={cultureItems}
          title="CULTURE"
          category="culture"
          actionLabel="Voir plus"
        />
        <CategorySection
          items={sportItems}
          title="SPORT"
          category="sport"
          actionLabel="Voir plus"
        />
      </section>

      {/* Regional News with Ad */}
      <RegionalNews
        items={regionalItems}
        title="ACTUALITÉS RÉGIONALES"
        actionLabel="Voir plus"
      />
    </div>
  );
}
