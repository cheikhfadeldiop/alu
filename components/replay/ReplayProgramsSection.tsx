"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { SafeImage } from "@/components/ui/SafeImage";
import type { SliderVideoItem } from "@/types/api";
import { formatDate, parseToDate } from "@/utils/text";

type ReplayProgramsSectionProps = {
  videos: SliderVideoItem[];
};

function displayTime(date?: string, fallbackTime?: string) {
  if (fallbackTime && fallbackTime.trim()) return fallbackTime;
  const parsed = parseToDate(date);
  if (!parsed) return "--:--";
  return parsed.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function ReplayProgramsSection({ videos }: ReplayProgramsSectionProps) {
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const visibleVideos = useMemo(() => videos.slice(0, visibleCount), [videos, visibleCount]);
  const hasMore = visibleCount < videos.length;

  const handleLoadMore = () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 8, videos.length));
      setIsLoadingMore(false);
    }, 600);
  };

  return (
    <section className="mx-auto w-full space-y-[42px]">
      <div className="news-section-header">
        <h2 className="fig-h9 uppercase text-white">Programs TV</h2>
        <div className="news-section-line" />
      </div>

      <div className="grid gap-[20px] sm:grid-cols-2 xl:grid-cols-4">
        {visibleVideos.map((video, idx) => (
          <Link key={`${video.id}-${idx}`} href={`/replay/${video.slug || video.id}`} className="block space-y-4 rounded-[12px] hover-lift-primary">
            <div className="h-[440px] overflow-hidden rounded-[15px] bg-[#333333]">
              <SafeImage
                src={video.logo_url || video.logo || "/assets/placeholders/live_tv_frame.png"}
                alt={video.title || "Program"}
                width={343}
                height={440}
                className="h-full w-full object-cover"
              />
            </div>
            <h3 className="fig-h9 line-clamp-2 uppercase text-white">{video.title || "Program"}</h3>
            <div className="flex items-center gap-[10px] text-[12px] leading-[18px] text-[#8E8E8E]">
              <span>{video.date ? formatDate(video.date) : formatDate(new Date())}</span>
              <span className="h-[3.86px] w-[3.86px] rounded-full bg-[#8E8E8E]" />
              <span>{displayTime(video.date, video.time)}</span>
            </div>
          </Link>
        ))}

        {isLoadingMore && (
          <>
            {[0, 1].map((idx) => (
              <article key={`replay-program-shimmer-${idx}`} className="space-y-4 animate-pulse">
                <div className="h-[440px] overflow-hidden rounded-[15px] bg-[#2a2a2a]" />
                <div className="h-6 w-4/5 rounded bg-[#2a2a2a]" />
                <div className="h-4 w-2/3 rounded bg-[#2a2a2a]" />
              </article>
            ))}
          </>
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="h-[40px] rounded-[60px] border border-[#777777] px-5 text-[14px] font-semibold uppercase text-white disabled:opacity-60"
          >
            {isLoadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </section>
  );
}

