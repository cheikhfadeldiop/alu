import { Suspense } from "react";
import {
    getSliderVideos,
    getLiveChannels,
    getEPGNow,
    getWordPressAlaunePost,
    getWordPressPosts,
    getLatestAggregateReplays,
    getWordPressLatestPosts,
    getLiveRadios,
    getEPGAll
} from "@/services/api";
import { SITE_CONFIG } from "@/constants/site-config";
import {
    WordPressNewsSection,
    LiveChannelsGrid,
    DernieresEditions,
    EditorialChoice,
    RegionalCategoriesSection,
    CategoryWithAdSection,
    ShortsCarousel,
    CorporateNewsSection,
    PromoAntenne
} from "./index";
import {
    WordPressNewsShimmer,
    LiveChannelsShimmer,
    ShortsShimmer,
    CorporateShimmer
} from "../ui/shimmer/HomeShimmers";
import { getTranslations } from "next-intl/server";

export async function WordPressNewsWrapper() {
    const [alauneItems, trendingItems] = await Promise.all([
        getWordPressAlaunePost().catch(() => []),
        getWordPressPosts(SITE_CONFIG.categories.news.trending, 10).catch(() => []),
    ]);
    return <WordPressNewsSection alauneItems={alauneItems} trendingItems={trendingItems} />;
}

export async function LiveChannelsWrapper() {
    const t = await getTranslations("pages.home");
    const tc = await getTranslations("common");
    const [channelsRes, epgRes] = await Promise.all([
        getLiveChannels().catch(() => ({ allitems: [] })),
        getEPGNow().catch(() => ({ allitems: [] })),
    ]);
    return (
        <LiveChannelsGrid
            channels={channelsRes.allitems || []}
            epgItems={epgRes.allitems || []}
            title={t("liveChannels")}
            title2={t("liveChannelsSuffix")}
            actionLabel={tc("seeAll")}
        />
    );
}

export async function DernieresEditionsWrapper() {
    const allReplays = await getLatestAggregateReplays().catch(() => []);
    return <DernieresEditions videos={allReplays} />;
}

export async function EditorialChoiceWrapper() {
    const t = await getTranslations("pages.home");
    const tc = await getTranslations("common");
    const trendingItems = await getWordPressPosts(SITE_CONFIG.categories.news.trending, 10).catch(() => []);
    return (
        <EditorialChoice
            items={trendingItems}
            title={t("editorChoice")}
            title2=''
            actionLabel={tc("seeAll")}
        />
    );
}

export async function RegionalCategoriesWrapper() {
    const [radioRes, replayItems] = await Promise.all([
        getLiveRadios().catch(() => ({ allitems: [] })),
        getLatestAggregateReplays().catch(() => []),
    ]);
    return (
        <RegionalCategoriesSection
            radioItems={radioRes.allitems || []}
            replayItems={replayItems || []}
        />
    );
}

export async function CategoryWithAdWrapper() {
    const t = await getTranslations("pages.home");
    const posts = await getWordPressLatestPosts(8).catch(() => []);
    return (
        <CategoryWithAdSection
            title={t("regionalNews") + " " + t("regionalNewsSuffix")}
            title2=''

            posts={posts}
            categorySlug="rts-1"
        />
    );
}

export async function ShortsCarouselWrapper() {
    const t = await getTranslations("pages.home");
    const tc = await getTranslations("common");
    const sliderVideosRes = await getSliderVideos().catch(() => ({ allitems: [] }));
    return (
        <ShortsCarousel
            videos={sliderVideosRes.allitems || []}
            title={t("shorts") + " " + t("shortsSuffix")}
            title2=""
            actionLabel=''
        />
    );
}

export async function CorporateNewsWrapper() {
    const posts = await getWordPressLatestPosts(3).catch(() => []);
    return (
        <CorporateNewsSection
            title="Corporate News"
            title2=""
            posts={posts}
        />
    );
}

export async function PromoAntenneWrapper({ titre, showMetadata = false }: { titre?: string, showMetadata?: boolean }) {
    const epgData = await getEPGAll().catch(() => []);

    // Flatten programs similar to UpcomingProgramsTimeline logic
    const allPrograms = epgData.flatMap(channel => {
        const { matin = [], soir = [] } = channel.subitems || {};
        return [...matin, ...soir].map(prog => ({
            ...prog,
            channelName: channel.titre,
            channelLogo: channel.logo
        }));
    }).toReversed().slice(0, 4);

    return (
        <PromoAntenne
            programs={allPrograms}
            title={titre || "PROMO D'ANTENNE"}
            showMetadata={showMetadata}
        />
    );
}
