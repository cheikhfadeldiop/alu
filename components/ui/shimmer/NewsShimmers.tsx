import { Skeleton } from "./Skeleton";

export function NewsTopBarShimmer() {
    return (
        <section className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 bg-[var(--fig-surface)]/95">
            <div className="mx-auto flex h-[120px] w-full max-w-[1280px] items-center px-4 xl:px-0">
                <div className="w-full pb-[10px]">
                    <div className="no-scrollbar flex items-center gap-[40px] overflow-x-auto whitespace-nowrap">
                        {Array.from({ length: 6 }, (_, index) => (
                            <Skeleton key={index} className="h-[30px] w-[120px] rounded-md" />
                        ))}
                    </div>
                    <div className="mt-[12px] flex justify-end gap-[8px]">
                        <Skeleton className="h-[14px] w-[14px] rounded-full" />
                        <Skeleton className="h-[14px] w-[14px] rounded-full" />
                    </div>
                </div>
            </div>
        </section>
    );
}

export function NewsHeroShimmer() {
    return (
        <section className="mt-[24px] space-y-[43px]">
            <div className="grid gap-[20px] xl:grid-cols-[566px_694px]">
                <Skeleton className="h-[462px] w-full rounded-[10px]" />
                <div className="grid gap-[17px] sm:grid-cols-2">
                    {[1, 2].map((index) => (
                        <div key={index} className="space-y-3">
                            <Skeleton className="h-[292px] w-full rounded-[10px]" />
                            <Skeleton className="h-6 w-5/6 rounded-md" />
                            <Skeleton className="h-4 w-2/3 rounded-md" />
                        </div>
                    ))}
                </div>
            </div>
            <div className="grid gap-[25px] sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((index) => (
                    <div key={index} className="space-y-3">
                        <Skeleton className="h-[230px] w-full rounded-[10px]" />
                        <Skeleton className="h-6 w-5/6 rounded-md" />
                        <Skeleton className="h-4 w-2/3 rounded-md" />
                    </div>
                ))}
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
        <div className="news-page-wrap px-4 pb-8 pt-[8px] xl:px-0">
            <div className="mb-[10px] mt-[2px]">
                <Skeleton className="h-5 w-24 rounded-md" />
            </div>
            <section className="mt-[6px] grid gap-[47px] xl:grid-cols-[781px_465px]">
                <div className="space-y-[34px]">
                    <Skeleton className="h-[445px] w-full rounded-[10px]" />
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full rounded-md" />
                        <Skeleton className="h-10 w-4/5 rounded-md" />
                        <Skeleton className="h-4 w-40 rounded-md" />
                    </div>
                    <div className="space-y-5">
                        {[1, 2, 3, 4, 5].map((index) => (
                            <Skeleton key={index} className="h-7 w-full rounded-md" />
                        ))}
                    </div>
                </div>
                <aside className="space-y-3">
                    <Skeleton className="h-8 w-56 rounded-md" />
                    <div className="space-y-[10px]">
                        {[1, 2, 3, 4, 5].map((index) => (
                            <Skeleton key={index} className="h-[115px] w-full rounded-[5px]" />
                        ))}
                    </div>
                    <Skeleton className="mt-10 h-[320px] w-full rounded-[10px]" />
                </aside>
            </section>
        </div>
    );
}
