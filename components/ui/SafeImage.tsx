"use client";

import * as React from "react";
import Image, { ImageProps } from "next/image";
import { SITE_CONFIG } from "@/constants/site-config";

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
    fallbackSrc?: string;
    containerClassName?: string;
}

/**
 * Standardized Image component that handles:
 * 1. Loading state (shows blurred logo placeholder)
 * 2. Error state (switches to logo fallback)
 * 3. Transitions
 */
export function SafeImage({
    src,
    alt,
    fallbackSrc = SITE_CONFIG.theme.placeholders.logo,
    className,
    containerClassName,
    fill,
    ...props
}: SafeImageProps) {
    const [imgSrc, setImgSrc] = React.useState(src);
    const [isLoading, setIsLoading] = React.useState(true);
    const [hasError, setHasError] = React.useState(false);

    React.useEffect(() => {
        setImgSrc(src);
        setHasError(false);
        // Only set loading if there's actually a source to load
        if (src) {
            setIsLoading(true);
        } else {
            setIsLoading(false);
            setHasError(true);
            setImgSrc(fallbackSrc);
        }
    }, [src, fallbackSrc]);

    const handleLoadingComplete = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        setHasError(true);
        setIsLoading(false);
        setImgSrc(fallbackSrc);
    };

    return (
        <div className={`relative overflow-hidden w-full h-full ${containerClassName || ""}`}>
            {/* Loading & Error Placeholder Overlay */}
            {(isLoading || hasError) && (
                <div className={`absolute inset-0 z-0 flex items-center justify-center p-6 bg-background/40 backdrop-blur-sm transition-opacity duration-500 ${!isLoading && hasError ? 'opacity-100' : 'opacity-100'}`}>
                    <Image
                        src={SITE_CONFIG.theme.placeholders.logo}
                        alt="CRTV"
                        width={80}
                        height={80}
                        className={`object-contain opacity-20  ${isLoading ? 'animate-pulse' : ''}`}
                        priority
                    />
                </div>
            )}

            <Image
                {...props}
                src={imgSrc || fallbackSrc}
                alt={alt || "CRTV Content"}
                fill={fill}
                className={[
                    className,
                    "transition-opacity duration-700 ease-in-out",
                    isLoading ? "opacity-0" : "opacity-100",
                    hasError ? "object-contain p-12 bg-muted/5 opacity-50" : ""
                ].join(" ")}
                onLoadingComplete={handleLoadingComplete}
                onError={handleError}
            />
        </div>
    );
}
