"use client";

import * as React from "react";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { LiveChannel, EPGItem } from "../../types/api";
import { useTranslations } from "next-intl";
import { SafeImage } from "../ui/SafeImage";
import { AdBannerV } from "../ui/AdBannerV";

interface RadioPlayerSectionProps {
    channel: LiveChannel;
    currentProgram?: EPGItem;
    onNextChannel?: () => void;
    onPrevChannel?: () => void;
}

export function RadioPlayerSection({ channel, currentProgram, onNextChannel, onPrevChannel }: RadioPlayerSectionProps) {
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
            setLoading(true);
            setError(null);
            setIsPlaying(false);
            setIsActuallyPlaying(false);
            setIsStreamDead(false);

            try {
                if (!channel.stream_url) {
                    throw new Error(t('errors.noStream'));
                }

                if (mounted) {
                    setStreamUrl(channel.stream_url);

                    // Try auto-play after a short delay
                    setTimeout(() => {
                        if (mounted && audioRef.current) {
                            audioRef.current.play().catch((err) => {
                                // Check if it's an actual error or just autoplay policy
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
    }, [channel, retryTrigger]);

    // Cleanup when channel changes
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        return () => {
            audio.pause();
            audio.currentTime = 0;
            setIsPlaying(false);
            setIsActuallyPlaying(false);
        };
    }, [channel.id]);

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

        audio.addEventListener("play", handlePlay);
        audio.addEventListener("pause", handlePause);
        audio.addEventListener("error", handleError);
        audio.addEventListener("playing", handlePlaying);

        return () => {
            clearTimeout(playingTimeout);
            clearTimeout(errorTimeout);
            audio.removeEventListener("play", handlePlay);
            audio.removeEventListener("pause", handlePause);
            audio.removeEventListener("error", handleError);
            audio.removeEventListener("playing", handlePlaying);
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

    const handleShare = async () => {
        if (typeof window === 'undefined') return;

        const shareData = {
            title: channel.title,
            text: `Écoutez ${channel.title} sur CRTV Web`,
            url: window.location.href,
        };

        try {
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(window.location.href);
                // Ideally, show a toast notification here
                alert(tCommon('linkCopied') || "Lien copié !");
            } else {
                // Fallback for browsers without clipboard API or non-secure contexts
                const textArea = document.createElement("textarea");
                textArea.value = window.location.href;
                // Avoid scrolling to bottom
                textArea.style.top = "0";
                textArea.style.left = "0";
                textArea.style.position = "fixed";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    alert(tCommon('linkCopied') || "Lien copié !");
                } catch (err) {
                    console.error('Fallback: Oops, unable to copy', err);
                }
                document.body.removeChild(textArea);
            }
        } catch (err) {
            console.error('Share failed:', err);
        }
    };

    const frequency = channel.desc?.match(/(\d+\.?\d*)\s*(FM|MHz)/i)?.[0] || "FM";
    const currentProgramTitle = currentProgram?.program_title ||
        (channel.slug && RADIO_FALLBACK_DATA[channel.slug] ? RADIO_FALLBACK_DATA[channel.slug].program : t('fallback.program'));
    const currentPresenter = RADIO_FALLBACK_DATA[channel.slug || ''] ?
        RADIO_FALLBACK_DATA[channel.slug || ''].presenter : t('fallback.presenter');

    return (
        <div className="flex flex-col lg:flex-row justify-between gap-8">
            <div className="w-full lg:w-[68%] h-auto ">
                {/* Main Player Container */}
                <div className=" relative  bg-white/30 dark:bg-black/50 backdrop-blur-2xl border border-gray-200 dark:border-white/10">
                    {/* ... content ... */}
                    {/* Stream Dead Overlay */}
                    {isStreamDead && (
                        <div className="absolute inset-0  bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
                            <div className="text-center max-w-md px-6">
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                                    <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                </div>
                                <h3 className="text-white text-xl font-bold mb-3">{t('status.offlineTitle')}</h3>
                                <p className="text-white/70 text-sm mb-6">
                                    {error || t('status.offlineMessage')}
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
                        <div className="absolute  inset-0 z-0 overflow-hidden">
                            <SafeImage
                                src="/assets/logo/fondd.png"
                                alt="Background"
                                fill
                                className="object-cover opacity-10 bg-white/10 backdrop-blur-sm"
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

                    <div className="relative z-10 flex flex-col items-center justify-center pt-24 pb-12 px-6 text-center">
                        {/*<div className=" mt-[-35px] flex flex-col items-center bg-white/10 backdrop-blur-sm w-[250px] h-[200px] pt-5 pb-5 rounded-b-4xl">
                            <div className="mb-4 relative w-24 h-24 overflow-hidden rounded-full border-2 border-white/20">
                                <SafeImage
                                    src={channel.logo_url || channel.logo || channel.hd_logo || "/assets/placeholders/radio_icon_sur_card.png"}
                                    alt={channel.title}
                                    fill
                                    className="object-contain bg-black"
                                />
                            </div>

                            <div className="text-4xl font-bold text-white mb-8 tracking-tight mt-4">
                                {frequency}
                            </div>
                        </div>
                        */}

                        <div className="relative w-44 h-44 mb-0 " />

                        {/* Circular Player Control */}
                        <div className="relative w-64 h-64">
                            {/* ... SVG Circle Logic ... */}
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

                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl flex items-center justify-center">
                                    <div className="flex items-center gap-4">
                                        {/* Prev Button */}
                                        <button
                                            onClick={onPrevChannel}
                                            className={`w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors ${!onPrevChannel ? 'cursor-not-allowed opacity-50' : ''}`}
                                            disabled={!onPrevChannel}
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" transform="scale(-1, 1) translate(-20, 0)" />

                                            </svg>
                                        </button>

                                        {/* Play/Pause Button */}
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

                                        {/* Next Button */}
                                        <button
                                            onClick={onNextChannel}
                                            className={`w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors ${!onNextChannel ? 'cursor-not-allowed opacity-50' : ''}`}
                                            disabled={!onNextChannel}
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" transform="scale(-1, 1) translate(-20, 0)" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative w-44 h-24 mt-0 " />
                        {/* Meta Info Row */}
                        <div className="w-full max-w-3xl mx-auto mt-6 pt-6 border-t border-white/10 flex items-center justify-between gap-6">
                            <div className="hidden md:flex items-end gap-1 w-1/4 h-12">
                                {Array.from({ length: 20 }).map((_, i) => (
                                    <div key={i} className="w-1 rounded-full bg-white/30" style={{ height: `${isActuallyPlaying ? 10 + ((i * 7) % 40) : 10}px`, animation: isActuallyPlaying ? `crtvWave ${900 + (i % 7) * 120}ms ease-in-out ${(i % 9) * 60}ms infinite alternate` : 'none' }} />
                                ))}
                            </div>

                            {/* Center: Title & Info */}
                            <div className="flex-1 flex flex-col items-center justify-center overflow-hidden px-4">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-white text-lg font-medium truncate max-w-full">
                                        {currentProgramTitle}
                                    </h3>
                                    <span className="shrink-0 flex items-center gap-1.5 bg-red-500/20 px-2 py-0.5 rounded-full border border-red-500/30">
                                        <span className={`w-1.5 h-1.5 rounded-full ${isActuallyPlaying ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
                                        <span className="text-[10px] uppercase font-bold text-red-100 tracking-wider">On air</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-white/50">
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>{new Date().toLocaleDateString('fr-FR', { weekday: 'long' })}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-3 shrink-0">
                                <button onClick={handleShare} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                </button>
                                <button onClick={toggleMute} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                                    {isMuted ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        </svg>
                                    )}
                                </button>
                                <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Premium Info */}
                <div className="relative p-8 md:p-10  backdrop-blur-3xl  bg-secondary    border border-white/5 overflow-hidden group/info">
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
                                <h2 className="text-2xl  w-[70%] md:text-3xl font-black  uppercase tracking-tighter drop-shadow-sm">
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
                    <div className="pt-4 flex flex-col md:flex-row md:items-center gap-4 md:gap-6 border-t border-foreground/30">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
                                {"RADIO EN DIRECT"}
                            </span>
                        </div>
                        <div className="hidden md:block w-px h-4 bg-foreground/30" />
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium text-foreground/40 uppercase tracking-widest">DIFFUSÉ SUR :</span>
                            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                                {channel.title || "RADIO EN DIRECT"}
                            </span>
                        </div>
                    </div>
                </div>

                <audio ref={audioRef} src={streamUrl || undefined} preload="metadata" className="hidden" />
            </div>
            <div className="w-full lg:w-[30%] sticky top-24 h-fit">
                <AdBannerV />
            </div>
        </div>

    );
}
