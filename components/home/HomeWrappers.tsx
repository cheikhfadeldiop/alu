import { Suspense } from "react";
import {
    getSliderVideos,
    getLiveChannels,
    getEPGNow,
    getWordPressAlaunePost,
    getWordPressPosts,
    getLatestAggregateReplays,
    getWordPressLatestPosts,
    getLatestAOD,
    getLiveRadios,
    getEPGAll,
    getShortVideos
} from "@/services/api";
import { SITE_CONFIG } from "@/constants/site-config";
import { parseToDate, decodeHtmlEntities, getPostAuthor, formatDate } from "@/utils/text";
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
        getWordPressLatestPosts(10).catch(() => []),
    ]);

    const sortedAlaune = [...alauneItems].sort((a, b) => (parseToDate(b.date)?.getTime() || 0) - (parseToDate(a.date)?.getTime() || 0));
    const sortedTrending = [...trendingItems].sort((a, b) => (parseToDate(b.date)?.getTime() || 0) - (parseToDate(a.date)?.getTime() || 0));

    return <WordPressNewsSection alauneItems={sortedAlaune} trendingItems={sortedTrending} />;
}

export async function LiveChannelsWrapper() {
    const t = await getTranslations("pages.home");
    const tc = await getTranslations("common");
    const [channelsRes, radiosRes, epgRes, fullEpgRes] = await Promise.all([
        getLiveChannels().catch(() => ({ allitems: [] })),
        getLiveRadios().catch(() => ({ allitems: [] })),
        getEPGNow().catch(() => ({ allitems: [] })),
        getEPGAll().catch(() => []),
    ]);

    const tvChannels = (channelsRes.allitems || []).map(ch => ({ ...ch, type: 'TV' as const }));
    const radioChannels = (radiosRes.allitems || []).map(ch => ({ ...ch, type: 'RADIO' as const }));

    return (
        <LiveChannelsGrid
            channels={[...tvChannels, ...radioChannels]}
            epgItems={epgRes.allitems || []}
            fullEpg={fullEpgRes || []}
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
    const items = await getWordPressPosts(SITE_CONFIG.categories.news.alaune, 10).catch(() => []);
    const sortedItems = [...items].sort((a, b) => (parseToDate(b.date)?.getTime() || 0) - (parseToDate(a.date)?.getTime() || 0));

    return (
        <EditorialChoice
            items={sortedItems}
            title={t("editorChoice")}
            title2=''
            actionLabel={tc("seeAll")}
        />
    );
}

export async function RegionalCategoriesWrapper() {
    const [aodRes, replayItems] = await Promise.all([
        getLatestAOD(10).catch(() => ({ allitems: [] })),
        getLatestAggregateReplays().catch(() => []),
    ]);
    return (
        <RegionalCategoriesSection
            radioItems={aodRes.allitems || []}
            replayItems={replayItems || []}
        />
    );
}

export async function CategoryWithAdWrapper() {
    const t = await getTranslations("pages.home");
    const posts = await getWordPressLatestPosts(8).catch(() => []);
    const sortedPosts = [...posts].sort((a, b) => (parseToDate(b.date)?.getTime() || 0) - (parseToDate(a.date)?.getTime() || 0));

    return (
        <CategoryWithAdSection
            title={t("regionalNews") + " " + t("regionalNewsSuffix")}
            title2=''

            posts={sortedPosts}
            categorySlug=""
        />
    );
}

export async function ShortsCarouselWrapper() {
    const t = await getTranslations("pages.home");
    const tc = await getTranslations("common");
    const sliderVideosRes = await getShortVideos().catch(() => ({ allitems: [] }));
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
    const posts = await getWordPressLatestPosts(4).catch(() => []);
    const sortedPosts = [...posts].sort((a, b) => (parseToDate(b.date)?.getTime() || 0) - (parseToDate(a.date)?.getTime() || 0));

    return (
        <CorporateNewsSection
            title="Corporate News"
            title2=""
            posts={sortedPosts}
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
