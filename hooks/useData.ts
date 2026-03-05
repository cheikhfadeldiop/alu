"use client";

import useSWR from "swr";
import { SITE_CONFIG } from "@/constants/site-config";
import * as api from "@/services/api";

/**
 * Robust Refresh Controller Logic
 * Uses the settings defined in SITE_CONFIG.api.cache.ttl
 */

// Centralized Fetcher mapping
const FETCHER_MAP = {
    liveChannels: api.getLiveChannels,
    liveRadios: api.getLiveRadios,
    epgNow: api.getEPGNow,
    sliderVideos: api.getSliderVideos,
    alaune: api.getAlaune,
    vodChannels: api.getVODChannels,
    vodShows: api.getVODShows,
    presenters: api.getPresenters,
    wordpressPosts: (key: string) => {
        const [, categoryId, count] = key.split(':');
        return api.getWordPressPosts(categoryId, parseInt(count) || 10);
    },
    wordpressCategories: api.getWordPressCategories,
    wordpressPost: (key: string) => {
        const [, identifier] = key.split(':');
        return api.getWordPressPost(identifier);
    },
    epgAll: api.getEPGAll
};

/**
 * Generic Data Hook with Caching Control
 */
export function useData<T>(
    key: keyof typeof FETCHER_MAP | [keyof typeof FETCHER_MAP, string | number, ...any[]],
    refreshType: keyof typeof SITE_CONFIG.api.cache.ttl = "standard",
    fallbackData?: T
) {
    const swrKey = Array.isArray(key) ? key.join(':') : key;
    const fetcherKey = Array.isArray(key) ? key[0] : key;

    const ttl = SITE_CONFIG.api.cache.ttl[refreshType];

    return useSWR<T>(swrKey, async () => {
        const fetcherFn = FETCHER_MAP[fetcherKey];
        if (typeof fetcherFn === 'function') {
            // Special cases for hooks that need multiple arguments from the key array
            if (fetcherKey === 'wordpressPosts' && Array.isArray(key)) {
                return await api.getWordPressPosts(key[1] as any, key[2] as any);
            }
            if (fetcherKey === 'wordpressPost' && Array.isArray(key)) {
                return await api.getWordPressPost(key[1] as any);
            }
            // Default: call fetcher with the full string key
            return await (fetcherFn as any)(swrKey);
        }
        throw new Error(`No fetcher defined for key: ${fetcherKey}`);
    }, {
        fallbackData,
        refreshInterval: ttl,
        revalidateOnFocus: refreshType === "realtime" || refreshType === "dynamic",
        revalidateIfStale: false, // Prevents flash on navigation
        dedupingInterval: 5000,
        keepPreviousData: true,
    });
}

/**
 * Specific Shorthand Hooks for common data
 */

export function useLiveChannels(fallbackData?: import("@/types/api").LiveChannelsResponse) {
    return useData<import("@/types/api").LiveChannelsResponse>("liveChannels", "realtime", fallbackData);
}

export function useLiveRadios(fallbackData?: import("@/types/api").LiveChannelsResponse) {
    return useData<import("@/types/api").LiveChannelsResponse>("liveRadios", "realtime", fallbackData);
}

export function useEPGNow(fallbackData?: import("@/types/api").EPGResponse) {
    return useData<import("@/types/api").EPGResponse>("epgNow", "dynamic", fallbackData);
}

export function useWordPressNews(categoryId: string | number, count: number = 10, fallbackData?: import("@/types/api").WordPressPost[]) {
    return useData<import("@/types/api").WordPressPost[]>(["wordpressPosts", categoryId, count], "standard", fallbackData);
}

export function useWordPressPost(postId: string | number, fallbackData?: import("@/types/api").WordPressPost) {
    return useData<import("@/types/api").WordPressPost>(["wordpressPost", postId], "standard", fallbackData);
}

export function useSliderVideos(fallbackData?: import("@/types/api").SliderVideosResponse) {
    return useData<import("@/types/api").SliderVideosResponse>("sliderVideos", "standard", fallbackData);
}

export function useAlaune(fallbackData?: import("@/types/api").AlauneResponse) {
    return useData<import("@/types/api").AlauneResponse>("alaune", "standard", fallbackData);
}

export function useVODShows(fallbackData?: import("@/types/api").SliderVideosResponse) {
    return useData<import("@/types/api").SliderVideosResponse>("vodShows", "standard", fallbackData);
}

export function useWordPressCategories(fallbackData?: import("@/types/api").WordPressCategory[]) {
    return useData<import("@/types/api").WordPressCategory[]>("wordpressCategories", "static", fallbackData);
}

