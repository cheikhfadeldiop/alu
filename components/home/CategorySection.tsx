import { Link } from "@/i18n/navigation";
import { SectionTitle } from "../ui/SectionTitle";
import { AlauneItem } from "../../types/api";
import { SafeImage } from "../ui/SafeImage";
import { getPostAuthor, formatDate } from "@/utils/text";

interface CategorySectionProps {
    items: AlauneItem[];
    title: string;
    category: string;
    actionLabel: string;
}

export function CategorySection({ items, title, category, actionLabel }: CategorySectionProps) {
    return (
        <div className="space-y-l">
            <SectionTitle
                title={title}
                title2=""
                actionLabel={actionLabel}
                actionHref={`/news?category=${category.toLowerCase()}`}
            />
            <div className="space-y-m">
                {items.map((item) => (
                    <Link key={item.slug || item.id} href={`/replay/${item.slug || item.id}`} className="group block">
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10 mb-2">
                            <SafeImage
                                src={item.image_url || item.image || "/assets/placeholders/article_list.png"}
                                alt={item.title}
                                fill
                                sizes="(max-width: 1024px) 100vw, 33vw"
                                className="object-cover"
                            />
                        </div>
                        <h3 className="font-semibold b4 line-clamp-2 mb-xxs">
                            {item.title}
                        </h3>
                        <p className="b5 text-[color:var(--muted)] hover:text-[color:var(--accent)] uppercase flex justify-between items-center w-full">
                            <span>{getPostAuthor(item) || title}</span>
                            <span>{formatDate((item as any).published_at || Date.now())}</span>
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
