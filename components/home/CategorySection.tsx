import Link from "next/link";
import Image from "next/image";
import { SectionTitle } from "../ui/SectionTitle";
import { AlauneItem } from "../../types/api";

interface CategorySectionProps {
    items: AlauneItem[];
    title: string;
    category: string;
    actionLabel: string;
}

export function CategorySection({ items, title, category, actionLabel }: CategorySectionProps) {
    return (
        <div className="space-y-4">
            <SectionTitle
                title={title}
                actionLabel={actionLabel}
                actionHref={`/news?category=${category.toLowerCase()}`}
            />
            <div className="space-y-3">
                {items.map((item) => (
                    <Link key={item.id} href={`/playback/${item.id}`} className="group block">
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-200 mb-2">
                            <Image
                                src={item.image_url || item.image || "/assets/placeholders/article_list.png"}
                                alt={item.title}
                                fill
                                sizes="(max-width: 1024px) 100vw, 33vw"
                                className="object-cover"
                            />
                        </div>
                        <h3 className="font-semibold text-xs line-clamp-2 group-hover:underline mb-1">
                            {item.title}
                        </h3>
                        <p className="text-[10px] text-[color:var(--muted)] uppercase">
                            {(item as any).category || title} •{" "}
                            {new Date((item as any).published_at || Date.now()).toLocaleDateString("fr-FR")}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
