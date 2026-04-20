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
    const [isLoading, setIsLoading] = React.useState(true);
    const [hasError, setHasError] = React.useState(false);
  
    // Domains problématiques (bypass optimisation Next.js)
    const isProblematicDomain =
      typeof src === "string" &&
      [
        
        "www.figma.com/api/mcp/asset/"
      ].some((domain) => src.includes(domain));
  
    React.useEffect(() => {
      setHasError(false);
      setIsLoading(Boolean(src));
      if (!src) {
        setIsLoading(false);
      }
    }, [src]);
  
    const handleLoad = () => {
      setIsLoading(false);
    };
  
    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
    };

    const sanitizeImageSrc = (value: ImageProps["src"]) => {
      if (typeof value !== "string") return value;

      const trimmed = value.trim();
      const firstCandidate = trimmed.split(",")[0]?.trim() || trimmed;
      const withoutDescriptor = firstCandidate.replace(/\s+\d+w$/i, "");

      return withoutDescriptor || fallbackSrc;
    };

    const resolvedSrc = sanitizeImageSrc((hasError ? fallbackSrc : (src || fallbackSrc)) as ImageProps["src"]);
  
    return (
      <div
        className={`relative w-full h-full overflow-hidden ${containerClassName || ""}`}
      >
        {/* Placeholder */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center p-6 grayscale opacity-20 transition-opacity duration-300">
            <Image
              src={SITE_CONFIG.theme.placeholders.logo}
              alt="Loading..."
              width={60}
              height={60}
              className={`object-contain ${
                isLoading && !hasError ? "animate-pulse" : ""
              }`}
            />
          </div>
        )}
  
        <Image
          {...props}
          src={resolvedSrc}
          alt={alt || `${SITE_CONFIG.name} Content`}
          fill={fill}
          priority={priority}
          unoptimized={isProblematicDomain || (props as any).unoptimized}
          onLoad={handleLoad}
          onError={handleError}
          className={[
            className,
            "transition-opacity duration-500 ease-out",
            hasError ? "object-contain p-12 opacity-50" : "opacity-100"
          ].join(" ")}
        />
      </div>
    );
  }
