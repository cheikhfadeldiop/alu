"use client";

import { useMemo } from "react";
import { RadioPlayerSection } from "./RadioPlayerSection";
import { LiveChannel, EPGItem } from "../../types/api";
import { useTranslations } from "next-intl";
import { AdBannerHD } from "../ui/AdBanner";

interface RadioPageClientProps {
    initialRadios: LiveChannel[];
    epgData: EPGItem[];
}

export function RadioPageClient({ initialRadios, epgData }: RadioPageClientProps) {
    const t = useTranslations("pages.radio");
    const selectedRadio = initialRadios[0];

    // Current EPG items for all channels (for carousel info)
    const currentPrograms = useMemo(() => {
        return epgData.filter(item => item.is_current);
    }, [epgData]);

    // Current program for the selected radio
    const currentRadioProgram = useMemo(() => {
        if (!selectedRadio) return undefined;
        return currentPrograms.find(p => p.channel_id === selectedRadio.id);
    }, [selectedRadio, currentPrograms]);

    if (!selectedRadio) {
        return <div className="text-center text-foreground py-20">{t("noRadioAvailable")}</div>;
    }

    return (
        <div className="space-y-8 md:space-y-12">
            <section className="relative mx-auto h-[247px] w-full max-w-[1227px] overflow-hidden ">
            <AdBannerHD/>

            </section>
            <RadioPlayerSection
                channel={selectedRadio}
                currentProgram={currentRadioProgram}
            />
        </div>
    );
}
