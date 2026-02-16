import { Skeleton } from "./Skeleton";

export function InfoPageShimmer() {
    return (
        <div className="py-12 md:py-24 animate-pulse">
            <div className="max-w-4xl mx-auto space-y-12 px-4">
                {/* Hero Shimmer */}
                <div className="text-center space-y-6">
                    <Skeleton className="h-6 w-32 mx-auto rounded-full" />
                    <Skeleton className="h-16 w-3/4 mx-auto" />
                    <Skeleton className="h-1 w-24 mx-auto rounded-full mt-8" />
                </div>

                {/* Content Shimmer */}
                <div className="space-y-12 mt-20">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="h-8 w-1/3 mb-6" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                    ))}
                </div>

                {/* Footer Card Shimmer */}
                <Skeleton className="h-48 w-full rounded-[3rem] mt-24" />
            </div>
        </div>
    );
}

export function AboutPageShimmer() {
    return (
        <div className="py-12 md:py-24 animate-pulse">
            <div className="max-w-5xl mx-auto space-y-20 px-4">
                {/* Header Shimmer: Two text blocks with offset */}
                <div className="relative space-y-4">
                    <Skeleton className="h-20 md:h-24 w-1/2" />
                    <Skeleton className="h-20 md:h-24 w-1/2 ml-16" />
                    <div className="mt-8 border-l-4 border-muted/10 pl-6 space-y-2">
                        <Skeleton className="h-6 w-2/3" />
                        <Skeleton className="h-6 w-1/2" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    <div className="md:col-span-7 space-y-12">
                        {[1, 2].map(i => (
                            <div key={i} className="relative p-8 bg-surface/30 rounded-3xl border border-muted/5">
                                <div className="absolute -top-4 -left-4 w-12 h-12 bg-muted/20 rounded-xl" />
                                <div className="space-y-3">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-5/6" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="md:col-span-5 md:pt-20">
                        <div className="p-1 bg-muted/10 rounded-2xl rotate-3">
                            <div className="p-8 rounded-xl -rotate-3 bg-surface/20 space-y-4">
                                <Skeleton className="h-8 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10">
                    <div className="p-8 border-l-2 border-muted/10 space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                    <div className="p-8 border-l-2 border-muted/10 space-y-4 md:mt-12">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ContactPageShimmer() {
    return (
        <div className="space-y-10 animate-pulse">
            {/* Hero Shimmer */}
            <div className="relative rounded-3xl bg-surface/30 p-10 md:p-14 h-[300px] flex flex-col items-center justify-center space-y-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-6 w-3/4 max-w-2xl" />
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
                {/* Left Column Shimmer */}
                <div className="space-y-6">
                    <div className="rounded-xl border border-muted/10 bg-surface/20 p-6 space-y-8">
                        <Skeleton className="h-4 w-32" />
                        <div className="flex gap-4">
                            <Skeleton className="w-12 h-12 rounded-sm" />
                            <div className="flex-1 space-y-2 py-1">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-5 w-full" />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Skeleton className="w-12 h-12 rounded-sm" />
                            <div className="flex-1 space-y-2 py-1">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-5 w-full" />
                            </div>
                        </div>
                    </div>
                    <Skeleton className="aspect-[4/3] w-full rounded-sm" />
                </div>

                {/* Right Column (Form) Shimmer */}
                <div className="rounded-sm border border-muted/10 bg-surface/20 p-8 md:p-10 space-y-8">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-1 w-12 rounded-full" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-12 w-full rounded-sm" />
                            </div>
                        ))}
                    </div>
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-12 w-full rounded-sm" />
                    </div>
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-[200px] w-full rounded-sm" />
                    </div>
                    <div className="flex justify-between items-center pt-4">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-12 w-40 rounded-sm" />
                    </div>
                </div>
            </div>
        </div>
    );
}


export function CommitmentsPageShimmer() {
    return (
        <div className="py-12 md:py-24 animate-pulse">
            <div className="max-w-5xl mx-auto space-y-20 px-4">
                <div className="space-y-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-20 md:h-24 w-2/3" />
                </div>

                <div className="space-y-12">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-8 items-start">
                            <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
                            <div className="flex-1 space-y-4 pt-2">
                                <Skeleton className="h-10 w-1/3" />
                                <Skeleton className="h-6 w-3/4" />
                                <div className="h-[1px] w-full bg-muted/10 mt-4" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-24">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="aspect-square rounded-3xl" />
                    ))}
                </div>
            </div>
        </div>
    );
}
