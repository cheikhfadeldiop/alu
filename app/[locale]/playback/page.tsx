import { useTranslations } from "next-intl";

import { Carousel } from "../../../components/ui/Carousel";
import { MediaCard } from "../../../components/ui/MediaCard";
import { SectionTitle } from "../../../components/ui/SectionTitle";

export default function PlaybackIndexPage() {
  const t = useTranslations("nav");

  return (
    <div className="crtv-page-enter space-y-10">
      <SectionTitle title={t("playback")} />

      <section className="space-y-4">
        <SectionTitle title="À regarder maintenant" />
        <Carousel itemClassName="w-[320px] sm:w-[420px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <MediaCard
              key={i}
              href={`/playback/p-${i + 1}`}
              title={`Lecture vidéo ${i + 1}`}
              imageSrc="/assets/placeholders/news_wide.png"
              meta="Replay • 28 min"
              aspect="16/9"
            />
          ))}
        </Carousel>
      </section>

      <section className="space-y-4">
        <SectionTitle title="Dernières vidéos" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <MediaCard
              key={i}
              href={`/playback/p-${i + 10}`}
              title={`Vidéo ${i + 10}`}
              imageSrc={
                i % 2 === 0
                  ? "/assets/placeholders/actu_regional_469x246.png"
                  : "/assets/placeholders/article_list.png"
              }
              meta="12 déc. 2026"
              aspect="16/9"
            />
          ))}
        </div>
      </section>
    </div>
  );
}

