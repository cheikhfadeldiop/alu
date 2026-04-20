import type { Metadata } from "next";
import { NewsDetailPageClient } from "@/components/news/NewsDetailPageClient";
import { SITE_CONFIG } from "@/constants/site-config";
import { getWordPressCategories, getWordPressLatestPosts, getWordPressPost, getWordPressPosts } from "@/services/api";
import type { WordPressCategory, WordPressPost } from "@/types/api";
import { decodeHtmlEntities } from "@/utils/text";

interface NewsDetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ cat?: string }>;
}

const NEWS_DETAIL_INITIAL_CATEGORY_COUNT = 20;
const NEWS_DETAIL_INITIAL_FILL_COUNT = 20;
const NEWS_DETAIL_INITIAL_LATEST_COUNT = 20;

function buildPriorityCategoryIds(activeCategoryId: number, validIds: number[], limit: number) {
  if (!validIds.length) return [activeCategoryId];
  const activeIndex = Math.max(0, validIds.indexOf(activeCategoryId));
  const ordered = [...validIds.slice(activeIndex), ...validIds.slice(0, activeIndex)];
  return ordered.slice(0, Math.max(1, limit));
}

async function getInitialDetailPayload(post: WordPressPost | null, rawCat?: string) {
  const initialCategories = await getWordPressCategories().catch(() => [] as WordPressCategory[]);
  const validCategories = initialCategories.filter(
    (cat) =>
      Number(cat?.count || 0) > 0 &&
      String(cat?.name || "").toLowerCase() !== "uncategorized" &&
      String(cat?.slug || "").toLowerCase() !== "uncategorized"
  );

  const postCategories = Array.isArray(post?.categories) ? post.categories.map((id) => Number(id)) : [];
  const validIds = validCategories.map((category) => Number(category.id));
  const requestedCategory = rawCat && !Number.isNaN(Number(rawCat)) ? Number(rawCat) : null;
  const matchedCategoryId = postCategories.find((categoryId) => validIds.includes(categoryId));
  const activeCategoryId =
    (requestedCategory && validIds.includes(requestedCategory) ? requestedCategory : null) ||
    matchedCategoryId ||
    Number(validCategories[0]?.id || 0);
  const prioritizedCategoryIds = buildPriorityCategoryIds(
    activeCategoryId,
    validIds,
    SITE_CONFIG.cacheLimit || 5
  );

  const [categoryArticles, groupedArticles, latestArticles] = await Promise.all([
    getWordPressPosts(activeCategoryId, NEWS_DETAIL_INITIAL_CATEGORY_COUNT).catch(() => [] as WordPressPost[]),
    Promise.all(
      prioritizedCategoryIds.map((categoryId) =>
        getWordPressPosts(categoryId, NEWS_DETAIL_INITIAL_FILL_COUNT).catch(() => [] as WordPressPost[])
      )
    ),
    getWordPressLatestPosts(NEWS_DETAIL_INITIAL_LATEST_COUNT, 1).catch(() => [] as WordPressPost[]),
  ]);

  const dedupedArticles = new Map<number, WordPressPost>();
  groupedArticles.flat().forEach((item) => {
    if (!item?.id || dedupedArticles.has(item.id)) return;
    dedupedArticles.set(item.id, item);
  });

  return {
    initialCategories,
    initialBundle: {
      activeCategoryId,
      categoryArticles,
      allArticles: Array.from(dedupedArticles.values()),
      latestArticles,
    },
    initialCategoryId: activeCategoryId,
  };
}

export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getWordPressPost(slug).catch(() => null);
  const title = decodeHtmlEntities(post?.title?.rendered || "News");

  return {
    title: `${title} - ${SITE_CONFIG.name}`,
    description: decodeHtmlEntities(post?.excerpt?.rendered || SITE_CONFIG.description),
  };
}

export default async function NewsDetailPage({ params, searchParams }: NewsDetailPageProps) {
  const { slug } = await params;
  const { cat } = await searchParams;
  const initialPost = await getWordPressPost(slug).catch(() => null);
  const initialPayload = await getInitialDetailPayload(initialPost, cat);

  return (
    <NewsDetailPageClient
      key={`news-detail-${slug}-${initialPayload.initialCategoryId}`}
      slug={slug}
      initialPost={initialPost || undefined}
      initialCategories={initialPayload.initialCategories}
      initialBundle={initialPayload.initialBundle}
      initialCategoryId={initialPayload.initialCategoryId}
    />
  );
}
