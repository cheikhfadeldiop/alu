"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { LiveChannel } from "../../types/api";

interface RadioPlayerSectionProps {
    channel: LiveChannel;
}

export function RadioPlayerSection({ channel }: RadioPlayerSectionProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [streamUrl, setStreamUrl] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isActuallyPlaying, setIsActuallyPlaying] = useState(false);
    const [volume, setVolume] = useState(0.7);
    const [isMuted, setIsMuted] = useState(false);
    const [retryTrigger, setRetryTrigger] = useState(0);
    const [isStreamDead, setIsStreamDead] = useState(false);

    // Fetch stream URL
    useEffect(() => {
        let mounted = true;

        async function fetchStream() {
            console.log(`[RadioPlayer] Fetching stream for ${channel.title}`);
            setLoading(true);
            setError(null);
            setIsPlaying(false);
            setIsActuallyPlaying(false);
            setIsStreamDead(false);

            try {
                if (!channel.stream_url) {
                    throw new Error("Aucune source de flux disponible");
                }

                if (mounted) {
                    console.log(`[RadioPlayer] Setting stream URL: ${channel.stream_url}`);
                    setStreamUrl(channel.stream_url);

                    // Try auto-play after a short delay
                    setTimeout(() => {
                        if (mounted && audioRef.current) {
                            console.log(`[RadioPlayer] Attempting auto-play`);
                            audioRef.current.play().catch((err) => {
                                console.log(`[RadioPlayer] Auto-play error:`, err.name, err.message);

                                // Check if it's an actual error or just autoplay policy
                                if (err.name === 'NotAllowedError') {
                                    // Auto-play blocked by browser policy - OK, user can click play
                                    // Just hide loader so play button is visible
                                    setLoading(false);
                                } else {
                                    // Other errors (NotSupportedError, NetworkError, etc.)
                                    // This means the stream is likely offline or broken
                                    console.error("[RadioPlayer] Autoplay failed due to stream error");
                                    // Don't hide loader immediately, let handleError event handle it with the 5s check
                                    // OR force error if we want immediate feedback
                                    // Let's set error immediately if it's clearly not an autoplay block
                                    const errorMsg = "La radio semble être hors ligne (Erreur de lecture)";
                                    setError(errorMsg);
                                    setLoading(false);
                                    setIsStreamDead(true);
                                }
                            });
                        }
                    }, 500);
                }
            } catch (err) {
                console.error("[RadioPlayer] Failed to fetch stream", err);
                if (mounted) {
                    const errorMsg = err instanceof Error ? err.message : "Erreur de chargement du flux";
                    setError(errorMsg);
                    setLoading(false);
                    setIsStreamDead(true);
                }
            }
        }

        fetchStream();

        return () => {
            mounted = false;
        };
    }, [channel, retryTrigger]);

    // Cleanup when channel changes
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        console.log(`[RadioPlayer] Channel changed to ${channel.title}`);

        return () => {
            console.log(`[RadioPlayer] Cleanup audio for ${channel.title}`);
            audio.pause();
            audio.currentTime = 0;
            setIsPlaying(false);
            setIsActuallyPlaying(false);
        };
    }, [channel.id, channel.slug, channel.title]);

    // Handle audio element events
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        let playingTimeout: NodeJS.Timeout;
        let errorTimeout: NodeJS.Timeout;

        const handlePlay = () => {
            console.log(`[RadioPlayer] Audio play event triggered`);
            setIsPlaying(true);
            setIsStreamDead(false);

            // Clear any previous error timeout
            clearTimeout(errorTimeout);

            // Set timeout to detect streams that never start (45s for very slow streams)
            playingTimeout = setTimeout(() => {
                if (!isActuallyPlaying) {
                    console.error(`[RadioPlayer] Stream never started playing after 45s`);
                    setError("Le flux ne répond pas - la radio est hors ligne");
                    setLoading(false);
                    setIsPlaying(false);
                    setIsStreamDead(true);
                    audio.pause();
                }
            }, 45000); // 45 secondes
        };

        const handlePause = () => {
            console.log(`[RadioPlayer] Audio paused`);
            setIsPlaying(false);
            setIsActuallyPlaying(false);
            clearTimeout(playingTimeout);
            clearTimeout(errorTimeout);
        };

        const handleError = (e: Event) => {
            const audioElement = e.target as HTMLAudioElement;
            console.error(`[RadioPlayer] Audio element error:`, audioElement.error);

            // Don't immediately show error - some streams recover
            // Wait 5 seconds to see if it's a temporary glitch
            clearTimeout(errorTimeout);
            errorTimeout = setTimeout(() => {
                let errorMessage = "Impossible de lire ce flux radio";
                let shouldMarkDead = true;

                if (audioElement.error) {
                    switch (audioElement.error.code) {
                        case MediaError.MEDIA_ERR_NETWORK:
                            errorMessage = "Erreur réseau - la radio semble hors ligne";
                            break;
                        case MediaError.MEDIA_ERR_DECODE:
                            errorMessage = "Format audio non supporté";
                            break;
                        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                            errorMessage = "La radio est hors ligne ou le flux est indisponible";
                            break;
                        case MediaError.MEDIA_ERR_ABORTED:
                            // Don't show error for aborted - user might have clicked pause
                            if (isPlaying) {
                                errorMessage = "Chargement interrompu";
                            } else {
                                shouldMarkDead = false;
                                return; // Don't set error
                            }
                            break;
                    }
                }

                if (shouldMarkDead) {
                    setError(errorMessage);
                    setIsPlaying(false);
                    setIsActuallyPlaying(false);
                    setLoading(false);
                    setIsStreamDead(true);
                }
            }, 5000); // 5 secondes avant de marquer comme mort

            clearTimeout(playingTimeout);
        };

        const handleLoadStart = () => {
            console.log(`[RadioPlayer] Audio load started`);
            // Keep loading true
        };

        const handleLoadedMetadata = () => {
            console.log(`[RadioPlayer] Audio metadata loaded`);
        };

        const handleCanPlay = () => {
            console.log(`[RadioPlayer] Audio can play (buffered enough)`);
            // Don't hide loader yet - wait for actual playback
        };

        const handleWaiting = () => {
            console.log(`[RadioPlayer] Audio waiting (buffering)`);
            // Show buffering state but don't stop "actually playing" immediately
            // Some streams buffer frequently
        };

        const handlePlaying = () => {
            console.log(`[RadioPlayer] Audio is ACTUALLY playing now`);
            setLoading(false);
            setIsActuallyPlaying(true);
            setError(null);
            setIsStreamDead(false);
            clearTimeout(playingTimeout);
            clearTimeout(errorTimeout);
        };

        const handleStalled = () => {
            console.log(`[RadioPlayer] Audio stalled (temporary)`);
            // Don't immediately stop "actually playing" - might recover
        };

        const handleProgress = () => {
            // Audio is downloading - good sign
            if (loading && isPlaying && !isActuallyPlaying) {
                console.log(`[RadioPlayer] Audio is downloading...`);
            }
        };

        const handleSuspend = () => {
            console.log(`[RadioPlayer] Audio suspended (normal for streams)`);
            // This is normal for live streams, don't treat as error
        };

        audio.addEventListener("play", handlePlay);
        audio.addEventListener("pause", handlePause);
        audio.addEventListener("error", handleError);
        audio.addEventListener("loadstart", handleLoadStart);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("canplay", handleCanPlay);
        audio.addEventListener("waiting", handleWaiting);
        audio.addEventListener("playing", handlePlaying);
        audio.addEventListener("stalled", handleStalled);
        audio.addEventListener("progress", handleProgress);
        audio.addEventListener("suspend", handleSuspend);

        return () => {
            clearTimeout(playingTimeout);
            clearTimeout(errorTimeout);
            audio.removeEventListener("play", handlePlay);
            audio.removeEventListener("pause", handlePause);
            audio.removeEventListener("error", handleError);
            audio.removeEventListener("loadstart", handleLoadStart);
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("canplay", handleCanPlay);
            audio.removeEventListener("waiting", handleWaiting);
            audio.removeEventListener("playing", handlePlaying);
            audio.removeEventListener("stalled", handleStalled);
            audio.removeEventListener("progress", handleProgress);
            audio.removeEventListener("suspend", handleSuspend);
        };
    }, [isActuallyPlaying, isPlaying, loading]);

    // Update audio volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    const handlePlayPause = () => {
        if (!audioRef.current || !streamUrl) {
            console.log(`[RadioPlayer] Cannot play - no stream URL`);
            return;
        }

        if (isPlaying) {
            console.log(`[RadioPlayer] Pausing audio`);
            audioRef.current.pause();
        } else {
            console.log(`[RadioPlayer] Starting playback of ${streamUrl}`);
            setLoading(true);
            setError(null); // Clear previous errors
            setIsStreamDead(false);
            audioRef.current.play().catch((err) => {
                console.error("[RadioPlayer] Playback failed:", err);
                setError("Impossible de lire le flux audio");
                setLoading(false);
                setIsActuallyPlaying(false);
                setIsStreamDead(true);
            });
        }
    };

    const handleRetry = () => {
        console.log(`[RadioPlayer] Retry triggered - reloading stream`);

        // Stop current playback
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        // Reset all states
        setStreamUrl("");
        setError(null);
        setLoading(true);
        setIsPlaying(false);
        setIsActuallyPlaying(false);
        setIsStreamDead(false);

        // Trigger refetch
        setRetryTrigger(prev => prev + 1);
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    const frequency = channel.desc?.match(/(\d+\.?\d*)\s*(FM|MHz)/i)?.[0] || "FM";

    return (
        <div className="w-full space-y-6">
            {/* Main Player Container */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black dark:from-black dark:via-gray-900 dark:to-gray-800 p-8 border border-white/10">
                {/* Loading Overlay */}
                {loading && !error && !isStreamDead && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-white text-lg font-semibold">Chargement de la radio...</p>
                            <p className="text-white/60 text-sm mt-2">{channel.title}</p>
                            <p className="text-white/40 text-xs mt-2">Cela peut prendre jusqu'à 45 secondes...</p>
                        </div>
                    </div>
                )}

                {/* Stream Dead Overlay */}
                {isStreamDead && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="text-center max-w-md px-6">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                            </div>
                            <h3 className="text-white text-xl font-bold mb-3">Radio Hors Ligne</h3>
                            <p className="text-white/70 text-sm mb-6">
                                {error || "La radio est actuellement indisponible. Le flux pourrait être temporairement hors ligne."}
                            </p>
                            <button
                                onClick={handleRetry}
                                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Réessayer
                            </button>
                        </div>
                    </div>
                )}

                {/* Background Waveform Pattern */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
                        <path
                            d="M0,200 Q50,150 100,200 T200,200 T300,200 T400,200 T500,200 T600,200 T700,200 T800,200 T900,200 T1000,200"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-white/30"
                        >
                            {isActuallyPlaying && (
                                <animate
                                    attributeName="d"
                                    dur="2s"
                                    repeatCount="indefinite"
                                    values="M0,200 Q50,150 100,200 T200,200 T300,200 T400,200 T500,200 T600,200 T700,200 T800,200 T900,200 T1000,200;
                                            M0,200 Q50,250 100,200 T200,200 T300,200 T400,200 T500,200 T600,200 T700,200 T800,200 T900,200 T1000,200;
                                            M0,200 Q50,150 100,200 T200,200 T300,200 T400,200 T500,200 T600,200 T700,200 T800,200 T900,200 T1000,200"
                                />
                            )}
                        </path>
                    </svg>
                </div>

                {/* Collapse Button */}
                <button
                    className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                    aria-label="Collapse"
                >
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-4">
                        <Image
                            src={channel.logo_url || channel.logo || "/assets/placeholders/radio_icon_sur_card.png"}
                            alt={channel.title}
                            width={120}
                            height={40}
                            className="object-contain"
                        />
                    </div>

                    <div className="text-6xl font-bold text-white mb-8 tracking-tight">
                        {frequency}
                    </div>

                    {/* Circular Player Control */}
                    <div className="relative w-64 h-64 mb-8">
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="2"
                            />
                            {isActuallyPlaying && (
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="url(#gradient)"
                                    strokeWidth="2"
                                    strokeDasharray="283"
                                    strokeDashoffset="0"
                                    strokeLinecap="round"
                                >
                                    <animate
                                        attributeName="stroke-dashoffset"
                                        from="283"
                                        to="0"
                                        dur="60s"
                                        repeatCount="indefinite"
                                    />
                                </circle>
                            )}
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#ef4444" />
                                    <stop offset="100%" stopColor="#22c55e" />
                                </linearGradient>
                            </defs>
                        </svg>

                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl flex items-center justify-center">
                                <div className="flex items-center gap-4">
                                    <button
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/50 cursor-not-allowed"
                                        disabled
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
                                        </svg>
                                    </button>

                                    <button
                                        onClick={handlePlayPause}
                                        disabled={loading || isStreamDead}
                                        className="w-16 h-16 flex items-center justify-center rounded-full bg-white text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                    >
                                        {loading && !isStreamDead ? (
                                            <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                                        ) : isPlaying ? (
                                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                            </svg>
                                        )}
                                    </button>

                                    <button
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/50 cursor-not-allowed"
                                        disabled
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Metadata */}
                    <div className="w-full max-w-2xl">
                        {/* Waveform Visualization */}
                        <div className="flex items-center justify-center gap-1 h-16 mb-4">
                            {Array.from({ length: 60 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1 rounded-full bg-white/30"
                                    style={{
                                        height: `${isActuallyPlaying ? 10 + ((i * 7) % 40) : 10}px`,
                                        animation: isActuallyPlaying ? `crtvWave ${900 + (i % 7) * 120}ms ease-in-out ${(i % 9) * 60}ms infinite alternate` : 'none',
                                    }}
                                />
                            ))}
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="text-white font-bold text-lg">{channel.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-white/60 mt-1">
                                    <span className="flex items-center gap-1">
                                        <span className={`w-2 h-2 rounded-full ${isActuallyPlaying ? 'bg-red-500 animate-pulse'
                                            : isStreamDead ? 'bg-gray-500'
                                                : loading && isPlaying ? 'bg-yellow-500 animate-pulse'
                                                    : 'bg-gray-500'
                                            }`} />
                                        {isActuallyPlaying ? 'En direct'
                                            : isStreamDead ? 'Hors ligne'
                                                : loading && isPlaying ? 'Connexion...'
                                                    : 'Prêt'}
                                    </span>
                                    <span>•</span>
                                    <span>{new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                </button>

                                <button
                                    onClick={toggleMute}
                                    disabled={!isActuallyPlaying}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isMuted ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        </svg>
                                    )}
                                </button>

                                <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error State with Retry - Only show if not already showing dead overlay */}
            {error && !isStreamDead && (
                <div className="flex items-center justify-center gap-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                        <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-red-500 text-sm font-medium">{error}</p>
                    </div>
                    <button
                        onClick={handleRetry}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
                    >
                        Réessayer
                    </button>
                </div>
            )}

            {/* Channel Description */}
            <div className="p-6 bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-xl border border-gray-200 dark:border-white/10">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-white/5 p-2 border border-gray-200 dark:border-white/10">
                        <Image
                            src={channel.logo_url || channel.logo || "/assets/placeholders/radio_icon_sur_card.png"}
                            alt={channel.title}
                            width={64}
                            height={64}
                            className="object-contain w-full h-full"
                        />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{channel.title}</h2>
                        <p className="text-sm text-gray-600 dark:text-white/60">
                            {channel.desc || "Radio en direct du Cameroun"}
                        </p>
                    </div>
                    <div className="hidden sm:block">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${isActuallyPlaying
                            ? 'bg-red-600/10 text-red-500 border border-red-600/20'
                            : isStreamDead
                                ? 'bg-gray-600/10 text-gray-500 border border-gray-600/20'
                                : loading && isPlaying
                                    ? 'bg-yellow-600/10 text-yellow-500 border border-yellow-600/20'
                                    : 'bg-gray-600/10 text-gray-500 border border-gray-600/20'
                            }`}>
                            <span className={`w-2 h-2 rounded-full ${isActuallyPlaying ? 'bg-red-500 animate-pulse'
                                : loading && isPlaying && !isStreamDead ? 'bg-yellow-500 animate-pulse'
                                    : 'bg-gray-500'
                                }`} />
                            {isActuallyPlaying ? 'LIVE'
                                : isStreamDead ? 'OFFLINE'
                                    : loading && isPlaying ? 'CONNECTING'
                                        : 'READY'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                src={streamUrl}
                preload="metadata"
                className="hidden"
            />
        </div>
    );
}