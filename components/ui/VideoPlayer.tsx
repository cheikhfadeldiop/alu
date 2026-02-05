"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";

interface VideoPlayerProps {
    streamUrl: string;
    poster?: string;
    autoplay?: boolean;
    className?: string;
}

export function VideoPlayer({ streamUrl, poster, autoplay = false, className = "" }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    // State
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false); // Start false, update on event
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [qualityLevels, setQualityLevels] = useState<{ index: number, height: number }[]>([]);
    const [currentQuality, setCurrentQuality] = useState(-1); // -1 = Auto
    const [showQualityMenu, setShowQualityMenu] = useState(false);
    const [retryTrigger, setRetryTrigger] = useState(0);

    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initial Setup & HLS
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !streamUrl) return;

        setIsLoading(true);
        setError(null);
        setQualityLevels([]);

        let hls: Hls | null = null;
        let manifestTimeout: NodeJS.Timeout;

        // Set a timeout for manifest loading (15 seconds)
        manifestTimeout = setTimeout(() => {
            if (isLoading) {
                setError("Le flux vidéo ne répond pas");
                setIsLoading(false);
                if (hls) hls.destroy();
            }
        }, 15000);

        if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90,
                manifestLoadingTimeOut: 10000,
                manifestLoadingMaxRetry: 2,
                levelLoadingTimeOut: 10000,
            });

            hlsRef.current = hls;
            hls.loadSource(streamUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                clearTimeout(manifestTimeout);
                // DON'T set isLoading to false here!
                // Keep loading until video actually starts playing
                const levels = data.levels.map((l, idx) => ({ index: idx, height: l.height }));
                setQualityLevels(levels);

                if (autoplay) {
                    video.play().catch(e => {
                        console.warn("Autoplay blocked", e);
                        setIsMuted(true); // Fallback to muted autoplay
                        video.muted = true;
                        video.play().catch(e2 => {
                            console.error("Muted autoplay also blocked", e2);
                            // User needs to click play - hide loader to show controls
                            setIsLoading(false);
                        });
                    });
                }
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    clearTimeout(manifestTimeout);
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.error("Network error:", data);
                            setError("Erreur réseau - Impossible de charger le flux");
                            setIsLoading(false);
                            hls?.destroy();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error("Media error:", data);
                            hls?.recoverMediaError();
                            break;
                        default:
                            setError("Erreur fatale de lecture");
                            setIsLoading(false);
                            hls?.destroy();
                            break;
                    }
                }
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            // Native HLS
            video.src = streamUrl;
            video.addEventListener("loadedmetadata", () => {
                clearTimeout(manifestTimeout);
                setIsLoading(false);
                if (autoplay) video.play().catch(console.error);
            });
            video.addEventListener("error", () => {
                clearTimeout(manifestTimeout);
                setError("Erreur de chargement native");
                setIsLoading(false);
            });
        } else {
            clearTimeout(manifestTimeout);
            setError("Format non supporté");
            setIsLoading(false);
        }

        return () => {
            clearTimeout(manifestTimeout);
            if (hls) hls.destroy();
        };
    }, [streamUrl, autoplay, retryTrigger]); // Added retryTrigger

    // Cleanup timeout
    useEffect(() => {
        return () => {
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, []);

    // Event Listeners for Video Element
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => setCurrentTime(video.currentTime);
        const handleDurationChange = () => setDuration(video.duration);
        const handlePlay = () => {
            setIsPlaying(true);
        };
        const handlePause = () => setIsPlaying(false);
        const handlePlaying = () => {
            // Video is actually playing (not just starting)
            setIsLoading(false);
            console.log("[VideoPlayer] Video is playing, hiding loader");
        };
        const handleVolumeChange = () => {
            setVolume(video.volume);
            setIsMuted(video.muted);
        };
        const handleWaiting = () => {
            console.log("[VideoPlayer] Video buffering");
        };

        video.addEventListener("timeupdate", handleTimeUpdate);
        video.addEventListener("durationchange", handleDurationChange);
        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);
        video.addEventListener("playing", handlePlaying);
        video.addEventListener("waiting", handleWaiting);
        video.addEventListener("volumechange", handleVolumeChange);

        return () => {
            video.removeEventListener("timeupdate", handleTimeUpdate);
            video.removeEventListener("durationchange", handleDurationChange);
            video.removeEventListener("play", handlePlay);
            video.removeEventListener("pause", handlePause);
            video.removeEventListener("playing", handlePlaying);
            video.removeEventListener("waiting", handleWaiting);
            video.removeEventListener("volumechange", handleVolumeChange);
        };
    }, []);

    // Helper Functions
    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    };

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) video.play();
        else video.pause();
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = !video.muted;
    };

    const handleVolumeSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVol = parseFloat(e.target.value);
        const video = videoRef.current;
        if (video) {
            video.volume = newVol;
            video.muted = newVol === 0;
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        const video = videoRef.current;
        if (video) {
            video.currentTime = time;
        }
    };

    const toggleFullscreen = () => {
        const container = containerRef.current;
        if (!container) return;

        if (!document.fullscreenElement) {
            container.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
        }
    };

    const handleQualityChange = (levelIndex: number) => {
        if (hlsRef.current) {
            hlsRef.current.currentLevel = levelIndex;
            setCurrentQuality(levelIndex);
            setShowQualityMenu(false);
        }
    };

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds) || !isFinite(seconds)) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? "0" + secs : secs}`;
    };

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full bg-black group overflow-hidden ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setShowControls(false)}
        >
            <video
                ref={videoRef}
                poster={poster}
                className="w-full h-full object-contain"
                crossOrigin="anonymous"
                playsInline
                onClick={togglePlay}
            />

            {/* Loader */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Error Overlay */}
            {error && (
                <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center text-white z-50 gap-3">
                    <svg className="w-16 h-16 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-lg font-semibold text-red-500 mb-1">Erreur de lecture</p>
                    <p className="text-sm text-white/70 mb-4">{error}</p>
                    <button
                        onClick={() => {
                            setError(null);
                            setIsLoading(true);
                            setRetryTrigger(prev => prev + 1);
                        }}
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        Réessayer
                    </button>
                </div>
            )}

            {/* Controls Overlay */}
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 py-4 transition-opacity duration-300 ${showControls || !isPlaying ? "opacity-100" : "opacity-0"}`}>

                {/* Progress Bar */}
                <div className="relative w-full h-1 group mb-4 cursor-pointer flex items-center">
                    <div className="absolute w-full h-1 bg-white/30 rounded-full group-hover:h-1.5 transition-all" />
                    <div
                        className="absolute h-1 bg-red-600 rounded-full group-hover:h-1.5 transition-all"
                        style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                    />
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="absolute w-full h-full opacity-0 cursor-pointer"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Play/Pause */}
                        <button onClick={togglePlay} className="text-white hover:text-red-500 transition">
                            {isPlaying ? (
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                            ) : (
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            )}
                        </button>

                        {/* Volume */}
                        <div className="flex items-center gap-2 group/vol">
                            <button onClick={toggleMute} className="text-white hover:text-red-500 transition">
                                {isMuted || volume === 0 ? (
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
                                )}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeSeek}
                                className="w-0 overflow-hidden group-hover/vol:w-24 transition-all duration-300 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600"
                            />
                        </div>

                        {/* Time */}
                        <div className="text-white/80 text-xs font-mono">
                            {formatTime(currentTime)} / {duration && isFinite(duration) ? formatTime(duration) : "LIVE"}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Quality Selector */}
                        {qualityLevels.length > 0 && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                                    className="text-white hover:text-red-500 text-xs font-bold uppercase transition flex items-center gap-1"
                                >
                                    {currentQuality === -1 ? "Auto" : `${qualityLevels[currentQuality].height}p`}
                                    <svg className={`w-4 h-4 transition-transform ${showQualityMenu ? "rotate-180" : ""}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </button>
                                {showQualityMenu && (
                                    <div className="absolute bottom-full right-0 mb-2 bg-black/90 border border-white/10 rounded-lg overflow-hidden min-w-[100px] z-20">
                                        <button
                                            onClick={() => handleQualityChange(-1)}
                                            className={`block w-full text-left px-4 py-2 text-xs hover:bg-white/10 ${currentQuality === -1 ? "text-red-500 font-bold" : "text-white"}`}
                                        >
                                            Auto
                                        </button>
                                        {qualityLevels.map((level) => (
                                            <button
                                                key={level.index}
                                                onClick={() => handleQualityChange(level.index)}
                                                className={`block w-full text-left px-4 py-2 text-xs hover:bg-white/10 ${currentQuality === level.index ? "text-red-500 font-bold" : "text-white"}`}
                                            >
                                                {level.height}p
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Fullscreen */}
                        <button onClick={toggleFullscreen} className="text-white hover:text-red-500 transition">
                            {isFullscreen ? (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" /></svg>
                            ) : (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" /></svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

