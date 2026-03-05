import * as React from "react";
import { SliderVideoItem } from "../../types/api";
import { MediaCard } from "../ui/MediaCard";
import { SectionTitle } from "../ui/SectionTitle";
import { getPostAuthor } from "@/utils/text";

interface ReplaySectionProps {
    videos: SliderVideoItem[];
}

export function ReplaySection({ videos }: ReplaySectionProps) {
    if (!videos || videos.length === 0) return null;

    // Show top 8 videos (2 rows of 4)
    const displayVideos = videos.slice(0, 8);

    return (
        <section className="space-y-6">
            <div className="flex items-center">
                <SectionTitle
                    title="VOIR AUSSI"
                    title2=""
                    uppercase={true}
                    actionIcon={true}
                    actionHref={`/replay`}
                />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 ">
                {displayVideos.map((video, index) => (
                    <MediaCard
                        key={`${video.slug}-${index}`}
                        href={video.video_url || `/replay/${video.slug}`}
                        target={false}
                        title={video.title}
                        imageSrc={video.logo_url}
                        meta={`${video.date} • ${video.time || 'Replay'}`}
                        aspect="16/9"
                        showPlayIcon={true}
                        author={getPostAuthor(video)}
                    />
                ))}
            </div>
        </section>
    );
}
