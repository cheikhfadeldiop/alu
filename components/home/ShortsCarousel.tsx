import { Link } from "@/i18n/navigation";
import { SectionTitle } from "../ui/SectionTitle";
import { Carousel } from "../ui/Carousel";
import { SliderVideoItem } from "../../types/api";
import { SafeImage } from "../ui/SafeImage";
import { formatDate } from "@/utils/text";

interface ShortsCarouselProps {
    videos: SliderVideoItem[];
    title: string;
    title2: string;
    actionLabel?: string;
}

export function ShortsCarousel({ videos, title, title2, actionLabel }: ShortsCarouselProps) {

    return (
        // Section: flex col, justify-center, items-center, gap-[30px], h-[482px]
        <section className="flex flex-col items-center w-full gap-8">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
                <SectionTitle
                    title={title}
                    title2={title2}
                    actionIcon
                    actionHref="/replay"
                    className="font-bold"
                />

                <Link
                    href="/replay"
                    className="flex flex-row justify-center items-center flex-shrink-0 border-b border-[#8E8E8E] px-0 h-[37px]"
                >
                    <span className="b2 font-normal text-xs leading-[24px] uppercase text-[#777777]">
                        VOIR PLUS
                    </span>
                </Link>
            </div>

            {/* CONTENT CONTAINER */}
            <div className="w-full">
                <Carousel itemClassName="flex-shrink-0" showArrows={false}>
                    {videos.map((video, index) => (
                        <Link
                            key={index}
                            href={`/replay/${video.slug || video.id}`}
                            className="group flex flex-col items-center flex-shrink-0 w-[200px] sm:w-[260px] gap-3"
                        >
                            <div
                                className="relative flex flex-row items-end flex-shrink-0 overflow-hidden w-full aspect-[250/298] transition-transform duration-500 rounded-lg"
                                style={{
                                    backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%), url(${video.logo_url || video.logo})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                }}
                            >
                                <div className="absolute bottom-4  left-4 flex justify-center">
                                    <div className="relative w-10 h-10  sm:w-[49px] sm:h-[49px] flex-shrink-0 group-hover:scale-110 transition-transform z-10">
                                        <SafeImage
                                            src="/assets/placeholders/play_overlay.png"
                                            alt="Play"
                                            fill
                                            sizes="49px"
                                            className="object-contain"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col justify-center items-start w-full px-2 gap-2 min-h-[80px]">
                                <p className="b2 font-medium text-xs sm:text-base leading-snug line-clamp-2 text-foreground">
                                    {video.title}
                                </p>

                                <div className="flex flex-row items-center justify-between w-full gap-2">
                                    <div className="flex flex-row items-center gap-1.5 rounded-full">
                                        <svg className="w-3.5 h-3.5 text-muted flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                        </svg>
                                        <span className="b4 font-normal text-[10px] sm:text-xs text-foreground flex-shrink-0 line-clamp-1">
                                            {video.time}
                                        </span>
                                    </div>

                                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-border/40" />

                                    {video.date && (
                                        <span className="b4 font-normal text-[10px] sm:text-xs text-foreground flex-shrink-0 line-clamp-1">
                                            {formatDate(video.date)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </Carousel>
            </div>
        </section>
    );
}