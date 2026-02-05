import Link from "next/link";
import Image from "next/image";
import { SectionTitle } from "../ui/SectionTitle";
import { AlauneItem } from "../../types/api";

interface EditorialChoiceProps {
    items: AlauneItem[];
    title: string;
    actionLabel: string;
}

export function EditorialChoice({ items, title, actionLabel }: EditorialChoiceProps) {
    const featuredItem = items[0];
    const listItems = items.slice(1, 5);
    const gridItems = items.slice(5, 9);

    return (
        <section className="space-y-4">
            <SectionTitle title={title} actionLabel={actionLabel} actionHref="/news" />
            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                {/* Featured Article */}
                {featuredItem && (
                    <Link
                        href={`/playback/${featuredItem.id}`}
                        className="group relative block overflow-hidden rounded-lg bg-black"
                    >
                        <div className="relative aspect-[16/10] w-full">
                            <Image
                                src={featuredItem.image_url || featuredItem.image || "/assets/placeholders/news_wide.png"}
                                alt={featuredItem.title}
                                fill
                                sizes="(max-width: 1024px) 100vw, 58vw"
                                className="object-cover"
                            />
                            {/* Play Icon */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-5">
                                <h3 className="text-white font-bold text-lg leading-tight group-hover:underline">
                                    {featuredItem.title}
                                </h3>
                                <p className="text-white/80 text-xs mt-2">
                                    {new Date((featuredItem as any).published_at || Date.now()).toLocaleDateString("fr-FR")}{" "}
                                    • {(featuredItem as any).category || "Actualités"}
                                </p>
                            </div>
                        </div>
                    </Link>
                )}

                {/* Articles List */}
                <div className="space-y-3">
                    {listItems.map((item) => (
                        <Link
                            key={item.id}
                            href={`/playback/${item.id}`}
                            className="group flex gap-3 hover:bg-[color:var(--surface)] p-2 rounded-lg transition-colors"
                        >
                            <div className="relative w-24 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-200">
                                <Image
                                    src={item.image_url || item.image || "/assets/placeholders/article_list.png"}
                                    alt={item.title}
                                    fill
                                    sizes="96px"
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xs font-semibold line-clamp-2 group-hover:underline mb-1">
                                    {item.title}
                                </h3>
                                <p className="text-[10px] text-[color:var(--muted)] uppercase">
                                    {(item as any).category || "Actualités"} •{" "}
                                    {new Date((item as any).published_at || Date.now()).toLocaleDateString("fr-FR")}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* 4-Card Grid Below */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {gridItems.map((item) => (
                    <Link key={item.id} href={`/playback/${item.id}`} className="group block">
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-200 mb-2">
                            <Image
                                src={item.image_url || item.image || "/assets/placeholders/article_list.png"}
                                alt={item.title}
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                className="object-cover"
                            />
                            {/* Play Icon */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <h3 className="font-semibold text-xs line-clamp-2 group-hover:underline mb-1">
                            {item.title}
                        </h3>
                        <p className="text-[10px] text-[color:var(--muted)]">
                            {new Date((item as any).published_at || Date.now()).toLocaleDateString("fr-FR")} •{" "}
                            {(item as any).category || "Actualités"}
                        </p>
                    </Link>
                ))}
            </div>
        </section>
    );
}
