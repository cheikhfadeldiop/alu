"use client";

import * as React from "react";
import { LiveDirectSection } from "./LiveDirectSection";
import { DernieresEditionsCarousel } from "./DernieresEditionsCarousel";
import { MissedAiringSection } from "./MissedAiringSection";
import { EmissionsSlider } from "./EmissionsSlider";
import { CrossedNavigationSection } from "./CrossedNavigationSection";
import { SliderVideoItem, ShowReplayGroup } from "../../services/api";
import { ReplayPlayerWrapper } from "./ReplayPlayerWrapper";

interface ReplayPageContentProps {
    liveChannels: any[];
    epgItems: any[];
    replays: SliderVideoItem[];
    shows: any[];
    crossedData: ShowReplayGroup[];
    selectedVideo?: SliderVideoItem;
}

export function ReplayPageContent({
    liveChannels,
    epgItems,
    replays,
    shows,
    crossedData,
    selectedVideo
}: ReplayPageContentProps) {
    // This Client Component will receive new props when the URL changes in Next.js
    // but React will only re-render the individual components that depend on the props.
    // Since sections like LiveDirectSection receive stable data, their internal state
    // and DOM will be preserved, avoiding the 'skeleton' or 'flicker' look.

    return (
        <div className="py-8 space-y-16">
            {/* 1. Live Direct Section */}
            <div className="max-w-[1400px] mx-auto px-4">
                <LiveDirectSection
                    channels={liveChannels}
                    epgItems={epgItems}
                />
            </div>

            {/* 2. Replay Player (Always rendered to maintain layout) */}
            <ReplayPlayerWrapper video={selectedVideo} />

            {/* 3. Replay Carousel */}
            <DernieresEditionsCarousel videos={replays} liveChannels={liveChannels} />

            {/* 4. Missed Airing Section */}
            <MissedAiringSection initialVideos={replays} liveChannels={liveChannels} />

            {/* 5. Nos Émissions Section */}
            <EmissionsSlider shows={shows} />

            {/* 6. Crossed Navigation Section */}
            <CrossedNavigationSection data={crossedData} />
        </div>
    );
}
