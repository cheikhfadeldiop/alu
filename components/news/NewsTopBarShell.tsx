"use client";

import { useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { SITE_CONFIG } from "@/constants/site-config";
import { createNewsTopTabs, NewsTopBar } from "./NewsTopBar";

export function NewsTopBarShell() {
  const router = useRouter();
  const pathname = usePathname();
  const tabs = createNewsTopTabs(SITE_CONFIG.categories.news.alaune);
  const [activeTab, setActiveTab] = useState("top");

  return (
    <div className="-mt-8 w-full bg-[var(--fig-bg)] md:-mt-14">
      <NewsTopBar
        tabs={tabs}
        activeTab={activeTab}
        onTabClick={(tab) => {
          setActiveTab(tab.key);
          const isNewsDetails = /^\/[a-z]{2}\/news\/.+/.test(pathname);
          if (isNewsDetails) {
            router.push("/news");
          }
        }}
      />
    </div>
  );
}
