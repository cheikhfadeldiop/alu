import Link from "next/link";
import Image from "next/image";
import { SectionTitle } from "../ui/SectionTitle";
import { LiveChannel, EPGItem } from "../../types/api";

interface LiveChannelsGridProps {
    channels: LiveChannel[];
    epgItems: EPGItem[];
    title: string;
    title2: string;
    actionLabel: string;
}

export function LiveChannelsGrid({ channels, epgItems, title, title2, actionLabel }: LiveChannelsGridProps) {
    return (
        <section className="space-y-6 ">
            <SectionTitle title={title} title2={title2} actionLabel={actionLabel} actionHref="/live" />
            <div className="flex gap-4">
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
                        const startDate = new Date(); startDate.setHours(startHour, startMinute, 0, 0);
                        const endDate = new Date(); endDate.setHours(endHour, endMinute, 0, 0);
                        if (endDate < startDate) endDate.setDate(endDate.getDate() + 1);
                        const totalDuration = endDate.getTime() - startDate.getTime();
                        const elapsed = now.getTime() - startDate.getTime();
                        if (totalDuration > 0) {
                            progressPercentage = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
                        }
                    } else {
                        // Random progress for demo/fallback (deterministic per channel)
                        // FIX: Safe access to channel.id to prevent crash if undefined
                        const safeId = channel.id ? String(channel.id) : "unknown";
                        const seed = safeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                        progressPercentage = 15 + (seed % 75);
                    }


                    return (
                        <Link
                            key={channel.id}
                            href={`/live?channel=${channel.id}`}
                            className="group relative flex flex-col w-[280px] sm:w-[300px] h-[220px] 
                                overflow-hidden rounded-xl 
                                bg-background/30 backdrop-blur-sm text-left transition-all duration-300 
                               "
                        >
                            <div className="relative h-[65%] w-full">
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
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-grey/90 backdrop-blur-sm text-white text-xs font-bold shadow-lg">
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
                                <div className="absolute bottom-3 left-3">
                                    <div className="w-8 h-8 relative drop-shadow-lg">
                                        <Image
                                            src="/assets/placeholders/live_tv_frame.png"
                                            alt="Live TV"
                                            width={32}
                                            height={32}
                                            className="object-contain w-full h-full"
                                        />
                                    </div>
                                </div>

                            </div>
                            <div className="h-[35%] w-full  backdrop-blur-sm px-3 py-2 flex flex-col justify-between">
                                {/* First Line: Title + Progress Bar */}
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-sm line-clamp-1 flex-shrink min-w-0">
                                        {channel.title}
                                    </h3>
                                    {/* Progress Bar next to title */}
                                    <div className="flex-1 h-1.5 bg-surface-2 rounded-full overflow-hidden min-w-[40px]">
                                        <div
                                            className="h-full bg-red-600 rounded-full transition-all"
                                            style={{ width: `${progressPercentage}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Second Line: Date/Time with Icons */}
                                <div className="flex items-center gap-2 text-[10px] dark:text-gray-400  ">
                                    {/* Calendar Icon */}
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-gray-500 text-sm">{currentProgram?.start_time ?? new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    <span className="text-gray-400 dark:text-white/90  text-xs">-</span>
                                    {/* Clock Icon */}
                                    <svg className="w-5 h-5 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-gray-500 text-sm">{currentProgram?.end_time || new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
