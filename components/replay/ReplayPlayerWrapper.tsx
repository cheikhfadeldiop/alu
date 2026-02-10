"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { SliderVideoItem, findReplayBySlug } from "../../services/api";
import { ReplayPlayer } from "./ReplayPlayer";

interface ReplayPlayerWrapperProps {
    video?: SliderVideoItem;
}

export function ReplayPlayerWrapper({ video: initialVideo }: ReplayPlayerWrapperProps) {
    const params = useParams();
    const slug = params?.slug as string;
    const sectionRef = React.useRef<HTMLDivElement>(null);
    const [video, setVideo] = React.useState<SliderVideoItem | undefined>(initialVideo);
    const [isSearching, setIsSearching] = React.useState(!initialVideo);

    // If initialVideo changes (navigation between known videos), update state
    React.useEffect(() => {
        if (initialVideo) {
            setVideo(initialVideo);
            setIsSearching(false);
        }
    }, [initialVideo]);

    // Deep search if video is missing (deep-links or refresh on paginated items)
    React.useEffect(() => {
        if (!video && slug) {
            const deepSearch = async () => {
                setIsSearching(true);

                // 45s Safety Timeout for Search
                const timer = setTimeout(() => {
                    setIsSearching(false);
                }, 45000);

                try {
                    const found = await findReplayBySlug(slug);
                    if (found) {
                        clearTimeout(timer);
                        setVideo(found);
                    }
                } catch (err) {
                    console.error("Deep search failed:", err);
                } finally {
                    setIsSearching(false);
                }
            };
            deepSearch();
        }
    }, [video, slug]);

    // Scroll into view only when initialVideo or slug changes if needed, 
    // but the user wants to avoid jumping, so we remove the auto-scroll.

    return (
        <div ref={sectionRef} className="max-w-[1400px] mx-auto px-4 scroll-mt-24 min-h-[400px]">
            {video ? (
                <ReplayPlayer video={video} />
            ) : isSearching ? (
                <div className="w-full aspect-video bg-[#0a0a0a] flex flex-col items-center justify-center gap-6 border border-white/5 shadow-2xl overflow-hidden">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-red-600/20 rounded-full" />
                        <div className="absolute inset-0 w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div className="space-y-2 text-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 animate-pulse block">Recherche approfondie...</span>
                        <p className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Récupération de l'émission dans les archives</p>
                    </div>
                </div>
            ) : (
                <div className="w-full aspect-video bg-[#0a0a0a] flex flex-col items-center justify-center gap-6 border border-white/5 shadow-2xl overflow-hidden text-center px-10">
                    <div className="w-20 h-20 rounded-full bg-red-600/5 flex items-center justify-center border border-red-600/10">
                        <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-black text-white uppercase tracking-tighter">Épisode introuvable</h3>
                        <p className="text-xs text-white/40 max-w-xs mx-auto leading-relaxed">
                            Ce contenu n'est plus disponible ou a été déplacé dans les archives profondes.
                        </p>
                    </div>
                    <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all text-white border border-white/10">Réessayer la recherche</button>
                </div>
            )}
        </div>
    );
}
