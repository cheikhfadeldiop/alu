"use client";

import * as React from "react";
import Image from "next/image";
import { Link } from "../../i18n/navigation";
import { SliderVideoItem } from "../../types/api";
import { SectionTitle } from "../ui/SectionTitle";
import { useReplayFetcher } from "../../hooks/useReplayFetcher";
import { useTranslations } from "next-intl";
import { SafeImage } from "../ui/SafeImage";
import { getPostAuthor, formatDate } from "@/utils/text";

interface MissedAiringSectionProps {
    initialVideos: SliderVideoItem[];
    liveChannels?: import("../../types/api").LiveChannel[];
}

interface Block {
    type: "A" | "B";
    videos: SliderVideoItem[];
}

export function MissedAiringSection({ initialVideos, liveChannels = [] }: MissedAiringSectionProps) {
    const t = useTranslations("common");
    const [blocks, setBlocks] = React.useState<Block[]>([]);
    const { replays, loading, hasMore, loadMore: fetchMoreFromChannels } = useReplayFetcher(initialVideos, liveChannels, 3);
    const [shownCount, setShownCount] = React.useState(0);

    React.useEffect(() => {
        if (shownCount === 0 && replays.length > 0) {
            const firstBatch = replays.slice(0, 7);
            if (firstBatch.length > 0) {
                setBlocks([{ type: "A", videos: firstBatch }]);
                setShownCount(firstBatch.length);
            }
        }
    }, [replays, shownCount]);

    const [isExpanding, setIsExpanding] = React.useState(false);

    React.useEffect(() => {
        if (isExpanding) {
            const remaining = replays.length - shownCount;
            if (remaining >= 7) {
                const nextBatch = replays.slice(shownCount, shownCount + 7);
                const types: ("A" | "B")[] = ["A", "B"];
                const randomType = types[Math.floor(Math.random() * types.length)];
                setBlocks(prev => [...prev, { type: randomType, videos: nextBatch }]);
                setShownCount(prev => prev + 7);
                setIsExpanding(false);
            } else {
                setIsExpanding(false);
            }
        }
    }, [replays, shownCount, isExpanding]);

    const onTriggerLoadMore = async () => {
        setIsExpanding(true);
        if (replays.length - shownCount < 7 && hasMore) {
            await fetchMoreFromChannels();
        }
    };

    if (blocks.length === 0) return null;

    return (
        <section className="w-full mx-auto px-4">
            {/* SectionTitle untouched — as instructed */}
            <SectionTitle title={t("missed") + "  " + t("onAir")} title2="" actionIcon={true} className="font-bold" />

            <div className="space-y-16 pt-8">
                {blocks.map((block, blockIdx) => (
                    <div key={blockIdx} className="space-y-8">
                        {/* ── Row 1: BigCard + 2 SmallCards (Figma: 699px + 340px + 340px) ── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] gap-5">
                            {block.type === "A" ? (
                                <>
                                    {block.videos[0] && <BigCard video={block.videos[0]} />}
                                    {block.videos[1] && <SmallCard video={block.videos[1]} />}
                                    {block.videos[2] && <SmallCard video={block.videos[2]} />}
                                </>
                            ) : (
                                <>
                                    {block.videos[1] && <SmallCard video={block.videos[1]} />}
                                    {block.videos[2] && <SmallCard video={block.videos[2]} />}
                                    {block.videos[0] && <BigCard video={block.videos[0]} />}
                                </>
                            )}
                        </div>

                        {/* ── Row 2: 4 SmallCards (Figma: 4 × 340px) ── */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                            {block.videos.slice(3, 7).map((video, idx) => (
                                <SmallCard key={idx} video={video} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {(replays.length > shownCount || hasMore) && (
                <div className="flex justify-center pt-16">
                    <button
                        onClick={onTriggerLoadMore}
                        disabled={loading}
                        className="group relative flex items-center gap-1 px-10 py-2 rounded-full border border-gray-200 dark:border-white/10 hover:border-red-600 transition-all duration-300 bg-background/30 backdrop-blur-md shadow-sm hover:shadow-md disabled:opacity-50"
                    >
                        <span className="text-sm font-bold uppercase tracking-[0.2em]">
                            {loading ? t("loading") : t("loadMore")}
                        </span>
                    </button>
                </div>
            )}
        </section>
    );
}

/* ══════════════════════════════════════════════════
   BigCard — Figma: 699×393, gradient bottom, play-circle-02 + title + meta
══════════════════════════════════════════════════ */
function BigCard({ video }: { video: SliderVideoItem }) {
    return (
        <Link
            href={`/replay/${video.slug || (video as any).id}`}
            className="group relative block overflow-hidden rounded-sm hover:scale-[1.02] transition-transform duration-300 hover:z-10"
            style={{ aspectRatio: "699/393" }}
        >
            {/* Thumbnail */}
            <SafeImage
                src={video.logo_url || video.logo}
                alt={video.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
            />

            {/* Figma gradient: transparent → black/90 */}
            <div
                className="absolute inset-0"
                style={{
                    background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.9) 100%)",
                }}
            />

            {/* Bottom content block (Figma: padding 20px, gap 10px) */}
            <div className="absolute inset-0 flex flex-col justify-end p-5">
                {/* play-circle-02 + text row */}
                <div className="flex items-start gap-3">
                    {/* play-circle-02 icon (Figma: 56×56, circle border + play triangle) */}
                    <div className="shrink-0" style={{ width: 48, height: 48 }}>
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                            <circle cx="24" cy="24" r="20" stroke="#D2D2D2" strokeWidth="1.5" />
                            <path
                                d="M20 17.5L32 24L20 30.5V17.5Z"
                                fill="#D2D2D2"
                            />
                        </svg>
                    </div>

                    {/* Title + meta */}
                    <div className="flex flex-col gap-2 min-w-0">
                        {/* Title (Figma: Inter 500 18px, color #D2D2D2) */}
                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-tighter">
                            {getPostAuthor(video)}
                        </span>
                        <h3
                            className="line-clamp-2 leading-snug"
                            style={{
                                fontFamily: "Inter, sans-serif",
                                fontWeight: 500,
                                fontSize: 18,
                                color: "#D2D2D2",
                            }}
                        >
                            {video.title}
                        </h3>

                        {/* Meta row (Figma: duration icon + duration text + dot + date) */}
                        <MetaRow
                            time={video.time}
                            date={video.date}
                            color="rgba(210, 210, 210, 1)"
                            dotColor="#D2D2D2"
                        />
                    </div>
                </div>
            </div>
        </Link>
    );
}

/* ══════════════════════════════════════════════════
   SmallCard — Figma: 340×325 (190px image + 126px text block)
══════════════════════════════════════════════════ */
function SmallCard({ video }: { video: SliderVideoItem }) {
    return (
        <Link
            href={`/replay/${video.slug || (video as any).id}`}
            className="group block hover:scale-[1.02] transition-transform duration-300 hover:z-10"
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
        >
            {/* Image block — Figma: 338×190, gradient, play-circle-02 bottom-left */}
            <div className="relative overflow-hidden rounded-sm" style={{ aspectRatio: "338/190" }}>
                <SafeImage
                    src={video.logo_url || video.logo}
                    alt={video.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 25vw"
                />

                {/* Figma gradient: transparent 50% → black/90 */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.9) 100%)",
                    }}
                />

                {/* play-circle-02 bottom-left (Figma: ~48×48, left:10 top:127–133) */}
                <div className="absolute bottom-2 left-2.5">
                    <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
                        <circle cx="24" cy="24" r="20" stroke="#BBBBBB" strokeWidth="1.5" />
                        <path d="M20 17.5L32 24L20 30.5V17.5Z" fill="#BBBBBB" />
                    </svg>
                </div>
            </div>

            {/* Text block (Figma: 320×126, gap 10) */}
            <div
                className="flex flex-col justify-center"
                style={{ gap: 10, paddingLeft: 0 }}
            >
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-tighter">
                    {getPostAuthor(video)}
                </span>
                {/* Title (Figma: Inter 500 18px, #D2D2D2, 3-line clamp at ~79px) */}
                <h4
                    className="line-clamp-3 leading-snug"
                    style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 500,
                        fontSize: 15,
                        //color: "#c54d4dff",
                    }}
                >
                    {video.title}
                </h4>

                {/* Meta row (Figma: duration + dot + date, color #777) */}
                <MetaRow
                    time={video.time}
                    date={video.date}
                    color="#777777"
                    dotColor="#777777ff"
                />
            </div>
        </Link>
    );
}

/* ══════════════════════════════════════════════════
   MetaRow — clock icon + duration + dot + date
   (Figma: carbon:time 16×16 + Inter 400 12px)
══════════════════════════════════════════════════ */
function MetaRow({
    time,
    date,
    color,
    dotColor,
}: {
    time?: string;
    date?: string;
    color: string;
    dotColor: string;
}) {
    return (
        <div className="flex items-center  w-full" style={{ gap: 19 }}>
            {/* Duration container (Figma: padding 10px 10px 10px 0, gap 10, border-radius 50px) */}
            <div className="flex items-center" style={{ gap: 10, paddingRight: 10 }}>
                {/* carbon:time icon */}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke={color} strokeWidth="1.2" />
                    <path d="M8 4.5V8L10.5 9.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                {/* Duration text */}
                <span
                    style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 400,
                        fontSize: 12,
                        color,
                        whiteSpace: "nowrap",
                    }}
                >
                    {time || "2min 27s"}
                </span>
            </div>
            {/*cercle grey*/}
            <div className="w-2 h-2 rounded-full bg-muted/30"></div>
            

            {/* Date */}
            <span
                style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 400,
                    fontSize: 12,
                    color,
                    whiteSpace: "nowrap",
                }}
            >
                {formatDate(date)}
            </span>
        </div>
    );
}