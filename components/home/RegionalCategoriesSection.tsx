import { WordPressPost } from "../../types/api";
import { WordPressCategoryColumn } from "./WordPressCategoryColumn";

interface RegionalCategoriesSectionProps {
    regionalPosts: WordPressPost[];
    matamPosts: WordPressPost[];
    agriculturePosts: WordPressPost[];
}

import { useTranslations } from "next-intl";

export function RegionalCategoriesSection({
    regionalPosts,
    matamPosts,
    agriculturePosts,
}: RegionalCategoriesSectionProps) {
    const t = useTranslations("pages.home");

    return (
        <section className="py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <WordPressCategoryColumn
                    title={t("regionalNewsSuffix")}
                    title2=''
                    items={regionalPosts}
                    categorySlug="actualites-regionale"
                />
                <WordPressCategoryColumn
                    title={t("matam")}
                    title2=''
                    items={matamPosts}
                    categorySlug="actu-matam"
                />
                <WordPressCategoryColumn
                    title={t("agriculture")}
                    title2=''
                    items={agriculturePosts}
                    categorySlug="agriculture"
                />
            </div>
        </section>
    );
}
