import { EPGItem } from "../../types/api";

interface EPGScheduleViewProps {
    epgItems: EPGItem[]; // Should be filtered for the active channel
}

export function EPGScheduleView({ epgItems }: EPGScheduleViewProps) {
    if (!epgItems || epgItems.length === 0) {
        return (
            <div className="p-8 text-center text-white/40 bg-white/5 rounded-xl border border-white/10">
                <p>Programme non disponible pour le moment.</p>
            </div>
        );
    }

    // Sort by time just in case
    const sortedItems = [...epgItems].sort((a, b) => a.start_time.localeCompare(b.start_time));

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-white mb-4">Programme TV</h2>
            <div className="space-y-2">
                {sortedItems.map((item, idx) => {
                    const isCurrent = item.is_current;
                    return (
                        <div
                            key={idx}
                            className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${isCurrent
                                    ? "bg-red-600/10 border-red-600/50"
                                    : "bg-white/5 border-white/10 hover:bg-white/10"
                                }`}
                        >
                            <div className="w-16 text-sm font-bold text-white/80 shrink-0">
                                {item.start_time}
                            </div>
                            <div className="w-[2px] h-10 bg-white/10 shrink-0 self-stretch relative">
                                {isCurrent && <div className="absolute top-0 bottom-0 left-[-1px] right-[-1px] bg-red-500 w-[4px] rounded-full" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className={`text-sm font-bold truncate ${isCurrent ? "text-red-400" : "text-white"}`}>
                                    {item.program_title}
                                </h3>
                                <p className="text-xs text-white/50 truncate">
                                    {item.program_desc || "Aucune description"}
                                </p>
                            </div>
                            <div className="text-xs text-white/40 shrink-0">
                                {item.duration}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
