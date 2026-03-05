"use client";

import * as React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface ShareButtonProps {
    title: string;
    text: string;
    url?: string;
    className?: string;
    iconClassName?: string;
    children?: React.ReactNode;
}

export function ShareButton({ title, text, url, className, iconClassName, children }: ShareButtonProps) {
    const t = useTranslations("common");

    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (typeof window === 'undefined') return;

        const shareUrl = url || window.location.href;
        const shareData = {
            title,
            text,
            url: shareUrl,
        };

        try {
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(shareUrl);
                alert(t('linkCopied') || "Lien copié !");
            } else {
                // Fallback for non-secure contexts or older browsers
                const textArea = document.createElement("textarea");
                textArea.value = shareUrl;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    alert(t('linkCopied') || "Lien copié !");
                } catch (err) {
                    console.error('Fallback copy failed', err);
                }
                document.body.removeChild(textArea);
            }
        } catch (err) {
            if ((err as Error).name !== 'AbortError') {
                console.error('Share failed:', err);
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            className={className + " flex items-center justify-center"}
            title={ "Partager"}
        >
            {children || (
                <Image src="/assets/placeholders/sharp.png" alt="Partager" width={50} height={50} />
            )}
        </button>
    );
}
