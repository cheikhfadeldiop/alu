import { useState, useEffect, useMemo, useRef } from "react";
import { getWordPressCategories } from "../../services/api";
import { WordPressCategory } from "../../types/api";
import { decodeHtmlEntities } from "../../utils/text";
import { SITE_CONFIG } from "@/constants/site-config";
import { TabsShimmer } from "../ui/shimmer/CommonShimmers";

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
    const [categories, setCategories] = useState<WordPressCategory[]>([]);
    const [activeGroupId, setActiveGroupId] = useState<string>(VIRTUAL_PARENTS[0].id);
    const [activeSubId, setActiveSubId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);

    // Track scroll progress for the subtle indicator
    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const totalScroll = scrollWidth - clientWidth;
        if (totalScroll <= 0) {
            setScrollProgress(0);
            return;
        }
        setScrollProgress((scrollLeft / totalScroll) * 100);
    };

    // Helper to find which group a category belongs to
    const getGroupForCategory = (category: WordPressCategory): string => {
        const slug = (category.slug || "").toLowerCase();
        const name = (category.name || "").toLowerCase();

        // 1. Check explicit matchIds (ID or Parent ID)
        for (const group of VIRTUAL_PARENTS) {
            if (group.matchIds.includes(category.id) || group.matchIds.includes(category.parent)) {
                return group.id;
            }
        }

        // 2. Check keywords in slug or name
        for (const group of VIRTUAL_PARENTS) {
            if (group.keywords.some(k => slug.includes(k) || name.includes(k))) {
                return group.id;
            }
        }

        // 3. Fallback to "a-la-une"
        return "a-la-une";
    };

    useEffect(() => {
        const fetchAllCategories = async () => {
            try {
                const data = await getWordPressCategories();
                // 1. Filter out categories with zero posts (count: 0)
                // 2. Ensure they have post_type links as requested for validity
                const activeData = data.filter(c =>
                    c.count > 0 &&
                    c._links &&
                    c._links["wp:post_type"]
                );
                setCategories(activeData);

                // Initial Selection: A LA UNE
                const firstGroup = VIRTUAL_PARENTS[0];
                const members = activeData.filter(c => getGroupForCategory(c) === firstGroup.id);

                if (members.length > 0) {
                    const firstId = members[0].id;
                    const firstName = members[0].name;
                    setActiveSubId(firstId);
                    // Initial load: Only show the first specific subcategory for precision
                    onFilterChange(`${firstId}`, firstName);
                } else {
                    onFilterChange(`${firstGroup.matchIds.join(",")}`, firstGroup.name);
                }
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllCategories();
    }, []);

    const currentSubCategories = useMemo(() => {
        const group = VIRTUAL_PARENTS.find(g => g.id === activeGroupId);
        if (!group) return [];
        return categories.filter(c => getGroupForCategory(c) === activeGroupId);
    }, [categories, activeGroupId]);

    const handleGroupClick = (group: VirtualParent) => {
        setActiveGroupId(group.id);
        const members = categories.filter(c => getGroupForCategory(c) === group.id);

        if (members.length > 0) {
            const firstId = members[0].id;
            const firstName = members[0].name;
            setActiveSubId(firstId);
            // Pass ONLY the specific category ID to ensure different content per tab
            onFilterChange(`${firstId}`, firstName);
        } else {
            setActiveSubId(null);
            // Fallback to group roots if no subcategories exist
            onFilterChange(`${group.matchIds.join(",")}`, group.name);
        }

        // Reset scroll position and progress when group changes
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = 0;
            setScrollProgress(0);
        }
    };

    const handleSubClick = (subId: number) => {
        const sub = categories.find(c => c.id === subId);
        setActiveSubId(subId);
        // Pass ONLY the specific category ID for strict filtering
        onFilterChange(`${subId}`, sub?.name || "");
    };


    if (loading) return <TabsShimmer />;

    return (
        <div className="w-full space-y-4 py-6">
            {/* Row 1: Virtual Parent Groups */}
            <div className="flex border-b border-gray-100 dark:border-muted/20 pb-0 overflow-x-auto no-scrollbar">
                <div className="flex gap-8 min-w-max">
                    {VIRTUAL_PARENTS.map((group) => (
                        <button
                            key={group.id}
                            onClick={() => handleGroupClick(group)}
                            className={`pb-3 text-2xl font-bold transition-all relative uppercase ${activeGroupId === group.id
                                ? "text-foreground"
                                : "text-gray-400 hover:text-foreground/30"
                                }`}
                        >
                            {decodeHtmlEntities(group.name)}
                            {activeGroupId === group.id && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-[color:var(--success)] rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Row 2: Real WordPress Categories (Sub-tabs) with subtle scroll indicator */}
            <div className="relative group">
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex items-center gap-3 overflow-x-auto no-scrollbar py-3"
                >
                    <div className="flex items-center gap-3 min-w-max">
                        {currentSubCategories.map((tab, index) => (
                            <div key={tab.id} className="flex items-center">
                                <button
                                    onClick={() => handleSubClick(tab.id)}
                                    className={`text-[13px] font-bold tracking-wider transition-colors uppercase ${activeSubId === tab.id
                                        ? "text-[color:var(--accent)]"
                                        : "text-gray-500 hover:text-foreground"
                                        }`}
                                >
                                    {decodeHtmlEntities(tab.name)}
                                </button>
                                {index < currentSubCategories.length - 1 && (
                                    <span className="ml-3 text-[10px] text-gray-300">◆</span>
                                )}
                            </div>
                        ))}
                        {currentSubCategories.length === 0 && (
                            <span className="text-[13px] font-bold text-gray-400 italic">
                                Aucune sous-catégorie
                            </span>
                        )}
                    </div>
                </div>

                {/* Subtle Red Scroll Indicator Bar */}
                {scrollRef.current && scrollRef.current.scrollWidth > scrollRef.current.clientWidth && (
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gray-100 dark:bg-muted/10 overflow-hidden">
                        <div
                            className="h-full bg-[color:var(--accent)]/60 transition-all duration-150 ease-out rounded-full"
                            style={{
                                width: `${(scrollRef.current.clientWidth / scrollRef.current.scrollWidth) * 100}%`,
                                transform: `translateX(${(scrollProgress * (scrollRef.current.clientWidth - (scrollRef.current.clientWidth / scrollRef.current.scrollWidth) * scrollRef.current.clientWidth)) / 100}px)`
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
