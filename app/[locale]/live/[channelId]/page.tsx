import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { VideoPlayer } from "../../../../components/ui/VideoPlayer";
import { SectionTitle } from "../../../../components/ui/SectionTitle";
import { MediaCard } from "../../../../components/ui/MediaCard";

import { getAluLiveTVOnly } from "../../../../services/api";

interface LiveChannelPageProps {
    params: Promise<{
        channelId: string;
        locale: string;
    }>;
}

export default async function LiveChannelPage({ params }: LiveChannelPageProps) {
    const { channelId } = await params;
    const t = await getTranslations("common");

    try {
        const channelsData = await getAluLiveTVOnly().catch(() => ({ allitems: [] }));
        const channel = channelsData.allitems.find((ch) => ch.id === channelId) || channelsData.allitems[0];
        const streamUrl = channel?.stream_url;

        if (!channel || !streamUrl) {
            notFound();
        }

        const currentProgram: any = null;
        const relatedContent: any[] = [];

        return (
            <div className="crtv-page-enter space-y-8">
                {/* Video Player Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Image
                            src={channel.logo_url || channel.logo}
                            alt={channel.title}
                            width={60}
                            height={60}
                            className="rounded-lg"
                        />
                        <div>
                            <h1 className="text-2xl font-bold">{channel.title}</h1>
                            <p className="text-sm text-[color:var(--muted)]">{channel.desc}</p>
                        </div>
                    </div>

                    <VideoPlayer streamUrl={streamUrl} poster={channel.logo_url} autoplay={true} className="aspect-video" />

                    {/* Current Program Info (EPG not available in ALU mode) */}
                    {currentProgram && (
                        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500 text-white text-xs font-semibold">
                                            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                            EN DIRECT
                                        </span>
                                        <span className="text-xs text-[color:var(--muted)]">
                                            {currentProgram.start_time} - {currentProgram.end_time}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-bold mb-2">{currentProgram.program_title}</h2>
                                    <p className="text-sm text-[color:var(--muted)]">{currentProgram.program_desc}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Related Content */}
                {relatedContent.length > 0 && (
                    <section className="space-y-4">
                        <SectionTitle title="Contenus associés" title2="" />
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {relatedContent.slice(0, 6).map((item) => (
                                <MediaCard
                                    key={item.slug}
                                    href={`/replay/${item.slug}`}
                                    title={item.title}
                                    imageSrc={item.logo_url || item.logo || "/assets/placeholders/article_list.png"}
                                    meta={item.chaine_name || item.time}
                                    aspect="16/9"
                                    showPlayIcon
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Other Live Channels */}
                <section className="space-y-4">
                    <SectionTitle title="Autres chaînes en direct" title2="" />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {channelsData.allitems
                            .filter((ch) => ch.id !== channelId)
                            .slice(0, 4)
                            .map((ch) => (
                                <MediaCard
                                    key={ch.id}
                                    href={`/live/${ch.id}`}
                                    title={ch.title}
                                    imageSrc={ch.logo_url || ch.logo || "/assets/placeholders/live_tv_frame.png"}
                                    meta="En direct"
                                    live
                                    aspect="16/9"
                                />
                            ))}
                    </div>
                </section>
            </div>
        );
    } catch (error) {
        console.error("Error loading live channel:", error);
        notFound();
    }
}