export function useEPGAll(fallbackData?: import("@/types/api").FullEPGChannel[]) {
    return useData<import("@/types/api").FullEPGChannel[]>("epgAll", "dynamic", fallbackData);
}

/**
 * Hook to resolve a channel logo for any given item (Replay or Post)
 */
export function useChannelResolver() {
    const { data: channelsRes } = useLiveChannels();
    const { data: alauneRes } = useAlaune();

    const allChannels = channelsRes?.allitems || [];
    const alauneItems = (alauneRes as any)?.allitems || [];

    const resolveLogo = (item: any): string | null => {
        if (!item) return null;

        // 1. Direct fields check
        if (item.chaine_logo && item.chaine_logo !== "null") return item.chaine_logo;
        if (item.channel_logo && item.channel_logo !== "null") return item.channel_logo;

        // 2. Build Hunt string
        // For WordPress, we also look into embedded terms (categories/tags)
        const embeddedTerms = item._embedded?.['wp:term']?.flat()?.map((t: any) => t.name) || [];

        const hunt = [
            item.feed_url,
            item.logo_url,
            item.logo,
            item.video_url,
            item.slug,
            item.chaine_name,
            item.title?.rendered || item.title,
            // WordPress specifics
            item.link,
            item.excerpt?.rendered,
            ...embeddedTerms,
            // Brand identifiers from config
            SITE_CONFIG.name,
            SITE_CONFIG.officialName
        ].filter(Boolean).join('::').toLowerCase();

        // 3. Match against dynamic channels list
        const dynamicMatch = allChannels.find(ch => {
            const chTitle = ch.title.toLowerCase();
            const chSlug = (ch.slug || "").toLowerCase();
            const chId = ch.id;

            if (chId && hunt.includes(`/${chId}/`)) return true;
            if (chSlug && (hunt.includes(chSlug) || hunt.includes(chSlug.replace('-', '')))) return true;

            // Aggressive matching for WordPress categories
            if (chTitle.includes('news') || chSlug.includes('news')) {
                if (hunt.includes('news') || hunt.includes('50005')) return true;
            }
            if (chTitle.includes('sport') || chSlug.includes('sport')) {
                if (hunt.includes('sport') || hunt.includes('50006')) return true;
            }
            if ((chTitle === 'crtv' || chSlug === 'crtv') &&
                (hunt.includes('crtv-') || hunt.includes('50004') || hunt.includes('lacrtv')) &&
                !hunt.includes('news') && !hunt.includes('sport')) return true;

            return false;
        });

        if (dynamicMatch) return dynamicMatch.logo_url || dynamicMatch.logo;

        // 4. Try SITE_CONFIG.channels (Static data)
        const staticMatch = SITE_CONFIG.channels.find(ch => {
            const huntLow = hunt.toLowerCase();
            return huntLow.includes(ch.slug.toLowerCase()) ||
                huntLow.includes(ch.id) ||
                huntLow.includes(ch.name.toLowerCase());
        });

        if (staticMatch) return staticMatch.logo;

        // 5. WordPress Category ID Matching
        if (item.categories && Array.isArray(item.categories)) {
            // Check news category (141 = trending, but often maps to news channel)
            const newsIds = [121, 141, 145, 133, 153]; // Any news related category
            const sportIds = [125, 612]; // Sport/Loisirs

            const hasNews = item.categories.some((id: number) => newsIds.includes(id));
            const hasSport = item.categories.some((id: number) => sportIds.includes(id));

            if (hasNews) {
                const newsCh = SITE_CONFIG.channels.find(ch => ch.id === '50005');
                if (newsCh) return newsCh.logo;
            }
            if (hasSport) {
                const sportCh = SITE_CONFIG.channels.find(ch => ch.id === '50006');
                if (sportCh) return sportCh.logo;
            }
        }

        // 6. Try Alaune nested structure
        if (alauneItems.length > 0) {
            const nested = alauneItems[0]?.list_alaune_by_chaine || [];
            if (nested.length > 0) {
                if (hunt.includes('news') || hunt.includes('50005'))
                    return nested.find((c: any) => c.chaine_name?.toLowerCase().includes('news'))?.chaine_logo;
                if (hunt.includes('sport') || hunt.includes('50006'))
                    return nested.find((c: any) => c.chaine_name?.toLowerCase().includes('sport'))?.chaine_logo;
                if (hunt.includes('crtv') || hunt.includes('50004'))
                    return nested.find((c: any) => c.chaine_name === 'CRTV')?.chaine_logo;
            }
        }

        // 7. ULTIMATE FALLBACK: If it's on this site, it's at least CRTV
        const crtvMain = SITE_CONFIG.channels.find(ch => ch.id === '50004');
        return crtvMain ? crtvMain.logo : null;
    };

    return { resolveLogo };
}
