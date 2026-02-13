"use client";

import * as React from "react";
import Image from "next/image";
import Hls from "hls.js";
import { LiveChannel } from "../../types/api";
import { ensureAbsoluteUrl } from "../../services/api";
import { SafeImage } from "../ui/SafeImage";

interface LivePlayerSectionProps {
    channel: LiveChannel;
}

export function LivePlayerSection({ channel }: LivePlayerSectionProps) {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // State
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [volume, setVolume] = React.useState(1);
    const [isMuted, setIsMuted] = React.useState(false);
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [resolvedUrl, setResolvedUrl] = React.useState<string | null>(null);
    const [isResolving, setIsResolving] = React.useState(false);

    // HLS Features
    const [hlsInstance, setHlsInstance] = React.useState<Hls | null>(null);
    const [qualities, setQualities] = React.useState<{ height: number; index: number }[]>([]);
    const [currentQuality, setCurrentQuality] = React.useState<number>(-1); // -1 for Auto
    const [showQualityMenu, setShowQualityMenu] = React.useState(false);

    // 1. Resolve actual stream URL (Live Logic)
    React.useEffect(() => {
        let isAborted = false;

        const resolve = async () => {
            setResolvedUrl(null);
            setIsPlaying(false);
            setIsResolving(true);
            setError(null);

            try {
                // If it's a direct stream URL already
                if (channel.stream_url && (channel.stream_url.endsWith('.m3u8') || channel.stream_url.includes('playlist.m3u8'))) {
                    if (!isAborted) {
                        setResolvedUrl(channel.stream_url);
                        return;
                    }
                }

                // Fetch from feed_url
                if (channel.feed_url) {
                    const response = await fetch(channel.feed_url).catch(() => null);
                    if (response && response.ok) {
                        const data = await response.json();
                        const directUrl = data.direct_url || data.web_url || data.stream_url || data.url;

                        if (directUrl && !isAborted) {
                            setResolvedUrl(ensureAbsoluteUrl(directUrl));
                            return;
                        }
                    }
                }

                // Fallback to stream_url if nothing else worked
                if (channel.stream_url && !isAborted) {
                    setResolvedUrl(ensureAbsoluteUrl(channel.stream_url));
                    return;
                }

                throw new Error("Impossible de charger le flux en direct.");
            } catch (err: any) {
                console.error("Live Resolution Error:", err);
                if (!isAborted) {
                    setError(err.message || "Erreur de chargement.");
                    setIsResolving(false);
                }
            }
        };

        resolve();
        return () => { isAborted = true; };
    }, [channel.id, channel.feed_url, channel.stream_url]);

    // 2. HLS & Video Initialization
    React.useEffect(() => {
        const videoEl = videoRef.current;
        if (!videoEl || !resolvedUrl) return;

        let hls: Hls;

        const initPlayer = () => {
            if (Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                });
                hls.loadSource(resolvedUrl);
                hls.attachMedia(videoEl);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    const levels = hls.levels.map((level, index) => ({
                        height: level.height,
                        index: index
                    })).sort((a, b) => b.height - a.height);
                    setQualities(levels);

                    videoEl.play().catch(() => {
                        setIsResolving(false);
                    });
                });

                hls.on(Hls.Events.ERROR, (_event, data) => {
                    if (data.fatal) {
                        setIsResolving(false);
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                hls.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                hls.recoverMediaError();
                                break;
                            default:
                                hls.destroy();
                                setError("Erreur fatale du flux vidéo.");
                                break;
                        }
                    }
                });
                setHlsInstance(hls);
            } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
                videoEl.src = resolvedUrl;
                videoEl.play().catch(() => setIsResolving(false));
            } else {
                setError("Votre navigateur ne supporte pas ce format vidéo.");
                setIsResolving(false);
            }
        };

        initPlayer();

        return () => {
            if (hls) hls.destroy();
            setHlsInstance(null);
        };
    }, [resolvedUrl]);

    // 3. Controls Handlers
    const togglePlay = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    };

    React.useEffect(() => {
        const v = videoRef.current;
        if (!v) return;

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onPlaying = () => setIsResolving(false);
        const onWaiting = () => setIsResolving(true);
        const onLoadStart = () => setIsResolving(true);

        v.addEventListener('play', onPlay);
        v.addEventListener('pause', onPause);
        v.addEventListener('playing', onPlaying);
        v.addEventListener('waiting', onWaiting);
        v.addEventListener('loadstart', onLoadStart);

        return () => {
            v.removeEventListener('play', onPlay);
            v.removeEventListener('pause', onPause);
            v.removeEventListener('playing', onPlaying);
            v.removeEventListener('waiting', onWaiting);
            v.removeEventListener('loadstart', onLoadStart);
        };
    }, []);

    const toggleMute = () => {
        if (videoRef.current) {
            const nextMuted = !isMuted;
            videoRef.current.muted = nextMuted;
            setIsMuted(nextMuted);
            if (nextMuted) setVolume(0);
            else {
                setVolume(1);
                videoRef.current.volume = 1;
            }
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        if (videoRef.current) {
            videoRef.current.volume = val;
            const nextMuted = val === 0;
            videoRef.current.muted = nextMuted;
            setIsMuted(nextMuted);
        }
    };

    const toggleFullscreen = () => {
        const videoEl = videoRef.current;
        if (!videoEl) return;
        videoEl.controls = true;

        if (videoEl.requestFullscreen) {
            videoEl.requestFullscreen();
        } else if ((videoEl as any).webkitRequestFullscreen) {
            (videoEl as any).webkitRequestFullscreen();
        } else if ((videoEl as any).webkitEnterFullscreen) {
            (videoEl as any).webkitEnterFullscreen();
        }
    };

    React.useEffect(() => {
        const handleFsChange = () => {
            if (!document.fullscreenElement && videoRef.current) {
                videoRef.current.controls = false;
                setIsFullscreen(false);
            } else {
                setIsFullscreen(true);
            }
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        document.addEventListener('webkitfullscreenchange', handleFsChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFsChange);
            document.removeEventListener('webkitfullscreenchange', handleFsChange);
        };
    }, []);

    const changeQuality = (index: number) => {
        if (hlsInstance) {
            hlsInstance.currentLevel = index;
            setCurrentQuality(index);
            setShowQualityMenu(false);
        }
    };

    return (
        <div ref={containerRef} className="w-full space-y-4">
            <div className="w-full overflow-hidden group/player rounded-sm bg-black shadow-2xl">
                <div className="relative aspect-video flex items-center justify-center bg-black overflow-hidden group/screen">

                    {/* Video Canvas */}
                    <video
                        ref={videoRef}
                        className={`w-full h-full object-contain cursor-pointer transition-opacity duration-700 ${isResolving || error ? 'opacity-0' : 'opacity-100'}`}
                        onClick={togglePlay}
                        onEnded={() => setIsPlaying(false)}
                        poster={channel.affiche_url || channel.logo_url || channel.logo || undefined}
                        playsInline
                        autoPlay
                    />

                    {/* Overlays */}
                    {error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-center px-12 z-10 bg-black">
                            <div className="w-20 h-20 rounded-full bg-red-600/10 flex items-center justify-center border border-red-600/20">
                                <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Flux indisponible</h3>
                                <p className="text-sm text-white/40 max-w-sm mx-auto leading-relaxed">{error}</p>
                            </div>
                            <button onClick={() => window.location.reload()} className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-600/20">Réessayer</button>
                        </div>
                    )}

                    {isResolving && !error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-20 bg-black">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-red-600/20 rounded-full" />
                                <div className="absolute inset-0 w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-red-600 animate-pulse">Chargement en cours...</span>
                        </div>
                    )}

                    {!isPlaying && !error && !isResolving && (
                        <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition-all group/play z-20">
                            <div className="w-20 h-20 rounded-full bg-white/5 backdrop-blur-3xl border border-white/20 flex items-center justify-center group-hover/play:scale-110 group-hover/play:bg-red-600 group-hover/play:border-red-500 transition-all duration-700 shadow-[0_0_50px_rgba(220,38,38,0.3)]">
                                <svg className="w-12 h-12 text-white ml-2 drop-shadow-2xl" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            </div>
                        </button>
                    )}

                    {/* Live Badge (Top Right) */}
                    <div className="absolute top-6 right-6 z-30">
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-lg shadow-xl animate-pulse">
                            <span className="w-2 h-2 bg-white rounded-full" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">EN DIRECT</span>
                        </div>
                    </div>
                </div>

                {/* CONTROLS AREA */}
                <div className="h-24 bg-[#0a0a0a]/80 backdrop-blur-md border-t border-white/5 flex flex-col justify-center px-10 relative group/controls">

                    {/* Minimal Progress Line for Live (Static) */}
                    <div className="absolute -top-0.5 left-0 w-full h-1 bg-red-600/20">
                        <div className="h-full bg-red-600 w-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                    </div>

                    <div className="flex items-center justify-between w-full">
                        {/* LEFT: Volume */}
                        <div className="flex items-center gap-6 w-1/3">
                            <button onClick={toggleMute} className="text-white/40 hover:text-white transition-colors">
                                {isMuted || volume === 0 ? (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                )}
                            </button>
                            <input
                                type="range"
                                min={0} max={1} step={0.05}
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-24 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-red-600"
                            />
                        </div>

                        {/* CENTER: Play Button */}
                        <div className="flex justify-center w-1/3">
                            <button onClick={togglePlay} className="w-14 h-14 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-red-600 hover:border-red-500 transition-all duration-300 shadow-2xl">
                                {isPlaying ? (
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                ) : (
                                    <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                )}
                            </button>
                        </div>

                        {/* RIGHT: Quality & Fullscreen */}
                        <div className="flex items-center justify-end gap-6 w-1/3">
                            <div className="relative">
                                <button
                                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                                    className={`text-[10px] font-black uppercase tracking-widest border px-3 py-1 rounded-lg transition-all ${showQualityMenu ? 'bg-red-600 border-red-600 text-white' : 'text-white/40 border-white/10 hover:text-white hover:border-red-600'}`}
                                >
                                    {currentQuality === -1 ? 'Auto' : `${qualities.find(q => q.index === currentQuality)?.height}P`}
                                </button>
                                {showQualityMenu && qualities.length > 0 && (
                                    <div className="absolute bottom-full mb-4 right-0 w-36 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                                        <div className="p-2 space-y-1">
                                            <button onClick={() => changeQuality(-1)} className={`w-full px-4 py-2 text-[9px] font-black uppercase text-left rounded-lg transition-colors ${currentQuality === -1 ? 'bg-red-600/20 text-red-500' : 'text-white/40 hover:bg-white/5'}`}>Auto</button>
                                            {qualities.map(q => (
                                                <button key={q.index} onClick={() => changeQuality(q.index)} className={`w-full px-4 py-2 text-[9px] font-black uppercase text-left rounded-lg transition-colors ${currentQuality === q.index ? 'bg-red-600/20 text-red-500' : 'text-white/40 hover:bg-white/5'}`}>{q.height}P</button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button onClick={toggleFullscreen} className="text-white/40 hover:text-white transition-all transform hover:scale-110">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Container */}
            <div className="relative p-8 md:p-10  backdrop-blur-3xl bg-background/85   border border-white/5 overflow-hidden group/info">
                {/* Decoration Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 blur-[100px] pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-center items-center md:items-start gap-8">
                    {/* Channel Logo */}
                    <div className="relative w-32 h-24 rounded-2xl bg-black/5 p-4 border border-white/10 shadow-inner flex items-center justify-center overflow-hidden shrink-0">
                        <SafeImage
                            src={channel.hd_logo || channel.logo || "/assets/placeholders/radio_icon_sur_card.png"}
                            alt={channel.title}
                            fill
                            className="object-contain brightness-110 drop-shadow-md"
                        />
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-center md:text-left justify-center items-center space-y-4">
                        {/* Header: Status + Title */}
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <div className="flex items-center gap-2 px-3 py-1">
                                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Live</span>
                                <svg color="red" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black  uppercase tracking-tighter drop-shadow-sm">
                                {channel.title}
                            </h2>
                        </div>


                    </div>


                    {/* Share Button (Top Right Desktop) */}
                    <div className="absolute top-0 right-0 p-4 shrink-0">
                        <button className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-2xl bg-foreground/5 hover:bg-white/10 border border-white/5 transition-all duration-300  group/share">
                            <svg className="w-6 h-6 md:w-8 md:h-8 transition-transform group-hover/share:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                        </button>
                    </div>
                </div>
                {/* Description */}
                <div className="max-w-3xl pt-4 pb-8">
                    <p className="text-sm md:text-base text-foreground/50 leading-relaxed font-medium">
                        {channel.desc || "Votre Chaîne, au cœur de l'actualité et de la culture. Restez à l'écoute pour nos programmes variés."}
                    </p>
                </div>

                {/* Program Info (New addition matching image) */}
                <div className="pt-4 flex flex-col md:flex-row md:items-center gap-4 md:gap-6 border-t border-white/5">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
                            {"JOURNAL EN DIRECT"}
                        </span>
                    </div>
                    <div className="hidden md:block w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-foreground/40 uppercase tracking-widest">PRÉSENTÉ DANS :</span>
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                            {channel.title || "JOURNAL EN DIRECT"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
