"use client";

import * as React from "react";
import Link from "next/link";
import { LiveChannel, EPGItem, FullEPGChannel } from "../../types/api";
import { SectionTitle } from "../ui/SectionTitle";
import { LiveCarousel } from "../shared/LiveCarousel";
import { SITE_CONFIG } from "@/constants/site-config";
import { useTranslations } from "next-intl";
import { SafeImage } from "../ui/SafeImage";
import { formatDate } from "@/utils/text";

interface LiveDirectSectionProps {
    channels: LiveChannel[];
    epgItems: EPGItem[];
    fullEpg?: FullEPGChannel[];
}

export function LiveDirectSection({ channels, epgItems, fullEpg = [] }: LiveDirectSectionProps) {
    const t = useTranslations("common");
    if (!channels || channels.length === 0) return null;

    return (
        <section className="py-8">
            <SectionTitle title={t("direct") + " " + t("onAir")} title2="" actionIcon={true} className="font-bold" />
            <LiveCarousel>
                {channels.map((channel) => {
                    const currentEPGItem = epgItems.find(
                        (epg) => epg.channel_id === channel.id && epg.is_current
                    );

                    // Find detailed program from fullEpg
                    const channelFullEpg = fullEpg.find(ch => ch.id === channel.id);
                    let progDetails = null;
                    if (channelFullEpg) {
                        const now = new Date();
                        const nowSec = now.getHours() * 3600 + now.getMinutes() * 60;
                        const { matin = [], soir = [] } = channelFullEpg.subitems || {};
                        const combined = [...matin, ...soir];
                        progDetails = combined.find(prog => {
                            const [sH, sM] = prog.startTime.split(':').map(Number);
                            const [eH, eM] = prog.endTime.split(':').map(Number);
                            const startSec = sH * 3600 + sM * 60;
                            let endSec = eH * 3600 + eM * 60;
                            if (endSec < startSec) endSec += 24 * 3600;
                            return nowSec >= startSec && nowSec < endSec;
                        });
                    }

                    return (
                        <div key={channel.id} className="w-[200px] xs:w-[240px] md:w-[400px]">
                            <LiveChannelCard
                                channel={channel}
                                currentProgram={currentEPGItem}
                                progDetails={progDetails}
                            />
                        </div>
                    );
                })}
            </LiveCarousel>
        </section>
    );
}

function LiveChannelCard({
    channel,
    currentProgram,
    progDetails
}: {
    channel: LiveChannel,
    currentProgram?: EPGItem,
    progDetails?: any
}) {
    const t = useTranslations("common");

    return (
        <Link
            href={`/live?channel=${channel.slug || channel.id}`}
            className="group flex items-center backdrop-blur-xl bg-muted/20 over:scale-105 transition-transform hover:z-10 p-2 sm:p-5 transition-colors rounded-sm overflow-hidden h-[80px] sm:h-[140px]"        >
            <div className="relative w-[35%] h-full">
                <SafeImage
                    src={progDetails?.logo || channel.logo_url || channel.logo || SITE_CONFIG.theme.placeholders.video}
                    alt={progDetails?.title || channel.title}
                    fill
                    className="object-contain opacity-80"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            <div className="flex-1 p-2 sm:p-4 flex flex-col justify-center space-y-0.5 min-w-0">
                <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-[color:var(--accent)]">{"EN" + " " + t("direct")}</span>
                </div>
                <div className="space-y-0.5 flex flex-col sm:flex-row sm:items-center ">
                    <h3 className="text-[10px] sm:text-sm font-bold line-clamp-1">
                        {progDetails?.title || currentProgram?.program_title || t("inProgress")}
                    </h3>
                    <div className="flex items-center sm:pl-2 w-[35%]">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[color:var(--accent)] rotate-45 animate-pulse" />
                        <span className="w-0.5 sm:w-1 h-0.5 sm:h-1 rounded-full" />
                        <p className="text-[9px] pl-2 sm:text-[11px] font-bold uppercase tracking-tighter">
                            {channel.title}
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-between w-full gap-2 text-[9px] sm:text-[10px] text-gray-400 font-medium">
                    {progDetails?.startTime && progDetails?.endTime && (
                        <span className="text-[color:var(--accent)]">{progDetails.startTime} - {progDetails.endTime}</span>
                    )}
                </div>
                <p className="text-[9px] sm:text-[10px] text-gray-400 line-clamp-1 sm:line-clamp-2 leading-tight">
                    {progDetails?.description || currentProgram?.program_desc || t("liveDescription")}
                </p>
            </div>
        </Link>
    );
}
