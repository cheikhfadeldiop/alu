"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { VideoPlayer } from "../ui/VideoPlayer";
import { LiveChannel } from "../../types/api";
import { getDirectPlayback } from "../../services/api"; // Assuming we can call this from client if we wrap in server action or just fetch from client
// Actually, 'getDirectPlayback' is an async function in services/api.ts which likely uses fetch on server. 
// If we use it on client, we need to ensure it works or generic fetch.
// Since 'services/api.ts' is simple fetch wrapper, it should work on client too if env vars are public or it just uses fetch.

interface LivePlayerSectionProps {
    channel: LiveChannel;
}

export function LivePlayerSection({ channel }: LivePlayerSectionProps) {
    const [streamUrl, setStreamUrl] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryTrigger, setRetryTrigger] = useState(0);

    useEffect(() => {
        let mounted = true;
        let timeoutId: NodeJS.Timeout;

        async function fetchStream() {
            setLoading(true);
            setError(null);

            // Set timeout to detect if channel is down (10 seconds)
            timeoutId = setTimeout(() => {
                if (mounted && loading) {
                    setError("La chaîne semble être hors ligne");
                    setLoading(false);
                }
            }, 10000);

            try {
                if (channel.type === "RADIO") {
                    // Radio usually has direct stream_url or needs simple fetch
                    if (channel.stream_url && (channel.stream_url.endsWith('.mp3') || channel.stream_url.endsWith('.aac') || channel.stream_url.startsWith('http'))) {
                        if (mounted) setStreamUrl(channel.stream_url);
                    } else if (channel.feed_url) {
                        // Logic for fetching radio feed if stream_url is missing?
                        // User said: "c'est le feed_url qui a le flux de la radio ... c'est a partir du 'feed_url' ... que tu peux avoir le 'direct_url'"
                        // BUT user json has stream_url present for radios.
                        if (channel.stream_url) {
                            if (mounted) setStreamUrl(channel.stream_url);
                        } else {
                            // Fallback check
                            if (mounted) {
                                setStreamUrl("");
                                setError("URL de flux non disponible");
                            }
                        }
                    }
                } else {
                    // TV Logic
                    // User said: "pour les video toujour c'est a partir du 'feed_url' ... que tu peux avoir le 'direct_url'"
                    // We can use our getDirectPlayback service which does exactly this if channel.id matches
                    // Fetch stream URL and handle loading
                    // For live channels, fetch the stream URL from feed_url
                    if (channel.feed_url) {
                        const response = await fetch(channel.feed_url);
                        const data = await response.json();

                        if (data?.direct_url || data?.web_url) {
                            const url = data.direct_url || data.web_url;
                            if (mounted) {
                                console.log(`[LivePlayer] Setting stream URL: ${url}`);
                                setStreamUrl(url);
                                // DON'T set loading to false here!
                                // Loading will be set to false when:
                                // 1. Video starts playing (in VideoPlayer component)
                                // 2. Error occurs
                                // 3. Timeout triggers
                            }
                        } else {
                            throw new Error("URL de flux introuvable");
                        }
                    } else if (channel.stream_url) {
                        // Fallback to direct stream_url if available
                        if (mounted) {
                            console.log(`[LivePlayer] Using direct stream_url: ${channel.stream_url}`);
                            setStreamUrl(channel.stream_url);
                        }
                    } else {
                        throw new Error("Aucune source de flux disponible");
                    }
                }
            } catch (err) {
                console.error("[LivePlayer] Failed to fetch stream:", err);
                if (mounted) {
                    setError(err instanceof Error ? err.message : "Erreur de chargement du flux");
                    setLoading(false);
                }
            } finally {
                clearTimeout(timeoutId);
            }
        }

        fetchStream();

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
        };
    }, [channel, retryTrigger]); // Added retryTrigger to dependencies

    const handleRetry = () => {
        setStreamUrl("");
        setError(null);
        setLoading(true);
        // Increment retry trigger to force useEffect to run again
        setRetryTrigger(prev => prev + 1);
    };

    // Poster Image
    const poster = channel.affiche_url || channel.logo_url || channel.logo || channel.hd_logo || channel.sd_logo;

    return (
        <div className="w-full space-y-4">
            <div className="aspect-video w-full rounded-xl overflow-hidden shadow-2xl bg-black border border-white/10">
                <VideoPlayer
                    streamUrl={streamUrl}
                    poster={poster}
                    autoplay={true}
                    key={channel.id} // Re-mount player on channel change to reset state
                />
            </div>

            {/* Error State with Retry */}
            {error && (
                <div className="flex items-center justify-center gap-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-500 text-sm font-medium">{error}</p>
                    <button
                        onClick={handleRetry}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                        Réessayer
                    </button>
                </div>
            )}

            {/* Info Container */}
            <div className="p-6 bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-xl border border-gray-200 dark:border-white/10">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-white/5 p-2 border border-gray-200 dark:border-white/10">
                            <Image
                                src={channel.logo_url || channel.logo || channel.hd_logo || channel.sd_logo || "/assets/placeholders/live_tv_frame.png"}
                                alt={channel.title}
                                width={64}
                                height={64}
                                className="object-contain w-full h-full"
                            />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{channel.title}</h1>
                            <p className="text-sm text-gray-600 dark:text-white/60">{channel.desc || "En direct du Cameroun"}</p>
                        </div>
                    </div>
                    <div className="hidden sm:block">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/10 text-red-500 border border-red-600/20 text-sm font-semibold">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            LIVE
                        </span>
                    </div>
                </div>

                {/* Next Show Logic could go here if we have it readily available (e.g. from EPG passed as prop) */}
            </div>
        </div>
    );
}
