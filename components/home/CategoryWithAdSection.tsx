import { WordPressPost } from "../../types/api";
import { WordPressCategoryColumn } from "./WordPressCategoryColumn";
import { AdBanner } from "../ui/AdBanner";
import { AdBannerV } from "../ui/AdBannerV";

interface CategoryWithAdSectionProps {
    title: string;
    title2: string;
    posts: WordPressPost[];
    categorySlug: string;
}

export function CategoryWithAdSection({ title, title2, posts, categorySlug }: CategoryWithAdSectionProps) {
    if (!posts || posts.length === 0) return null;

    // Split posts: first 4 for col 1, next 4 for col 2
    const col1Posts = posts.slice(0, 4);
    const col2Posts = posts.slice(4, 20);

    return (
        <section className="py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {/* Column 1: Actu RTS 1 Part 1 */}
                <WordPressCategoryColumn
                    title={title}
                    title2={title2}
                    items={col1Posts}
                    categorySlug={categorySlug}
                />

                {/* Part 2 */}
                <div className="pt-0 md:pt-5 lg:pt-5">
                    <WordPressCategoryColumn
                        title={''}
                        title2={''}
                        items={col2Posts}
                        categorySlug={''}
                        enter={true}
                    />
                </div>

                {/* Column 3: Advertising */}
                <div className="flex flex-col items-center justify-start lg:block">
                    <div className="sticky top-24">
                        <AdBannerV />
                    </div>
                </div>
            </div>
        </section>

    );
}
