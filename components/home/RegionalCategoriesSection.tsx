import { WordPressCategoryColumn } from "./WordPressCategoryColumn";
import { useTranslations } from "next-intl";

interface RegionalCategoriesSectionProps {
    radioItems: any[];
    replayItems: any[];
}

export function RegionalCategoriesSection({
    radioItems,
    replayItems,
}: RegionalCategoriesSectionProps) {
    const t = useTranslations("pages.home");

    return (
        // Section: flex row, gap-[50px], w-full
        // (pattern Frame 427318772: flex row, items-start, gap-[50px])
        <section
            className="flex flex-col lg:flex-row items-start w-full gap-8 lg:gap-[50px]"
        >
            {/* Colonne Audio/Radio: flex col, gap-[20px], flex-1 */}
            <div className="flex-1 min-w-0">
                <WordPressCategoryColumn
                    title={t("journalsRadio")}
                    title2=""
                    items={radioItems}
                    categorySlug="audio"
                    type="audio"
                    figmaLayout
                />
            </div>

            {/* Colonne TV: flex col, gap-[20px], flex-1 */}
            <div className="flex-1 min-w-0">
                <WordPressCategoryColumn
                    title={t("journalsTV")}
                    title2=""
                    items={replayItems}
                    categorySlug="replays"
                    type="tv"
                    figmaLayout
                />
            </div>
        </section>
    );
}