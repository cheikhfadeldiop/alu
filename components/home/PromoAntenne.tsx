import React from "react";
import { Link } from "../../i18n/navigation";
import { FullEPGProgram } from "../../types/api";
import { SectionTitle } from "../ui/SectionTitle";
import { SafeImage } from "../ui/SafeImage";

interface PromoAntenneProps {
    programs: FullEPGProgram[];
    title?: string;
    showMetadata?: boolean;
}

export function PromoAntenne({ programs, title, showMetadata = true }: PromoAntenneProps) {
    // Take only 4 programs as shown in the photo
    const displayPrograms = programs.slice(0, 4);
    const todayDate = new Date().toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <section className="w-full space-y-6">
            <div className="flex items-center justify-between">
                <SectionTitle
                    title={title || "CAPSULES VIDEOS CRTVWEB"}
                    actionLabel="VOIR PLUS"
                    actionHref="/replay"
                    className="font-bold whitespace-nowrap"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {displayPrograms.map((program, index) => (
                    <Link key={index} href={`/replay/${program.slug}`} className="group cursor-pointer space-y-4  group block space-y-4 hover:scale-105 transition-transform">
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
                                <div className="absolute bottom-3 left-3 z-20 w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center  transition-all duration-300">
                                    <svg className="w-3.5 h-3.5 text-white fill-current translate-x-0.5" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Text Content */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="line-clamp-1 text-[13px] font-bold text-foreground/90 group-hover:text-red-500 transition-colors">
                                    {program.title}
                                </h3>


                                <h4 className="line-clamp-1 text-[13px] font-bold text-foreground/90 group-hover:text-red-500 opacity-80 uppercase transition-colors">
                                    {program.description + " " + program.startTime || `${program.startTime} - ${program.endTime}`}
                                </h4>


                            </div>

                            {/* Metadata Row: Clock Icon | Time Range • Date - Conditional */}
                            {showMetadata && (
                                <div className="flex items-center gap-3 text-[10px] text-foreground/40 font-semibold tracking-tight uppercase">
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{program.startTime} - {program.endTime}</span>
                                    </div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-foreground/20"></div>
                                    <span>{todayDate}</span>
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
