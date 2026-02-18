import { Suspense } from "react";
import { findReplayBySlug, getLatestAggregateReplays, getRelatedItems, mapVODToSliderItem, SliderVideoItem } from "@/services/api";
import { ReplayPlayerWrapper } from "@/components/replay/ReplayPlayerWrapper";
import { ReplayPlayerShimmer } from "@/components/ui/shimmer/ReplayShimmers";
import { RelatedReplaysGrid } from "@/components/replay/RelatedReplaysGrid";
import { AdBannerV } from "@/components/ui/AdBannerV";
import { BackButton } from "@/components/ui/BackButton";
import { Metadata } from "next";
import { SITE_CONFIG } from "@/constants/site-config";
import { getSiteAbsoluteUrl, ensureAbsoluteUrl } from "@/services/api";

interface PageProps {
    params: Promise<{ slug: string }>;
}

async function ReplayContent({ slug }: { slug: string }) {
    const selectedVideo = await findReplayBySlug(slug).catch(() => undefined);

    // Now fetch related replays intelligently
    let relatedReplays: SliderVideoItem[] = [];

    if (selectedVideo?.relatedItems && selectedVideo.relatedItems !== "null") {
        try {
            // Priority: Fetch show-specific archives
            const archives = await getRelatedItems(selectedVideo.relatedItems).catch(() => []);
            relatedReplays = archives.map(item => mapVODToSliderItem(item, selectedVideo.channel_logo || (selectedVideo as any).chaine_logo));
        } catch (err) {
            console.error("Failed to fetch show-specific archives:", err);
        }
    }

    // Fallback/Supplement: If we don't have enough, or they failed, fetch global latest
    if (relatedReplays.length < 12) {
        const globalLatest = await getLatestAggregateReplays(20).catch(() => []);
        // Merge and deduplicate
        const seenSlugs = new Set(relatedReplays.map(r => r.slug));
        if (selectedVideo?.slug) seenSlugs.add(selectedVideo.slug);

        const filteredGlobal = globalLatest.filter(r => !seenSlugs.has(r.slug));
        relatedReplays = [...relatedReplays, ...filteredGlobal].slice(0, 20);
    }

    // Convert null to undefined for type safety
    const video = selectedVideo ?? undefined;

    return (
        <div className="space-y-8 md:space-y-12">
            {/* Player and Ad Banner Section - Side by Side */}
            <div className="max-w-[1400px] mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Player - Takes 70% width on large screens */}
                    <div className="lg:w-[70%]">
                        <ReplayPlayerWrapper video={video} />
                    </div>

                    {/* Ad Banner - Takes 30% width on large screens */}
                    <div className="lg:w-[30%] flex items-start">
                        <div className="w-full sticky top-24">
                            <AdBannerV />
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Replays Grid - 4x2 with Load More */}
            <RelatedReplaysGrid initialReplays={relatedReplays} currentSlug={slug} relatedItemsUrl={selectedVideo?.relatedItems} />
        </div>
    );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const video = await findReplayBySlug(slug).catch(() => null);

    if (!video) return { title: "Replay - CRTV" };

    const imageUrl = ensureAbsoluteUrl(video.logo_url || video.logo) || getSiteAbsoluteUrl(SITE_CONFIG.theme.placeholders.video);

    return {
        title: `${video.title} - CRTV Replay`,
        description: video.desc || "Regardez ce replay sur CRTV Web",
        openGraph: {
            title: video.title,
            description: video.desc || "Regardez ce replay sur CRTV Web",
            images: [{
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: video.title
            }],
            type: 'video.other',
        },
        twitter: {
            card: 'summary_large_image',
            title: video.title,
            description: video.desc || "Regardez ce replay sur CRTV Web",
            images: [imageUrl],
        }
    };
}

export default async function ReplaySlugPage({ params }: PageProps) {
    const { slug } = await params;

    return (
        <div className="crtv-page-enter py-8">
            {/* Back Button - Outside Suspense to be always visible */}
            <div className="max-w-[1400px] mx-auto px-4 mb-8">
                <BackButton />
            </div>

            <Suspense fallback={
                <div className="max-w-[1400px] mx-auto px-4">
                    <ReplayPlayerShimmer />
                </div>
            }>
                <ReplayContent slug={slug} />
            </Suspense>
        </div>
    );
}
