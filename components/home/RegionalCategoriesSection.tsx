import { WordPressPost } from "../../types/api";
import { WordPressCategoryColumn } from "./WordPressCategoryColumn";

interface RegionalCategoriesSectionProps {
    regionalPosts: WordPressPost[];
    matamPosts: WordPressPost[];
    agriculturePosts: WordPressPost[];
}

export function RegionalCategoriesSection({
    regionalPosts,
    matamPosts,
    agriculturePosts,
}: RegionalCategoriesSectionProps) {
    return (
        <section className="py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <WordPressCategoryColumn
                    title="ACTU"
                    title2="RÉGIONALE"
                    items={regionalPosts}
                    categorySlug="actualites-regionale"
                />
                <WordPressCategoryColumn
                    title="ACTU"
                    title2="MATAM"
                    items={matamPosts}
                    categorySlug="actu-matam"
                />
                <WordPressCategoryColumn
                    title="ACTU"
                    title2="AGRICULTURE"
                    items={agriculturePosts}
                    categorySlug="agriculture"
                />
            </div>
        </section>
    );
}
