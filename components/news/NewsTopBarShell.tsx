"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { mutate, useSWRConfig } from "swr";
import { SITE_CONFIG } from "@/constants/site-config";
import { NewsTopBar, NewsTopTab } from "./NewsTopBar";
import { fetchWordPressNewsBundleData, useWordPressCategories } from "@/hooks/useData";
import { clearPendingNewsCategoryId, setPendingNewsCategoryId } from "./newsClientState";
import { NewsTopBarShimmer } from "@/components/ui/shimmer/NewsShimmers";

const NEWS_INITIAL_CATEGORY_COUNT = 20;
const NEWS_INITIAL_FILL_COUNT = 20;
const NEWS_INITIAL_LATEST_COUNT = 20;

function buildPriorityCategoryIds(activeCategoryId: number, validIds: number[], limit: number) {
  if (!validIds.length) return [activeCategoryId];
  const activeIndex = Math.max(0, validIds.indexOf(activeCategoryId));
  const ordered = [...validIds.slice(activeIndex), ...validIds.slice(0, activeIndex)];
  return ordered.slice(0, Math.max(1, limit));
}

export function NewsTopBarShell() {
  const router = useRouter();
  const { cache } = useSWRConfig();
  const searchParams = useSearchParams();
  const { data: wpCategories = [] } = useWordPressCategories();
  const defaultCategoryId = Number(wpCategories?.[0]?.id || 0);

  const tabs = useMemo<NewsTopTab[]>(() => {
    const dynamic = (wpCategories || [])
      .filter((cat: any) =>
        Number(cat?.count || 0) > 0 &&
        String(cat?.name || "").toLowerCase() !== "uncategorized" &&
        String(cat?.slug || "").toLowerCase() !== "uncategorized"
      )
      .slice(0, 9)
      .map((cat: any) => ({ id: cat.id, key: String(cat.id), label: cat.name }));
    return dynamic;
  }, [wpCategories]);

  const routeActiveTab = searchParams.get("cat") || String(tabs[0]?.id || defaultCategoryId);
  const [optimisticActiveTab, setOptimisticActiveTab] = useState(routeActiveTab);
  const cacheLimit = SITE_CONFIG.cacheLimit || 5;
  const validIds = useMemo(() => tabs.map((tab) => Number(tab.id)).filter((id) => !Number.isNaN(id)), [tabs]);

  useEffect(() => {
    setOptimisticActiveTab(routeActiveTab);
    clearPendingNewsCategoryId(Number(routeActiveTab));
  }, [routeActiveTab]);

  useEffect(() => {
    const activeCategoryId = Number(routeActiveTab) || defaultCategoryId;
    const prioritizedCategoryIds = buildPriorityCategoryIds(activeCategoryId, validIds, cacheLimit);

    prioritizedCategoryIds.forEach((categoryId) => {
      router.prefetch(`/news?cat=${categoryId}`);
      const fillCategoryIds = buildPriorityCategoryIds(categoryId, validIds, cacheLimit).join(",");
      void mutate(
        `wordpressNewsBundle:${categoryId}:${fillCategoryIds}:${NEWS_INITIAL_CATEGORY_COUNT}:${NEWS_INITIAL_FILL_COUNT}:${NEWS_INITIAL_LATEST_COUNT}:1`,
        fetchWordPressNewsBundleData(
          categoryId,
          fillCategoryIds,
          NEWS_INITIAL_CATEGORY_COUNT,
          NEWS_INITIAL_FILL_COUNT,
          NEWS_INITIAL_LATEST_COUNT,
          1
        ),
        {
          populateCache: true,
          revalidate: false,
        }
      );
    });
  }, [cacheLimit, defaultCategoryId, routeActiveTab, router, validIds]);

  if (!tabs.length) {
    return <NewsTopBarShimmer />;
  }

  return (
    <div className="-mt-8 w-full bg-[var(--fig-bg)] md:-mt-14">
      <NewsTopBar
        tabs={tabs}
        activeTab={optimisticActiveTab}
        onTabClick={(tab) => {
          const cat = Number(tab.id);
          const fillCategoryIds = buildPriorityCategoryIds(cat, validIds, cacheLimit).join(",");
          const bundleKey = `wordpressNewsBundle:${cat}:${fillCategoryIds}:${NEWS_INITIAL_CATEGORY_COUNT}:${NEWS_INITIAL_FILL_COUNT}:${NEWS_INITIAL_LATEST_COUNT}:1`;
          const cachedBundle = cache.get(bundleKey) as { activeCategoryId?: number } | undefined;

          if (cachedBundle?.activeCategoryId === cat) {
            clearPendingNewsCategoryId(cat);
          } else {
            setPendingNewsCategoryId(cat);
          }

          setOptimisticActiveTab(String(cat));
          router.replace(`/news?cat=${cat}`);
        }}
      />
    </div>
  );
}
