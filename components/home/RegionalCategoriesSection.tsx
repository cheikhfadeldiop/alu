import { WordPressCategoryColumn } from "./WordPressCategoryColumn";

interface RegionalCategoriesSectionProps {
    radioItems: any[];
    replayItems: any[];
}

import { useTranslations } from "next-intl";

export function RegionalCategoriesSection({
    radioItems,
    replayItems,
}: RegionalCategoriesSectionProps) {
    const t = useTranslations("pages.home");

    return (
        <section className="py-2 md:py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <WordPressCategoryColumn
                    title={t("journalsRadio")}
                    title2=''
                    items={radioItems}
                    categorySlug="radio"
                    type="radio"
                />
                <WordPressCategoryColumn
                    title={t("journalsTV")}
                    title2=''
                    items={replayItems}
                    categorySlug="replays"
                    type="tv"
                />
            </div>
        </section>
    );
}
