"use client";

import * as React from "react";
import Image from "next/image";
import Hls from "hls.js";
import { LiveChannel, EPGItem } from "../../types/api";
import { ensureAbsoluteUrl } from "../../services/api";
import { SafeImage } from "../ui/SafeImage";
import { ShareButton } from "../ui/ShareButton";
import { SITE_CONFIG } from "@/constants/site-config";
import { useTranslations } from "next-intl";

interface LivePlayerSectionProps {
    channel: LiveChannel;
    currentProgram?: EPGItem;
}

// TEST: Set this to true to simulate a broken stream and test the 30s timeout
const SIMULATE_ERROR = false;
//const SIMILATE_TESTE = false;

export function LivePlayerSection({ channel, currentProgram }: LivePlayerSectionProps) {
    const t = useTranslations("common");
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // State
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [volume, setVolume] = React.useState(1);
    const [isMuted, setIsMuted] = React.useState(true);
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [resolvedUrl, setResolvedUrl] = React.useState<string | null>(null);
    const [isResolving, setIsResolving] = React.useState(false);
    const [retryNonce, setRetryNonce] = React.useState(0);
    const [streamTimeout, setStreamTimeout] = React.useState(false);

    // HLS Features
    const [hlsInstance, setHlsInstance] = React.useState<Hls | null>(null);
    const [qualities, setQualities] = React.useState<{ height: number; index: number }[]>([]);
    const [currentQuality, setCurrentQuality] = React.useState<number>(-1); // -1 for Auto
    const [showQualityMenu, setShowQualityMenu] = React.useState(false);

    // 1. Resolve actual stream URL (Live Logic)
    React.useEffect(() => {
        let isAborted = false;

        const resolve = async () => {
            if (SIMULATE_ERROR) {
                setError(null);
                setIsResolving(true);
                setResolvedUrl(null);
                return;
            }
            const nextUrl = channel.stream_url || "";
            if (nextUrl !== resolvedUrl) {
                setResolvedUrl(null);
                setIsPlaying(false);
                setIsResolving(true);
            }
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

                if (!isAborted) {
                    setError(t("streamUnavailable"));
                    setIsResolving(false);
                }
                return;
            } catch (err: any) {
                console.error("Live Resolution Error:", err);
                if (!isAborted) {
                    setError(err.message || t("streamUnavailable"));
                    setIsResolving(false);
                }
            }
        };

        resolve();
        return () => { isAborted = true; };
    }, [channel.id, channel.feed_url, channel.stream_url, retryNonce]);

    // 2. HLS & Video Initialization
    const hlsRef = React.useRef<Hls | null>(null);

    React.useEffect(() => {
        const videoEl = videoRef.current;
        if (!videoEl || !resolvedUrl) return;

        // Cleanup existing HLS if it's different
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        let hls: Hls;

        const initPlayer = () => {
            setIsResolving(true);
            videoEl.muted = isMuted;
            videoEl.volume = volume;

            if (Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90,
                });
                hlsRef.current = hls;
                hls.loadSource(resolvedUrl);
                hls.attachMedia(videoEl);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    const levels = hls.levels.map((level, index) => ({
                        height: level.height,
                        index: index
                    })).sort((a, b) => b.height - a.height);
                    setQualities(levels);
                    setIsResolving(false);

                    videoEl.play().catch((err) => {
                        console.warn("Autoplay blocked or failed:", err);
                    });
                });

                hls.on(Hls.Events.ERROR, (_event, data) => {
                    if (data.fatal) {
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                hls.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                hls.recoverMediaError();
                                break;
                            default:
                                hls.destroy();
                                setError(t("streamUnavailable"));
                                setIsResolving(false);
                                break;
                        }
                    }
                });
                setHlsInstance(hls);
            } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
                videoEl.src = resolvedUrl;
                videoEl.addEventListener('loadedmetadata', () => {
                    setIsResolving(false);
                    videoEl.play().catch(console.warn);
                });
            } else {
                setError(t("streamUnavailable"));
                setIsResolving(false);
            }
        };

        initPlayer();

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
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
        const onCanPlay = () => setIsResolving(false);
        const onLoadedData = () => setIsResolving(false);

        v.addEventListener('play', onPlay);
        v.addEventListener('pause', onPause);
        v.addEventListener('playing', onPlaying);
        v.addEventListener('waiting', onWaiting);
        v.addEventListener('loadstart', onLoadStart);
        v.addEventListener('canplay', onCanPlay);
        v.addEventListener('loadeddata', onLoadedData);

        return () => {
            v.removeEventListener('play', onPlay);
            v.removeEventListener('pause', onPause);
            v.removeEventListener('playing', onPlaying);
            v.removeEventListener('waiting', onWaiting);
            v.removeEventListener('loadstart', onLoadStart);
            v.removeEventListener('canplay', onCanPlay);
            v.removeEventListener('loadeddata', onLoadedData);
        };
    }, []);

    // 4. Loading Timeout Logic (30s)
    React.useEffect(() => {
        let timer: NodeJS.Timeout;

        if (isResolving && !error) {
            timer = setTimeout(() => {
                if (isResolving && !isPlaying) {
                    setError(t("streamTimeoutError") || "Le flux est inaccessible pour le moment. Veuillez réessayer plus tard.");
                    setIsResolving(false);
                }
            }, 30000); // 30 seconds
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isResolving, isPlaying, error, t]);

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
        <div className="mx-auto grid w-full max-w-[1280px] gap-0 lg:grid-cols-[1fr_400px] xl:grid-cols-[730px_550px] bg-[#3333331e]">

            <div ref={containerRef} className="w-full overflow-hidden ">
                <div className="w-full overflow-hidden group/player h-auto md:h-[488px]">
                    <div className="relative aspect-video md:h-[410px] w-full overflow-hidden bg-black">
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
                                    <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tighter">{t("streamUnavailable")}</h3>
                                    <p className="text-xs md:text-sm text-white/40 max-w-sm mx-auto leading-relaxed">{error}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setError(null);
                                        setIsResolving(true);
                                        setResolvedUrl(null);
                                        setRetryNonce((n) => n + 1);
                                    }}
                                    className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                                >
                                    {t("retry")}
                                </button>
                            </div>
                        )}

                        {isResolving && !error && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-20 bg-black">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-red-600/20 rounded-full" />
                                    <div className="absolute inset-0 w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-red-600 animate-pulse">{t("loading")}</span>
                            </div>
                        )}

                        {!isPlaying && !error && !isResolving && (
                            <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition-all group/play z-20">
                                <div className="w-20 h-20 rounded-full bg-white/5 backdrop-blur-3xl border border-white/20 flex items-center justify-center group-hover/play:scale-110 group-hover/play:bg-red-600 group-hover/play:border-red-500 transition-all duration-700 shadow-[0_0_50px_rgba(220,38,38,0.3)]">
                                    <svg className="w-12 h-12 text-white ml-2 drop-shadow-2xl" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                </div>
                            </button>
                        )}
                    </div>

                    {/* CONTROLS AREA */}
                    <div className="relative flex h-[60px] md:h-[78px] flex-col justify-center border-t border-white/5 px-4 md:px-5">

                        {/* Progress live bar */}
                        <div className="absolute -top-0.5 left-0 w-full h-1 bg-red-600/20">
                            <div className="h-full bg-red-600 w-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                        </div>

                        {/* Controls row */}
                        <div className="flex h-[28px] w-full flex-row items-center justify-between">

                            {/* LEFT: volume controls */}
                            <div className="flex flex-row items-center gap-3">
                                <button onClick={toggleMute} className="p-0 border-none bg-none cursor-pointer">
                                    {isMuted || volume === 0 ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F7F7F4" strokeWidth="2" strokeLinecap="round">
                                            <path d="M11 5L6 9H2v6h4l5 4V5z" />
                                            <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F7F7F4" strokeWidth="2" strokeLinecap="round">
                                            <path d="M11 5L6 9H2v6h4l5 4V5z" />
                                            <path d="M15.54 8.46a5 5 0 010 7.07" />
                                            <path d="M19.07 4.93a10 10 0 010 14.14" />
                                        </svg>
                                    )}
                                </button>

                                <div className="hidden sm:flex relative items-center w-[60px] md:w-[114px] h-[20px]">
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0 border-t-2 border-[#989896]" />
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0 border-t-2 border-[#F7F7F4] transition-[width] duration-75"
                                        style={{ width: `${volume * 100}%` }} />
                                    <input
                                        type="range"
                                        min={0} max={1} step={0.02}
                                        value={volume}
                                        onChange={handleVolumeChange}
                                        className="absolute inset-0 w-full cursor-pointer opacity-0"
                                    />
                                </div>
                            </div>

                            {/* Play/Pause */}
                            <button
                                onClick={togglePlay}
                                className="flex flex-row items-center justify-center p-0 border-none bg-none cursor-pointer mx-2 md:mx-4"
                            >
                                {isPlaying ? (
                                    <div className="flex flex-row items-center gap-[4px] md:gap-[5px]">
                                        <div className="h-[20px] md:h-[28px] border-l-[4px] md:border-l-[5px] border-[#F7F7F4]" />
                                        <div className="h-[20px] md:h-[28px] border-l-[4px] md:border-l-[5px] border-[#F7F7F4]" />
                                    </div>
                                ) : (
                                    <svg viewBox="0 0 15 28" fill="#F7F7F4" className="h-[24px] w-[12px] md:h-[28px] md:w-[15px]">
                                        <path d="M0 0L15 14L0 28V0Z" />
                                    </svg>
                                )}
                            </button>

                            {/* RIGHT: Quality & Fullscreen */}
                            <div className="flex flex-row items-center gap-1.5 md:gap-3">
                                {/* Quality */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowQualityMenu(!showQualityMenu)}
                                        className="flex flex-row items-center justify-center h-[24px] md:h-[27px] bg-[#1F1E18] rounded-[5px] px-2 md:px-3 gap-1 md:gap-[5px] border-none cursor-pointer"
                                    >
                                        <span className="text-[11px] md:text-[14px] leading-none text-white font-[Roboto]">
                                            {currentQuality === -1 ? t("auto") : `${qualities.find(q => q.index === currentQuality)?.height}p`}
                                        </span>
                                        <svg viewBox="0 0 10 6" fill="#FFFFFF" className={`h-[5px] w-[8px] md:h-[6px] md:w-[10px] transition-transform ${showQualityMenu ? 'rotate-180' : ''}`}>
                                            <path d="M0 0L5 6L10 0Z" />
                                        </svg>
                                    </button>
                                    {showQualityMenu && qualities.length > 0 && (
                                        <div className="absolute bottom-full mb-2 right-0 w-36 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                                            <div className="p-2 space-y-1">
                                                <button onClick={() => changeQuality(-1)}
                                                    className={`w-full px-4 py-2 text-[9px] font-black uppercase text-left rounded-lg transition-colors ${currentQuality === -1 ? 'bg-red-600/20 text-red-500' : 'text-white/40 hover:bg-white/5'}`}>
                                                    {t("auto")}
                                                </button>
                                                {qualities.map(q => (
                                                    <button key={q.index} onClick={() => changeQuality(q.index)}
                                                        className={`w-full px-4 py-2 text-[9px] font-black uppercase text-left rounded-lg transition-colors ${currentQuality === q.index ? 'bg-red-600/20 text-red-500' : 'text-white/40 hover:bg-white/5'}`}>
                                                        {q.height}p
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button onClick={toggleFullscreen} className="flex justify-center items-center w-[24px] h-[24px] md:w-[27px] md:h-[27px] bg-[#1F1E18] rounded-[5px] border-none cursor-pointer">
                                    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px] md:h-[20px] md:w-[20px]">
                                        <path d="M4 8V4H8M16 4H20V8M20 16V20H16M8 20H4V16" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>


            </div>


            <div className="flex h-auto w-full flex-col justify-between p-4 md:p-8">

                {/* TOP */}
                <div className="flex flex-col gap-6">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">

                        <div className="flex items-center gap-3">

                            <div className="relative w-[70px] h-[30px] md:w-[95px] md:h-[42px] shrink-0">
                                <SafeImage
                                    src={SITE_CONFIG.theme.placeholders.logo}
                                    alt={channel.title}
                                    fill
                                    className="object-contain"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#F80000] animate-pulse" />

                                <span className="text-[12px] md:text-[14px] font-bold text-white uppercase">{t("live")}</span>

                                <svg width="12" height="24" viewBox="0 0 12 24">
                                    <path d="M3 8L9 12L3 16" stroke="#F80000" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>

                                <h2 className="text-[14px] md:text-[16px] font-bold text-white line-clamp-1">
                                    {channel.title}
                                </h2>
                            </div>
                        </div>

                        <ShareButton
                            title={channel.title}
                            text={t("shareLiveText", { channel: channel.title, siteName: SITE_CONFIG.name })}
                            className="shrink-0 self-end md:self-auto"
                            iconClassName="w-5 h-5 md:w-6 md:h-6"
                        />
                    </div>

                    {/* Description */}
                    <p className="text-[13px] md:text-[14px] text-[#8E8E8E] leading-relaxed">
                        {channel.desc || t("channelDescriptionFallback")}
                    </p>
                </div>

                {/* BOTTOM */}
                <div className="mt-8 flex flex-wrap items-center gap-2">
                    <span className="text-[12px] md:text-[13px] font-bold text-[#FF0000] uppercase">
                        {currentProgram?.program_title || t("direct")}
                    </span>

                    <span className="text-[12px] md:text-[13px] font-bold text-[#8E8E8E]">
                        | {t("presentedBy")}
                    </span>

                    <span className="text-[12px] md:text-[13px] font-bold text-white/70 uppercase">
                        {(currentProgram as any)?.presentateur ||
                            (currentProgram as any)?.presentateurs ||
                            channel.title}
                    </span>
                </div>

            </div>
        </div>


    );
}
