import { Skeleton } from "./Skeleton";

export function LivePageShimmer() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* 1. Carousel with Tabs Shimmer */}
            <div className="w-full space-y-6">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-9 w-20 rounded-sm" />
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="w-10 h-10 rounded-sm" />
                        <Skeleton className="w-10 h-10 rounded-sm" />
                    </div>
                </div>
                <div className="flex gap-6 overflow-hidden pb-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="shrink-0 w-[260px] sm:w-[300px] h-[220px] rounded-sm overflow-hidden border border-muted/10 bg-surface/20">
                            <Skeleton className="h-[65%] w-full" />
                            <div className="h-[35%] p-4 space-y-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-1 w-full rounded-full" />
                                </div>
                                <div className="flex justify-between">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Player Section Shimmer */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-8">
                <div className="lg:col-span-8 space-y-6">
                    <Skeleton className="aspect-video w-full rounded-[2.5rem]" />
                    <div className="space-y-3">
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
                <div className="lg:col-span-4 space-y-6">
                    <Skeleton className="h-12 w-full rounded-2xl" />
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-sm border border-muted/10 bg-surface/10">
                                <Skeleton className="w-24 h-16 rounded-sm shrink-0" />
                                <div className="flex-1 space-y-2 py-1">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. Upcoming Programs Timeline Shimmer */}
            <div className="space-y-6 pt-10">
                <Skeleton className="h-8 w-48" />
                <div className="flex gap-4 overflow-hidden pt-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="w-[300px] shrink-0 space-y-4">
                            <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
