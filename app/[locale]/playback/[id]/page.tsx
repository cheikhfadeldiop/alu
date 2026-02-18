import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { SectionTitle } from "../../../../components/ui/SectionTitle";
import { MediaCard } from "../../../../components/ui/MediaCard";

export default async function PlaybackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("nav");

  return (
    <div className="crtv-page-enter space-y-8">
      <SectionTitle title={`${t("playback")} • ${id}`} />

      <section className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]">
        <div className="relative aspect-video w-full">
          <Image
            src="/assets/placeholders/news_wide.png"
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5">
            <div className="max-w-2xl text-lg font-semibold text-white">
              Lecture vidéo — {id}
            </div>
            <div className="mt-1 text-sm text-white/80">
              News • 12 déc. 2026 • 28 min
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.65fr_1fr]">
        <div className="space-y-4">
          <SectionTitle title="À propos" />
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 text-sm text-[color:var(--muted)]">
            Ceci est un écran de lecture (UI). Le flux vidéo réel sera branché
            plus tard côté API.
          </div>
        </div>

        <aside className="space-y-4">
          <SectionTitle title="À suivre" />
          <div className="grid gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <MediaCard
                key={i}
                href={`/replay/next-${i + 1}`}
                title={`Suggestion ${i + 1}`}
                imageSrc="/assets/placeholders/actu_regional_469x246.png"
                meta="Replay"
                aspect="16/9"
              />
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}

