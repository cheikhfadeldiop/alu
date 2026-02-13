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
            if (fetcherKey === 'wordpressPosts' && Array.isArray(key)) {
                return await api.getWordPressPosts(key[1] as any, key[2] as any);
            }
            return await (fetcherFn as any)();
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
