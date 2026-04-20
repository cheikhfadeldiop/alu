import { FigmaHomePage } from "@/components/home/FigmaHomePage";
import { getWordPressCategoryBySlug, getWordPressLatestPosts, getWordPressPosts, getYouTubeLatestVideos } from "@/services/api";
import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("pages.home");

  // Dynamically resolve category IDs from slugs
  const [alauneCats, trendingCats] = await Promise.all([
    getWordPressCategoryBySlug('a-la-une').catch(() => []),
    getWordPressCategoryBySlug('trending').catch(() => []),
  ]);

  const newsCategory = Number(alauneCats?.[0]?.id || 0);
  const trendingCategory = Number(trendingCats?.[0]?.id || newsCategory || 0);

  const [postsRaw, popularRaw, videos] = await Promise.all([
    getWordPressLatestPosts(20, 1, { ttlKey: "standard" }).catch(() => []),
    trendingCategory
      ? getWordPressPosts(trendingCategory, 20, 1, { ttlKey: "standard" }).catch(() => [])
      : getWordPressLatestPosts(20, 1, { ttlKey: "standard" }).catch(() => []),
    getYouTubeLatestVideos(30, { ttlKey: "standard" }).catch(() => []),
  ]);

  const byDateDesc = (a: any, b: any) => new Date(b?.date || 0).getTime() - new Date(a?.date || 0).getTime();
  const latestPosts = [...postsRaw].sort(byDateDesc);
  const popularPosts = [...popularRaw].sort(byDateDesc);

  return (
    <FigmaHomePage
      posts={latestPosts}
      popularPosts={popularPosts}
      videos={videos}
      shorts={videos}
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
