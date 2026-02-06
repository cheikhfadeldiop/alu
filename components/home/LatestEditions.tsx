import Link from "next/link";
import Image from "next/image";
import { SectionTitle } from "../ui/SectionTitle";
import { AlauneItem } from "../../types/api";

interface LatestEditionsProps {
    items: AlauneItem[];
    title: string;
    actionLabel: string;
}

export function LatestEditions({ items, title, actionLabel }: LatestEditionsProps) {
    const featuredEdition = items[0];
    const listItems = items.slice(1, 5);

    return (
        <section className="space-y-4">
            <SectionTitle title={title} title2="" actionLabel={actionLabel} actionHref="/replay" />
            <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
                {/* Featured Edition */}
                {featuredEdition && (
                    <Link
                        href={`/playback/${featuredEdition.id}`}
                        className="group relative block overflow-hidden rounded-lg bg-white/10 dark:bg-black/30 backdrop-blur-sm border border-white/20 dark:border-white/10"
                    >
                        <div className="relative aspect-[4/3] w-full">
                            <Image
                                src={featuredEdition.image_url || featuredEdition.image || "/assets/placeholders/actu_regional_469x246.png"}
                                alt={featuredEdition.title || "Dernière édition"}
                                fill
                                sizes="(max-width: 1024px) 100vw, 55vw"
                                className="object-cover"
                            />
                            {/* Play Icon */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform border border-white/40">
                                    <svg className="w-8 h-8 text-black dark:text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-5">
                                <h3 className="text-white font-bold text-lg leading-tight group-hover:underline">
                                    {featuredEdition.title}
                                </h3>
                                <p className="text-white/80 text-xs mt-2">
                                    {new Date((featuredEdition as any).published_at || Date.now()).toLocaleDateString("fr-FR")}{" "}
                                    • {featuredEdition.duration || ""}
                                </p>
                            </div>
                        </div>
                    </Link>
                )}

                {/* Editions List */}
                <div className="space-y-3">
                    {listItems.map((item, index) => (
                        <Link
                            key={`${item.id}-${index}`}
                            href={`/playback/${item.id}`}
                            className="group flex gap-3 hover:bg-white/10 dark:hover:bg-white/5 p-2 rounded-lg transition-colors border border-transparent hover:border-white/10"
                        >
                            <div className="relative w-32 h-20 flex-shrink-0 rounded overflow-hidden bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10">
                                <Image
                                    src={item.image_url || item.image || "/assets/placeholders/article_list.png"}
                                    alt={item.title || "Édition"}
                                    fill
                                    sizes="128px"
                                    className="object-cover"
                                />
                                {/* Small Play Icon */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-black ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold line-clamp-2 group-hover:underline mb-1">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-[color:var(--muted)]">
                                    {new Date((item as any).published_at || Date.now()).toLocaleDateString("fr-FR")} •{" "}
                                    {(item as any).category || "Replay"}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
