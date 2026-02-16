import { Skeleton } from "./Skeleton";

export function ReplayPlayerShimmer() {
    return (
        <div className="w-full space-y-12 animate-pulse">
            {/* 1. Main Player Component Shimmer */}
            <div className="rounded-sm w-full overflow-hidden mb-12 border border-muted/10 bg-black">
                <div className="flex flex-col lg:flex-row h-auto lg:h-[720px]">
                    {/* Left: Video Area (75%) */}
                    <div className="w-full lg:w-3/4 flex flex-col relative border-r border-muted/10">
                        <div className="flex-1 relative aspect-video lg:aspect-auto flex items-center justify-center bg-black/50">
                            <Skeleton className="w-20 h-20 rounded-full" />
                        </div>
                        {/* Controls Bar Shimmer */}
                        <div className="h-28 bg-[#0a0a0a] flex items-center px-10 gap-8">
                            <div className="flex-1 flex gap-4">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <Skeleton className="w-16 h-16 rounded-full" />
                            <div className="flex-1 flex justify-end gap-4">
                                <Skeleton className="h-6 w-12 rounded-lg" />
                                <Skeleton className="h-6 w-12 rounded-lg" />
                                <Skeleton className="h-6 w-12 rounded-lg" />
                            </div>
                        </div>
                    </div>
                    {/* Right: Sidebar (25%) */}
                    <div className="w-full lg:w-1/4 bg-[#0a0a0a] flex flex-col h-full">
                        <div className="p-8 border-b border-muted/10 bg-black/40">
                            <Skeleton className="h-8 w-3/4" />
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-8">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="space-y-4 px-2">
                                    <Skeleton className="aspect-video w-full rounded-2xl" />
                                    <Skeleton className="h-3 w-1/2 mx-auto" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Page Info Shimmer (Below Player) */}
            <div className="max-w-[1400px] mx-auto px-4 space-y-12">
                <div className="flex justify-between items-start">
                    <div className="space-y-4 flex-1">
                        <Skeleton className="h-10 w-3/4" />
                        <div className="flex gap-4">
                            <Skeleton className="h-6 w-32 rounded-full" />
                            <Skeleton className="h-6 w-32 rounded-full" />
                        </div>
                    </div>
                    <Skeleton className="h-12 w-48 rounded-2xl" />
                </div>

                <div className="space-y-4 max-w-3xl">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>

                {/* 3. Extended Related Grid Shimmer */}
                <div className="pt-20 space-y-8">
                    <div className="flex justify-between items-end">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="aspect-video w-full rounded-2xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
