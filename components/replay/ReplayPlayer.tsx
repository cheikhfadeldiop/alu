"use client";

import * as React from "react";
import Image from "next/image";
import Hls from "hls.js";
import { SliderVideoItem, getRelatedItems, ensureAbsoluteUrl } from "../../services/api";
import { Link } from "../../i18n/navigation";
import { SITE_CONFIG } from "@/constants/site-config";
import { useTranslations } from "next-intl";

interface ReplayPlayerProps {
    video: SliderVideoItem;
}

export function ReplayPlayer({ video: initialVideo }: ReplayPlayerProps) {
    const t = useTranslations("common");
    // Local copy of current video to allow internal selection if feed returns multiple items
    const [video, setVideo] = React.useState<SliderVideoItem>(initialVideo);
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const sidebarRef = React.useRef<HTMLDivElement>(null);

    // Sync state if prop changes
    React.useEffect(() => {
        setVideo(initialVideo);
    }, [initialVideo]);

    // State
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [volume, setVolume] = React.useState(1);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const [isMuted, setIsMuted] = React.useState(false);
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [resolvedUrl, setResolvedUrl] = React.useState<string | null>(null);
    const [isResolving, setIsResolving] = React.useState(false);
    const [scrollPercentage, setScrollPercentage] = React.useState(0);

    // HLS Features
    const [hlsInstance, setHlsInstance] = React.useState<Hls | null>(null);
    const [qualities, setQualities] = React.useState<{ height: number; index: number }[]>([]);
    const [currentQuality, setCurrentQuality] = React.useState<number>(-1); // -1 for Auto
    const [showQualityMenu, setShowQualityMenu] = React.useState(false);
    const [tracks, setTracks] = React.useState<{ name: string; index: number }[]>([]);
    const [currentTrack, setCurrentTrack] = React.useState<number>(-1); // -1 for Off
    const [showTrackMenu, setShowTrackMenu] = React.useState(false);

    // Sidebar Data
    const [relatedVideos, setRelatedVideos] = React.useState<SliderVideoItem[]>([]);
    const [loadingRelated, setLoadingRelated] = React.useState(false);
    const [failedImages, setFailedImages] = React.useState<Record<string, boolean>>({});

    // Sidebar Scroll Listener
    const handleSidebarScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const totalScrollable = target.scrollHeight - target.clientHeight;
        if (totalScrollable > 0) {
            setScrollPercentage((target.scrollTop / totalScrollable) * 100);
        }
    };

    const handleImageError = (slug: string) => {
        setFailedImages(prev => ({ ...prev, [slug]: true }));
    };

    // 1. Resolve actual stream URL
    React.useEffect(() => {
        let isAborted = false;

        const resolve = async () => {
            setResolvedUrl(null);
            setIsPlaying(false);
            setCurrentTime(0);
            setDuration(0);
            setIsResolving(true);
            setError(null);

            // 45s Safety Timeout for Resolution
            const timeoutId = setTimeout(() => {
                if (!resolvedUrl && !isAborted) {
                    setError("Le chargement du flux a expiré (45s).");
                    setIsResolving(false);
                }
            }, 45000);

            try {
                // 1. YouTube Identification
                const isYoutubeVideo = video.type === 'youtube' || (video.video_url && (video.video_url.includes('youtube.com') || video.video_url.includes('youtu.be')));
                if (isYoutubeVideo) {
                    setResolvedUrl(video.video_url);
                    clearTimeout(timeoutId);
                    setIsResolving(false);
                    return;
                }

                // 2. EXHAUSTIVE CHECK: Try direct URLs first in ALL possible fields
                const directFields = [
                    video.video_url,
                    video.feed_url,
                    video.stream_url,
                    video.android_url,
                    video.web_url,
                    video.webdetail_url
                ];

                const foundDirect = directFields.find(u =>
                    u && (u.endsWith('.m3u8') || u.endsWith('.mp4') || u.includes('playlist.m3u8') || u.includes('.ts'))
                );

                if (foundDirect) {
                    setResolvedUrl(foundDirect);
                    clearTimeout(timeoutId);
                    return;
                }

                // 3. If no direct URL, try fetching metadata from multiple sources in priority order
                const possibleMetadataUrls = [
                    video.webdetail_url,
                    video.feed_url,
                    video.video_url,
                    video.stream_url
                ].filter(Boolean) as string[];

                let data: any = null;
                let usedUrl: string = "";

                for (const url of possibleMetadataUrls) {
                    const response = await fetch(url).catch(() => null);
                    if (response && response.ok) {
                        const json = await response.json();
                        // Check if it's a list (Show/Category) or a direct stream source
                        if (json.allitems || json.web_url || json.video_url || json.android_url || json.url || json.stream_url) {
                            data = json;
                            usedUrl = url;
                            break;
                        }
                    }
                }

                if (!data) {
                    // Final fallback: try using whatever we have as a direct link if it contains http
                    const finalFallback = video.video_url || video.feed_url || video.stream_url;
                    if (finalFallback && finalFallback.includes('http')) {
                        setResolvedUrl(finalFallback);
                        clearTimeout(timeoutId);
                        return;
                    }
                    throw new Error("Impossible de charger les métadonnées de la vidéo (tous les endpoints ont échoué).");
                }

                // 2. SHOW/CATEGORY FEED HANDLING:
                // If the feed returns a list of items (like listItemsByChannel), 
                // we treat the current "video" as a show container.
                if (data.allitems && Array.isArray(data.allitems) && data.allitems.length > 0) {
                    const mappedItems = data.allitems.map((item: any) => ({
                        title: item.title,
                        desc: item.desc,
                        logo: item.image,
                        logo_url: item.image_url,
                        video_url: ensureAbsoluteUrl(item.video_url),
                        feed_url: ensureAbsoluteUrl(item.feed_url || item.video_url),
                        stream_url: ensureAbsoluteUrl(item.stream_url),
                        android_url: ensureAbsoluteUrl(item.android_url),
                        web_url: ensureAbsoluteUrl(item.web_url),
                        webdetail_url: ensureAbsoluteUrl(item.webdetail_url),
                        date: item.published_at,
                        time: "",
                        slug: item.slug,
                        type: "vod",
                        views: "0",
                        relatedItems: item.relatedItems || "",
                        channel_logo: video.channel_logo || video.chaine_logo
                    } as SliderVideoItem));

                    if (!isAborted) {
                        const firstItem = mappedItems[0];
                        setVideo(firstItem);
                        setRelatedVideos(mappedItems.slice(1));
                        setLoadingRelated(false);

                        // If the first item already has a direct stream, resolve it immediately
                        const firstUrl = firstItem.web_url || firstItem.video_url || firstItem.android_url || firstItem.stream_url;
                        if (firstUrl && (firstUrl.endsWith('.m3u8') || firstUrl.endsWith('.mp4') || firstUrl.includes('playlist.m3u8'))) {
                            setResolvedUrl(firstUrl);
                            clearTimeout(timeoutId);
                            return;
                        }
                    }
                    // If not direct, the next effect run will handle the firstItem's own resolution
                    clearTimeout(timeoutId);
                    return;
                }

                // 3. SINGLE STREAM RESOLUTION
                const directUrl = data.web_url || data.video_url || data.android_url || data.url || data.stream_url;

                if (!directUrl) {
                    // One last check: maybe the original endpoint itself returns the stream directly (rare)
                    if (usedUrl.includes('http')) {
                        setResolvedUrl(usedUrl);
                        clearTimeout(timeoutId);
                        return;
                    }
                    throw new Error("Aucun flux exploitable trouvé dans la réponse API.");
                }

                if (!isAborted) {
                    setResolvedUrl(directUrl);
                    clearTimeout(timeoutId);
                }
            } catch (err: any) {
                console.error("Resolution Error:", err);
                if (!isAborted) {
                    setError(err.message || "Erreur de chargement.");
                    setIsResolving(false);
                }
            }
        };

        resolve();
        return () => { isAborted = true; };
    }, [video.video_url, video.feed_url, (video as any).stream_url]);

    // 2. Fetch Sidebar Content
    React.useEffect(() => {
        if (!video.relatedItems || video.relatedItems === "null") return;

        async function fetchRelated() {
            setLoadingRelated(true);
            try {
                const items = await getRelatedItems(video.relatedItems);
                const filtered = items.filter(i => i.slug !== video.slug);
                setRelatedVideos(filtered);
            } catch (err) {
                console.error("Failed to fetch related items:", err);
            } finally {
                setLoadingRelated(false);
            }
        }
        fetchRelated();
    }, [video.relatedItems, video.slug]);

    // 3. HLS & Video Initialization
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
                    // 1. Get Quality Levels
                    const levels = hls.levels.map((level, index) => ({
                        height: level.height,
                        index: index
                    })).sort((a, b) => b.height - a.height); // Higher first
                    setQualities(levels);

                    // Try to autplay, but let events handle isResolving
                    const playPromise = videoEl.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(() => {
                            // On autoplay block, we still stop resolving so user can hit play
                            setIsResolving(false);
                        });
                    }
                });

                hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, () => {
                    const subtitleTracks = hls.subtitleTracks.map((track, index) => ({
                        name: track.name || track.lang || `Track ${index}`,
                        index: index
                    }));
                    setTracks(subtitleTracks);
                });

                hls.on(Hls.Events.ERROR, (_event, data) => {
                    if (data.fatal) {
                        setIsResolving(false); // Ensure loader stops on fatal HLS error
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

        const timer = setTimeout(() => {
            if (isResolving) setIsResolving(false);
        }, 15000); // 15s Safety timeout for HLS manifest load

        initPlayer();

        return () => {
            if (hls) hls.destroy();
            setHlsInstance(null);
            clearTimeout(timer);
        };
    }, [resolvedUrl]);

    // 4. Controls Handlers
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

    // Synchronize play state with native events and handle loader
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

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
            setDuration(videoRef.current.duration || 0);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = val;
            setCurrentTime(val);
            // Proactively try to play after seek to prevent stagnation
            videoRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(() => {
                // If play fails, we ensure loader shows if it's actually buffering
                // but usually the next native event 'waiting' will handle it
            });
        }
    };

    const toggleFullscreen = () => {
        const videoEl = videoRef.current;
        if (!videoEl) return;

        // Use native controls during fullscreen
        videoEl.controls = true;

        if (videoEl.requestFullscreen) {
            videoEl.requestFullscreen();
        } else if ((videoEl as any).webkitRequestFullscreen) {
            (videoEl as any).webkitRequestFullscreen();
        } else if ((videoEl as any).webkitEnterFullscreen) {
            (videoEl as any).webkitEnterFullscreen();
        }
    };

    // Monitor fullscreen exit to hide native controls
    React.useEffect(() => {
        const handleFsChange = () => {
            if (!document.fullscreenElement && videoRef.current) {
                if (videoRef.current) videoRef.current.controls = false;
                setIsFullscreen(false);
            } else {
                setIsFullscreen(true);
            }
        };
        const handleOutsideClick = (e: MouseEvent) => {
            if (showQualityMenu || showTrackMenu) {
                const target = e.target as HTMLElement;
                if (!target.closest('.relative')) {
                    setShowQualityMenu(false);
                    setShowTrackMenu(false);
                }
            }
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        document.addEventListener('webkitfullscreenchange', handleFsChange);
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('fullscreenchange', handleFsChange);
            document.removeEventListener('webkitfullscreenchange', handleFsChange);
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [showQualityMenu, showTrackMenu]);

    const changeQuality = (index: number) => {
        if (hlsInstance) {
            hlsInstance.currentLevel = index;
            setCurrentQuality(index);
            setShowQualityMenu(false);
        }
    };

    const changeTrack = (index: number) => {
        if (hlsInstance) {
            hlsInstance.subtitleTrack = index;
            setCurrentTrack(index);
            setShowTrackMenu(false);
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "00:00";
        const h = Math.floor(time / 3600);
        const m = Math.floor((time % 3600) / 60);
        const s = Math.floor(time % 60);
        return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    };

    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const youtubeId = resolvedUrl ? getYoutubeId(resolvedUrl) : null;

    return (
        <div ref={containerRef} className=" rounded-sm w-full overflow-hidden group/player mb-12">
            <div className="flex flex-col lg:flex-row h-auto lg:h-[720px]">

                {/* Left: Video Area (75%) */}
                <div className="w-full lg:w-3/4 flex flex-col relative overflow-hidden group/screen">

                    {/* Video Canvas */}
                    <div className="flex-1 relative aspect-video lg:aspect-auto overflow-hidden flex items-center justify-center bg-black">

                        {youtubeId ? (
                            <iframe
                                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <video
                                ref={videoRef}
                                className={`w-full h-full object-contain cursor-pointer transition-opacity duration-700 ${isResolving || error ? 'opacity-0' : 'opacity-100'}`}
                                onClick={togglePlay}
                                onTimeUpdate={handleTimeUpdate}
                                onEnded={() => setIsPlaying(false)}
                                poster={video.logo_url || video.logo || undefined}
                                playsInline
                                autoPlay
                            />
                        )}

                        {error && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-center px-12 z-10 bg-black">
                                <div className="w-20 h-20 rounded-full bg-[color:var(--accent)]/10 flex items-center justify-center border border-[color:var(--accent)]/20">
                                    <svg className="w-10 h-10 text-[color:var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">{t("previewUnavailable")}</h3>
                                    <p className="text-sm text-white/40 max-w-sm mx-auto leading-relaxed">
                                        {error || SITE_CONFIG.strings.unavailabilityMsg}
                                    </p>
                                </div>
                                <button onClick={() => window.location.reload()} className="px-8 py-3 bg-[color:var(--accent)] hover:brightness-90 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[color:var(--accent)]/20">{t("retry")}</button>
                            </div>
                        )}

                        {isResolving && !error && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-20 bg-black">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-[color:var(--accent)]/20 rounded-full" />
                                    <div className="absolute inset-0 w-16 h-16 border-4 border-[color:var(--accent)] border-t-transparent rounded-full animate-spin" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[color:var(--accent)] animate-pulse">{t("loading")}</span>
                            </div>
                        )}

                        {/* Center Play Overlay - Hidden for YouTube */}
                        {!isPlaying && !error && !isResolving && !youtubeId && (
                            <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition-all group/play z-20">
                                <div className="w-20 h-20 rounded-full bg-white/5 backdrop-blur-3xl border border-white/20 flex items-center justify-center group-hover/play:scale-110 group-hover/play:bg-[color:var(--accent)] group-hover/play:border-[color:var(--accent)] transition-all duration-700 shadow-[0_0_50px_rgba(209,18,31,0.3)]">
                                    <svg className="w-12 h-12 text-white ml-2 drop-shadow-2xl" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                </div>
                            </button>
                        )}
                    </div>

                    {/* CONTROLS AREA - Hidden for YouTube as it has its own controls */}
                    {!youtubeId && (
                        <div className="h-28 bg-[#0a0a0a] border-t border-white/5 flex flex-col justify-center px-10 relative group/controls">

                            {/* HOVER INFO: Centered above progress bar */}
                            <div className="absolute -top-25 left-0 w-full flex justify-center opacity-0 group-hover/controls:opacity-100 transition-all duration-300 pointer-events-none translate-y-2 group-hover/controls:translate-y-0 text-center">
                                <div className="bg-black/90 backdrop-blur-xl px-8 py-3 rounded-2xl border border-white/10 flex flex-col items-center gap-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                                    <span className="text-[12px] font-black uppercase text-white tracking-[0.3em]">{video.title}</span>
                                    <div className="flex items-center gap-2 font-mono text-[12px] font-black text-white/40">
                                        <span className="text-white">{formatTime(currentTime)}</span>
                                        <span>/</span>
                                        <span>{formatTime(duration)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Custom Seek Bar */}
                            <div className="absolute -top-1 left-0 w-full z-40 ">
                                <div className="w-full h-2 bg-white/10 relative cursor-pointer group/sk rounded-full overflow-hidden">
                                    <input
                                        type="range"
                                        min={0} max={duration || 100}
                                        value={currentTime}
                                        onChange={handleSeek}
                                        className="absolute inset-0 w-full h-full opacity-0 z-50 cursor-pointer"
                                    />
                                    <div
                                        className="h-full bg-[color:var(--accent)] relative transition-all duration-150 z-10"
                                        style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                                    >
                                        <div className="absolute right-0 top-0 h-full w-10 bg-white/20 blur-sm animate-pulse" />
                                    </div>
                                </div>
                            </div>

                            {/* Control Elements Grid */}
                            <div className="grid grid-cols-3 items-center w-full mt-4">

                                {/* LEFT: Volume Control */}
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-4 group/vctrl">
                                        <button onClick={toggleMute} className="text-white/40 hover:text-white transition-colors">
                                            {isMuted || volume === 0 ? (
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                                            ) : (
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                            )}
                                        </button>
                                        <div className="flex items-center">
                                            <input
                                                type="range"
                                                min={0} max={1} step={0.05}
                                                value={volume}
                                                onChange={handleVolumeChange}
                                                className="w-24 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-red-600 hover:accent-red-500 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* CENTER: LARGE Play/Pause Button */}
                                <div className="flex justify-center">
                                    <button onClick={togglePlay} className="group/playbtn active:scale-95 transition-all">
                                        <div className="w-16 h-16 rounded-full border-2 border-white/5 bg-white/5 flex items-center justify-center hover:bg-white/10 hover:border-red-600 transition-all duration-500 shadow-2xl">
                                            {isPlaying ? (
                                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                            ) : (
                                                <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                            )}
                                        </div>
                                    </button>
                                </div>

                                {/* RIGHT: Quality, CC, FS */}
                                <div className="flex items-center justify-end gap-8">

                                    {/* Quality Selector */}
                                    <div className="relative">
                                        <button
                                            onClick={() => { setShowQualityMenu(!showQualityMenu); setShowTrackMenu(false); }}
                                            className={`text-[10px] font-black uppercase tracking-widest transition-all border px-3 py-1 rounded-lg hover:scale-105 active:scale-95 ${showQualityMenu ? 'bg-red-600 border-red-600 text-white' : 'text-white/40 border-white/10 hover:text-white hover:border-red-600/50'}`}
                                        >
                                            {currentQuality === -1 ? 'Auto' : `${qualities.find(q => q.index === currentQuality)?.height}P`}
                                        </button>

                                        {showQualityMenu && qualities.length > 0 && (
                                            <div className="absolute bottom-full mb-6 right-0 w-40 bg-black/95 backdrop-blur-3xl border border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <div className="p-4 border-b border-white/5 bg-white/5">
                                                    <div className="flex items-center gap-2 justify-center">
                                                        <span className="w-1 h-1 bg-red-600 rounded-full animate-pulse" />
                                                        <span className="text-[9px] font-black uppercase text-white/40 tracking-[0.3em]">Qualité Flux</span>
                                                    </div>
                                                </div>
                                                <div className="max-h-64 overflow-y-auto p-2 space-y-1 scrollbar-none">
                                                    <button
                                                        onClick={() => changeQuality(-1)}
                                                        className={`w-full px-5 py-3 text-[10px] font-black uppercase tracking-widest text-left rounded-2xl transition-all duration-300 flex items-center justify-between group/opt ${currentQuality === -1 ? 'bg-red-600/10 text-red-500' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                                                    >
                                                        <span>Automatique</span>
                                                        {currentQuality === -1 && <div className="w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.8)]" />}
                                                    </button>
                                                    {qualities.map(q => (
                                                        <button
                                                            key={q.index}
                                                            onClick={() => changeQuality(q.index)}
                                                            className={`w-full px-5 py-3 text-[10px] font-black uppercase tracking-widest text-left rounded-2xl transition-all duration-300 flex items-center justify-between group/opt ${currentQuality === q.index ? 'bg-red-600/10 text-red-500' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                                                        >
                                                            <span>{q.height}P</span>
                                                            {currentQuality === q.index && <div className="w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.8)]" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* CC / Subtitles */}
                                    <div className="relative">
                                        <button
                                            onClick={() => { setShowTrackMenu(!showTrackMenu); setShowQualityMenu(false); }}
                                            className={`transition-all transform hover:scale-110 active:scale-90 ${showTrackMenu ? 'text-red-600' : 'text-white/40 hover:text-white'}`}
                                        >
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                                        </button>

                                        {showTrackMenu && (
                                            <div className="absolute bottom-full mb-6 right-0 w-48 bg-black/95 backdrop-blur-3xl border border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <div className="p-4 border-b border-white/5 bg-white/5">
                                                    <div className="flex items-center gap-2 justify-center">
                                                        <span className="w-1 h-1 bg-red-600 rounded-full animate-pulse" />
                                                        <span className="text-[9px] font-black uppercase text-white/40 tracking-[0.3em]">Audio & Langues</span>
                                                    </div>
                                                </div>
                                                <div className="max-h-64 overflow-y-auto p-2 space-y-1 scrollbar-none">
                                                    <button
                                                        onClick={() => changeTrack(-1)}
                                                        className={`w-full px-5 py-3 text-[10px] font-black uppercase tracking-widest text-left rounded-2xl transition-all duration-300 flex items-center justify-between group/opt ${currentTrack === -1 ? 'bg-red-600/10 text-red-500' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                                                    >
                                                        <span>Désactivés</span>
                                                        {currentTrack === -1 && <div className="w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.8)]" />}
                                                    </button>
                                                    {tracks.length > 0 ? tracks.map(t => (
                                                        <button
                                                            key={t.index}
                                                            onClick={() => changeTrack(t.index)}
                                                            className={`w-full px-5 py-3 text-[10px] font-black uppercase tracking-widest text-left rounded-2xl transition-all duration-300 flex items-center justify-between group/opt ${currentTrack === t.index ? 'bg-red-600/10 text-red-500' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                                                        >
                                                            <span>{t.name}</span>
                                                            {currentTrack === t.index && <div className="w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.8)]" />}
                                                        </button>
                                                    )) : (
                                                        <div className="px-5 py-6 text-center">
                                                            <span className="text-[9px] font-black uppercase text-white/10 tracking-[0.2em]">Aucune piste</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button onClick={toggleFullscreen} className="text-white/40 hover:text-red-600 transition-all transform hover:scale-110 active:scale-90">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Archives (25%) */}
                <div ref={sidebarRef} onScroll={handleSidebarScroll} className="w-full lg:w-1/4 bg-[#0a0a0a] flex flex-col h-full shadow-2xl relative pb-2">

                    <div className="p-8 border-b border-white/5 bg-black/40">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                            <h3 className="text-base font-black text-white uppercase tracking-tight leading-tight">
                                Émissions Précédentes
                            </h3>                        </div>

                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-5 
                        scrollbar-thin 
                        [&::-webkit-scrollbar]:w-1 
                        [&::-webkit-scrollbar-track]:bg-transparent 
                        [&::-webkit-scrollbar-thumb]:bg-red-600 
                        [&::-webkit-scrollbar-thumb]:rounded-full 
                        hover:[&::-webkit-scrollbar-thumb]:bg-red-400
                    ">
                        {loadingRelated && relatedVideos.length === 0 ? (
                            <div className="p-4 space-y-8">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="animate-pulse space-y-4">
                                        <div className="aspect-video bg-white/5 rounded-3xl" />
                                        <div className="h-2 bg-white/5 rounded w-1/2 mx-auto" />
                                    </div>
                                ))}
                            </div>
                        ) : relatedVideos.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                                <svg className="w-16 h-16 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                <span className="text-xs uppercase font-black tracking-widest text-white">Aucun contenu trouvé</span>
                            </div>
                        ) : (
                            relatedVideos.map((item, idx) => (
                                <Link
                                    href={`/replay/${item.slug}`}
                                    key={`${item.slug}-${idx}`}
                                    scroll={false}
                                    className="group block p-2 rounded-[2rem] hover:bg-white/5 transition-all duration-500 border border-transparent hover:border-white/5"
                                >
                                    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl mb-4 bg-zinc-900 border border-white/5">
                                        <Image
                                            src={failedImages[item.slug] ? "/assets/logo/logo.png" : (item.logo_url || item.logo || "/assets/logo/logo.png")}
                                            alt={item.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-1000 opacity-70 group-hover:opacity-100"
                                            onError={() => handleImageError(item.slug)}
                                            unoptimized={failedImages[item.slug]}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                            <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-500">
                                                <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                            </div>
                                        </div>
                                        <div className="absolute top-3 left-3">
                                            <span className="text-[7px] font-black text-white/40 uppercase tracking-[0.3em] bg-black/40 backdrop-blur-md px-2 py-1 rounded-full group-hover:text-white transition-colors">{item.date}</span>
                                        </div>
                                    </div>
                                    <div className="px-4 pb-2">
                                        <h4 className="text-[10px] font-black uppercase text-white/50 group-hover:text-white transition-all line-clamp-2 leading-relaxed tracking-tight text-center">
                                            {item.title}
                                        </h4>
                                    </div>
                                </Link>
                            ))
                        )}
                        <div className="h-10" />
                    </div>
                </div>

            </div>
        </div>
    );
}
