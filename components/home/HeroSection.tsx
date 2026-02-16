import { Link } from "../../i18n/navigation";
import { AlauneItem, SliderItem } from "../../types/api";
import { SafeImage } from "../ui/SafeImage";

interface HeroSectionProps {
    hero: SliderItem | AlauneItem | null;
    trendingNews: AlauneItem[];
}

export function HeroSection({ hero, trendingNews }: HeroSectionProps) {
    return (
        <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            {/* Main Hero */}
            {hero && (
                <Link
                    href={`/playback/${hero.id}`}
                    className="group relative block overflow-hidden rounded-lg bg-white/10 dark:bg-black/30 backdrop-blur-sm border border-white/20 dark:border-white/10"
                >
                    <div className="relative aspect-[16/10] w-full">
                        <SafeImage
                            src={hero.image_url || hero.image || "/assets/placeholders/news_wide.png"}
                            alt={hero.title || "Image à la une"}
                            fill
                            sizes="(max-width: 1024px) 100vw, 60vw"
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                            <p className="text-xs font-semibold text-white/80 mb-2">
                                {(hero as any).published_at
                                    ? new Date((hero as any).published_at).toLocaleDateString("fr-FR")
                                    : new Date().toLocaleDateString("fr-FR")}{" "}
                                • {(hero as any).category || "À la une"}
                            </p>
                            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight ">
                                {hero.title}
                            </h1>
                        </div>
                    </div>
                </Link>
            )}

            {/* Trending News Sidebar */}
            <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[color:var(--border)] pb-2">
                    <h2 className="text-sm font-bold uppercase">À la une</h2>
                    <Link href="/news" className="text-xs text-[color:var(--accent)] ">
                        Trending news
                    </Link>
                </div>
                <div className="space-y-3">
                    {trendingNews.map((item, index) => (
                        <Link
                            key={`${item.id}-${index}`}
                            href={`/playback/${item.id}`}
                            className="group flex gap-3 hover:bg-white/10 dark:hover:bg-white/5 p-2 rounded-lg transition-colors border border-transparent hover:border-white/10"
                        >
                            <div className="relative w-24 h-16 flex-shrink-0 rounded overflow-hidden bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10">
                                <SafeImage
                                    src={item.image_url || item.image || "/assets/placeholders/article_list.png"}
                                    alt={item.title || "Actualité"}
                                    fill
                                    sizes="96px"
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xs font-semibold line-clamp-2  mb-1">
                                    {item.title}
                                </h3>
                                <p className="text-[10px] text-[color:var(--muted)]">
                                    {new Date(item.published_at || Date.now()).toLocaleDateString("fr-FR")} •{" "}
                                    {item.category || "Actualités"}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
