import { useState, useMemo, useRef, useEffect } from "react";
import { WordPressCategory } from "../../types/api";
import { decodeHtmlEntities } from "../../utils/text";
import { SITE_CONFIG } from "@/constants/site-config";
import { TabsShimmer } from "../ui/shimmer/CommonShimmers";
import { useWordPressCategories } from "@/hooks/useData";

interface NewsTabsProps {
    onFilterChange: (categoryIds: string, categoryName: string) => void;
}

const VIRTUAL_PARENTS = SITE_CONFIG.categories.news.groups;

interface VirtualParent {
    id: string;
    name: string;
    matchIds: number[];
    keywords: string[];
}

export function NewsTabs({ onFilterChange }: NewsTabsProps) {
    const [activeGroupId, setActiveGroupId] = useState<string>(VIRTUAL_PARENTS[0].id);
    const [activeSubId, setActiveSubId] = useState<number | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const getGroupForCategory = (category: WordPressCategory): string => {
        const slug = (category.slug || "").toLowerCase();
        const name = (category.name || "").toLowerCase();
        for (const group of VIRTUAL_PARENTS) {
            if (group.matchIds.includes(category.id) || group.matchIds.includes(category.parent)) {
                return group.id;
            }
        }
        for (const group of VIRTUAL_PARENTS) {
            if (group.keywords.some(k => slug.includes(k) || name.includes(k))) {
                return group.id;
            }
        }
        return "a-la-une";
    };

    const { data: rawCategories = [], isLoading } = useWordPressCategories();

    const categories = useMemo(() => {
        return rawCategories.filter(c =>
            c.count > 0 && c._links && c._links["wp:post_type"]
        );
    }, [rawCategories]);

    useEffect(() => {
        if (categories.length > 0 && activeGroupId === VIRTUAL_PARENTS[0].id && !activeSubId) {
            const firstGroup = VIRTUAL_PARENTS[0];
            const members = categories.filter(c => getGroupForCategory(c) === firstGroup.id);
            if (members.length > 0) {
                setActiveSubId(members[0].id);
            }
        }
    }, [categories, activeGroupId, activeSubId]);

    const currentSubCategories = useMemo(() => {
        return categories.filter(c => getGroupForCategory(c) === activeGroupId);
    }, [categories, activeGroupId]);

    const handleGroupClick = (group: VirtualParent) => {
        setActiveGroupId(group.id);
        const members = categories.filter(c => getGroupForCategory(c) === group.id);
        if (members.length > 0) {
            setActiveSubId(members[0].id);
            onFilterChange(`${members[0].id}`, members[0].name);
        } else {
            setActiveSubId(null);
            onFilterChange(`${group.matchIds.join(",")}`, group.name);
        }
        if (scrollRef.current) scrollRef.current.scrollLeft = 0;
    };

    const handleSubClick = (subId: number) => {
        const sub = categories.find(c => c.id === subId);
        setActiveSubId(subId);
        onFilterChange(`${subId}`, sub?.name || "");
    };

    if (isLoading && categories.length === 0) return <TabsShimmer />;

    return (
        // Container: flex col, justify-center, items-start, padding: 10px, gap-[10px]
        // w-full, bg: #FFFFFF, border-radius: 10px
        <div
            className="flex flex-col justify-center items-start lg:items-center w-full max-w-[1440px] mx-auto min-h-[100px] sm:min-h-[151px] p-[10px_0] sm:p-[10px]"
            style={{ gap: 10, borderRadius: 10 }}
        >
            {/* Frame 427318788: flex col, items-start, padding: 0 15px, gap: 1px */}
            <div
                className="flex flex-col items-start w-full"
                style={{ padding: "0 15px", gap: 1 }}
            >
                <div
                    className="flex flex-row items-center justify-start overflow-x-auto no-scrollbar w-full gap-5 sm:gap-[70px]"
                    style={{ height: 43 }}
                >
                    {VIRTUAL_PARENTS.map((group) => {
                        const isActive = activeGroupId === group.id;
                        return (
                            <button
                                key={group.id}
                                onClick={() => handleGroupClick(group)}
                                className="flex flex-row justify-center items-center flex-shrink-0 transition-colors"
                                style={{
                                    height: 39,
                                    borderBottom: isActive
                                        ? "4px solid var(--success)"
                                        : "4px solid transparent",
                                    background: "none",
                                    outline: "none",
                                    cursor: "pointer",
                                }}
                            >
                                <span
                                    className="flex items-center font-inter whitespace-nowrap uppercase text-base sm:text-[22px]"
                                    style={{
                                        fontWeight: 700,
                                        lineHeight: "1.2",
                                        color: isActive ? "#333333" : "#606060",
                                    }}>
                                    {decodeHtmlEntities(group.name)}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div
                    ref={scrollRef}
                    className="flex flex-row items-center justify-start w-full overflow-x-auto no-scrollbar gap-2.5 sm:gap-[21px]"
                    style={{
                        height: 54,
                        borderTop: "1px solid var(--border)",
                    }}
                >
                    {currentSubCategories.map((tab, index) => {
                        const isActive = activeSubId === tab.id;
                        const isLast = index === currentSubCategories.length - 1;
                        return (
                            <div key={tab.id} className="flex flex-row items-center flex-shrink-0 gap-2.5 sm:gap-[21px]">
                                <button
                                    onClick={() => handleSubClick(tab.id)}
                                    className="flex flex-row justify-center items-center flex-shrink-0 transition-colors px-1 sm:px-2 w-auto min-w-[70px] sm:min-w-[110px]"
                                    style={{
                                        height: 28,
                                        background: "none",
                                        outline: "none",
                                        cursor: "pointer",
                                    }}
                                >
                                    <span
                                        className="b4 flex items-center justify-center text-center uppercase"
                                        style={{
                                            fontWeight: isActive ? 700 : 400,
                                            fontSize: 12,
                                            lineHeight: "18px",
                                            letterSpacing: "-0.165px",
                                            color: isActive ? "#F80000" : "#606060",
                                            height: 18,
                                        }}>
                                        {decodeHtmlEntities(tab.name)}
                                    </span>
                                </button>

                                {/* Diamant séparateur: 7×7px, #D2D2D2, rotate(-135deg) */}
                                {!isLast && (
                                    <div
                                        className="flex-shrink-0"
                                        style={{
                                            width: 7,
                                            height: 7,
                                            background: "#D2D2D2",
                                            transform: "rotate(-135deg)",
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })}

                    {/* "..." si trop de catégories */}
                    {currentSubCategories.length > 7 && (
                        // Frame 48096357: w-[56px], h-[28px]
                        <div
                            className="flex flex-row justify-center items-center flex-shrink-0"
                            style={{ width: 56, height: 28 }}
                        >
                            <span style={{
                                fontFamily: "DM Sans",
                                fontWeight: 400,
                                fontSize: 12,
                                lineHeight: "18px",
                                letterSpacing: "-0.165px",
                                textTransform: "uppercase",
                                textAlign: "center",
                                color: "#000000",
                                width: 56,
                                height: 18,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}>
                                ...
                            </span>
                        </div>
                    )}

                    {currentSubCategories.length === 0 && (
                        <span style={{
                            fontFamily: "DM Sans",
                            fontWeight: 400,
                            fontSize: 12,
                            color: "#606060",
                        }}>
                            Aucune sous-catégorie
                        </span>
                    )}

                </div>
            </div>
        </div>
    );
}