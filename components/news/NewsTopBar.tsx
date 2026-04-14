"use client";

import { useRef } from "react";

export type NewsTopTab = {
  id: string | number;
  key: string;
  label: string;
};

export function createNewsTopTabs(categoryId: string | number): NewsTopTab[] {
  return [
    { id: categoryId, key: "top", label: "Top stories" },
    { id: categoryId, key: "economy", label: "Economy" },
    { id: categoryId, key: "health", label: "Health" },
    { id: categoryId, key: "environment", label: "Environment" },
    { id: categoryId, key: "sciences", label: "Sciences" },
    { id: categoryId, key: "politics", label: "Politics" },
    { id: categoryId, key: "education", label: "Education" },
    { id: categoryId, key: "lifestyle", label: "Lifestyle" },
    { id: categoryId, key: "culture", label: "Culture" },
    { id: categoryId, key: "sports", label: "Sports" },
  ];
}

type NewsTopBarProps = {
  tabs: NewsTopTab[];
  activeTab: string;
  onTabClick: (tab: NewsTopTab) => void;
  className?: string;
};

export function NewsTopBar({ tabs, activeTab, onTabClick, className = "" }: NewsTopBarProps) {
  const navRef = useRef<HTMLDivElement>(null);

  const scrollTabs = (direction: "left" | "right") => {
    const el = navRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === "left" ? -260 : 260, behavior: "smooth" });
  };

  return (
    <section className={`relative left-1/2 right-1/2 w-screen -translate-x-1/2 bg-white ${className}`}>
      <div className="mx-auto flex h-[120px] w-full max-w-[1280px] items-center px-4 xl:px-0">
        <div className="w-full pb-[10px]">
          <div ref={navRef} className="no-scrollbar flex items-center gap-[85px] overflow-x-auto whitespace-nowrap">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabClick(tab)}
                className={`h-[30px] border-b text-[20px] font-medium leading-[30px] transition-colors ${
                  activeTab === tab.key ? "border-[#c7382b] text-[#c7382b]" : "border-transparent text-[#4a4a4a]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="mt-[6px] flex justify-end gap-[5px]">
            <button type="button" aria-label="Scroll left" onClick={() => scrollTabs("left")} className="h-[14px] w-[14px] text-[#141B34]">
              ‹
            </button>
            <button type="button" aria-label="Scroll right" onClick={() => scrollTabs("right")} className="h-[14px] w-[14px] text-[#141B34]">
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
