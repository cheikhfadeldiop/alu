import { useTranslations } from "next-intl";

import { SectionTitle } from "../../../components/ui/SectionTitle";
import { MediaCard } from "../../../components/ui/MediaCard";

const mainArticles = Array.from({ length: 9 }).map((_, i) => ({
  id: `n-${i + 1}`,
  title: `Actualité: point du jour ${i + 1}`,
  imageSrc:
    i % 2 === 0
      ? "/assets/placeholders/news_wide.png"
      : "/assets/placeholders/article_list.png",
  meta: "Politique • 2h",
}));

const trending = Array.from({ length: 6 }).map((_, i) => ({
  id: `t-${i + 1}`,
  title: `Trending: sujet ${i + 1}`,
  imageSrc: "/assets/placeholders/actu_regional_469x246.png",
  meta: "Il y a 1h",
}));

export default function NewsPage() {
  const t = useTranslations("pages.news");

  return (
    <div className="crtv-page-enter space-y-6">
      <SectionTitle title={t("title")} />

      <div className="grid gap-6 lg:grid-cols-[1.65fr_1fr]">
        <div className="space-y-4">
          {mainArticles.map((a) => (
            <MediaCard
              key={a.id}
              href={`/playback/${a.id}`}
              title={a.title}
              imageSrc={a.imageSrc}
              meta={a.meta}
              aspect="16/9"
              showPlayIcon
            />
          ))}
        </div>

        <aside className="space-y-4">
          <SectionTitle title={t("trending")} />
          <div className="grid gap-4">
            {trending.map((a) => (
              <MediaCard
                key={a.id}
                href={`/playback/${a.id}`}
                title={a.title}
                imageSrc={a.imageSrc}
                meta={a.meta}
                aspect="16/9"
                showPlayIcon
              />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

