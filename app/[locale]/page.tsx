import { FigmaHomePage } from "@/components/home/FigmaHomePage";
import { getWordPressLatestPosts, getWordPressPosts, getYouTubeLatestVideos, getYouTubeShorts } from "@/services/api";
import { SITE_CONFIG } from "@/constants/site-config";
import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("pages.home");
  const newsCategory = SITE_CONFIG.categories.news.alaune;
  const trendingCategory = SITE_CONFIG.categories.news.trending || newsCategory;
  const [postsRaw, popularRaw, videos, shorts] = await Promise.all([
    getWordPressLatestPosts(20, 1).catch(() => []),
    getWordPressPosts(trendingCategory, 20, 1).catch(() => []),
    getYouTubeLatestVideos(30).catch(() => []),
    getYouTubeShorts(10).catch(() => []),
  ]);

  const byDateDesc = (a: any, b: any) => new Date(b?.date || 0).getTime() - new Date(a?.date || 0).getTime();
  const latestPosts = [...postsRaw].sort(byDateDesc);
  const popularPosts = [...popularRaw].sort(byDateDesc);

  return (
    <FigmaHomePage
      posts={latestPosts}
      popularPosts={popularPosts}
      videos={videos}
      shorts={shorts}
      newsCategoryId={newsCategory}
      labels={{
        latestNews: t("latestNews"),
        mostPopular: t("mostPopular"),
        videos: t("videosSection"),
        shorts: t("shortsSection"),
        fallbackShortTitle: t("fallbackShortTitle"),
      }}
    />
  );
}
