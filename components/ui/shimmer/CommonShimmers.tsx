import { Skeleton } from "./Skeleton";

export function TabsShimmer() {
    return (
        <div className="w-full space-y-6 py-6">
            <div className="flex gap-8 border-b border-muted/10 pb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-8 w-32" />
                ))}
            </div>
            <div className="flex gap-4">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <Skeleton key={i} className="h-4 w-24 rounded-full" />
                ))}
            </div>
        </div>
    );
}
