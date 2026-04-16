"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SafeImage } from "../ui/SafeImage";
import type { SliderVideoItem } from "@/types/api";
import { formatDate } from "@/utils/text";

function formatDateTime(dateString: string) {
  const date = new Date(dateString);

  const formattedDate = date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    date: formattedDate,
    time: formattedTime,
  };
}

type LatestVideosLoadMoreGridProps = {
  selectedReplay: SliderVideoItem;
  initialVideos: SliderVideoItem[];
  initialNextPageToken: string | null;
};

const GRID_ROW_SIZE = 4;
const INITIAL_VISIBLE_COUNT = GRID_ROW_SIZE * 3; // 3 lignes (12 sur xl)
const LOAD_MORE_INCREMENT = GRID_ROW_SIZE * 2; // +2 lignes par clic
const FETCH_BATCH_SIZE = LOAD_MORE_INCREMENT; // multiple of GRID_ROW_SIZE (2 rows)
const SKELETON_CARD_COUNT = 2;

function uniqVideos(items: SliderVideoItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = String(item.slug || item.id || "");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function LatestVideosLoadMoreGrid({
  selectedReplay,
  initialVideos,
  initialNextPageToken,
}: LatestVideosLoadMoreGridProps) {
  const t = useTranslations("common");


  const initialLoadedVideos = React.useMemo(
    () => uniqVideos([selectedReplay, ...initialVideos]),
    [selectedReplay, initialVideos],
  );

  const [loadedVideos, setLoadedVideos] = React.useState<SliderVideoItem[]>(initialLoadedVideos);
  const [visibleCount, setVisibleCount] = React.useState(() =>
    Math.min(INITIAL_VISIBLE_COUNT, initialLoadedVideos.length),
  );
  const [nextPageToken, setNextPageToken] = React.useState<string | null>(initialNextPageToken || null);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);

  const hasMore = visibleCount < loadedVideos.length || Boolean(nextPageToken);

  const handleLoadMore = async () => {
    if (isLoadingMore) return;

    // If we have a next page, always fetch from the channel API (pagination).
    if (nextPageToken) {
      setIsLoadingMore(true);
      try {
        const response = await fetch(
          `/api/youtube/latest-videos?maxResults=${FETCH_BATCH_SIZE}&pageToken=${encodeURIComponent(nextPageToken)}`,
        );
        if (!response.ok) throw new Error("Failed to fetch more videos");

        const data = (await response.json()) as { items?: SliderVideoItem[]; nextPageToken?: string | null };
        const merged = uniqVideos([...(loadedVideos || []), ...((data.items || []) as SliderVideoItem[])]);

        setLoadedVideos(merged);
        setNextPageToken(data.nextPageToken || null);
        setVisibleCount((prev) => Math.min(prev + LOAD_MORE_INCREMENT, merged.length));
      } catch {
        // If fetching fails, stop showing the button.
        setNextPageToken(null);
      } finally {
        setIsLoadingMore(false);
      }
      return;
    }

    // No next page: just reveal the remaining locally loaded items.
    setVisibleCount((prev) => Math.min(prev + LOAD_MORE_INCREMENT, loadedVideos.length));
  };

 



  return (
    <>
      <div className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
        {loadedVideos.slice(0, visibleCount).map((video, index) => (
          
          
          <Link
            key={`${video.slug || video.id}-${index}`}
            href={`/replay/${video.slug || video.id}`}
            className="space-y-2 hover-lift-primary rounded-[10px]"
          >
            <div className="h-[172px] overflow-hidden rounded-[10px]">
              <SafeImage
                src={video.logo_url || video.logo || "/assets/placeholders/live_tv_frame.png"}
                alt={video.title || t("replays")}
                width={306}
                height={172}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="px-2">
            <h3 className="line-clamp-2 text-[16px] leading-[24px] text-white">
            {video.title}
          </h3>

          <div className="flex items-center gap-[10px] text-[12px] leading-[18px] text-[#8E8E8E]">
            <span>
              {new Date(video.date).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>

            <span className="h-[3.86px] w-[3.86px] rounded-full bg-[#8E8E8E]" />

            <span>
              {new Date(video.date).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
            </div>
          </Link>
        ))}

        {isLoadingMore &&
          Array.from({ length: SKELETON_CARD_COUNT }, (_, idx) => (
            <article key={`latest-shimmer-${idx}`} className="space-y-2 animate-pulse">
              <div className="h-[172px] overflow-hidden rounded-[10px] bg-[#2a2a2a]" />
              <div className="h-5 w-4/5 rounded bg-[#2a2a2a]" />
              <div className="h-4 w-2/3 rounded bg-[#2a2a2a]" />
            </article>
          ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-8">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="h-[40px] rounded-[60px] border border-[#777777] px-5 text-[14px] font-semibold uppercase text-white disabled:opacity-60"
          >
            {isLoadingMore ? t("loading") : t("loadMore")}
          </button>
        </div>
      )}
    </>
  );
}

