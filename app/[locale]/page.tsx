import { getTranslations } from "next-intl/server";

import { AdBanner } from "../../components/ui/AdBanner";
import {
  HeroSection,
  LiveChannelsGrid,
  ShortsCarousel,
  EditorialChoice,
  CategorySection,
  RegionalNews,
  WordPressNewsSection,
  DernieresEditions,
  RegionalCategoriesSection,
  CategoryWithAdSection,
  CorporateNewsSection,
} from "../../components/home";


import {
  getSliderVideos,
  getLiveChannels,
  getAlaune,
  getVODChannels,
  getEPGNow,
  getWordPressAlaunePost,
  getWordPressPosts,
  getWordPressLatestPosts,
  getAllChannelReplays,
} from "../../services/api";
import { LiveSelectionCarousel } from "@/components/live/LiveSelectionCarousel";

export default async function HomePage() {
  const t = await getTranslations("pages.home");
  const tc = await getTranslations("common");

  // Fetch data from API
  const [
    sliderVideosData,
    liveChannelsData,
    alauneData,
    vodChannelsData,
    epgData,
    wpAlauneData,
    wpTrendingData,
    allReplaysData,
    wpRegionalData,
    wpMatamData,
    wpAgricultureData,
    wpRTS1Data,
    wpCorporateData
  ] = await Promise.all([
    getSliderVideos().catch(() => ({ allitems: [] })),
    getLiveChannels().catch(() => ({ allitems: [] })),
    getAlaune().catch(() => ({ allitems: [] })),
    getVODChannels().catch(() => ({ allitems: [] })),
    getEPGNow().catch(() => ({ allitems: [] })),
    getWordPressAlaunePost().catch(() => []),
    getWordPressPosts(141, 10).catch(() => []), // Trending news
    getAllChannelReplays().catch(() => []),
    getWordPressPosts(145, 4).catch(() => []), // Regional news
    getWordPressPosts(133, 4).catch(() => []), // Matam news
    getWordPressPosts(153, 4).catch(() => []), // Agriculture news
    getWordPressLatestPosts(8).catch(() => []), // Actu RTS 1 (Generic latest for now as placeholder)
    getWordPressLatestPosts(3).catch(() => []), // Corporate News
  ]);

  const sliderVideos = sliderVideosData.allitems || [];
  const liveChannels = liveChannelsData.allitems || [];
  const alauneItems = alauneData.allitems || [];
  const vodChannels = vodChannelsData.allitems || [];
  const epgItems = epgData.allitems || [];
  const wpAlauneItems = wpAlauneData || [];
  const wpTrendingItems = wpTrendingData || [];
  const allReplays = allReplaysData || [];
  const wpRegionalPosts = wpRegionalData || [];
  const wpMatamPosts = wpMatamData || [];
  const wpAgriculturePosts = wpAgricultureData || [];
  const wpRTS1Posts = wpRTS1Data || [];
  const wpCorporatePosts = wpCorporateData || [];

  // Data preparation for components
  const hero = alauneItems[0];
  const trendingNews = alauneItems.slice(0, 4);
  const latestEditionsItems = alauneItems; // Pass all items, component handles slicing

  // Separate TV and Radio channels for LiveVideosSection
  const tvChannels = liveChannels.filter(channel => channel.type === 'TV');
  const radioChannels = liveChannels.filter(channel => channel.type === 'RADIO');

  // Separate TV and Radio channels for LiveVideosSection

  return (
    <div className="crtv-page-enter space-y-8 max-w-[1400px] mx-auto px-4">
      {/* WordPress News Section */}
      <WordPressNewsSection
        alauneItems={wpAlauneItems}
        trendingItems={wpTrendingItems}
      />

      {/*<LiveSelectionCarousel
        channels={tvChannels}
        epgItems={epgItems}
       // onSelectChannel={() => { }}
        //title="NOS CHAÎNES EN DIRECT"
        //actionLabel="Voir tout"
      />*/}



      <LiveChannelsGrid
        channels={liveChannels}
        epgItems={epgItems}
        title="NOS CHAÎNES"
        title2="EN DIRECT"
        actionLabel=""
      />

      {/* dernier edition*/}
      <DernieresEditions
        videos={allReplays}
      />

      {/* Ad Banner */}
      <AdBanner />

      <EditorialChoice
        items={wpTrendingItems}
        title="CHOIX DE LA"
        title2="RÉDACTION"
        actionLabel=""
      />

      <RegionalCategoriesSection
        regionalPosts={wpRegionalPosts}
        matamPosts={wpMatamPosts}
        agriculturePosts={wpAgriculturePosts}
      />
      {/* Shorts Carousel */}

      {/* Regional News with Ad */}
      <CategoryWithAdSection
        title="ACTUALITÉS"
        title2="RÉGIONALES"
        posts={wpRTS1Posts}
        categorySlug="rts-1"
      />

      <ShortsCarousel
        videos={sliderVideos}
        title="L'actu en Resumé"
        title2="#CrtvShorts"
        actionLabel="VOIR PLUS"
      />

      <CorporateNewsSection
        title="Corporate"
        title2="News"
        posts={wpCorporatePosts}
      />




      {/*<RegionalNews
        items={alauneItems.slice(26, 32)}
        title="ACTUALITÉS"
        title2="RÉGIONALES"
        actionLabel=""
      />*/}
    </div>
  );
}
