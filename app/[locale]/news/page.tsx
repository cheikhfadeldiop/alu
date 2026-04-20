import { Suspense } from "react";
import { NewsPageClient } from "@/components/news/NewsPageClient";
import { NewsHeroShimmer } from "@/components/ui/shimmer/NewsShimmers";
import { SITE_CONFIG } from "@/constants/site-config";
import { getWordPressCategories, getWordPressLatestPosts, getWordPressPosts } from "@/services/api";
import type { WordPressCategory, WordPressPost } from "@/types/api";

const NEWS_INITIAL_CATEGORY_COUNT = 20;
const NEWS_INITIAL_FILL_COUNT = 20;
const NEWS_INITIAL_LATEST_COUNT = 20;

interface NewsPageProps {
  searchParams: Promise<{ cat?: string }>;
}

function buildPriorityCategoryIds(activeCategoryId: number, validIds: number[], limit: number) {
  if (!validIds.length) return [activeCategoryId];
  const activeIndex = Math.max(0, validIds.indexOf(activeCategoryId));
  const ordered = [...validIds.slice(activeIndex), ...validIds.slice(0, activeIndex)];
  return ordered.slice(0, Math.max(1, limit));
}

async function getInitialNewsPayload(rawCat?: string) {
  const initialCategories = await getWordPressCategories().catch(() => [] as WordPressCategory[]);
  const validCategories = initialCategories.filter(
    (cat) =>
      Number(cat?.count || 0) > 0 &&
      String(cat?.name || "").toLowerCase() !== "uncategorized" &&
      String(cat?.slug || "").toLowerCase() !== "uncategorized"
  );

  const defaultCategoryId = Number(validCategories[0]?.id || 0);
  const requestedCategory = rawCat && !Number.isNaN(Number(rawCat)) ? Number(rawCat) : defaultCategoryId;
  const validIds = validCategories.map((category) => Number(category.id));
  const activeCategoryId = validIds.includes(requestedCategory) ? requestedCategory : defaultCategoryId;
  const prioritizedCategoryIds = buildPriorityCategoryIds(
    activeCategoryId,
    validIds,
    SITE_CONFIG.cacheLimit || 5
  );

  const [categoryArticles, groupedArticles, latestArticles] = await Promise.all([
    getWordPressPosts(activeCategoryId, NEWS_INITIAL_CATEGORY_COUNT).catch(() => [] as WordPressPost[]),
    Promise.all(
      prioritizedCategoryIds.map((categoryId) =>
        getWordPressPosts(categoryId, NEWS_INITIAL_FILL_COUNT).catch(() => [] as WordPressPost[])
      )
    ),
    getWordPressLatestPosts(NEWS_INITIAL_LATEST_COUNT, 1).catch(() => [] as WordPressPost[]),
  ]);

  const dedupedArticles = new Map<number, WordPressPost>();
  groupedArticles.flat().forEach((item) => {
    if (!item?.id || dedupedArticles.has(item.id)) return;
    dedupedArticles.set(item.id, item);
  });

  return {
    initialCategories,
    initialCategoryId: activeCategoryId,
    initialBundle: {
      activeCategoryId,
      categoryArticles,
      allArticles: Array.from(dedupedArticles.values()),
      latestArticles,
    },
  };
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const { cat } = await searchParams;
  const initialPayload = await getInitialNewsPayload(cat);

  return (
    <Suspense fallback={<NewsHeroShimmer />}>
      <NewsPageClient
        key={`news-${initialPayload.initialCategoryId}`}
        initialCategories={initialPayload.initialCategories}
        initialCategoryId={initialPayload.initialCategoryId}
        initialBundle={initialPayload.initialBundle}
      />
    </Suspense>
  );
}
