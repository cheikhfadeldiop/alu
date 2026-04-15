import { AdBannerH } from "@/components/ui/AdBanner";
import { SafeImage } from "@/components/ui/SafeImage";
import {
  getLatestAggregateReplays,
  getRelatedItems,
  getVODShows,
  mapVODToSliderItem,
} from "@/services/api";
import { SliderVideoItem } from "@/types/api";

function toSlugText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default async function PlaybackShowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  const [showsRes, fallbackVideos] = await Promise.all([
    getVODShows().catch(() => ({ allitems: [] })),
    getLatestAggregateReplays(16).catch(() => []),
  ]);

  const shows = showsRes.allitems || [];
  const selectedShow =
    shows.find((show) => show.slug === decodedId || show.id === decodedId || toSlugText(show.title) === decodedId) ??
    shows[0];

  const showTitle = selectedShow?.title || "CANDELIGHT INITIATIVE";
  const showImage = selectedShow?.logo_url || selectedShow?.logo || "/assets/placeholders/live_tv_frame.png";

  let showVideos: SliderVideoItem[] = [];
  if (selectedShow?.relatedItems && selectedShow.relatedItems !== "null") {
    const related = await getRelatedItems(selectedShow.relatedItems).catch(() => []);
    showVideos = related.map((item) => mapVODToSliderItem(item, selectedShow.chaine_logo || selectedShow.logo_url));
  }

  const videoPool = showVideos.length ? showVideos : fallbackVideos;
  const videos = Array.from({ length: 12 }, (_, index) => videoPool[index % Math.max(videoPool.length, 1)]).filter(Boolean);

  return (
    <div className="crtv-page-enter mx-auto w-full max-w-[1285px] space-y-12 py-8 text-white">
      <AdBannerH className="mx-auto w-full max-w-[1264px]" />

      <section className="grid gap-10 lg:grid-cols-[373px_1fr] lg:items-center">
        <div className="h-[479px] overflow-hidden rounded-[15px]">
          <SafeImage src={showImage} alt={showTitle} width={373} height={479} className="h-full w-full object-cover" />
        </div>

        <div className="flex flex-col gap-[42px]">
          <div className="space-y-[33px]">
            <div className="space-y-[13px]">
              <h1 className="fig-h9 uppercase text-white">{showTitle}</h1>
              <div className="flex items-center gap-[10px] text-[12px] leading-[18px] text-[#8E8E8E]">
                <span>Monday</span>
                <span className="h-[2px] w-[8px] bg-[#606060]" />
                <span>Thursday</span>
                <span className="h-[3.86px] w-[3.86px] rounded-full bg-[#8E8E8E]" />
                <span>09:00 PM</span>
              </div>
            </div>
            <p className="text-[14px] leading-[21px] text-[#A4A4A4]">
              {selectedShow?.desc ||
                "Emission d'information et de debrief qui revient sur les faits marquants, les analyses et les temps forts de la semaine avec les meilleures séquences en replay."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href={`/playback/video/${videos[0]?.slug || videos[0]?.id || "video-1"}`}
              className="inline-flex h-[40px] items-center justify-center gap-2 rounded-[60px] border border-[#C8ABD7] bg-[#774791] px-5 text-[14px] font-semibold uppercase text-white"
            >
              <span>▶</span>
              <span>Play</span>
            </a>
            <a
              href="/playback"
              className="inline-flex h-[40px] items-center justify-center gap-2 rounded-[60px] border border-[#C8ABD7] px-5 text-[14px] font-semibold uppercase text-white"
            >
              <span>↺</span>
              <span>All programs</span>
            </a>
          </div>
        </div>
      </section>

      <section className="space-y-[50px]">
        <div className="news-section-header">
          <h2 className="fig-h9 uppercase text-white">Latest videos</h2>
          <div className="news-section-line" />
        </div>

        <div className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
          {videos.map((video, index) => (
            <a key={`${video.slug || video.id}-${index}`} href={`/playback/video/${video.slug || video.id}`} className="space-y-2">
              <div className="h-[172px] overflow-hidden rounded-[10px]">
                <SafeImage
                  src={video.logo_url || video.logo || "/assets/placeholders/live_tv_frame.png"}
                  alt={video.title || "Replay"}
                  width={306}
                  height={172}
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="line-clamp-3 text-[16px] leading-[24px] text-white">{video.title || showTitle}</h3>
              <div className="flex items-center gap-[10px] text-[12px] leading-[18px] text-[#8E8E8E]">
                <span>{video.date || "15 juin 2024"}</span>
                <span className="h-[3.86px] w-[3.86px] rounded-full bg-[#8E8E8E]" />
                <span>{video.time || "15:47"}</span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

