import { Skeleton } from "./Skeleton";

export function WordPressNewsShimmer() {
    return (
        <section className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-surface/30 backdrop-blur-sm rounded-lg p-1">
                <div className="w-full col-span-2">
                    <Skeleton className="w-full h-[520px] rounded-lg" />
                </div>
                <div className="w-full border rounded-lg p-2 border-muted/10 pl-4">
                    <div className="bg-surface/50 w-full rounded-lg p-1 flex mb-4">
                        <Skeleton className="h-10 w-1/2 rounded-md mx-1" />
                        <Skeleton className="h-10 w-1/2 rounded-md mx-1" />
                    </div>
                    <div className="h-[440px] space-y-4 px-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex gap-4 items-start p-3 border-b border-muted/20">
                                <Skeleton className="w-24 h-20 rounded flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2 mt-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export function LiveChannelsShimmer() {
    return (
        <section className="space-y-6">
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-64" />
                </div>
                <Skeleton className="h-10 w-24 rounded-full" />
            </div>
            <div className="flex gap-6 overflow-hidden pb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-[300px] h-[220px] rounded-xl bg-surface/30 backdrop-blur-sm overflow-hidden flex-shrink-0">
                        <Skeleton className="h-[65%] w-full" />
                        <div className="h-[35%] p-3 space-y-3">
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-2 w-1/4 rounded-full" />
                            </div>
                            <Skeleton className="h-3 w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export function DernieresEditionsShimmer() {
    return (
        <section className="w-full max-w-[1400px] mx-auto bg-surface/30 backdrop-blur-sm rounded-lg p-6 space-y-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex lg:flex-row flex-col gap-6">
                {/* Left 60% */}
                <div className="lg:w-3/5 space-y-4">
                    <Skeleton className="aspect-video w-full rounded-lg" />
                    <div className="mx-20 space-y-3 p-4 bg-background/50 rounded-lg">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>
                {/* Right 40% */}
                <div className="lg:w-2/5 space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex gap-3 p-2">
                            <Skeleton className="w-32 h-20 rounded shrink-0" />
                            <div className="flex-1 space-y-2 py-1">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-3 w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function EditorialChoiceShimmer() {
    return (
        <section className="space-y-6 pb-10">
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-64" />
                </div>
                <Skeleton className="h-4 w-24" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-center">
                {/* 30% Left */}
                <div className="lg:col-span-3 space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
                {/* 40% Middle */}
                <div className="lg:col-span-4">
                    <Skeleton className="aspect-video w-full rounded-lg" />
                </div>
                {/* 30% Right */}
                <div className="lg:col-span-3 space-y-6">
                    {[1, 2].map(i => (
                        <div key={i} className="flex gap-4">
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-3 w-2/3" />
                            </div>
                            <Skeleton className="w-24 h-24 rounded shrink-0" />
                        </div>
                    ))}
                </div>
            </div>
            {/* Row 2 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="aspect-[16/10] w-full rounded-lg" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                ))}
            </div>
        </section>
    );
}

export function RegionalCategoriesShimmer() {
    return (
        <section className="py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-6">
                        <Skeleton className="h-8 w-48" />
                        <div className="space-y-4 border-b border-muted/10 pb-6">
                            <Skeleton className="aspect-video w-full rounded-lg" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                        <div className="space-y-5">
                            {[1, 2, 3].map(j => (
                                <div key={j} className="flex gap-4">
                                    <Skeleton className="w-20 h-20 rounded shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-3 w-full" />
                                        <Skeleton className="h-3 w-full" />
                                        <Skeleton className="h-2 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export function CategoryWithAdShimmer() {
    return (
        <section className="space-y-8">
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-64" />
                </div>
                <Skeleton className="h-4 w-24" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="aspect-video w-full rounded-xl" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    ))}
                </div>
                <div className="lg:col-span-4">
                    <Skeleton className="h-full w-full min-h-[400px] rounded-[2.5rem]" />
                </div>
            </div>
        </section>
    );
}

export function ShortsShimmer() {
    return (
        <section className="space-y-6">
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <Skeleton className="h-10 w-24 rounded-full" />
            </div>
            <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="w-[200px] h-[350px] rounded-3xl flex-shrink-0" />
                ))}
            </div>
        </section>
    );
}

export function CorporateShimmer() {
    return (
        <section className="space-y-8">
            <div className="flex justify-between items-end">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-4 w-24" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-8 border border-muted/10 rounded-2xl bg-surface/30 space-y-4 h-[300px]">
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
        </section>
    );
}
