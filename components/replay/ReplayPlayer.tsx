"use client";

import * as React from "react";
import Image from "next/image";
import Hls from "hls.js";
import { SliderVideoItem, ensureAbsoluteUrl } from "../../services/api";
import { SITE_CONFIG } from "@/constants/site-config";
import { useTranslations } from "next-intl";
import { SafeImage } from "../ui/SafeImage";
import { ShareButton } from "../ui/ShareButton";

interface ReplayPlayerProps {
    video: SliderVideoItem;
}

export function ReplayPlayer({ video: initialVideo }: ReplayPlayerProps) {
    const t = useTranslations("common");
    const [video, setVideo] = React.useState<SliderVideoItem>(initialVideo);
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        setVideo(initialVideo);
    }, [initialVideo]);

    const [isPlaying, setIsPlaying] = React.useState(false);
    const [volume, setVolume] = React.useState(1);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const [isMuted, setIsMuted] = React.useState(false);
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [resolvedUrl, setResolvedUrl] = React.useState<string | null>(null);
    const [isResolving, setIsResolving] = React.useState(false);

    const [hlsInstance, setHlsInstance] = React.useState<Hls | null>(null);
    const [qualities, setQualities] = React.useState<{ height: number; index: number }[]>([]);
    const [currentQuality, setCurrentQuality] = React.useState<number>(-1);
    const [showQualityMenu, setShowQualityMenu] = React.useState(false);
    const [tracks, setTracks] = React.useState<{ name: string; index: number }[]>([]);
    const [currentTrack, setCurrentTrack] = React.useState<number>(-1);
    const [showTrackMenu, setShowTrackMenu] = React.useState(false);

    React.useEffect(() => {
        let isAborted = false;
        const resolve = async () => {
            setResolvedUrl(null);
            setIsPlaying(false);
            setCurrentTime(0);
            setDuration(0);
            setIsResolving(true);
            setError(null);

            const timeoutId = setTimeout(() => {
                if (!resolvedUrl && !isAborted) {
                    setError("Le chargement du flux a expiré (45s).");
                    setIsResolving(false);
                }
            }, 45000);

            try {
                const isYoutubeVideo = video.type === 'youtube' || (video.video_url && (video.video_url.includes('youtube.com') || video.video_url.includes('youtu.be')));
                if (isYoutubeVideo) {
                    setResolvedUrl(video.video_url);
                    clearTimeout(timeoutId);
                    setIsResolving(false);
                    return;
                }

                const directFields = [video.video_url, video.feed_url, video.stream_url, video.android_url, video.web_url, video.webdetail_url];
                const foundDirect = directFields.find(u => u && (u.endsWith('.m3u8') || u.endsWith('.mp4') || u.includes('playlist.m3u8') || u.includes('.ts')));

                if (foundDirect) {
                    setResolvedUrl(foundDirect);
                    clearTimeout(timeoutId);
                    return;
                }

                const possibleMetadataUrls = [video.webdetail_url, video.feed_url, video.video_url, video.stream_url].filter(Boolean) as string[];
                let data: any = null;
                let usedUrl: string = "";

                for (const url of possibleMetadataUrls) {
                    const response = await fetch(url).catch(() => null);
                    if (response && response.ok) {
                        const json = await response.json();
                        if (json.allitems || json.web_url || json.video_url || json.android_url || json.url || json.stream_url) {
                            data = json;
                            usedUrl = url;
                            break;
                        }
                    }
                }

                if (!data) {
                    const finalFallback = video.video_url || video.feed_url || video.stream_url;
                    if (finalFallback && finalFallback.includes('http')) {
                        setResolvedUrl(finalFallback);
                        clearTimeout(timeoutId);
                        return;
                    }
                    throw new Error("Impossible de charger les métadonnées de la vidéo.");
                }

                if (data.allitems && Array.isArray(data.allitems) && data.allitems.length > 0) {
                    const mappedItems = data.allitems.map((item: any) => ({
                        title: item.title,
                        desc: item.desc,
                        logo: item.image,
                        logo_url: item.image_url,
                        video_url: ensureAbsoluteUrl(item.video_url),
                        feed_url: ensureAbsoluteUrl(item.feed_url || item.video_url),
                        stream_url: ensureAbsoluteUrl(item.stream_url),
                        slug: item.slug,
                        type: "vod",
                        date: item.published_at,
                        channel_logo: video.channel_logo || video.chaine_logo
                    } as SliderVideoItem));

                    if (!isAborted) {
                        const firstItem = mappedItems[0];
                        setVideo(firstItem);
                        const firstUrl = firstItem.web_url || firstItem.video_url || firstItem.android_url || firstItem.stream_url;
                        if (firstUrl && (firstUrl.endsWith('.m3u8') || firstUrl.endsWith('.mp4') || firstUrl.includes('playlist.m3u8'))) {
                            setResolvedUrl(firstUrl);
                            clearTimeout(timeoutId);
                            return;
                        }
                    }
                    clearTimeout(timeoutId);
                    return;
                }

                const directUrl = data.web_url || data.video_url || data.android_url || data.url || data.stream_url;
                if (!directUrl) {
                    if (usedUrl.includes('http')) {
                        setResolvedUrl(usedUrl);
                        clearTimeout(timeoutId);
                        return;
                    }
                    throw new Error("Aucun flux exploitable trouvé.");
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



    React.useEffect(() => {
        const videoEl = videoRef.current;
        if (!videoEl || !resolvedUrl) return;

        let hls: Hls;
        const initPlayer = () => {
            if (Hls.isSupported()) {
                hls = new Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(resolvedUrl);
                hls.attachMedia(videoEl);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    setQualities(hls.levels.map((level, index) => ({ height: level.height, index: index })).sort((a, b) => b.height - a.height));
                    videoEl.play().catch(() => setIsResolving(false));
                });
                hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, () => setTracks(hls.subtitleTracks.map((track, index) => ({ name: track.name || track.lang || `Track ${index}`, index: index }))));
                hls.on(Hls.Events.ERROR, (_event, data) => {
                    if (data.fatal) {
                        setIsResolving(false);
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR: hls.startLoad(); break;
                            case Hls.ErrorTypes.MEDIA_ERROR: hls.recoverMediaError(); break;
                            default: hls.destroy(); setError("Erreur fatale du flux."); break;
                        }
                    }
                });
                setHlsInstance(hls);
            } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
                videoEl.src = resolvedUrl;
                videoEl.play().catch(() => setIsResolving(false));
            } else {
                setError("Navigateur non supporté.");
                setIsResolving(false);
            }
        };

        const timer = setTimeout(() => { if (isResolving) setIsResolving(false); }, 15000);
        initPlayer();
        return () => { if (hls) hls.destroy(); setHlsInstance(null); clearTimeout(timer); };
    }, [resolvedUrl]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) videoRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
            else { videoRef.current.pause(); setIsPlaying(false); }
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
            setVolume(nextMuted ? 0 : 1);
            if (!nextMuted) videoRef.current.volume = 1;
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        if (videoRef.current) {
            videoRef.current.volume = val;
            setIsMuted(val === 0);
            videoRef.current.muted = val === 0;
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = val;
            setCurrentTime(val);
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => { });
        }
    };

    const toggleFullscreen = () => {
        const videoEl = videoRef.current;
        if (!videoEl) return;
        videoEl.controls = true;
        if (videoEl.requestFullscreen) videoEl.requestFullscreen();
        else if ((videoEl as any).webkitRequestFullscreen) (videoEl as any).webkitRequestFullscreen();
        else if ((videoEl as any).webkitEnterFullscreen) (videoEl as any).webkitEnterFullscreen();
    };

    React.useEffect(() => {
        const handleFsChange = () => {
            if (!document.fullscreenElement && videoRef.current) {
                videoRef.current.controls = false;
                setIsFullscreen(false);
            } else setIsFullscreen(true);
        };
        const handleOutsideClick = (e: MouseEvent) => {
            if (showQualityMenu || showTrackMenu) {
                if (!(e.target as HTMLElement).closest('.relative')) { setShowQualityMenu(false); setShowTrackMenu(false); }
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

    const changeQuality = (index: number) => { if (hlsInstance) { hlsInstance.currentLevel = index; setCurrentQuality(index); setShowQualityMenu(false); } };
    const changeTrack = (index: number) => { if (hlsInstance) { hlsInstance.subtitleTrack = index; setCurrentTrack(index); setShowTrackMenu(false); } };
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
        <div ref={containerRef} className="rounded-sm w-full overflow-hidden group/player mb-12 space-y-4">
            <div className="flex flex-col h-auto">
                {/* Video Area - Full Width */}
                <div className="w-full flex flex-col relative overflow-hidden group/screen rounded-sm bg-black shadow-2xl">
                    <div className="relative aspect-video overflow-hidden flex items-center justify-center bg-black">
                        {youtubeId ? (
                            <iframe src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`} className="w-full h-full border-0" allowFullScreen />
                        ) : (
                            <video
                                ref={videoRef}
                                className={`w-full h-full object-contain cursor-pointer transition-opacity duration-700 ${isResolving || error ? 'opacity-0' : 'opacity-100'}`}
                                onClick={togglePlay}
                                onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                                onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                                onEnded={() => setIsPlaying(false)}
                                poster={video.logo_url || video.logo || undefined}
                                playsInline autoPlay
                            />
                        )}

                        {error && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-center px-12 z-10 bg-black">
                                <div className="w-20 h-20 rounded-full bg-[color:var(--accent)]/10 flex items-center justify-center border border-[color:var(--accent)]/20">
                                    <svg className="w-10 h-10 text-[color:var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase">{t("previewUnavailable")}</h3>
                                    <p className="text-sm text-white/40">{error || SITE_CONFIG.strings.unavailabilityMsg}</p>
                                </div>
                                <button onClick={() => window.location.reload()} className="px-8 py-3 bg-[color:var(--accent)] rounded-full text-[10px] font-black uppercase">{t("retry")}</button>
                            </div>
                        )}

                        {isResolving && !error && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-20 bg-black">
                                <div className="relative"><div className="w-16 h-16 border-4 border-[color:var(--accent)]/20 rounded-full" /><div className="absolute inset-0 w-16 h-16 border-4 border-[color:var(--accent)] border-t-transparent rounded-full animate-spin" /></div>
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[color:var(--accent)] animate-pulse">{t("loading")}</span>
                            </div>
                        )}

                        {!isPlaying && !error && !isResolving && !youtubeId && (
                            <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 group/play z-20">
                                <div className="w-20 h-20 rounded-full bg-white/5 backdrop-blur-3xl border border-white/20 flex items-center justify-center group-hover/play:scale-110 group-hover/play:bg-[color:var(--accent)] transition-all duration-700 shadow-xl">
                                    <svg className="w-12 h-12 text-white ml-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                </div>
                            </button>
                        )}
                    </div>

                    {!youtubeId && (
                        <div className="backdrop-blur-md border-t bg-black border-white/5 flex flex-col justify-center relative group/controls bg-[#1A1A1A]/95 px-6"
                            style={{ height: 80 }}>

                            {/* Progress bar */}
                            <div className="absolute -top-1 left-0 w-full h-1.5 bg-accent/20 cursor-pointer group/progress">
                                <div className="h-full bg-accent shadow-[0_0_10px_rgba(209,56,45,0.5)] transition-all"
                                    style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%" }} />
                                <input
                                    type="range"
                                    min={0}
                                    max={duration || 0}
                                    step={0.5}
                                    value={currentTime}
                                    onChange={handleSeek}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                            </div>

                            <div className="flex flex-row items-center justify-between w-full ">

                                <div className="flex flex-row items-center gap-6">


                                    {/* Mute and Volume Track combined */}
                                    <div className="flex items-center gap-3">
                                        <button onClick={toggleMute} className="text-white hover:text-accent transition-colors">
                                            {isMuted || volume === 0 ? (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F7F7F4" strokeWidth="2" strokeLinecap="round">
                                                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                                                    <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
                                                </svg>
                                            ) : (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F7F7F4" strokeWidth="2" strokeLinecap="round">
                                                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                                                    <path d="M15.54 8.46a5 5 0 010 7.07" />
                                                    <path d="M19.07 4.93a10 10 0 010 14.14" />
                                                </svg>
                                            )}
                                        </button>


                                        {/* Track volume interactif */}
                                        <div className="relative flex items-center flex-shrink-0" style={{ width: 80, height: 20 }}>
                                            <div className="absolute" style={{
                                                left: 0, top: "50%", transform: "translateY(-50%)",
                                                width: 80, height: 0, borderTop: "3px solid #989896"
                                            }} />
                                            <div className="absolute" style={{
                                                left: 0, top: "50%", transform: "translateY(-50%)",
                                                width: `${volume * 80}px`, height: 0,
                                                borderTop: "3px solid #F7F7F4", transition: "width 0.05s ease"
                                            }} />
                                            <input
                                                type="range"
                                                min={0} max={1} step={0.02}
                                                value={volume}
                                                onChange={handleVolumeChange}
                                                className="absolute w-full h-full cursor-pointer opacity-0 z-10"
                                            />
                                        </div>
                                    </div>

                                    {/* Timecode */}
                                    <span className="b5 font-bold text-white/60 tracking-wider">
                                        {formatTime(currentTime)}
                                        <span className="mx-2 text-white/20">/</span>
                                        {formatTime(duration)}
                                    </span>
                                </div>
                                <button
                                    onClick={togglePlay}
                                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                                >
                                    {isPlaying ? (
                                        <div className="flex flex-row items-center" style={{ gap: 5 }}>
                                            <div style={{ width: 0, height: 20, borderLeft: "4px solid #F7F7F4" }} />
                                            <div style={{ width: 0, height: 20, borderLeft: "4px solid #F7F7F4" }} />
                                        </div>
                                    ) : (
                                        <svg width="14" height="20" viewBox="0 0 14 20" fill="#F7F7F4">
                                            <path d="M0 0L14 10L0 20V0Z" />
                                        </svg>
                                    )}
                                </button>

                                {/* RIGHT: Quality + CC + Fullscreen */}
                                <div className="flex flex-row items-center" style={{ gap: 10 }}>

                                    {/* Quality */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowQualityMenu(!showQualityMenu)}
                                            className="flex justify-center items-center"
                                            style={{
                                                width: 88, height: 27, borderRadius: 5,
                                                padding: "0 10px", border: "none", cursor: "pointer"
                                            }}
                                        >
                                            <div className="flex flex-row items-center" style={{ gap: 5 }}>
                                                <span style={{
                                                    fontFamily: "Roboto", fontWeight: 400, fontSize: 14,
                                                    lineHeight: "21px", color: "#FFFFFF"
                                                }}>
                                                    {currentQuality === -1 ? 'Auto' : `${qualities.find(q => q.index === currentQuality)?.height}p`}
                                                </span>
                                                <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" className={`transition-transform ${showQualityMenu ? 'rotate-180' : ''}`}>
                                                    <path d="M0 0L5 6L10 0Z" />
                                                </svg>
                                                <span style={{
                                                    fontFamily: "Roboto", fontWeight: 400, fontSize: 14,
                                                    lineHeight: "21px", color: "#FFFFFF"
                                                }}>HD</span>
                                            </div>
                                        </button>
                                        {showQualityMenu && qualities.length > 0 && (
                                            <div className="absolute bottom-full mb-3 right-0 w-32 bg-[#1A1A1A] border border-white/10 rounded-lg overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
                                                <div className="p-1">
                                                    <button onClick={() => changeQuality(-1)}
                                                        className={`w-full px-4 py-2 text-[10px] font-bold uppercase text-left rounded-md transition-colors ${currentQuality === -1 ? 'bg-accent text-white' : 'text-white/60 hover:bg-white/5'}`}>
                                                        Auto
                                                    </button>
                                                    {qualities.map(q => (
                                                        <button key={q.index} onClick={() => changeQuality(q.index)}
                                                            className={`w-full px-4 py-2 text-[10px] font-bold uppercase text-left rounded-md transition-colors ${currentQuality === q.index ? 'bg-accent text-white' : 'text-white/60 hover:bg-white/5'}`}>
                                                            {q.height}p
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* CC — ouvre showTrackMenu si tracks disponibles */}
                                    <div className="relative">
                                        <button className="flex justify-center items-center"
                                            style={{
                                                width: 27, height: 27, background: "#1F1E18", borderRadius: 5,
                                                border: "none", cursor: "pointer"
                                            }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <rect x="3" y="4" width="18" height="16" rx="2" fill="#FFFFFF" />
                                                <text x="5" y="16" fontSize="8" fontWeight="bold" fill="#1F1E18">CC</text>
                                            </svg>
                                        </button>
                                        {showTrackMenu && tracks.length > 0 && (
                                            <div className="absolute bottom-full mb-2 right-0 w-36 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                                                <div className="p-2 space-y-1">
                                                    <button onClick={() => changeTrack(-1)}
                                                        className={`w-full px-4 py-2 text-[9px] font-black uppercase text-left rounded-lg transition-colors ${currentTrack === -1 ? 'bg-red-600/20 text-red-500' : 'text-white/40 hover:bg-white/5'}`}>
                                                        Off
                                                    </button>
                                                    {tracks.map(tr => (
                                                        <button key={tr.index} onClick={() => changeTrack(tr.index)}
                                                            className={`w-full px-4 py-2 text-[9px] font-black uppercase text-left rounded-lg transition-colors ${currentTrack === tr.index ? 'bg-red-600/20 text-red-500' : 'text-white/40 hover:bg-white/5'}`}>
                                                            {tr.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Fullscreen */}
                                    <button onClick={toggleFullscreen} className="flex justify-center items-center"
                                        style={{
                                            width: 27, height: 27, background: "#1F1E18", borderRadius: 5,
                                            border: "none", cursor: "pointer"
                                        }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <path d="M4 8V4H8M16 4H20V8M20 16V20H16M8 20H4V16"
                                                stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Container */}
                <div className="flex flex-col justify-center items-center"
                    style={{ width: "100%", background: "#1C1C1C", padding: "10px 10px 10px 0" }}>
                    {/* Inner: flex col, items-start, gap-[22px], w-[896px] */}
                    <div className="flex flex-col items-start" style={{ width: "100%", gap: 22 }}>

                        {/* Header row: flex row, justify-between, h-[53px] */}
                        <div className="flex flex-row justify-between items-center w-full" style={{ height: 53 }}>

                            {/* LEFT: logo + status + title — flex row, items-center, gap-[13px] */}
                            <div className="flex flex-row items-center" style={{ gap: 13 }}>
                                {/* Logo: 95×42px */}
                                <div className="relative flex-shrink-0" style={{ width: 95, height: 42 }}>
                                    <SafeImage
                                        src={video.channel_logo || video.logo || "/assets/placeholders/radio_icon_sur_card.png"}
                                        alt={video.title} fill className="object-contain" />
                                </div>
                                {/* Status + title: flex row, items-center, gap-[3px] */}
                                <div className="flex flex-row items-center" style={{ gap: 3 }}>
                                    {/* Dot: 6×6px #F80000 */}
                                    <div className="rounded-full flex-shrink-0"
                                        style={{ width: 6, height: 6, background: "#F80000" }} />
                                    {/* "LIVE": Inter/700 13px blanc */}
                                    <span style={{
                                         fontWeight: 700, fontSize: 13,
                                        lineHeight: "50px", color: "#db0e0eff",
                                        display: "flex", alignItems: "center", textAlign: "center"
                                    }}>
                                        Replay
                                    </span>
                                    {/* Arrow: 12×24px #F80000 */}
                                    <svg width="12" height="24" viewBox="0 0 12 24" fill="none">
                                        <path d="M3 8L9 12L3 16" stroke="#F80000" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                    {/* Channel title: DM Sans/700 16px blanc, w-137px */}
                                    <span style={{
                                        fontWeight: 700, fontSize: 16,
                                        lineHeight: "18px", color: "#FFFFFF",
                                        height: 26, display: "flex", alignItems: "center", paddingRight: 2
                                    }}>
                                        {video.title}
                                    </span>

                                </div>
                            </div>

                            {/* RIGHT: Share button — 45×45px, bg #FFFFFF, border-radius 5px, shadow */}
                            <div className="flex-shrink-0 ">
                                <ShareButton
                                    title={video.title}
                                    text={`Regardez ${video.title} en direct sur CRTV Web`}
                                    className="flex justify-center items-center"
                                    iconClassName="w-6 h-6"
                                />
                            </div>
                        </div>

                        {/* Description: Nunito/400 16px #8E8E8E, w-629px, h-76px */}
                        <p style={{
                            fontWeight: 400, fontSize: 16, paddingLeft: 20,
                            lineHeight: "22px", color: "#8E8E8E", width: 629, height: 76,
                            overflow: "hidden"
                        }}>
                            {video.desc || "Votre Chaîne, au cœur de l'actualité et de la culture. Restez à l'écoute pour nos programmes variés."}
                        </p>

                        {/* Programme subtitle: DM Sans/700 15px #FF0000, w-896px, h-40px */}
                        <div className="flex items-center w-full" style={{ height: 40, paddingLeft: 20, }}>
                            <span style={{
                                 fontWeight: 700, fontSize: 15,
                                lineHeight: "18px", color: "#FF0000"
                            }}>
                                {"REPLAY"}
                            </span>
                            {/*divider vertical puis presenter par puis le nom de l'emission*/}
                            <span style={{
                              fontWeight: 700, fontSize: 15,
                                lineHeight: "18px", color: "#7a7a7aff", padding: 5
                            }}>
                                | DE L'EMISSION :
                            </span>
                            <span style={{
                               fontWeight: 700, fontSize: 15,
                                lineHeight: "18px", color: "#b4b4b4ff", padding: 5
                            }}>
                                {" " + video.title}
                            </span>
                        </div>
                    </div>
                </div>
            </div>


        </div>

    );
}
