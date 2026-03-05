import React from "react";
import { Link } from "../../i18n/navigation";
import { FullEPGProgram } from "../../types/api";
import { SectionTitle } from "../ui/SectionTitle";
import { SafeImage } from "../ui/SafeImage";
import { getProgramCategory, formatDate } from "@/utils/text";

interface PromoAntenneProps {
    programs: FullEPGProgram[];
    title?: string;
    showMetadata?: boolean;
}

export function PromoAntenne({ programs, title, showMetadata = true }: PromoAntenneProps) {
    // Take only 4 programs as shown in the photo
    const displayPrograms = programs.slice(0, 4);
    const todayDate = formatDate(new Date());

    return (
        <section className="w-full space-y-l">
            <div className="flex items-center justify-between">
                <SectionTitle
                    title={title || "CAPSULES VIDEOS CRTVWEB"}
                    //    actionLabel="VOIR PLUS"
                    actionHref="/replay"
                    className="font-bold whitespace-nowrap"
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-m sm:gap-l">
                {displayPrograms.map((program, index) => (
                    <Link key={index} href={`/replay/${program.slug || (program as any).id || index}`} className="group cursor-pointer space-y-4  group block space-y-4 hover:scale-105 transition-transform">
                        {/* Image Container with Play Overlay */}
                        <div className="relative aspect-video overflow-hidden rounded-sm group-hover:shadow-2xl transition-all duration-300">
                            <SafeImage
                                src={program.logo || "/assets/placeholders/live_tv_frame.png"}
                                alt={program.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />

                            {/* Play Icon - Bottom Left - Conditional */}
                            {showMetadata && (
                                <div className="absolute bottom-3 left-3 z-20  flex items-center justify-center  transition-all duration-300">
                                   <SafeImage
                                    src="/assets/placeholders/play_overlay.png"
                                    alt="Play"
                                    width={34}
                                    height={34}
                                />
                                </div>
                            )}
                        </div>

                        {/* Text Content */}
                        <div className="space-y-xs lg:space-y-m">
                            <div className="space-y-xxs">
                                <h3 className="line-clamp-1 b4 font-bold text-foreground/90 transition-colors">
                                    {program.title}
                                </h3>
                                <h4 className="line-clamp-1 b5 font-bold text-foreground/90  opacity-80 uppercase transition-colors">
                                    {program.description || `${program.startTime} - ${program.endTime}`}
                                </h4>
                            </div>

                            {/* Metadata Row: Clock Icon | Time Range • Date - Conditional */}
                            {showMetadata && (
                                <div className="flex flex-wrap items-center justify-between w-full gap-xs lg:gap-m b5 text-muted font-bold tracking-tight uppercase">
                                    <div className="flex items-center gap-1">
                                        <svg className="w-3 h-3 lg:w-3.5 lg:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="">{program.startTime}</span>
                                    </div>
                                    <span className="hidden lg:block opacity-60">{todayDate}</span>
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
