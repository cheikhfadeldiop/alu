import { WordPressPost } from "../../types/api";
import { AdBanner } from "../ui/AdBanner";
import { SectionTitle } from "../ui/SectionTitle";
import { Link } from "@/i18n/navigation";
import { SITE_CONFIG } from "@/constants/site-config";
import { SafeImage } from "../ui/SafeImage";
import { ensureAbsoluteUrl } from "@/services/api";
import { getPostAuthor, formatDate, decodeHtmlEntities } from "@/utils/text";

interface CategoryWithAdSectionProps {
    title: string;
    title2: string;
    posts: WordPressPost[];
    categorySlug: string;
}

export function CategoryWithAdSection({ title, title2, posts, categorySlug }: CategoryWithAdSectionProps) {
    if (!posts || posts.length === 0) return null;

    const categoryHref = categorySlug === 'radio' ? '/radio'
        : categorySlug === 'replays' ? '/replay'
            : `/news`;

    const getDisplayData = (item: any) => {
        if (item.title && typeof item.title === 'object' && item.title.rendered) {
            return {
                id: String(item.id),
                title: decodeHtmlEntities(item.title.rendered),
                image: ensureAbsoluteUrl(item.acan_image_url || item._embedded?.['wp:featuredmedia']?.[0]?.source_url) || SITE_CONFIG.theme.placeholders.news,
                link: `/news?slug=${item.slug || item.id}`,
                date: item.date,
                author: getPostAuthor(item),
            };
        }
        return {
            id: String(item.id || item.slug),
            title: decodeHtmlEntities(item.title?.rendered || item.title || ''),
            image: ensureAbsoluteUrl(item.acan_image_url || item.logo_url || item.logo) || SITE_CONFIG.theme.placeholders.news,
            link: `/news?slug=${item.slug || item.id}`,
            date: item.date,
            author: getPostAuthor(item),
        };
    };


    // Featured = posts[0], col1 sidebar = posts[1-3], col2 list = posts[4-20]
    const featured = getDisplayData(posts[0]);
    const col1Sidebar = posts.slice(1, 4).map(getDisplayData);
    const col2List = posts.slice(4, 20).map(getDisplayData);

    // ── ArticleInfo réutilisable ──
    const ArticleInfo = ({ date, author }: { date: string | null; author: string }) => (
        // Article Info Container: flex row, items-center, gap-[10px], h-[23px]
        <div className="flex flex-row items-center flex-shrink-0" style={{ gap: 10, height: 23 }}>
            {date && (
                <span className="b4 text-muted/80">
                    {formatDate(date)}
                </span>
            )}
            <div className="flex flex-row items-center" style={{ gap: 10 }}>
                {/* Green dot: 6×6px #118A39 */}
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#118A39]" />
                <span className="b4 text-muted font-medium">
                    {author}
                </span>
            </div>
        </div>
    );

    // ── ArticleRow: article thumbnail + content ──
    const ArticleRow = ({ item }: { item: ReturnType<typeof getDisplayData> }) => (
        <Link
            href={item.link}
            className="group flex flex-row items-start w-full gap-3 md:gap-4 md:h-[116px]"
        >
            <div className="relative flex-shrink-0 w-[100px] md:w-[116px] aspect-square overflow-hidden bg-white/5">
                <SafeImage
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100px, 116px"
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
            </div>

            <div className="flex flex-col flex-1 min-w-0 justify-between py-1 h-full">
                <p className="b2 font-medium text-sm md:text-base leading-snug line-clamp-3 text-foreground transition-colors group-hover:text-accent uppercase">
                    {item.title}
                </p>
                <ArticleInfo date={item.date} author={item.author} />
            </div>
        </Link>
    );

    return (
        <section className="flex flex-col items-start w-full gap-8 lg:gap-10">
            <AdBanner className="w-full pb-2 md:pb-4" />

            {/* ── COL GAUCHE ── */}
            <div className="flex flex-col w-full gap-10 lg:gap-[40px]">
                {/* Title Container */}
                <SectionTitle
                    title={title}
                    title2={title2}
                    actionHref={categoryHref}
                    actionIcon
                    className="font-bold"
                />

                {/* Main Content Layout */}
                <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-8 xl:gap-10">
                    {/* ── SUB-COL GAUCHE ── */}
                    <div className="flex flex-col items-center w-full lg:flex-1 gap-[30px] min-w-0">
                        {/* Article Container featured */}
                        <Link
                            href={featured.link}
                            className="group flex flex-col items-start w-full gap-[10px]"
                        >
                            <div className="relative w-full aspect-[469/246] overflow-hidden bg-white/5">
                                <SafeImage
                                    src={featured.image}
                                    alt={featured.title}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 469px"
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>

                            <div className="flex flex-col items-start w-full">
                                <p className="b2 font-medium text-base sm:text-lg leading-relaxed line-clamp-3 text-foreground mb-2 sm:min-h-[91px]">
                                    {featured.title}
                                </p>
                                <ArticleInfo date={featured.date} author={featured.author} />
                            </div>
                        </Link>

                        {/* Sidebar Articles col1 */}
                        <div className="flex flex-col justify-center items-center w-full gap-[25px]">
                            {col1Sidebar.map((item, idx) => (
                                <div key={item.id + '-' + idx} className="flex flex-col items-center w-full gap-[25px]">
                                    <div className="w-full h-px bg-border/40" />
                                    <ArticleRow item={item} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── SUB-COL DROITE ── */}
                    <div className="flex flex-col items-center w-full lg:w-[34%] xl:w-[31%] gap-[20px] min-w-0">
                        {col2List.map((item, idx) => (
                            <div key={item.id + '-' + idx} className="flex flex-col items-center w-full gap-[20px]">
                                <ArticleRow item={item} />
                                {idx < col2List.length - 1 && (
                                    <div className="w-full h-px bg-border/40" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}