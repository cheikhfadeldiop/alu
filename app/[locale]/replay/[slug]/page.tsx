import { Suspense } from "react";
import { findReplayBySlug } from "@/services/api";
import { ReplayPlayerWrapper } from "@/components/replay/ReplayPlayerWrapper";
import { ReplayPlayerShimmer } from "@/components/ui/shimmer/ReplayShimmers";

interface PageProps {
    params: Promise<{ slug: string }>;
}

async function ReplayContent({ slug }: { slug: string }) {
    const selectedVideo = (await findReplayBySlug(slug)) || undefined;
    return <ReplayPlayerWrapper video={selectedVideo} />;
}

export default async function ReplaySlugPage({ params }: PageProps) {
    const { slug } = await params;

    return (
        <Suspense fallback={<ReplayPlayerShimmer />}>
            <ReplayContent slug={slug} />
        </Suspense>
    );
}
