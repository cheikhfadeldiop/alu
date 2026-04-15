import { AdBannerH } from "@/components/ui/AdBanner";
import { SafeImage } from "@/components/ui/SafeImage";
import { getVODShows } from "@/services/api";

type PlaybackIndexProps = {
  searchParams?: Promise<{ rows?: string }>;
};

export default async function PlaybackIndexPage({ searchParams }: PlaybackIndexProps) {
  const params = (await searchParams) ?? {};
  const rows = Math.max(3, Number(params.rows ?? "3"));
  const [showsRes] = await Promise.all([getVODShows().catch(() => ({ allitems: [] }))]);

  const fallbackShow = {
    id: "fallback-show",
    slug: "candelight-initiative",
    title: "CANDELIGHT INITIATIVE",
    logo_url: "/assets/placeholders/live_tv_frame.png",
    logo: "/assets/placeholders/live_tv_frame.png",
  };

  const showsPool = showsRes.allitems?.length ? showsRes.allitems : [fallbackShow];
  const perRow = 4;
  const count = rows * perRow;
  const cards = Array.from({ length: count }, (_, i) => showsPool[i % showsPool.length]);
  const nextRows = rows + 3;

  return (
    <div className="crtv-page-enter mx-auto w-full max-w-[1293px] space-y-12 py-8 text-white">
      <AdBannerH className="mx-auto w-full max-w-[1264px]" />

      <section className="space-y-[42px]">
        <div className="news-section-header">
          <h2 className="fig-h9 uppercase text-white">Programs TV</h2>
          <div className="news-section-line" />
        </div>

        <div className="grid gap-x-[20px] gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((show, idx) => (
            <a key={`${show.slug || show.id}-${idx}`} href={`/playback/${show.slug || show.id}`} className="block space-y-4">
              <div className="h-[440px] overflow-hidden rounded-[15px] bg-[#333333]">
                <SafeImage
                  src={show.logo_url || show.logo || "/assets/placeholders/live_tv_frame.png"}
                  alt={show.title || "Program"}
                  width={343}
                  height={440}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-[13px]">
                <h3 className="fig-h9 line-clamp-1 uppercase text-white">{show.title || "CANDELIGHT INITIATIVE"}</h3>
                <div className="flex items-center gap-[10px] text-[12px] leading-[18px] text-[#8E8E8E]">
                  <span>Monday</span>
                  <span className="h-[2px] w-[8px] bg-[#606060]" />
                  <span>Thursday</span>
                  <span className="h-[3.86px] w-[3.86px] rounded-full bg-[#8E8E8E]" />
                  <span>09:00 PM</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="flex justify-center">
          <a
            href={`/playback?rows=${nextRows}`}
            className="inline-flex h-[40px] items-center justify-center rounded-[60px] border border-[#777777] px-5 text-[14px] font-semibold uppercase text-white"
          >
            Load more
          </a>
        </div>
      </section>

      <AdBannerH className="mx-auto w-full max-w-[1264px]" />
    </div>
  );
}

