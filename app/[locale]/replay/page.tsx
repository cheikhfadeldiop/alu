import { useTranslations } from "next-intl";

import { SectionTitle } from "../../../components/ui/SectionTitle";
import { MediaCard } from "../../../components/ui/MediaCard";

const mockVideos = Array.from({ length: 18 }).map((_, i) => ({
  id: `v-${i + 1}`,
  title: `Replay: Édition du jour ${i + 1}`,
  imageSrc:
    i % 3 === 0
      ? "/assets/placeholders/news_wide.png"
      : "/assets/placeholders/actu_regional_469x246.png",
  meta: "12 déc. 2026 • 28 min",
}));

export default function ReplayPage() {
  const t = useTranslations("pages.replay");

  return (
    <div className="crtv-page-enter space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionTitle title={t("title")} title2="" />

        <div className="flex flex-wrap gap-2">
          {["Tous", "Journal", "Sport", "Culture", "Éducation"].map((label) => (
            <button
              key={label}
              type="button"
              className="h-9 rounded-full border border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--surface)_70%,transparent)] px-4 text-sm font-semibold text-[color:var(--muted)] hover:bg-[color:var(--surface)] hover:text-foreground"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockVideos.map((v) => (
          <MediaCard
            key={v.id}
            href={`/playback/${v.id}`}
            title={v.title}
            imageSrc={v.imageSrc}
            meta={v.meta}
            aspect="16/9"
            showPlayIcon
          />
        ))}
      </div>
    </div>
  );
}

