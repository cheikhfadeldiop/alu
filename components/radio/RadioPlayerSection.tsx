"use client";

import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { LiveChannel, EPGItem } from "../../types/api";
import { useTranslations } from "next-intl";
import { SafeImage } from "../ui/SafeImage";
import { ShareButton } from "../ui/ShareButton";
import { SITE_CONFIG } from "@/constants/site-config";

interface RadioPlayerSectionProps {
    channel: LiveChannel | any;
    currentProgram?: EPGItem;
    isReplay?: boolean;
}

export function RadioPlayerSection({ channel, currentProgram, isReplay = false }: RadioPlayerSectionProps) {
    const t = useTranslations("pages.radioPlayer");

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


    const shareText = isReplay
        ? t("shareReplayText", { channelTitle: channel.title, siteName: SITE_CONFIG.name })
        : t("shareLiveText", { channelTitle: channel.title, siteName: SITE_CONFIG.name });

    return (
        <section className="relative mx-auto h-auto md:h-[605px] w-full max-w-[1220px] rounded-[30px] md:rounded-[80px] bg-[#1A1A1A] overflow-hidden py-8 md:py-0">
            <div className="relative md:absolute md:left-1/2 md:top-1/2 flex h-auto md:h-[484px] w-full max-w-[1126px] md:-translate-x-1/2 md:-translate-y-1/2 flex-col md:flex-row items-center justify-center gap-8 md:gap-[79px] px-6 md:px-0">
                
                <div className="relative h-[300px] w-[300px] md:h-[484px] md:w-[504px] overflow-hidden flex-shrink-0">
                    <div className="absolute left-1/2 top-1/2 h-[260px] w-[260px] md:h-[360px] md:w-[360px] -translate-x-1/2 -translate-y-1/2">
                        {Array.from({ length: 84 }).map((_, index) => {
                            const angle = (index / 84) * Math.PI * 2;
                            const radius = typeof window !== 'undefined' && window.innerWidth < 768 ? 120 : 162;
                            const center = typeof window !== 'undefined' && window.innerWidth < 768 ? 130 : 180;
                            const x = center + Math.cos(angle) * radius;
                            const y = center + Math.sin(angle) * radius;

                            return (
                                <span
                                    key={index}
                                    className={`radio-dot ${isActuallyPlaying ? "radio-dot--animated" : ""}`}
                                    style={{
                                        left: `${x}px`,
                                        top: `${y}px`,
                                        animationDelay: `${index * 18}ms`,
                                        transform: `translate(-50%, -50%) rotate(${(angle * 180) / Math.PI}deg)`,
                                    }}
                                />
                            );
                        })}
                    </div>
                </div>

                <div className="flex h-auto md:h-[359px] w-full md:w-[543px] flex-col items-center md:items-start gap-6 md:gap-[24px]">
                    <div className="h-auto md:h-[250px] w-full text-center md:text-left">
                        <div className="relative h-[60px] md:h-[95px] w-[100px] md:w-[163px] mx-auto md:mx-0">
                            <SafeImage
                                src={SITE_CONFIG.theme.placeholders.logo}
                                alt={channel.title}
                                fill
                                className="object-contain"
                            />
                        </div>
                        <p className="mt-6 md:mt-8 text-[13px] md:text-[14px] leading-relaxed text-[#A4A4A4] line-clamp-4 md:line-clamp-none">
                            {currentProgram?.program_desc || t("fallback.desc")}
                        </p>
                    </div>

                    <div className="flex h-[75px] md:h-[85px] w-[260px] md:w-[282px] items-center justify-center rounded-[110px] bg-[#333333] p-[10px]">
                        <div className="flex h-full w-full items-center justify-center gap-[30px] md:gap-[37px]">
                            <ShareButton title={channel.title} text={shareText}>
                                <button
                                    type="button"
                                    className="flex h-[44px] w-[44px] md:h-[50px] md:w-[50px] items-center justify-center rounded-full border border-[#4A4A4A]"
                                >
                                    <svg className="h-5 w-5 md:h-6 md:w-6 fill-none stroke-[#BBBBBB]" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                </button>
                            </ShareButton>

                            <button
                                onClick={handlePlayPause}
                                disabled={loading || isStreamDead}
                                className="flex h-[56px] w-[56px] md:h-[66px] md:w-[66px] items-center justify-center rounded-full border border-white"
                            >
                                {loading && !isStreamDead ? (
                                    <div className="h-6 w-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                ) : isPlaying ? (
                                    <div className="flex flex-row items-center gap-[4px] md:gap-[5px]">
                                        <div className="h-[18px] md:h-[20px] border-l-[4px] border-[#F7F7F4]" />
                                        <div className="h-[18px] md:h-[20px] border-l-[4px] border-[#F7F7F4]" />
                                    </div>
                                ) : (
                                    <svg viewBox="0 0 18 24" fill="#F7F7F4" className="h-[20px] w-[15px] md:h-[24px] md:w-[18px]">
                                        <path d="M0 0L18 12L0 24V0Z" />
                                    </svg>
                                )}
                            </button>

                            <button
                                onClick={toggleMute}
                                type="button"
                                className="flex h-[44px] w-[44px] md:h-[50px] md:w-[50px] items-center justify-center rounded-full border border-[#4A4A4A]"
                            >
                                {isMuted ? (
                                    <svg className="h-5 w-5 md:h-6 md:w-6 fill-none stroke-[#BBBBBB]" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z m11.414-1l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5 md:h-6 md:w-6 fill-none stroke-[#BBBBBB]" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {isStreamDead && (
                        <div className="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-200 text-center">
                            <p>
                                {error ||
                                    (isReplay ? t("status.replayOfflineMessage") : t("status.offlineMessage"))}
                            </p>
                            <button onClick={handleRetry} className="mt-2 text-xs font-semibold uppercase text-red-100 underline">
                                {t('player.retry')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <audio ref={audioRef} src={streamUrl || undefined} preload="metadata" className="hidden" />
            <style jsx>{`
                .radio-dot {
                    position: absolute;
                    width: 3px;
                    height: 3px;
                    border-radius: 9999px;
                    background: rgba(119, 71, 145, 0.7);
                    transform-origin: center center;
                }

                .radio-dot--animated {
                    animation: radioDotPulse 1.5s ease-in-out infinite;
                }

                @keyframes radioDotPulse {
                    0% {
                        opacity: 0.45;
                        box-shadow: 0 0 0 0 rgba(119, 71, 145, 0.25);
                        transform: translate(-50%, -50%) scale(1);
                    }
                    50% {
                        opacity: 1;
                        box-shadow: 0 0 8px 1px rgba(119, 71, 145, 0.6);
                        transform: translate(-50%, -50%) scale(1.9);
                    }
                    100% {
                        opacity: 0.45;
                        box-shadow: 0 0 0 0 rgba(119, 71, 145, 0.25);
                        transform: translate(-50%, -50%) scale(1);
                    }
                }
            `}</style>
        </section>


    );
}
