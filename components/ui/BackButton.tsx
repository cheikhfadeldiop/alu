"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const BackIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
);

export function BackButton() {
    const router = useRouter();
    const t = useTranslations("common");

    return (
        <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[color:var(--accent)] hover:opacity-70 transition-opacity mb-6"
        >
            <BackIcon />
            {t("previous") || "RETOUR"}
        </button>
    );
}
