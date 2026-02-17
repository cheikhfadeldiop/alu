import { Suspense } from "react";
import { getWordPressLatestPosts } from "@/services/api";
import { CorporateNewsPageClient } from "@/components/corporate/CorporateNewsPageClient";
import { CorporatePageShimmer } from "@/components/ui/shimmer/CorporateShimmer";

export default async function CorporateNewsPage() {
    // Fetch initial 9 posts for the 3x3 grid
    const posts = await getWordPressLatestPosts(9).catch(() => []);

    return (
        <main className="min-h-screen crtv-page-enter">
            <Suspense fallback={<CorporatePageShimmer />}>
                <CorporateNewsPageClient initialPosts={posts} />
            </Suspense>
        </main>
    );
}
