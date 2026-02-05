import Link from "next/link";
import Image from "next/image";
import { SectionTitle } from "../ui/SectionTitle";
import { LiveChannel, EPGItem } from "../../types/api";

interface LiveChannelsGridProps {
    channels: LiveChannel[];
    epgItems: EPGItem[];
    title: string;
    actionLabel: string;
}

export function LiveChannelsGrid({ channels, epgItems, title, actionLabel }: LiveChannelsGridProps) {
    return (
        <section className="space-y-4">
            <SectionTitle title={title} actionLabel={actionLabel} actionHref="/live" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {channels.slice(0, 3).map((channel) => {
                    // Get current program for this channel from EPG
                    const currentProgram = epgItems.find(
                        (epg) => epg.channel_id === channel.id && epg.is_current
                    );

                    // Calculate progress percentage
                    let progressPercentage = 0;
                    if (currentProgram && currentProgram.start_time && currentProgram.end_time) {
                        const now = new Date();
                        const [startHour, startMinute] = currentProgram.start_time.split(":").map(Number);
                        const [endHour, endMinute] = currentProgram.end_time.split(":").map(Number);

                        const startDate = new Date();
                        startDate.setHours(startHour, startMinute, 0, 0);

                        const endDate = new Date();
                        endDate.setHours(endHour, endMinute, 0, 0);

                        // Handle overnight programs
                        if (endDate < startDate) {
                            endDate.setDate(endDate.getDate() + 1);
                        }

                        const totalDuration = endDate.getTime() - startDate.getTime();
                        const elapsed = now.getTime() - startDate.getTime();

                        if (totalDuration > 0) {
                            progressPercentage = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
                        }
                    }

                    return (
                        <Link
                            key={channel.id}
                            href={`/live/${channel.id}`}
                            className="group relative block overflow-hidden rounded-lg bg-black"
                        >
                            <div className="relative aspect-video w-full">
                                {/* Background Image */}
                                <Image
                                    src={channel.logo_url || channel.logo || "/assets/placeholders/live_tv_frame.png"}
                                    alt={channel.title}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="object-cover opacity-60"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

                                {/* Direct Badge - Top Right */}
                                <div className="absolute top-3 right-3">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-black text-xs font-bold shadow-lg">
                                        <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                                        Direct
                                    </span>
                                </div>

                                {/* Channel Logo - Bottom Right */}
                                <div className="absolute bottom-3 right-3">
                                    <div className="w-20 h-12 rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 p-1">
                                        <Image
                                            src={channel.logo_url || channel.logo}
                                            alt={channel.title}
                                            width={64}
                                            height={64}
                                            className="object-contain w-full h-full"
                                        />
                                    </div>
                                </div>

                                {/* Channel Info - Bottom Left */}
                                <div className="absolute bottom-0 left-0 right-20 p-4">
                                    <h3 className="text-white font-bold text-sm mb-1 group-hover:underline line-clamp-1">
                                        {currentProgram?.program_title || channel.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-white/70 text-xs">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            En cours
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {currentProgram?.start_time || "Now"}
                                        </span>
                                    </div>
                                </div>

                                {/* Red Progress Bar - Bottom */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                                    <div
                                        className="h-full bg-red-600 transition-all duration-300"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
