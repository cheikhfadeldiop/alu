import { Link } from "@/i18n/navigation";
import { WordPressPost } from "../../types/api";
import { SectionTitle } from "../ui/SectionTitle";

interface CorporateNewsSectionProps {
    posts: WordPressPost[];
    title: string;
    title2?: string;
}

import { SITE_CONFIG } from "@/constants/site-config";

import { useTranslations } from "next-intl";

export function CorporateNewsSection({ posts, title, title2 }: CorporateNewsSectionProps) {
    const t = useTranslations("common");

    if (!posts || posts.length === 0) return null;

    return (
        <section className="space-y-6 ">
            <div className="flex items-center justify-between">
                <SectionTitle title={title} title2={title2} actionLabel='' actionHref="/news" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {posts.slice(0, 3).map((post) => (
                    <Link
                        key={post.id}
                        href={`/news?id=${post.id}`}
                        className="group   backdrop-blur-sm bg-background/30 border border-gray-100 dark:border-muted/30 rounded-2xl p-8 flex flex-col h-full hover:shadow-xl hover:border-[color:var(--accent)]/20 transition-all duration-300"
                    >
                        {/* Communiqué Label */}
                        <div className="text-[color:var(--accent)] text-xs font-black uppercase tracking-widest mb-4">
                            {t("pressRelease")}
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold leading-tight mb-4 group-hover:text-[color:var(--accent)] transition-colors line-clamp-2">
                            {post.title.rendered}
                        </h3>

                        {/* Excerpt */}
                        <div
                            className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2 flex-grow"
                            dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                        />

                        {/* Link */}
                        <div className="mt-auto flex items-center gap-2 text-sm font-bold text-foreground group-hover:gap-3 transition-all">
                            <span>{t("readRelease")}</span>
                            <span className="text-[color:var(--accent)]">→</span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
