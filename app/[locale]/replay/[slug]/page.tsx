import { findReplayBySlug } from "../../../../services/api";
import { ReplayPlayerWrapper } from "../../../../components/replay/ReplayPlayerWrapper";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function ReplaySlugPage({ params }: PageProps) {
    const { slug } = await params;

    // We fetch the video data. Since it's likely cached in fetch(), 
    // it will be extremely fast if already visited or pre-fetched.
    const selectedVideo = (await findReplayBySlug(slug)) || undefined;

    return <ReplayPlayerWrapper video={selectedVideo} />;
}
