import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { SafeImage } from "@/components/ui/SafeImage";
import {
  getYouTubePlaylists,
  getYouTubePlaylistItems,
  mapYouTubePlaylistToShow,
  mapYouTubeItemToReplay,
  SliderVideoItem,
} from "@/services/api";
import { AdBannerHD } from "@/components/ui/AdBanner";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Replay Emission - ${slug} - ${process.env.NEXT_PUBLIC_SITE_NAME || "ALU TV"}`,
    description: "Details de l'emission et ses derniers replays",
  };
}

export default async function ReplaySlugPage({ params }: PageProps) {
  const { slug } = await params;
  const playlists = await getYouTubePlaylists().catch(() => []);
  const shows = playlists.map(mapYouTubePlaylistToShow);
  const selectedShow =
    shows.find((show: any) => show.slug === slug || show.id === slug || normalizeSlug(show.title) === slug) ?? shows[0];

  const showTitle = selectedShow?.title || "Program";
  const showImage = selectedShow?.logo_url || selectedShow?.logo || "/assets/placeholders/live_tv_frame.png";

  const playlistId = selectedShow?.id || slug;
  const ytItems = await getYouTubePlaylistItems(playlistId).catch(() => []);
  const mapped = ytItems.map(mapYouTubeItemToReplay).filter(Boolean) as SliderVideoItem[];
  const replayPool = mapped.length ? mapped : [];
  const latestVideos = Array.from({ length: 12 }, (_, i) => replayPool[i % Math.max(replayPool.length, 1)]).filter(Boolean);

  return (
    <div className="crtv-page-enter py-8 text-white">
      <div className="mx-auto flex w-full max-w-[1257px] flex-col gap-12">
        <AdBannerHD/>
        <Link href="/replay" className="text-[12px] uppercase tracking-[0.2em] text-[#A4A4A4] hover:text-white">
          ← Back to programs
        </Link>

        <section className="mx-auto flex w-full max-w-[1257px] flex-row items-center gap-[85px]">
          <div className="h-[479px] w-[373px] overflow-hidden rounded-[15px]">
            <SafeImage src={showImage} alt={showTitle} width={373} height={479} className="h-full w-full object-cover" />
          </div>

          <div className="flex h-[352px] w-[729px] flex-col items-start gap-[89px]">
            <div className="flex h-[223px] w-full flex-col items-end gap-[33px]">
              <div className="flex h-[67px] w-full flex-col items-start gap-[13px]">
                <h1 className="fig-h9 w-full uppercase text-white">{showTitle}</h1>
                <div className="flex h-[18px] w-[224px] items-center gap-[10px] text-[12px] leading-[18px] text-[#8E8E8E]">
                  <div className="flex h-[18px] w-[196.86px] items-center gap-[10px]">
                    <div className="flex h-[18px] w-[118px] items-center gap-[5px]">
                      <span className="w-[46px]">Monday</span>
                      <span className="h-[2px] w-[8px] bg-[#606060]" />
                      <span className="w-[54px]">Thursday</span>
                    </div>
                    <span className="h-[3.86px] w-[3.86px] rounded-full bg-[#8E8E8E]" />
                    <span className="w-[55px]">09:00 PM</span>
                  </div>
                </div>
              </div>
              <p className="text-[14px] w-full leading-[21px] text-[#A4A4A4] ">
                {selectedShow?.desc ||
                  "Retrouvez tous les episodes de cette emission, les analyses et les meilleurs moments en replay."}
              </p>
            </div>

            <div className="flex h-[40px] w-[410px] items-center gap-[40px]">
              <Link
                href={`/replay/${slug}/${latestVideos[0]?.slug || latestVideos[0]?.id || "video-1"}`}
                className="inline-flex h-[40px] w-[185px] items-center justify-center gap-[10px] rounded-[60px] border border-[#C8ABD7] bg-[#774791] px-[10px] text-[14px] font-semibold uppercase text-white"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 7L17 12L9 17V7Z" fill="#FFFFFF" />
                </svg>
                <span>Play</span>
              </Link>

              <Link
                href="/replay"
                className="inline-flex h-[40px] w-[185px] items-center justify-center gap-[10px] rounded-[60px] border border-[#C8ABD7] px-[10px] text-[14px] font-semibold uppercase text-white"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3 12a9 9 0 1 0 2.64-6.36L3 8" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 3v5h5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>All programs</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="space-y-[50px] pt-10">
          <div className="news-section-header">
            <h2 className="fig-h9 uppercase text-white">Latest videos</h2>
            <div className="news-section-line" />
          </div>

          <div className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
            {latestVideos.map((video, index) => (
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
                <h3 className="line-clamp-3 text-[16px] leading-[24px] text-white">{video.title || showTitle}</h3>
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
    </div>
  );
}
