import { Skeleton } from "./Skeleton";

export function RadioPageShimmer() {
    return (
        <div className="space-y-12 animate-pulse">
            {/* Radio Player Shimmer */}
            <div className="w-full space-y-6">
                <div className="relative rounded-sm p-8 bg-surface/30 backdrop-blur-2xl border border-muted/10 min-h-[500px] flex flex-col items-center">
                    {/* Top Logo area Shimmer */}
                    <div className="mb-10 mt-[-35px] flex flex-col items-center bg-surface/20 w-[250px] h-[200px] pt-5 rounded-b-4xl">
                        <Skeleton className="w-24 h-24 rounded-full bg-black/20" />
                        <Skeleton className="h-10 w-32 mt-4" />
                    </div>

                    {/* Circular Control Shimmer */}
                    <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
                        <Skeleton className="w-48 h-48 rounded-full" />
                        <div className="absolute inset-0 border-2 border-muted/10 rounded-full" />
                    </div>

                    {/* Bottom Metadata Shimmer */}
                    <div className="w-full max-w-2xl flex items-center justify-between gap-4 py-3">
                        <div className="w-1/3 flex gap-1 h-8">
                            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="w-1 h-full rounded-full" />)}
                        </div>
                        <div className="flex-1 space-y-2 text-center">
                            <Skeleton className="h-6 w-48 mx-auto" />
                            <Skeleton className="h-4 w-32 mx-auto" />
                        </div>
                        <div className="w-1/3 flex justify-end gap-2">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <Skeleton className="w-10 h-10 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Info Container Shimmer */}
                <div className="relative p-8 md:p-10 bg-surface/20 border border-muted/5 space-y-8">
                    <div className="flex gap-8 items-start">
                        <Skeleton className="w-32 h-24 rounded-2xl" />
                        <div className="flex-1 space-y-4">
                            <div className="flex gap-4 items-center">
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-10 w-64" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                    </div>
                    <div className="pt-8 border-t border-muted/10 flex gap-6">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
            </div>

            {/* Grid of other radios Shimmer */}
            <div className="space-y-6">
                <Skeleton className="h-8 w-64" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="aspect-video w-full rounded-xl" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
