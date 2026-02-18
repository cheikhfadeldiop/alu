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
                        <div className="h-28 bg-[#0a0a0a] border-t border-white/5 flex flex-col justify-center px-10 relative group/controls">
                            <div className="absolute -top-1 left-0 w-full z-40 h-2 bg-white/10 cursor-pointer overflow-hidden rounded-full">
                                <input type="range" min={0} max={duration || 100} value={currentTime} onChange={handleSeek} className="absolute inset-0 w-full h-full opacity-0 z-50 cursor-pointer" />
                                <div className="h-full bg-[color:var(--accent)] transition-all duration-150" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} />
                            </div>
                            <div className="grid grid-cols-3 items-center w-full mt-4">
                                <div className="flex items-center gap-4">
                                    <button onClick={toggleMute} className="text-white/40 hover:text-white transition-colors">
                                        {isMuted || volume === 0 ? (
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                                        ) : (
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                        )}
                                    </button>
                                    <input type="range" min={0} max={1} step={0.05} value={volume} onChange={handleVolumeChange} className="w-24 accent-red-600" />
                                    <span className="text-[10px] font-bold text-white/40 tabular-nums">
                                        {formatTime(currentTime)} / {formatTime(duration)}
                                    </span>
                                </div>
                                <div className="flex justify-center">
                                    <button onClick={togglePlay} className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center hover:border-red-600 border border-white/10 transition-all">
                                        {isPlaying ? (
                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                        ) : (
                                            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                        )}
                                    </button>
                                </div>
                                <div className="flex items-center justify-end gap-6 text-[10px] font-bold uppercase tracking-widest text-white/40">
                                    <div className="relative">
                                        <button onClick={() => setShowQualityMenu(!showQualityMenu)} className="border border-white/10 px-3 py-1 rounded-lg hover:text-white hover:border-red-600 transition-all">
                                            {currentQuality === -1 ? 'Auto' : `${qualities.find(q => q.index === currentQuality)?.height}P`}
                                        </button>
                                        {showQualityMenu && qualities.length > 0 && (
                                            <div className="absolute bottom-full mb-4 right-0 w-36 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                                                <div className="p-2 space-y-1">
                                                    <button onClick={() => changeQuality(-1)} className={`w-full px-4 py-2 text-left rounded-lg transition-colors ${currentQuality === -1 ? 'bg-red-600 text-white' : 'hover:bg-white/5'}`}>Auto</button>
                                                    {qualities.map(q => (
                                                        <button key={q.index} onClick={() => changeQuality(q.index)} className={`w-full px-4 py-2 text-left rounded-lg transition-colors ${currentQuality === q.index ? 'bg-red-600 text-white' : 'hover:bg-white/5'}`}>{q.height}P</button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={toggleFullscreen} className="hover:text-red-600 transition-all">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Container */}
                <div className="relative p-4 sm:p-6 md:p-8 backdrop-blur-3xl bg-secondary border border-white/5 overflow-hidden group/info">
                    {/* Decoration Background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 blur-[100px] pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-10">
                        <div className="absolute top-0 right-0 p-0 sm:p-4 shrink-0 z-20">
                            <ShareButton
                                title={video.title}
                                text={`Regardez ${video.title} en replay sur CRTV Web`}
                                className="w-10 h-10 md:w-16 md:h-16 flex items-center justify-center rounded-2xl bg-foreground/5 hover:bg-white/10 border border-white/5 transition-all duration-300 group/share"
                                iconClassName="w-5 h-5 md:w-8 md:h-8 transition-transform group-hover/share:scale-110"
                            />
                        </div>

                        {/* Channel Logo */}
                        <div className="relative w-24 h-16 sm:w-32 sm:h-24 rounded-2xl bg-black/5 p-4 border border-white/10 shadow-inner flex items-center justify-center overflow-hidden shrink-0">
                            <SafeImage
                                src={video.channel_logo || video.logo || "/assets/placeholders/radio_icon_sur_card.png"}
                                alt={video.title}
                                fill
                                className="object-contain brightness-110 drop-shadow-md"
                            />
                        </div>

                        {/* Content */}
                        <div className="flex-1 w-full text-center md:text-left space-y-4">
                            {/* Header: Status + Title */}
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-3">
                                <div className="flex items-center gap-2 px-3 py-1 bg-black/10 rounded-full w-fit">
                                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                                    <span className="text-[8px] font-bold uppercase tracking-widest">Replay</span>
                                </div>
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-black w-full uppercase tracking-tighter drop-shadow-sm pr-10 md:pr-0">
                                    {video.title}
                                </h2>
                            </div>
                        </div>
                    </div>
                    {/* Description */}
                    <div className="max-w-3xl pt-4 pb-8">
                        <p className="text-sm md:text-base text-foreground/50 leading-relaxed font-medium">
                            {video.desc || "Votre Chaîne, au cœur de l'actualité et de la culture. Restez à l'écoute pour nos programmes variés."}
                        </p>
                    </div>

                    {/* Program Info (New addition matching image) */}
                    <div className="pt-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-6 border-t border-foreground/30">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] sm:text-xs font-bold text-red-500 uppercase tracking-widest">
                                {"REPLAY"}
                            </span>
                        </div>
                        <div className="hidden md:block w-px h-4 bg-foreground/30" />
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[9px] sm:text-[10px] font-medium text-foreground/40 uppercase tracking-widest">PRÉSENTÉ DANS :</span>
                            <span className="text-[10px] sm:text-xs font-bold text-foreground uppercase tracking-wider">
                                {video.title || "Replay"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
