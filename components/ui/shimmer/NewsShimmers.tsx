import { Skeleton } from "./Skeleton";

export function NewsHeroShimmer() {
    return (
        <section className="space-y-6">
            <div className="h-10 w-64">
                <Skeleton className="h-full w-full" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-5 items-stretch min-h-[400px]">
                {/* 30% Left: Metadata */}
                <div className="lg:col-span-3 flex flex-col justify-between space-y-8 order-2 lg:order-1 px-2">
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/6" />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
                {/* 40% Middle: Image */}
                <div className="lg:col-span-4 order-1 lg:order-2">
                    <Skeleton className="h-full min-h-[400px] w-full rounded-sm" />
                </div>
                {/* 30% Right: Feature */}
                <div className="lg:col-span-3 order-3 h-full flex flex-col">
                    <Skeleton className="h-[60%] w-full rounded-t-sm" />
                    <div className="flex-1 p-6 space-y-4 border border-muted/10 rounded-b-sm bg-surface/10">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            </div>
        </section>
    );
}

export function NewsGridShimmer() {
    return (
        <section className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="space-y-4">
                        <Skeleton className="aspect-video w-full rounded-2xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-4/5" />
                            <Skeleton className="h-3 w-1/3 mt-4" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export function ReplaySectionShimmer() {
    return (
        <div className="space-y-12 bg-surface/30 backdrop-blur-sm rounded-[3rem] p-12 mt-20">
            <Skeleton className="h-10 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-4">
                        <Skeleton className="aspect-video w-full rounded-2xl" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function NewsDetailShimmer() {
    return (
        <div className="flex flex-col lg:flex-row justify-center items-start w-full gap-6 lg:gap-[38px] max-w-[1446px] mx-auto">
            {/* Left Column (Main Article) */}
            <div className="flex flex-col items-start w-full lg:w-[830px] lg:flex-shrink-0 bg-background sm:px-[34px] py-4 sm:py-[15px] pb-6 sm:pb-[39px] gap-4 sm:gap-6">
                <div className="flex flex-col items-end w-full gap-6 sm:gap-[47px]">
                    {/* Image Placeholder */}
                    <Skeleton className="relative w-full aspect-video lg:aspect-[822/533] rounded-sm" />

                    {/* Content Meta */}
                    <div className="flex flex-col items-start w-full gap-2 sm:gap-[10px]">
                        <Skeleton className="h-10 w-full rounded-md" />
                        <Skeleton className="h-10 w-3/4 rounded-md" />

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-3 sm:gap-4 mt-4">
                            <div className="flex gap-4">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="w-8 h-8 rounded-md" />)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body Text Blocks */}
                <div className="w-full space-y-8 mt-8">
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/6" />
                    </div>

                    {/* Fake Blockquote */}
                    <div className="w-full max-w-[611px] mx-auto bg-accent/5 p-6 border-l-4 border-accent">
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>

                    <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                </div>
            </div>

            {/* Right Column (Sidebar) */}
            <div className="flex flex-col items-start w-full lg:w-[578px] lg:flex-shrink-0 gap-8">
                <div className="w-full border-b border-muted/10 pb-4">
                    <Skeleton className="h-8 w-40" />
                </div>
                <div className="w-full space-y-6">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex gap-4">
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-24 mt-2" />
                            </div>
                            <Skeleton className="w-24 h-24 rounded-md flex-shrink-0" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
