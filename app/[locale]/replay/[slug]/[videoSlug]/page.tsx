import { ReplayPlayerWrapper } from "@/components/replay/ReplayPlayerWrapper";
import { SafeImage } from "@/components/ui/SafeImage";
import { Link } from "@/i18n/navigation";
import { getYouTubePlaylistItems, mapYouTubeItemToReplay, SliderVideoItem } from "@/services/api";

interface ReplayVideoPageProps {
  params: Promise<{ slug: string; videoSlug: string }>;
}

export default async function ReplayVideoPage({ params }: ReplayVideoPageProps) {
  const { slug, videoSlug } = await params;
  const decodedVideoSlug = decodeURIComponent(videoSlug);

  const ytItems = await getYouTubePlaylistItems(slug).catch(() => []);
  const mapped = ytItems.map(mapYouTubeItemToReplay).filter(Boolean) as SliderVideoItem[];
  const selectedReplay = mapped.find((v) => v.slug === decodedVideoSlug || v.id === decodedVideoSlug) || null;

  const replay =
    selectedReplay ??
    mapped[0] ??
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

  const suggestions = mapped.length ? mapped.slice(0, 8) : [replay];

  return (
    <div className="crtv-page-enter mx-auto w-full max-w-[1280px] space-y-10 py-8 text-white">
      <Link href={`/replay/${slug}`} className="inline-flex text-[12px] uppercase tracking-[0.2em] text-[#A4A4A4] hover:text-white">
        ← Back to emission details
      </Link>

      <ReplayPlayerWrapper video={replay} />

      <section className="space-y-5">
        <div className="news-section-header">
          <h2 className="fig-h9 uppercase text-white">Latest videos</h2>
          <div className="news-section-line" />
        </div>

        <div className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
          {suggestions.map((video, index) => (
            <Link key={`${video.slug || video.id}-${index}`} href={`/replay/${slug}/${video.slug || video.id}`} className="space-y-2">
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
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
