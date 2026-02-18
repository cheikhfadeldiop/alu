"use client";

import * as React from "react";
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
            className={className}
            title={t('share') || "Partager"}
        >
            {children || (
                <svg className={iconClassName || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
            )}
        </button>
    );
}
