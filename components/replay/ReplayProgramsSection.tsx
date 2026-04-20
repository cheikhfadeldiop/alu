"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { SafeImage } from "@/components/ui/SafeImage";
import type { SliderVideoItem } from "@/types/api";
import { formatDate, parseToDate } from "@/utils/text";
import { useTranslations } from "next-intl";

type ReplayProgramsSectionProps = {
  videos: SliderVideoItem[];
  initialNextPageToken?: string | null;
};

const GRID_ROW_SIZE = 4;
const FETCH_BATCH_SIZE = 8;
const LOAD_MORE_INCREMENT = GRID_ROW_SIZE * 2; // +2 lignes
const INITIAL_VISIBLE_COUNT = GRID_ROW_SIZE * 3; // 3 lignes

function uniqVideos(items: SliderVideoItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = String(item.slug || item.id || "");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchMoreVideoRows(nextToken: string, loadedVideos: SliderVideoItem[], minimumCount: number) {
  let token: string | null = nextToken;
  let merged = loadedVideos;

  while (token && merged.length < minimumCount) {
    const response = await fetch(
      `/api/youtube/latest-videos?maxResults=${FETCH_BATCH_SIZE}&pageToken=${encodeURIComponent(token)}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch more videos");
    }

    const data = (await response.json()) as { items?: SliderVideoItem[]; nextPageToken?: string | null };
    merged = uniqVideos([...(merged || []), ...((data.items || []) as SliderVideoItem[])]);
    token = data.nextPageToken || null;
  }

  return { merged, nextPageToken: token };
}

function displayTime(date?: string, fallbackTime?: string, unknownTime: string = "--:--") {
  if (fallbackTime && fallbackTime.trim()) return fallbackTime;
  const parsed = parseToDate(date);
  if (!parsed) return unknownTime;
  return parsed.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function ReplayProgramsSection({ videos, initialNextPageToken }: ReplayProgramsSectionProps) {
  const t = useTranslations("common");
  const initialLoadedVideos = useMemo(() => uniqVideos(videos), [videos]);
  const [loadedVideos, setLoadedVideos] = useState<SliderVideoItem[]>(initialLoadedVideos);
  const [visibleCount, setVisibleCount] = useState(() => Math.min(INITIAL_VISIBLE_COUNT, initialLoadedVideos.length));
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(initialNextPageToken || null);

  const visibleVideos = useMemo(() => loadedVideos.slice(0, visibleCount), [loadedVideos, visibleCount]);
  const hasMore = visibleCount < loadedVideos.length || Boolean(nextPageToken);

  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore) return;
    // Reveal local seulement quand on n'a pas de pagination.
    if (!nextPageToken) {
      setVisibleCount((prev) => Math.min(prev + LOAD_MORE_INCREMENT, loadedVideos.length));
      return;
    }

    setIsLoadingMore(true);

    try {
      const data = await fetchMoreVideoRows(
        nextPageToken,
        loadedVideos,
        visibleCount + LOAD_MORE_INCREMENT
      );

      setLoadedVideos(data.merged);
      setNextPageToken(data.nextPageToken);
      setVisibleCount((prev) => Math.min(prev + LOAD_MORE_INCREMENT, data.merged.length));
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <section className="mx-auto w-full space-y-[42px]">
      <div className="news-section-header">
        <h2 className="fig-h9 uppercase text-white">{t("latestVideos")}</h2>
        <div className="news-section-line" />
      </div>

      <div className="grid gap-[15px] grid-cols-2 sm:grid-cols-2 xl:grid-cols-4">
        {visibleVideos.map((video, idx) => (
          <Link key={`${video.id}-${idx}`} href={`/replay/${video.slug || video.id}`} className="block space-y-3 rounded-[12px] hover-lift-primary">
            <div className="h-[240px] md:h-[440px] overflow-hidden rounded-[15px] bg-[#333333]">
              <SafeImage
                src={video.logo_url || video.logo || "/assets/placeholders/live_tv_frame.png"}
                alt={video.title || t("program")}
                width={343}
                height={440}
                className="h-full w-full object-cover scale-[1.6]"
              />
            </div>
            <div className="px-1 md:pl-3 pb-2">
              <h3 className="text-[13px] md:fig-h9 line-clamp-2 uppercase text-white font-medium leading-tight">{video.title || t("program")}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-[5px] md:gap-[10px] text-[10px] md:text-[12px] text-[#8E8E8E]">
                <span>{video.date ? formatDate(video.date) : formatDate(new Date())}</span>
                <span className="h-[3.86px] w-[3.86px] rounded-full bg-[#8E8E8E] hidden md:inline-block" />
                <span>{displayTime(video.date, video.time, t("unknownTime"))}</span>
              </div>
            </div>
          </Link>
        ))}

        {isLoadingMore && (
          <>
            {Array.from({ length: 2 }, (_, idx) => (
              <article key={`replay-program-shimmer-${idx}`} className="space-y-4 animate-pulse">
                <div className="h-[240px] md:h-[440px] overflow-hidden rounded-[15px] bg-[#2a2a2a]" />
                <div className="h-4 md:h-6 w-4/5 rounded bg-[#2a2a2a]" />
                <div className="h-3 md:h-4 w-2/3 rounded bg-[#2a2a2a]" />
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
            {isLoadingMore ? t("loading") : t("loadMore")}
          </button>
        </div>
      )}
    </section>
  );
}
