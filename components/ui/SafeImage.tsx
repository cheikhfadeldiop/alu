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
    priority,
    ...props
}: SafeImageProps) {
    const [imgSrc, setImgSrc] = React.useState(src);
    const [isLoading, setIsLoading] = React.useState(true);
    const [hasError, setHasError] = React.useState(false);

    React.useEffect(() => {
        setImgSrc(src);
        setHasError(false);
        if (!src) {
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
        <div className={`relative overflow-hidden w-full h-full bg-foreground/5 ${containerClassName || ""}`}>
            {/* Placeholder Background (always behind the image) */}
            {(isLoading || hasError) && (
                <div className="absolute inset-0 flex items-center justify-center p-6 grayscale opacity-20 transition-opacity duration-300">
                    <Image
                        src={SITE_CONFIG.theme.placeholders.logo}
                        alt="Loading..."
                        width={60}
                        height={60}
                        className={`object-contain ${isLoading && !hasError ? 'animate-pulse' : ''}`}
                    />
                </div>
            )}

            <Image
                {...props}
                src={imgSrc || fallbackSrc}
                alt={alt || "CRTV Content"}
                fill={fill}
                priority={priority}
                className={[
                    className,
                    "transition-opacity duration-500 ease-out",
                    hasError ? "object-contain p-12 opacity-50" : "opacity-100"
                ].join(" ")}
                onLoadingComplete={handleLoadingComplete}
                onError={handleError}
            />
        </div>
    );
}
