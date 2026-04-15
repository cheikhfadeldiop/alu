import { getVODShows } from "../../../services/api";
import { AdBannerH, AdBannerHD } from "@/components/ui/AdBanner";
import { SafeImage } from "@/components/ui/SafeImage";
import { Link } from "@/i18n/navigation";

type ReplayPageProps = {
  searchParams?: Promise<{ rows?: string }>;
};

export default async function ReplayPage({ searchParams }: ReplayPageProps) {
  const params = (await searchParams) ?? {};
  const rows = Math.max(3, Number(params.rows ?? "3"));
  const showsData = await getVODShows().catch(() => ({ allitems: [] }));

  const shows = showsData.allitems || [];
  const showFallback = {
    id: "fallback-show",
    slug: "candelight-initiative",
    title: "CANDELIGHT INITIATIVE",
    logo: "/assets/placeholders/live_tv_frame.png",
    logo_url: "/assets/placeholders/live_tv_frame.png",
  };
  const showsPool = shows?.length ? shows : [showFallback];
  const cards = Array.from({ length: rows * 4 }, (_, i) => showsPool[i % showsPool.length]);

  return (
    <div className="mx-auto py-8 text-white space-y-8 max-w-[1220px] md:space-y-12">
      <div className="mx-auto w-full ">
        <AdBannerHD />
      </div>

      <section className="mx-auto w-full  space-y-[42px]">
        <div className="news-section-header">
          <h2 className="fig-h9 uppercase text-white">Programs TV</h2>
          <div className="news-section-line" />
        </div>

        <div className="grid gap-[20px] sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((program, idx) => (
            <Link key={`${program.slug || program.id}-${idx}`} href={`/replay/${program.slug || program.id}`} className="space-y-4 pb-5 ">
              <div className="h-[440px] overflow-hidden rounded-[15px] bg-[#333333]">
                <SafeImage
                  src={program.logo_url || program.logo || "/assets/placeholders/live_tv_frame.png"}
                  alt={program.title || "Program"}
                  width={343}
                  height={440}
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="fig-h9 line-clamp-1 uppercase text-white">
                {program.title || "CANDELIGHT INITIATIVE"}
              </h3>
              <div className="flex items-center gap-[10px] text-[12px] leading-[18px] text-[#8E8E8E]">
                <span>Monday</span>
                <span className="h-[2px] w-[8px] bg-[#606060]" />
                <span>Thursday</span>
                <span className="h-[3.86px] w-[3.86px] rounded-full bg-[#8E8E8E]" />
                <span>09:00 PM</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex justify-center">
          <Link
            href={`/replay?rows=${rows + 3}`}
            className="h-[40px] rounded-[60px] border border-[#777777] px-5 text-[14px] font-semibold uppercase text-white inline-flex items-center"
          >
            Load more
          </Link>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1264px]">
        <AdBannerHD />
      </div>
    </div>
  );
}
