import { ReplayPlayerWrapper } from "@/components/replay/ReplayPlayerWrapper";
import { Link } from "@/i18n/navigation";
import { LatestVideosLoadMoreGrid } from "@/components/replay/LatestVideosLoadMoreGrid";
import { getYouTubeLatestVideosPage, SliderVideoItem } from "@/services/api";
import { getTranslations } from "next-intl/server";

interface ReplayVideoPageProps {
  params: Promise<{ videoSlug: string }>;
}

export default async function ReplayVideoPage({ params }: ReplayVideoPageProps) {
  const { videoSlug } = await params;
  const decodedVideoSlug = decodeURIComponent(videoSlug);

  const t = await getTranslations("common");
  const replayTag = t("replayTag");

  const latestPage = await getYouTubeLatestVideosPage({ maxResults: 12, ttlKey: "dynamic" }).catch(() => ({
    items: [],
    nextPageToken: null,
  }));

  const latestVideos = latestPage.items;
  const nextPageToken = latestPage.nextPageToken;
  const selectedReplay = latestVideos.find(
    (video) => video.slug === decodedVideoSlug || video.id === decodedVideoSlug
  );

  const replay =
    selectedReplay ??
    latestVideos[0] ??
    ({
      id: "fallback-replay",
      slug: "fallback-replay",
      title: replayTag,
      desc: "",
      type: "vod",
      views: "0",
      logo: "/assets/placeholders/live_tv_frame.png",
      logo_url: "/assets/placeholders/live_tv_frame.png",
      video_url: "",
      relatedItems: "",
      feed_url: "",
      date: "",
      time: "",
    } as SliderVideoItem);

  return (
    <div className="crtv-page-enter mx-auto w-full max-w-[1280px] space-y-10 py-8 text-white">
      <Link href="/replay" className="inline-flex text-[12px] uppercase tracking-[0.2em] text-[#A4A4A4] hover:text-white">
        ← {t("replays")}
      </Link>

      <ReplayPlayerWrapper video={replay} />

      <section className="space-y-5">
        <div className="news-section-header">
          <h2 className="fig-h9 uppercase text-white">{t("latestVideos")}</h2>
          <div className="news-section-line" />
        </div>

        <LatestVideosLoadMoreGrid
          selectedReplay={replay}
          initialVideos={latestVideos}
          initialNextPageToken={nextPageToken}
        />
      </section>
    </div>
  );
}
