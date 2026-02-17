import Link from "next/link";
import { SectionTitle } from "../ui/SectionTitle";
import { AlauneItem } from "../../types/api";
import { SafeImage } from "../ui/SafeImage";

interface RegionalNewsProps {
    items: AlauneItem[];
    title: string;
    title2: string;
    actionLabel: string;
}

export function RegionalNews({ items, title, title2, actionLabel }: RegionalNewsProps) {
    return (
        <section className="space-y-4">
            <SectionTitle title={title} title2={title2} actionLabel={actionLabel} actionHref="/news?category=regional" />
            <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
                {/* Articles List */}
                <div className="space-y-3">
                    {items.map((item) => (
                        <Link
                            key={item.id}
                            href={`/playback/${item.id}`}
                            className="group flex gap-3 hover:bg-white/10 dark:hover:bg-white/5 p-2 rounded-lg transition-colors border border-transparent hover:border-white/10"
                        >
                            <div className="relative w-28 h-20 flex-shrink-0 rounded overflow-hidden bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10">
                                <SafeImage
                                    src={item.image_url || item.image || "/assets/placeholders/article_list.png"}
                                    alt={item.title}
                                    fill
                                    sizes="112px"
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold line-clamp-2 mb-1">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-[color:var(--muted)] uppercase">
                                    {(item as any).category || "ACTUALITÉS RÉGIONALES"} •{" "}
                                    {new Date((item as any).published_at || Date.now()).toLocaleDateString("fr-FR")}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Right Sidebar Ad */}
                <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-6 flex flex-col items-center justify-center min-h-[400px]">
                    <p className="text-[color:var(--muted)] text-sm mb-2">Dimension</p>
                    <p className="text-2xl font-bold mb-4">1460 X 370</p>
                    <p className="text-[color:var(--muted)] text-xs text-center">Mettez vos annonces ici !</p>
                </div>
            </div>
        </section>
    );
}
