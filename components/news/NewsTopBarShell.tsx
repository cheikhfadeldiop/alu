"use client";

import { useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { SITE_CONFIG } from "@/constants/site-config";
import { NewsTopBar, NewsTopTab } from "./NewsTopBar";
import { useWordPressCategories } from "@/hooks/useData";

export function NewsTopBarShell() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: wpCategories = [] } = useWordPressCategories();
  const defaultCategoryId = Number(wpCategories?.[0]?.id || SITE_CONFIG.categories.news.alaune);

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

  const activeTab = searchParams.get("cat") || String(tabs[0]?.id || defaultCategoryId);

  return (
    <div className="-mt-8 w-full bg-[var(--fig-bg)] md:-mt-14">
      <NewsTopBar
        tabs={tabs}
        activeTab={activeTab}
        onTabClick={(tab) => {
          const cat = String(tab.id);
          router.push(`/news?cat=${cat}`);
        }}
      />
    </div>
  );
}
