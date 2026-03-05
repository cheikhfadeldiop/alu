import { Link } from "@/i18n/navigation";
import { WordPressPost } from "../../types/api";
import { SectionTitle } from "../ui/SectionTitle";
import { SITE_CONFIG } from "@/constants/site-config";
import { useTranslations } from "next-intl";

import { getPostAuthor } from "@/utils/text";

interface CorporateNewsSectionProps {
    posts: WordPressPost[];
    title: string;
    title2?: string;
}

export function CorporateNewsSection({ posts, title, title2 }: CorporateNewsSectionProps) {
    const t = useTranslations("common");

    if (!posts || posts.length === 0) return null;

    return (
        <section className="flex flex-col w-full gap-6 md:gap-[23px]">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <SectionTitle
                    title={title}
                    title2={title2}
                    actionHref="/corporate"
                    actionIcon
                    className="font-bold"
                />

                <Link
                    href="/corporate"
                    className="flex flex-row justify-center items-center flex-shrink-0 border-b border-[#8E8E8E] px-0 h-[37px]"
                >
                    <span className="b4 font-normal text-[14px] leading-[20px] uppercase text-[#777777] h-6 flex items-center justify-center">
                        {t("seeMore")}
                    </span>
                </Link>
            </div>

            {/* CONTAINER CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {posts.slice(0, 3).map((post) => (
                    <Link
                        key={post.id}
                        href={`/corporate?slug=${post.slug}`}
                        className="group flex flex-col items-start hover:shadow-xl transition-all duration-300 bg-surface border border-muted/10 rounded-xl p-6 min-h-[226px]"
                    >
                        {getPostAuthor(post) && (
                            <div className="mb-2">
                                <span className="b4 font-bold tracking-wider uppercase text-accent">
                                    {getPostAuthor(post)}
                                </span>
                            </div>
                        )}

                        <div className="mb-3">
                            <h3 className="line-clamp-2 text-foreground font-bold text-lg leading-relaxed md:h-[56px] w-full">
                                {post.title.rendered}
                            </h3>
                        </div>

                        <div className="mb-4">
                            <div
                                className="line-clamp-2 b3 text-muted w-full h-[50px] overflow-hidden"
                                dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                            />
                        </div>

                        <div className="flex flex-row items-center gap-2 group-hover:translate-x-1 transition-transform mt-auto">
                            <span className="b3 font-bold text-foreground">
                                {t("readRelease")}
                            </span>
                            <span className="b2 font-bold text-accent">
                                →
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}