"use client";

import * as React from "react";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { LiveChannel, EPGItem } from "../../types/api";
import { useTranslations } from "next-intl";
import { SafeImage } from "../ui/SafeImage";

interface RadioPlayerSectionProps {
    channel: LiveChannel;
    currentProgram?: EPGItem;
}

export function RadioPlayerSection({ channel, currentProgram }: RadioPlayerSectionProps) {
    const t = useTranslations("radioPlayer");
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

    const frequency = channel.desc?.match(/(\d+\.?\d*)\s*(FM|MHz)/i)?.[0] || "FM";

    return (
        <div className="w-full space-y-6 ">
            {/* Main Player Container */}
            <div className="relative rounded-sm p-8 bg-white/30 dark:bg-black/50 backdrop-blur-2xl border border-gray-200 dark:border-white/10">
                {/* Loading Overlay */}
                {loading && !error && !isStreamDead && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-white text-lg font-semibold">{t('status.loading')}</p>
                            <p className="text-white/60 text-sm mt-2">{channel.title}</p>
                            <p className="text-white/40 text-xs mt-2">{t('status.longLoad')}</p>
                        </div>
                    </div>
                )}

                {/* Stream Dead Overlay */}
                {isStreamDead && (
                    <div className="absolute inset-0  rounded-2xl bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
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
                <div className="absolute rounded-2xl pointer-events-none inset-0">
                    <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl">
                        <SafeImage
                            src="/assets/logo/fondd.png"
                            alt="Background"
                            fill
                            className="object-cover opacity-50"
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

                <div className="relative z-10 flex flex-col items-center">
                    <div className=" mb-10 mt-[-35px] flex flex-col items-center bg-white/10 backdrop-blur-sm w-[250px] h-[200px] pt-5 pb-5 rounded-b-4xl">
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

                    {/* Circular Player Control */}
                    <div className="relative w-64 h-64 mb-8">
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
                                    {/* ... Buttons ... */}
                                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/50 cursor-not-allowed" disabled>
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

                                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/50 cursor-not-allowed" disabled>
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Meta Info Row */}
                    <div className="w-full max-w-2xl mx-auto flex items-center justify-between gap-4 py-3">
                        <div className="flex items-center gap-1 w-1/3 h-16">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div key={i} className="w-1 rounded-full bg-white/30" style={{ height: `${isActuallyPlaying ? 10 + ((i * 7) % 40) : 10}px`, animation: isActuallyPlaying ? `crtvWave ${900 + (i % 7) * 120}ms ease-in-out ${(i % 9) * 60}ms infinite alternate` : 'none' }} />
                            ))}
                        </div>

                        <div className="flex-1 flex flex-col justify-center text-center">
                            <h3 className="text-white font-bold text-lg">{channel.title}</h3>
                            <div className="flex items-center justify-center gap-2 text-sm text-white/60 mt-1">
                                <span className="flex items-center gap-1">
                                    <span className={`w-2 h-2 rounded-full ${isActuallyPlaying ? 'bg-red-500 animate-pulse' : isStreamDead ? 'bg-gray-500' : loading && isPlaying ? 'bg-yellow-500 animate-pulse' : 'bg-gray-500'}`} />
                                    {isActuallyPlaying ? t('player.live') : isStreamDead ? t('status.offline') : loading && isPlaying ? t('status.connecting') : t('status.ready')}
                                </span>
                                <span>•</span>
                                <span>{new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-1/3 justify-end whitespace-nowrap">
                            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                            </button>
                            <button onClick={toggleMute} disabled={!isActuallyPlaying} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed">
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
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Info */}
            <div className="relative p-8 md:p-10 backdrop-blur-3xl bg-background/85 border border-white/5 overflow-hidden group/info">
                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="relative w-32 h-24 rounded-2xl bg-black/5 p-4 border border-white/10 shadow-inner flex items-center justify-center overflow-hidden shrink-0">
                        <SafeImage
                            src={channel.hd_logo || channel.logo || "/assets/placeholders/radio_icon_sur_card.png"}
                            alt={channel.title}
                            fill
                            className="object-contain brightness-110 drop-shadow-md"
                        />
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <div className="flex items-center gap-2 px-3 py-1">
                                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Live</span>
                                <svg color="red" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">{channel.title}</h2>
                        </div>
                        <p className="text-sm md:text-base text-foreground/50 leading-relaxed max-w-3xl mx-auto md:mx-0">
                            {channel.desc || (
                                Object.entries(RADIO_FALLBACK_DATA).find(([key]) =>
                                    channel.title.toLowerCase().includes(key) || (channel.slug && channel.slug.toLowerCase().includes(key))
                                )?.[1].desc || t('fallback.desc')
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <audio ref={audioRef} src={streamUrl} preload="metadata" className="hidden" />
        </div>
    );
}
