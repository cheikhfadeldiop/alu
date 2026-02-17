import { Skeleton } from "./Skeleton";

export function CorporatePageShimmer() {
    return (
        <div className="max-w-[1400px] mx-auto px-4 py-12 space-y-12 animate-pulse">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Content - 70% */}
                <div className="lg:w-[70%] space-y-8">
                    <div className="flex justify-between items-end">
                        <Skeleton className="h-12 w-80" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                            <div key={i} className="p-8 border border-muted/10 rounded-2xl bg-surface/30 space-y-4 h-[320px]">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                                <div className="mt-auto flex gap-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ad Banner - 30% */}
                <div className="lg:w-[30%]">
                    <Skeleton className="h-[600px] w-full rounded-2xl" />
                </div>
            </div>
        </div>
    );
}
