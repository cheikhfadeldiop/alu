import Link from "next/link";
import { SectionTitle } from "../ui/SectionTitle";
import { Carousel } from "../ui/Carousel";
import { SliderVideoItem } from "../../types/api";
import { SafeImage } from "../ui/SafeImage";

interface ShortsCarouselProps {
    videos: SliderVideoItem[];
    title: string;
    title2: string;
    actionLabel: string;
}

export function ShortsCarousel({ videos, title, title2, actionLabel }: ShortsCarouselProps) {
    return (
        <section className="space-y-4">
            <SectionTitle title={title} title2={title2} actionLabel={actionLabel} actionHref="/replay" />
            <Carousel itemClassName="w-[250px]" >
                {videos.map((video, index) => (
                    <Link key={index} href={`/playback/${video.slug}`} className="group block">
                        <div className="relative w-[250px] h-[298px] overflow-hidden bg-gray-200 mb-2
                        hover:scale-[1.02] transition-all ">
                            <SafeImage
                                src={video.logo_url || video.logo}
                                alt={video.title}
                                fill
                                sizes="250px"
                                className="object-cover"
                            />
                            {/* Play Icon - Bottom Left Corner */}
                            <div className="absolute bottom-3 left-3">
                                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                    <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                    </svg>
                                </div>
                            </div>
                            {/* Date Badge - Top */}
                            <div className="absolute top-3 left-3 right-3">
                                <div className="bg-black/70 rounded px-2 py-1">
                                    <p className="text-white text-[10px] font-semibold">News of {video.date}</p>
                                </div>
                            </div>
                        </div>
                        <h3 className="font-semibold text-xs line-clamp-2 group-hover:underline mb-1">
                            {video.title}
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] text-[color:var(--muted)]">
                            <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                {video.time}
                            </span>
                            <span>• {video.date}</span>
                        </div>
                    </Link>
                ))}
            </Carousel>
        </section>
    );
}
