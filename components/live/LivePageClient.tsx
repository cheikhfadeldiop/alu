"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { LiveChannel, EPGItem, FullEPGChannel, AODItem } from "../../types/api";
import { SafeImage } from "../ui/SafeImage";
import { AdBannerH, AdBannerHD } from "../ui/AdBanner";
import { LivePlayerSection } from "./LivePlayerSection";

interface LivePageClientProps {
    initialChannels: LiveChannel[];
    epgData: EPGItem[];
    fullEpg: FullEPGChannel[];
    aodItems: AODItem[];
}

export function LivePageClient({ initialChannels, epgData, fullEpg, aodItems: _aodItems }: LivePageClientProps) {
    const searchParams = useSearchParams();
    const channelParam = searchParams.get('channel');

    const selectedChannel = useMemo(() => {
        if (channelParam) {
            const paramChannel = initialChannels.find(c => c.slug === channelParam || c.id === channelParam);
            if (paramChannel) return paramChannel;
        }
        return initialChannels.find(c => c.type === 'TV') || initialChannels[0];
    }, [channelParam, initialChannels]);

    const currentProgram = useMemo(() => {
        if (!selectedChannel) return undefined;
        return epgData.find((item) => item.channel_id === selectedChannel.id && item.is_current) || epgData[0];
    }, [epgData, selectedChannel]);

    const latestVideos = useMemo(() => {
        const pool = initialChannels.filter((ch) => ch.type === "TV");
        if (!pool.length) return [];
        return Array.from({ length: 12 }, (_, i) => pool[i % pool.length]);
    }, [initialChannels]);

    const programs = useMemo(() => {
        const flattened = fullEpg.flatMap((channel) => {
            const matin = channel.subitems?.matin || [];
            const soir = channel.subitems?.soir || [];
            return [...matin, ...soir].map((p) => ({
                title: p.title || "CANDELIGHT INITIATIVE",
                logo: p.logo || channel.logo,
                days: "Monday - Thursday",
                time: p.startTime || "09:00 PM",
            }));
        });
        if (!flattened.length) {
            return Array.from({ length: 4 }, () => ({
                title: "CANDELIGHT INITIATIVE",
                logo: selectedChannel?.logo_url || selectedChannel?.logo || "",
                days: "Monday - Thursday",
                time: "09:00 PM",
            }));
        }
        return flattened.slice(0, 4);
    }, [fullEpg, selectedChannel]);

    if (!selectedChannel) {
        return <div className="text-center text-white py-20">Aucune chaîne disponible</div>;
    }

    return (
        <div className="space-y-[45px] text-white">
            <LivePlayerSection channel={selectedChannel} currentProgram={currentProgram} />

            <section className="mx-auto w-full max-w-[1280px] space-y-[50px]">
                <div className="news-section-header">
                    <h2 className="fig-h9 uppercase text-white">Latest videos</h2>
                    <div className="news-section-line" />
                </div>
                <div className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
                    {latestVideos.map((video, index) => (
                        <article key={`${video.id}-${index}`} className="space-y-2">
                            <div className="h-[172px] overflow-hidden rounded-[10px]">
                                <SafeImage
                                    src={video.logo_url || video.logo || "/assets/placeholders/live_tv_frame.png"}
                                    alt={video.title}
                                    width={306}
                                    height={172}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <h3 className="line-clamp-2 text-[16px] leading-[24px] text-white">
                                Sabon Shugaban Karamar Hukumar Kebbe Alh. Musa Garba Kuci Ya Lashe
                            </h3>
                            <div className="flex items-center gap-[10px] text-[12px] leading-[18px] text-[#8E8E8E]">
                                <span>15 juin 2024</span>
                                <span className="h-[3.86px] w-[3.86px] rounded-full bg-[#8E8E8E]" />
                                <span>15:47</span>
                            </div>
                        </article>
                    ))}
                </div>
                <div className="flex justify-center">
                    <button type="button" className="h-[40px] rounded-[60px] border border-[#777777] px-5 text-[14px] font-semibold uppercase text-white">
                        Load more
                    </button>
                </div>
            </section>

            <div className="mx-auto w-full max-w-[1280px]">
                <AdBannerHD className="mx-auto max-w-[1280px] py-16" />
            </div>

            <section className="mx-auto w-full max-w-[1280px] space-y-[42px]">
                <div className="news-section-header">
                    <h2 className="fig-h9 uppercase text-white">Programs TV</h2>
                    <div className="news-section-line" />
                </div>
                <div className="grid gap-[20px] sm:grid-cols-2 xl:grid-cols-4">
                    {programs.map((program, idx) => (
                        <article key={`${program.title}-${idx}`} className="space-y-4">
                            <div className="h-[440px] overflow-hidden rounded-[15px] bg-[#333333]">
                                <SafeImage
                                    src={program.logo || "/assets/placeholders/live_tv_frame.png"}
                                    alt={program.title}
                                    width={343}
                                    height={440}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <h3 className="fig-h9 uppercase text-white">{program.title}</h3>
                            <div className="flex items-center gap-[10px] text-[12px] leading-[18px] text-[#8E8E8E]">
                                <span>Monday</span>
                                <span>-</span>
                                <span>Thursday</span>
                                <span className="h-[3.86px] w-[3.86px] rounded-full bg-[#8E8E8E]" />
                                <span>{program.time}</span>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}
