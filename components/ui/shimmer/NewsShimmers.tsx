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
