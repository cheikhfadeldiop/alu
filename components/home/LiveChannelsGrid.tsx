"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import { LiveChannel, EPGItem, FullEPGChannel } from "../../types/api";
import { LiveCarousel } from "../shared/LiveCarousel";
import { useTranslations } from "next-intl";
import { SITE_CONFIG } from "@/constants/site-config";
import { SafeImage } from "../ui/SafeImage";
import { useLiveChannels, useEPGNow } from "@/hooks/useData";
import { SectionTitle } from "../ui/SectionTitle";
import { formatDate } from "@/utils/text";

interface LiveChannelsGridProps {
    channels: LiveChannel[];
    epgItems: EPGItem[];
    fullEpg?: FullEPGChannel[];
    title: string;
    title2: string;
    actionLabel: string;
}

export function LiveChannelsGrid({
    channels: initialChannels,
    epgItems: initialEpg,
    fullEpg = [],
    title,
    title2,
    actionLabel,
}: LiveChannelsGridProps) {
    const t = useTranslations("common");
    const tf = useTranslations("footer.links");
    const [activeTab, setActiveTab] = React.useState<"ALL" | "TV" | "RADIO">("ALL");

    const filteredChannels = initialChannels.filter((channel) => {
        if (activeTab === "ALL") return true;
        return channel.type === activeTab;
    });

    const epgItems = initialEpg;

    if (!filteredChannels || filteredChannels.length === 0) return null;

    return (
        /**
         * Layout : 2 colonnes côte-à-côte
         *  ┌────────────┬──────────────────────────────────────────────┐
         *  │ TITRE FIXE │  ◄ ─── CARTES EN SCROLL HORIZONTAL ─── ►    │
         *  └────────────┴──────────────────────────────────────────────┘
         */
        <section className="flex flex-col lg:flex-row items-start lg:items-stretch gap-8 lg:gap-l">

            {/* ── COL GAUCHE : titre fixe ── */}
            <div
                className="flex flex-col justify-between flex-shrink-0 w-full lg:w-[350px]"
            >
                <div className="flex flex-col gap-4">
                    <SectionTitle title={title} title2={title2} actionHref="/live" />

                    {/* ── TABS ── */}
                    <div className="flex flex-row items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                        {(["ALL", "TV", "RADIO"] as const).map((tab) => {
                            const isActive = activeTab === tab;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`h-8 px-4 rounded-full transition-all duration-300 text-lg font-bold border whitespace-nowrap ${isActive
                                        ? "border-accent text-accent bg-accent/5 shadow-sm"
                                        : "border-transparent text-muted hover:text-foreground hover:bg-surface-2"
                                        }`}
                                >
                                    {tab === "ALL" ? t("all") : tab === "TV" ? tf("tv") : tf("radio")}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── COL DROITE : carousel scrollable ── */}
            <div className="w-full min-w-0">
                <LiveCarousel>
                    {filteredChannels.map((channel, index) => {
                        // Calcul progression EPG
                        const currentProgram = epgItems.find(
                            (epg) => epg.channel_id === channel.id && epg.is_current
                        );

                        // Find detailed program from fullEpg if available
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

                        let progressPercentage = 0;
                        const channelLogo = channel.logo_url || channel.logo || (channel as any).hd_logo || (channel as any).sd_logo;
                        const effectiveProgramTitle = progDetails?.title || currentProgram?.program_title || channel.title;
                        const effectiveProgramLogo = progDetails?.logo || channelLogo;
                        const startTime = progDetails?.startTime || currentProgram?.start_time;
                        const endTime = progDetails?.endTime || currentProgram?.end_time;

                        if (startTime && endTime) {
                            const now = new Date();
                            const [startHour, startMinute] = startTime.split(":").map(Number);
                            const [endHour, endMinute] = endTime.split(":").map(Number);
                            const startDate = new Date();
                            startDate.setHours(startHour, startMinute, 0, 0);
                            const endDate = new Date();
                            endDate.setHours(endHour, endMinute, 0, 0);
                            if (endDate < startDate) endDate.setDate(endDate.getDate() + 1);
                            const totalDuration = endDate.getTime() - startDate.getTime();
                            const elapsed = now.getTime() - startDate.getTime();
                            if (totalDuration > 0) {
                                progressPercentage = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
                            }
                        } else {
                            const safeId = channel.id ? String(channel.id) : "unknown";
                            const seed = safeId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
                            progressPercentage = 15 + (seed % 75);
                        }

                        const dateLabel =
                            startTime ? `${startTime} - ${endTime || ''}` :
                                formatDate(Date.now());
                        const timeLabel =
                            startTime && endTime ? `${startTime} - ${endTime}` :
                                (startTime ?? new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));

                        return (
                            <Link
                                key={index}
                                href={channel.type === 'RADIO' ? `/radio?channel=${channel.slug}` : `/live?channel=${channel.slug}`}
                                className="group flex flex-col flex-shrink-0 hover:opacity-90 transition-opacity"
                                style={{ width: 260, height: 240, gap: 13, borderRadius: 10 }}
                            >
                                {/* ── THUMBNAIL 260 × 157 ── */}
                                <div
                                    className="relative flex-shrink-0 overflow-hidden"
                                    style={{ width: 260, height: 157, borderRadius: 10 }}
                                >
                                    {/* Image de fond */}
                                    <SafeImage
                                        src={
                                            effectiveProgramLogo ||
                                            SITE_CONFIG.theme.placeholders.video
                                        }
                                        alt={effectiveProgramTitle}
                                        fill
                                        sizes="260px"
                                        className="object-cover"
                                    />

                                    {/* Dégradé transparent → noir */}
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            background:
                                                "linear-gradient(180deg, rgba(0,0,0,0) 22%, rgba(0,0,0,0.8) 92%)",
                                            borderRadius: 10,
                                        }}
                                    />

                                    {/* TOP : icône TV gauche · badge LIVE droite */}
                                    <div
                                        className="absolute flex flex-row items-center justify-between"
                                        style={{ left: 8, right: 8, top: 9, height: 28 }}
                                    >
                                        {/* Icône TV */}


                                        {/* Badge LIVE */}
                                        <div
                                            className="flex items-center justify-center"
                                            style={{
                                                width: 72,
                                                height: 26,
                                                background: "rgba(255,255,255,0.92)",
                                                borderRadius: 50,
                                                flexShrink: 0,
                                            }}
                                        >
                                            <div className="flex flex-row items-center" style={{ gap: 4 }}>
                                                <div
                                                    className="relative"
                                                    style={{ width: 14, height: 14, flexShrink: 0 }}
                                                >
                                                    <div
                                                        className="absolute inset-0 rounded-full"
                                                        style={{ background: "rgba(255,0,63,0.12)" }}
                                                    />
                                                    <div
                                                        className="absolute rounded-full animate-pulse"
                                                        style={{
                                                            width: 7,
                                                            height: 7,
                                                            top: 3.5,
                                                            left: 3.5,
                                                            background: "#FF003F",
                                                        }}
                                                    />
                                                </div>
                                                <span
                                                    style={{
                                                        fontFamily: "'Plus Jakarta Sans', Roboto, sans-serif",
                                                        fontWeight: 500,
                                                        fontSize: 12,
                                                        lineHeight: "18px",
                                                        color: "#3A3A3A",
                                                    }}
                                                >
                                                    {t("direct")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Logo chaîne — bas droite */}
                                    <div
                                        className="absolute"
                                        style={{ bottom: 8, right: 8, width: 44, height: 42 }}
                                    >
                                        <SafeImage
                                            src={channelLogo}
                                            alt={channel.title}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <div
                                        className="absolute"
                                        style={{ bottom: 8, left: 8, width: 28, height: 28 }}
                                    >
                                        <SafeImage
                                            src={channel.type === 'RADIO' ? SITE_CONFIG.theme.placeholders.radio : SITE_CONFIG.theme.placeholders.video}
                                            alt={channel.type}
                                            fill
                                            className="object-contain opacity-80"
                                        />
                                    </div>
                                </div>
                                {/* ── fin thumbnail ── */}

                                {/* ── INFO SECTION ── */}
                                <div
                                    className="flex flex-col"
                                    style={{ paddingLeft: 4, gap: 6, width: 260 }}
                                >
                                    {/* Ligne 1 : nom chaîne + barre de progression */}
                                    <div
                                        className="flex flex-row items-center"
                                        style={{ gap: 8, width: 252, height: 24 }}
                                    >
                                        <h3
                                            className="line-clamp-1 flex-shrink-0"
                                            style={{
                                                fontFamily: "var(--font-display)",
                                                fontWeight: 600,
                                                fontSize: 13,
                                                lineHeight: "20px",
                                                color: "var(--foreground)",
                                                maxWidth: 145,
                                            }}
                                        >
                                            {effectiveProgramTitle}
                                        </h3>

                                        {/* Barre de progression */}
                                        <div className="relative flex-1" style={{ height: 5 }}>
                                            <div
                                                className="absolute inset-0 rounded-full"
                                                style={{ background: "var(--token-colors-neutral-300)" }}
                                            />
                                            <div
                                                className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
                                                style={{
                                                    width: `${progressPercentage}%`,
                                                    background: "var(--accent)",
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Ligne 2 : date · tiret · heure */}
                                    <div
                                        className="flex flex-row items-center justify-between"
                                        style={{ gap: 6, height: 18 }}
                                    >
                                        {/* 📅 Icône calendrier */}
                                        <svg
                                            width={14}
                                            height={14}
                                            viewBox="0 0 16 16"
                                            fill="none"
                                            style={{ flexShrink: 0 }}
                                        >
                                            <rect x={2} y={2.5} width={12} height={12} rx={1.5} stroke="#888" strokeWidth={1} />
                                            <line x1={5} y1={1} x2={5} y2={4} stroke="#888" strokeWidth={1} />
                                            <line x1={11} y1={1} x2={11} y2={4} stroke="#888" strokeWidth={1} />
                                            <line x1={2} y1={6.5} x2={14} y2={6.5} stroke="#888" strokeWidth={1} />
                                            <rect x={5} y={9} width={2} height={2} rx={0.5} fill="#888" />
                                            <rect x={9} y={9} width={2} height={2} rx={0.5} fill="#888" />
                                        </svg>

                                        {/* Date */}
                                        <span
                                            style={{
                                                fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                                                fontWeight: 400,
                                                fontSize: 11,
                                                lineHeight: "17px",
                                                color: "#888",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                maxWidth: 120,
                                            }}
                                        >
                                            {startTime && endTime ? `${startTime} - ${endTime}` : dateLabel}
                                        </span>

                                        {/* Tiret */}
                                        <svg width={12} height={12} viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                                            <line x1={1} y1={6} x2={11} y2={6} stroke="#8E8E8E" strokeWidth={1.5} />
                                        </svg>

                                        {/* 🕐 Icône horloge */}
                                        <svg
                                            width={14}
                                            height={14}
                                            viewBox="0 0 16 16"
                                            fill="none"
                                            style={{ flexShrink: 0 }}
                                        >
                                            <circle cx={8} cy={8} r={7} stroke="#888" strokeWidth={1} />
                                            <polyline
                                                points="8,4 8,8 11,10"
                                                stroke="#888"
                                                strokeWidth={1}
                                                strokeLinecap="round"
                                            />
                                        </svg>

                                        {/* Heure */}
                                        <span
                                            style={{
                                                fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                                                fontWeight: 400,
                                                fontSize: 11,
                                                lineHeight: "17px",
                                                color: "#888",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {timeLabel}
                                        </span>
                                    </div>
                                </div>
                                {/* ── fin info section ── */}

                            </Link>
                        );
                    })}
                </LiveCarousel>
            </div>

        </section>
    );
}