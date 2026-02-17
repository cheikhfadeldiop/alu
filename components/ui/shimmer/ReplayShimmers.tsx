import { Skeleton } from "./Skeleton";

export function ReplayPlayerShimmer() {
    return (
        <div className="w-full space-y-12 animate-pulse">
            {/* 1. Main Player and Ad Side by Side Shimmer */}
            <div className="max-w-[1400px] mx-auto">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left: Video Area (70%) */}
                    <div className="lg:w-[70%] space-y-4">
                        <div className="aspect-video w-full bg-black/20 rounded-sm flex items-center justify-center border border-white/5 overflow-hidden">
                            <Skeleton className="w-20 h-20 rounded-full" />
                        </div>
                        {/* Info Container Shimmer (Matching Live Page Design) */}
                        <div className="relative p-8 md:p-10 bg-background/85 border border-white/5 overflow-hidden">
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Logo Placeholder */}
                                <Skeleton className="w-32 h-24 rounded-2xl shrink-0" />

                                {/* Content */}
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-6 w-20 rounded-full" />
                                        <Skeleton className="h-10 w-3/4 rounded-sm" />
                                    </div>
                                    <div className="space-y-3">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-5/6" />
                                    </div>
                                    <div className="pt-4 border-t border-white/5 flex gap-4">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Ad Area (30%) */}
                    <div className="lg:w-[30%]">
                        <Skeleton className="w-full h-[600px] rounded-sm" />
                    </div>
                </div>
            </div>

            {/* 2. Related Replays Grid Shimmer */}
            <div className="max-w-[1400px] mx-auto space-y-8 pt-12">
                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                    <Skeleton className="h-10 w-64" />
                </div>

                {/* 4x2 Grid Shimmer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="space-y-4">
                            <div className="aspect-video relative overflow-hidden rounded-sm bg-muted/5">
                                <Skeleton className="w-full h-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
