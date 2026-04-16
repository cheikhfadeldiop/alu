import { getYouTubeLatestVideos } from "../../../services/api";
import { AdBannerHD } from "@/components/ui/AdBanner";
import { ReplayProgramsSection } from "@/components/replay/ReplayProgramsSection";

export default async function ReplayPage() {
  const videos = await getYouTubeLatestVideos(80).catch(() => []);

  return (
    <div className="mx-auto py-8 text-white space-y-8 max-w-[1220px] md:space-y-12">
      <div className="mx-auto w-full ">
        <AdBannerHD />
      </div>

      <ReplayProgramsSection videos={videos} />

      <div className="mx-auto w-full max-w-[1264px]">
        <AdBannerHD />
      </div>
    </div>
  );
}
