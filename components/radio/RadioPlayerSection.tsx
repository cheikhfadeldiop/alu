"use client";

import * as React from "react";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { LiveChannel, EPGItem } from "../../types/api";
import { useTranslations } from "next-intl";
import { SafeImage } from "../ui/SafeImage";
import { AdBannerV } from "../ui/AdBannerV";
import { ShareButton } from "../ui/ShareButton";
import { SITE_CONFIG } from "@/constants/site-config";
import { formatDate } from "@/utils/text";

interface RadioPlayerSectionProps {
    channel: LiveChannel | any;
    currentProgram?: EPGItem;
    onNextChannel?: () => void;
    onPrevChannel?: () => void;
    isReplay?: boolean;
}

export function RadioPlayerSection({ channel, currentProgram, onNextChannel, onPrevChannel, isReplay = false }: RadioPlayerSectionProps) {
    const t = useTranslations("pages.radioPlayer");
    const tCommon = useTranslations("common");

    const RADIO_FALLBACK_DATA: Record<string, { desc: string, presenter: string, program: string }> = {
        'poste-national': {
            desc: t('channels.poste-national.desc'),
            presenter: "EUGÈNE SIAKA",
            program: t('channels.poste-national.program')
        },
        'fm-94': {
            desc: t('channels.fm-94.desc'),
            presenter: "ÉQUIPE FM 94",
            program: t('channels.fm-94.program')
        },
        'fm-105': {
            desc: t('channels.fm-105.desc'),
            presenter: "ANTONY PAYSAN",
            program: t('channels.fm-105.program')
        },
        'mount-cameroon-fm': {
            desc: t('channels.mount-cameroon-fm.desc'),
            presenter: "PETER MBE",
            program: t('channels.mount-cameroon-fm.program')
        }
    };

    // ... existing hooks and standard variables ...
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
            if (!channel.stream_url) {
                setError(t('errors.noStream'));
                setLoading(false);
                return;
            }

            // If same URL, don't reset playback state
            if (channel.stream_url === streamUrl && isActuallyPlaying) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            setIsPlaying(false);
            setIsActuallyPlaying(false);
            setIsStreamDead(false);

            try {
                if (mounted) {
                    setStreamUrl(channel.stream_url);

                    // Try auto-play after a short delay
                    setTimeout(() => {
                        if (mounted && audioRef.current) {
                            audioRef.current.play().catch((err) => {
                                if (err.name === 'NotAllowedError') {
                                    setLoading(false);
                                } else {
                                    const errorMsg = t('errors.offline');
                                    setError(errorMsg);
                                    setLoading(false);
                                    setIsStreamDead(true);
                                }
                            });
                        }
                    }, 500);
                }
            } catch (err) {
                if (mounted) {
                    const errorMsg = err instanceof Error ? err.message : t('errors.playError');
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
    }, [channel.stream_url, retryTrigger]);

    // Cleanup when stream URL changes significantly
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // We only pause if the stream URL is actually changed to something else
        // or if we're unmounting (handled by the return function)
    }, [channel.stream_url]);

    // Handle audio element events
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        let playingTimeout: NodeJS.Timeout;
        let errorTimeout: NodeJS.Timeout;

        const handlePlay = () => {
            setIsPlaying(true);
            setIsStreamDead(false);
            clearTimeout(errorTimeout);

            playingTimeout = setTimeout(() => {
                if (!isActuallyPlaying) {
                    setError(t('errors.notResponding'));
                    setLoading(false);
                    setIsPlaying(false);
                    setIsStreamDead(true);
                    audio.pause();
                }
            }, 45000); // 45 secondes
        };

        const handlePause = () => {
            setIsPlaying(false);
            setIsActuallyPlaying(false);
            clearTimeout(playingTimeout);
            clearTimeout(errorTimeout);
        };

        const handleError = (e: Event) => {
            const audioElement = e.target as HTMLAudioElement;
            clearTimeout(errorTimeout);
            errorTimeout = setTimeout(() => {
                let errorMessage = t('errors.playError');
                let shouldMarkDead = true;

                if (audioElement.error) {
                    switch (audioElement.error.code) {
                        case MediaError.MEDIA_ERR_NETWORK:
                            errorMessage = t('errors.networkError');
                            break;
                        case MediaError.MEDIA_ERR_DECODE:
                            errorMessage = t('errors.formatError');
                            break;
                        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                            errorMessage = t('errors.unavailable');
                            break;
                        case MediaError.MEDIA_ERR_ABORTED:
                            if (isPlaying) {
                                errorMessage = t('errors.aborted');
                            } else {
                                shouldMarkDead = false;
                                return;
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
            }, 5000);

            clearTimeout(playingTimeout);
        };

        const handlePlaying = () => {
            setLoading(false);
            setIsActuallyPlaying(true);
            setError(null);
            setIsStreamDead(false);
            clearTimeout(playingTimeout);
            clearTimeout(errorTimeout);
        };

        const handleCanPlay = () => setLoading(false);
        const handleLoadedData = () => setLoading(false);

        audio.addEventListener("play", handlePlay);
        audio.addEventListener("pause", handlePause);
        audio.addEventListener("error", handleError);
        audio.addEventListener("playing", handlePlaying);
        audio.addEventListener("canplay", handleCanPlay);
        audio.addEventListener("loadeddata", handleLoadedData);

        return () => {
            clearTimeout(playingTimeout);
            clearTimeout(errorTimeout);
            audio.removeEventListener("play", handlePlay);
            audio.removeEventListener("pause", handlePause);
            audio.removeEventListener("error", handleError);
            audio.removeEventListener("playing", handlePlaying);
            audio.removeEventListener("canplay", handleCanPlay);
            audio.removeEventListener("loadeddata", handleLoadedData);
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
            return;
        }

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            setLoading(true);
            setError(null);
            setIsStreamDead(false);
            audioRef.current.play().catch((err) => {
                setError(t('errors.playFailed'));
                setLoading(false);
                setIsActuallyPlaying(false);
                setIsStreamDead(true);
            });
        }
    };

    const handleRetry = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setStreamUrl("");
        setError(null);
        setLoading(true);
        setIsPlaying(false);
        setIsActuallyPlaying(false);
        setIsStreamDead(false);
        setRetryTrigger(prev => prev + 1);
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };


    const frequency = channel.desc?.match(/(\d+\.?\d*)\s*(FM|MHz)/i)?.[0] || (isReplay ? "" : "FM");
    const statusLabel = isReplay ? "AUDIO PODCAST" : "RADIO EN DIRECT";
    const currentProgramTitle = isReplay ? channel.title : (currentProgram?.program_title ||
        (channel.slug && RADIO_FALLBACK_DATA[channel.slug] ? RADIO_FALLBACK_DATA[channel.slug].program : statusLabel));

    const currentPresenter = isReplay
        ? (channel.channel_name || "Audio")
        : ((currentProgram as any)?.presentateur || (currentProgram as any)?.presentateurs ||
            (RADIO_FALLBACK_DATA[channel.slug || ''] ? RADIO_FALLBACK_DATA[channel.slug || ''].presenter : t('fallback.presenter')));

    const displayDate = isReplay && channel.published_at ? formatDate(channel.published_at) : formatDate(new Date());
    const shareText = isReplay ? `Écoutez cet audio : ${channel.title} sur ${SITE_CONFIG.name} Web` : `Écoutez ${channel.title} en direct sur ${SITE_CONFIG.name} Web`;

    return (
        <div className="flex flex-col xl:flex-row justify-between gap-8">
            <div className="w-full xl:w-[68%] flex-1">
                {/* Main Player Container */}
                <div className="relative overflow-hidden bg-white/30 dark:bg-black/50 backdrop-blur-2xl border border-gray-200 dark:border-white/10 ">
                    {/* Stream Dead Overlay */}
                    {isStreamDead && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
                            <div className="text-center max-w-md px-6">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                </div>
                                <h3 className="text-white text-lg sm:text-xl font-bold mb-3">{isReplay ? "Audio indisponible" : t('status.offlineTitle')}</h3>
                                <p className="text-white/70 text-sm mb-6">
                                    {error || (isReplay ? "Le fichier audio ne peut pas être lu pour le moment." : t('status.offlineMessage'))}
                                </p>
                                <button
                                    onClick={handleRetry}
                                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    {t('player.retry')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Background Pattern */}
                    <div className="absolute pointer-events-none inset-0">
                        <div className="absolute inset-0 z-0 overflow-hidden">
                            <SafeImage
                                src="/assets/logo/fondd.png"
                                alt="Background"
                                fill
                                className="object-cover opacity-10 bg-black/10 backdrop-blur-sm"
                            />
                        </div>
                        <svg className="w-full h-full relative z-10" viewBox="0 0 1000 400" preserveAspectRatio="none">
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

                    <div className="relative z-10 flex flex-col items-center justify-center pt-8 sm:pt-16 pb-6 sm:pb-8 px-4 sm:px-6 text-center w-full">
                        {/* Circular Player Control */}
                        <div className="relative w-40 h-40 sm:w-64 sm:h-64 mb-6 sm:mb-8">
                            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                                {isActuallyPlaying && (
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="url(#gradient)" strokeWidth="2" strokeDasharray="283" strokeDashoffset="0" strokeLinecap="round">
                                        <animate attributeName="stroke-dashoffset" from="283" to="0" dur="60s" repeatCount="indefinite" />
                                    </circle>
                                )}
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#ef4444" />
                                        <stop offset="100%" stopColor="#22c55e" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            <div className="absolute inset-2 sm:inset-4">
                                <div className="relative w-full h-full rounded-full bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl flex items-center justify-center">
                                    <div className="flex items-center gap-2 sm:gap-4">
                                        {/* Prev Button */}
                                        <button
                                            onClick={onPrevChannel}
                                            className="w-8 h-8 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-90 disabled:opacity-30"
                                            disabled={!onPrevChannel}
                                        >
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 -scale-x-100" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
                                            </svg>
                                        </button>

                                        {/* Play/Pause Button */}
                                        <button
                                            onClick={handlePlayPause}
                                            disabled={loading || isStreamDead}
                                            className="w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-white text-gray-900 hover:bg-gray-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl border-4 border-white/20"
                                        >
                                            {loading && !isStreamDead ? (
                                                <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                                            ) : isPlaying ? (
                                                <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <svg className="w-8 h-8 sm:w-10 sm:h-10 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                                </svg>
                                            )}
                                        </button>

                                        {/* Next Button */}
                                        <button
                                            onClick={onNextChannel}
                                            className="w-8 h-8 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-90 disabled:opacity-30"
                                            disabled={!onNextChannel}
                                        >
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Divider Line */}
                        <div className="w-[90%] h-px bg-[#4A4A4A] relative z-[2] mb-6" />

                        {/* Meta Row */}
                        <div className="flex flex-col sm:flex-row items-center justify-between w-full px-4 sm:px-8 py-4 gap-6 sm:gap-4 relative z-[2]">
                            {/* Left: album art placeholder + program info */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
                                {/* Waveform animation */}
                                <div className="flex items-end gap-0.5 min-w-[60px]" style={{ height: 36 }}>
                                    {Array.from({ length: 18 }).map((_, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                width: 2.5,
                                                borderRadius: 2,
                                                background: "#fff",
                                                height: isActuallyPlaying ? `${6 + ((i * 7) % 22)}px` : "6px",
                                                transformOrigin: "bottom",
                                                animation: isActuallyPlaying
                                                    ? `rpWave ${500 + (i % 5) * 120}ms ease-in-out ${(i % 7) * 40}ms infinite alternate`
                                                    : "none",
                                                opacity: 0.7,
                                            }}
                                        />
                                    ))}
                                </div>


                            </div>
                            {/* Program title + badges */}
                            <div className="flex flex-col ml-25  items-center sm:items-start text-center sm:text-left">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[15px] sm:text-[17px] font-bold text-[#D2D2D2] line-clamp-1 max-w-[200px]">
                                        {currentProgramTitle}
                                    </span>

                                </div>

                                {/* Date and Time */}
                                <div className="flex items-center gap-4 text-muted text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>{displayDate}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: action buttons */}
                            <div className="flex items-center gap-3">
                                {/* Secondary Play Button */}
                                <button
                                    onClick={handlePlayPause}
                                    disabled={loading || isStreamDead}
                                    className="w-12 h-12 rounded-full border border-[#777] flex items-center justify-center transition-all bg-transparent hover:bg-white/5 active:scale-95 disabled:opacity-20"
                                >
                                    {isPlaying ? (
                                        <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                                            <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 fill-white ml-1" viewBox="0 0 24 30">
                                            <path d="M5 3l18 12L5 27V3z" />
                                        </svg>
                                    )}
                                </button>

                                {/* Mute Button */}
                                <button
                                    onClick={toggleMute}
                                    className="w-12 h-12 rounded-full border border-[#777] flex items-center justify-center transition-all bg-transparent hover:bg-white/5 active:scale-95"
                                >
                                    {isMuted ? (
                                        <svg className="w-6 h-6 fill-none stroke-white" strokeWidth={1.5} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z m11.414-1l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6 fill-none stroke-white" strokeWidth={1.5} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        </svg>
                                    )}
                                </button>

                                <ShareButton title={channel.title} text={shareText}>
                                    <div className="w-12 h-12 rounded-full border border-[#777] flex items-center justify-center transition-all bg-transparent hover:bg-white/5">
                                        <svg className="w-5 h-5 fill-none stroke-white" strokeWidth={1.5} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                    </div>
                                </ShareButton>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sub-info Section */}
                <div className="flex flex-col justify-center items-center w-full bg-[#1C1C1C] p-6 sm:p-8">
                    <div className="flex flex-col items-start w-full gap-5 lg:gap-[22px]">
                        {/* Header row */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
                            <div className="flex flex-row items-center gap-3">
                                <div className="relative w-[80px] sm:w-[95px] h-[36px] sm:h-[42px] flex-shrink-0">
                                    <SafeImage src={channel.hd_logo || channel.logo} alt={channel.title} fill className="object-contain" />
                                </div>
                                <div className="flex flex-row items-center gap-1 sm:gap-[3px]">
                                    <svg width="12" height="24" viewBox="0 0 12 24" fill="none" className="shrink-0">
                                        <path d="M3 8L9 12L3 16" stroke="#F80000" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                    <h2 className="b1 font-bold text-white line-clamp-1">{channel.title}</h2>
                                </div>
                            </div>

                            <ShareButton
                                title={channel.title}
                                text={shareText}
                                className="flex justify-center items-center shrink-0"
                                iconClassName="w-6 h-6"
                            />
                        </div>

                        <p className="b2 text-[#8E8E8E] max-w-[800px] line-clamp-4 leading-relaxed">
                            {channel.desc || "Votre Chaîne, au cœur de l'actualité et de la culture. Restez à l'écoute pour nos programmes variés."}
                        </p>

                        <div className="flex flex-wrap items-center w-full gap-2 py-2">
                            <span className="b3 font-bold text-[#FF0000]">{statusLabel}</span>
                            <span className="b3 font-bold text-[#8E8E8E]">| {isReplay ? "SOURCE" : "DIFUSER SUR"} :</span>
                            <span className="b3 font-bold text-white/70">{isReplay ? (channel.channel_name || channel.title) : channel.title}</span>
                        </div>
                    </div>
                </div>

                <audio ref={audioRef} src={streamUrl || undefined} preload="metadata" className="hidden" />
            </div>

            <div className="w-full xl:w-[434px] xl:sticky xl:top-24 h-fit flex justify-center">
                <AdBannerV />
            </div>
        </div>

    );
}
