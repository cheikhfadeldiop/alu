"use client";

import * as React from "react";
import Link from "next/link";
import { LiveChannel, EPGItem } from "../../types/api";
import { SectionTitle } from "../ui/SectionTitle";
import { LiveCarousel } from "../shared/LiveCarousel";
import { SITE_CONFIG } from "@/constants/site-config";
import { useTranslations } from "next-intl";
import { SafeImage } from "../ui/SafeImage";

interface LiveDirectSectionProps {
    channels: LiveChannel[];
    epgItems: EPGItem[];
}

export function LiveDirectSection({ channels, epgItems }: LiveDirectSectionProps) {
    const t = useTranslations("common");
    if (!channels || channels.length === 0) return null;

    return (
        <section className="py-8">
            <SectionTitle title={t("direct")} title2={t("onAir")} actionIcon={true} />
            <LiveCarousel>
                {channels.map((channel) => {
                    const currentProgram = epgItems.find(
                        (epg) => epg.channel_id === channel.id && epg.is_current
                    );
                    return (
                        <div key={channel.id} className="w-[340px] md:w-[400px]">
                            <LiveChannelCard channel={channel} currentProgram={currentProgram} />
                        </div>
                    );
                })}
            </LiveCarousel>
        </section>
    );
}

function LiveChannelCard({ channel, currentProgram }: { channel: LiveChannel, currentProgram?: EPGItem }) {
    const t = useTranslations("common");

    return (
        <Link
            href={`/live?channel=${channel.id}`}
            className="group flex items-center backdrop-blur-xl bg-background/5 hover:scale-105 transition-transform hover:z-10 p-5 transition-colors rounded-sm overflow-hidden h-[140px]"
        >
            <div className="relative w-[35%] h-full">
                <SafeImage
                    src={channel.logo_url || channel.logo || SITE_CONFIG.theme.placeholders.video}
                    alt={channel.title}
                    fill
                    className="object-contain opacity-80"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            <div className="flex-1 p-4 flex flex-col justify-center space-y-2 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[color:var(--accent)]">{t("direct")}</span>
                </div>
                <div className="space-y-0.5 flex flex-grow">
                    <h3 className="text-sm font-bold line-clamp-1">{currentProgram?.channel_name || t("inProgress")}</h3>
                    <div className="flex items-center pl-2">
                        <span className="w-2 h-2 bg-[color:var(--accent)] rotate-45 animate-pulse" />
                        <span className="w-1 h-1 rounded-full" />
                        <p className="text-[11px] font-bold uppercase tracking-tighter">{channel.title}</p>
                    </div>
                </div>
                <p className="text-[10px] text-gray-400 line-clamp-2 leading-tight">{currentProgram?.program_desc || t("liveDescription")}</p>
            </div>
        </Link>
    );
}
