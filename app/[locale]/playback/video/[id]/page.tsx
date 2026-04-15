import { ReplayPlayerWrapper } from "@/components/replay/ReplayPlayerWrapper";
import { SafeImage } from "@/components/ui/SafeImage";
import {
  findReplay,
  getLatestAggregateReplays,
  SliderVideoItem,
} from "@/services/api";

export default async function PlaybackVideoPlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  const [selectedReplay, latestReplays] = await Promise.all([
    findReplay(decodedId),
    getLatestAggregateReplays(8).catch(() => []),
  ]);

  const replay =
    selectedReplay ??
    latestReplays[0] ??
    ({
      id: "fallback-replay",
      slug: "fallback-replay",
      title: "Sabon Shugaban Karamar Hukumar Kebbe Alh. Musa Garba Kuci Ya Lashe",
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

  const suggestions = latestReplays.length
    ? latestReplays
    : [replay];

  return (
    <div className="crtv-page-enter mx-auto w-full max-w-[1280px] space-y-10 py-8 text-white">
      <ReplayPlayerWrapper video={replay} />

      <section className="space-y-5">
        <div className="news-section-header">
          <h2 className="fig-h9 uppercase text-white">Latest videos</h2>
          <div className="news-section-line" />
        </div>

        <div className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
          {suggestions.map((video, index) => (
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
              <h3 className="line-clamp-2 text-[16px] leading-[24px] text-white">{video.title || replay.title}</h3>
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
