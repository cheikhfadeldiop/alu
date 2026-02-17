/**
 * CRTV API Service
 * Handles all API calls to the CRTV backend
 */

import type {
    AppDetails,
    AppData,
    LiveChannelsResponse,
    DirectPlayback,
    VODChannelsResponse,
    VODItemsResponse,
    SliderVideosResponse,
    AlauneResponse,
    NewsCategoriesResponse,
    NewsItemsResponse,
    EPGResponse,
    CinemaCategoriesResponse,
    CinemaItemsResponse,
    AODItemsResponse,
    PresentersResponse,
    AdsResponse,
    FlashNewsResponse,
    AffichesResponse,
    SliderVideoItem,
} from '../types/api';

export type { SliderVideoItem } from '../types/api';

import { SITE_CONFIG } from '../constants/site-config';

const API_BASE_URL = SITE_CONFIG.api.baseUrl;
const WORDPRESS_API_BASE_URL = SITE_CONFIG.api.wordpressBaseUrl;
const APP_ID = SITE_CONFIG.api.appId;

/**
 * Map a raw VOD item or Slider item to a consistent SliderVideoItem structure
 */
export function mapVODToSliderItem(item: any, channelLogo?: string): SliderVideoItem {
    return {
        title: item.title || "",
        desc: item.desc || "",
        logo: item.image || item.logo || "",
        logo_url: item.image_url || item.logo_url || "",
        video_url: ensureAbsoluteUrl(item.video_url),
        feed_url: ensureAbsoluteUrl(item.feed_url || item.video_url),
        stream_url: ensureAbsoluteUrl(item.stream_url),
        android_url: ensureAbsoluteUrl(item.android_url),
        web_url: ensureAbsoluteUrl(item.web_url),
        webdetail_url: ensureAbsoluteUrl(item.webdetail_url),
        date: item.published_at || item.date || "",
        time: item.duration || item.time || "",
        slug: item.slug || "",
        type: item.type || "vod",
        views: item.views || "0",
        relatedItems: item.relatedItems || "",
        channel_logo: channelLogo || item.chaine_logo || item.channel_logo
    } as SliderVideoItem;
}

export function ensureAbsoluteUrl(url: string | undefined): string {
    if (!url || url === "null") return "";
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(endpoint: string): Promise<T> {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            next: { revalidate: SITE_CONFIG.api.revalidateTime }, // Cache based on config
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch ${endpoint}:`, error);
        throw error;
    }
}

/**
 * Get application configuration and details
 */
export async function getAppDetails(): Promise<AppDetails> {
    return fetchAPI<AppDetails>(`/appdetails/${APP_ID}/json`);
}

export interface AppInfoResponse {
    app_description: string;
    app_privacy: string;
}

/**
 * Get application info (contains both description and privacy)
 */
export async function getAppInfo(): Promise<AppInfoResponse> {
    return fetchAPI<AppInfoResponse>(`/appinfo/${APP_ID}/json`);
}

/**
 * Get application description specifically
 */
export async function getAppDescription(): Promise<{ app_description: string }> {
    return fetchAPI<{ app_description: string }>(`/appinfo/${APP_ID}/description/json`);
}

/**
 * Get application privacy policy specifically
 */
export async function getAppPrivacy(): Promise<{ app_privacy: string }> {
    return fetchAPI<{ app_privacy: string }>(`/appinfo/${APP_ID}/privacy/json`);
}

/**
 * Get application terms of use specifically
 */
export async function getAppTerms(): Promise<{ app_description: string }> {
    return fetchAPI<{ app_description: string }>(`/appinfo/${APP_ID}/terms/json`);
}




/**
 * Get main application data structure (navigation items)
 */
export async function getAppData(): Promise<AppData> {
    return fetchAPI<AppData>(`/listAndroid/${APP_ID}/json`);
}

/**
 * Get list of live TV channels
 */
export async function getLiveChannels(): Promise<LiveChannelsResponse> {
    return fetchAPI<LiveChannelsResponse>(`/listLiveTV/${APP_ID}/json`);
}

/**
 * Get list of live radio channels
 */
export async function getLiveRadios(): Promise<LiveChannelsResponse> {
    return fetchAPI<LiveChannelsResponse>(`/listLiveRadios/${APP_ID}/json`);
}

/**
 * Get direct playback URL for a specific channel
 * @param channelId - The ID of the channel
 */
export async function getDirectPlayback(channelId: string): Promise<DirectPlayback> {
    return fetchAPI<DirectPlayback>(`/directplayback/${channelId}/json`);
}

/**
 * Get VOD channels (broadcast channels that have shows)
 */
export async function getVODChannels(): Promise<VODChannelsResponse> {
    return fetchAPI<VODChannelsResponse>(`/listChannels/${APP_ID}/json`);
}

/**
 * Get all VOD shows (emissions) grouped by app id
 */
export async function getVODShows(): Promise<SliderVideosResponse> {
    return fetchAPI<SliderVideosResponse>(`/listChannelsbygroup/${APP_ID}/json`);
}

/**
 * Get VOD items for a specific show
 * @param showId - The ID of the show
 */
export async function getVODItems(showId: string): Promise<VODItemsResponse> {
    return fetchAPI<VODItemsResponse>(`/listItemsByChannel/${APP_ID}/${showId}/json`);
}

/**
 * Get shows for a specific channel
 * @param chaineId - The ID of the channel (e.g. 50004)
 */
export async function getShowsByChaine(chaineId: string): Promise<SliderVideosResponse> {
    return fetchAPI<SliderVideosResponse>(`/listChannelsByChaine/${APP_ID}/${chaineId}/json`);
}

/**
 * Get aggregated replays for a channel by exploring its shows.
 * This is more thorough than getAlauneByChannel as per user feedback.
 */
export async function getAggregateReplaysByChannel(chaineId: string, limit: number = 10): Promise<SliderVideoItem[]> {
    try {
        // 1. Get all shows for this channel
        const showsRes = await getShowsByChaine(chaineId);
        const shows = showsRes.allitems || [];

        // 2. Filter shows that have a valid feed_url and are not null
        const validShows = shows.filter(show =>
            show.feed_url &&
            show.feed_url !== "null" &&
            show.feed_url.includes("listItemsByChannel")
        );

        if (validShows.length === 0) return [];

        // 3. Fetch replays from the top 5 shows (to avoid too many requests)
        // Usually shows are sorted by importance/recency
        const replaysPromises = validShows.slice(0, 5).map(async (show) => {
            try {
                const res = await getVODItems(show.feed_url.split('/').slice(-2, -1)[0] || "");
                const items = res.allitems || [];
                return items.map(item => mapVODToSliderItem(item, show.chaine_logo));
            } catch (err) {
                return [];
            }
        });

        const allReplays = (await Promise.all(replaysPromises)).flat();

        // Sort by date (descending)
        return allReplays
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, limit);

    } catch (error) {
        console.error(`Error aggregating replays for channel ${chaineId}:`, error);
        return [];
    }
}

/**
 * Get VOD channel categories
 */
export async function getVODCategories(): Promise<VODChannelsResponse> {
    return fetchAPI<VODChannelsResponse>(`/listChannelsCategories/${APP_ID}/json`);
}

/**
 * Get VOD items by category
 * @param categoryId - The ID of the category
 */
export async function getVODByCategory(categoryId: string): Promise<VODItemsResponse> {
    return fetchAPI<VODItemsResponse>(`/listChannelsCategoriesByChaine/${APP_ID}/${categoryId}/json`);
}

/**
 * Get slider videos (homepage carousel)
 */
export async function getSliderVideos(): Promise<SliderVideosResponse> {
    return fetchAPI<SliderVideosResponse>(`/alaunesliders/${APP_ID}/json`);
}

/**
 * Get featured content (À la une)
 */
export async function getAlaune(): Promise<AlauneResponse> {
    return fetchAPI<AlauneResponse>(`/alaune/${APP_ID}/json`);
}

/**
 * Get featured content for a specific channel
 * @param channelId - The ID of the channel
 */
export async function getAlauneByChannel(channelId: string): Promise<SliderVideosResponse> {
    return fetchAPI<SliderVideosResponse>(`/alauneByChaine/${channelId}/json`);
}

export interface ShowReplayGroup {
    title: string;
    logo: string;
    videos: SliderVideoItem[];
    nextBatchUrl?: string;
}

/**
 * Get aggregated replays by Show (Emission) instead of Channel.
 * 1. Fetches latest shows from alaunesliders.
 * 2. For each show, fetches its last 10 replays via relatedItems.
 */
export async function getReplaysByShowAggregated(limitShows: number = 8, limitReplays: number = 10): Promise<ShowReplayGroup[]> {
    try {
        // 1. Get latest highlight for each show
        const sliderRes = await getSliderVideos();
        const shows = sliderRes.allitems || [];

        // 2. Fetch archives for each show
        const aggregatedPromises = shows.slice(0, limitShows).map(async (show) => {
            try {
                let videos: SliderVideoItem[] = [];
                if (show.relatedItems && show.relatedItems !== "null") {
                    videos = await getRelatedItems(show.relatedItems);
                }

                // Ensure the current (latest) show is also included if archive is small
                // and deduplicate
                const allVideos = [...videos];
                const seenSlugs = new Set(videos.map(v => v.slug));
                if (!seenSlugs.has(show.slug)) {
                    allVideos.unshift(show);
                }

                return {
                    title: show.title.split(' du ')[0] || show.title, // Clean "JT 20H du 08/02/2026" to "JT 20H"
                    logo: show.logo_url || show.logo,
                    videos: allVideos.slice(0, limitReplays),
                    nextBatchUrl: show.relatedItems
                } as ShowReplayGroup;
            } catch (err) {
                console.error(`Error fetching archive for show ${show.title}:`, err);
                return null;
            }
        });

        const results = await Promise.all(aggregatedPromises);
        return results.filter((r): r is ShowReplayGroup => r !== null && r.videos.length > 0);
    } catch (error) {
        console.error("Error in getReplaysByShowAggregated:", error);
        return [];
    }
}

/**
 * Get aggregated replays from all channels using the alaunesliders endpoint
 * This is much faster than fetching from each channel individually.
 */
export async function getLatestAggregateReplays(limit: number = 20): Promise<SliderVideoItem[]> {
    try {
        // 1. Get the featured shows/videos (Alaunes)
        const sliderRes = await getSliderVideos();
        const initialItems = sliderRes.allitems || [];

        // 2. To get more, we fetch archives for the first few shows
        const showsToFetch = initialItems.slice(0, 8);
        const archivesPromises = showsToFetch.map(async (show) => {
            if (show.relatedItems && show.relatedItems !== "null") {
                const results = await getRelatedItems(show.relatedItems);
                return results.map(item => mapVODToSliderItem(item, show.channel_logo || (show as any).chaine_logo));
            }
            return [];
        });

        const archivesResults = await Promise.all(archivesPromises);
        const allItems = [...initialItems, ...archivesResults.flat()];

        // 3. Deduplicate by slug and sort by date
        const seenSlugs = new Set();
        const uniqueItems = allItems.filter(item => {
            if (!item || !item.slug || seenSlugs.has(item.slug)) return false;
            seenSlugs.add(item.slug);
            return true;
        });

        // Sort by date (descending)
        return uniqueItems
            .sort((a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return dateB - dateA;
            })
            .slice(0, limit);
    } catch (error) {
        console.error("Error fetching latest aggregate replays:", error);
        return [];
    }
}

/**
 * Fallback search for a specific replay by slug
 */
export async function findReplayBySlug(slug: string): Promise<SliderVideoItem | null> {
    try {
        // 1. Try initial aggregate list (Latest)
        const initial = await getLatestAggregateReplays();
        let found = initial.find(v => v.slug === slug);
        if (found) return found;

        // 2. Try matching a SHOW (Category) directly
        // This is important for the EmissionsSlider where items are categories
        const showsRes = await getVODShows();
        const shows = showsRes.allitems || [];
        const showMatch = shows.find(s => s.slug === slug);
        if (showMatch) {
            // Find the first video of this show to play it
            if (showMatch.relatedItems && showMatch.relatedItems !== "null") {
                const archives = await getRelatedItems(showMatch.relatedItems).catch(() => []);
                if (archives.length > 0) {
                    return mapVODToSliderItem(archives[0], showMatch.chaine_logo || showMatch.channel_logo);
                }
            }
            return showMatch;
        }

        // 3. Try searching through ALL channels
        const channelsRes = await getLiveChannels();
        const allChannels = channelsRes.allitems || [];

        for (const channel of allChannels) {
            try {
                const replays = await getAlauneByChannel(channel.id);
                found = (replays.allitems || []).find(v => v.slug === slug);
                if (found) {
                    return {
                        ...found,
                        channel_logo: channel.logo_url || channel.logo
                    };
                }
            } catch { continue; }
        }

        // 4. Try matching by TITLE (as last resort fallback for slug)
        found = shows.find(s => s.title.toLowerCase().replace(/\s+/g, '-') === slug);
        if (found) {
            if (found.relatedItems && found.relatedItems !== "null") {
                const archives = await getRelatedItems(found.relatedItems).catch(() => []);
                if (archives.length > 0) return mapVODToSliderItem(archives[0], found.chaine_logo || found.channel_logo);
            }
            return found;
        }

        // 5. ULTIMATE FALLBACK: Search through items INSIDE shows
        // Search top 40 shows (aggressive)
        for (const show of shows.slice(0, 40)) {
            if (show.feed_url && show.feed_url !== "null") {
                try {
                    const showItems = await getVODItems(show.feed_url.split('/').slice(-2, -1)[0] || "");
                    const item = (showItems.allitems || []).find(v => v.slug === slug || v.title.toLowerCase().replace(/\s+/g, '-') === slug);
                    if (item) {
                        return mapVODToSliderItem(item, show.chaine_logo || show.channel_logo);
                    }
                } catch { continue; }
            }
        }

        return null;
    } catch (error) {
        console.error("Error finding replay by slug:", error);
        return null;
    }
}

/**
 * Get replays for a specific list of channels
 * Used for progressive loading on the client
 */
export async function getReplaysForChannels(channels: import('../types/api').LiveChannel[]): Promise<SliderVideoItem[]> {
    try {
        const replaysPromises = channels.map(async (channel) => {
            try {
                const res = await getAlauneByChannel(channel.id);
                const items = res.allitems || [];
                return items.map(item => ({
                    ...item,
                    channel_logo: channel.logo_url || channel.logo
                }));
            } catch (err) {
                console.error(`Failed to fetch replays for channel ${channel.id}:`, err);
                return [];
            }
        });

        const allReplaysNested = await Promise.all(replaysPromises);
        const flattened = allReplaysNested.flat();
        return flattened;
    } catch (error) {
        console.error("Error fetching replays for channels:", error);
        return [];
    }
}

/**
 * Get related VOD items (used for pagination/load more)
 * @param url - The relatedItems URL provided in the video object
 */
export async function getRelatedItems(url: string): Promise<SliderVideoItem[]> {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
            },
            next: { revalidate: SITE_CONFIG.api.revalidateTime },
        });

        if (!response.ok) {
            throw new Error(`Related Items API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.allitems || [];
    } catch (error) {
        console.error("Error fetching related items:", error);
        return [];
    }
}

/**
 * Legacy wrapper for aggregated replays
 */
export async function getAllChannelReplays(): Promise<import('../types/api').SliderVideoItem[]> {
    return getLatestAggregateReplays();
}

/**
 * Get news categories
 */
export async function getNewsCategories(): Promise<NewsCategoriesResponse> {
    return fetchAPI<NewsCategoriesResponse>(`/newscategories/${APP_ID}/json`);
}

/**
 * Get news items for a specific category
 * @param categoryId - The ID of the category
 */
export async function getNews(categoryId: string): Promise<NewsItemsResponse> {
    return fetchAPI<NewsItemsResponse>(`/news/${APP_ID}/${categoryId}/json`);
}

/**
 * Get current EPG (Electronic Program Guide) data
 */
export async function getEPGNow(): Promise<EPGResponse> {
    return fetchAPI<EPGResponse>(`/guidetvnow/${APP_ID}/json`);
}

/**
 * Get current EPG for a specific channel
 * @param channelId - The ID of the channel
 */
export async function getEPGNowByChannel(channelId: string): Promise<EPGResponse> {
    return fetchAPI<EPGResponse>(`/guidetvnowbychaine/${APP_ID}/${channelId}/json`);
}

/**
 * Get full EPG schedule for today
 */
export async function getEPGAll(): Promise<import('../types/api').FullEPGChannel[]> {
    return fetchAPI<import('../types/api').FullEPGChannel[]>(`/guidetvall/${APP_ID}/today/json`);
}

/**
 * Get cinema categories (movies and series)
 */
export async function getCinemaCategories(): Promise<CinemaCategoriesResponse> {
    return fetchAPI<CinemaCategoriesResponse>(`/cinemacategories/${APP_ID}/json`);
}

/**
 * Get cinema items for a specific category
 * @param categoryId - The ID of the category
 */
export async function getCinemaByCategory(categoryId: string): Promise<CinemaItemsResponse> {
    return fetchAPI<CinemaItemsResponse>(`/cinema/${APP_ID}/${categoryId}/json`);
}

/**
 * Get latest cinema episodes
 */
export async function getLatestEpisodes(): Promise<CinemaItemsResponse> {
    return fetchAPI<CinemaItemsResponse>(`/lastestepisodes/${APP_ID}/json`);
}

/**
 * Get AOD (Audio On Demand) channels
 */
export async function getAODChannels(): Promise<VODChannelsResponse> {
    return fetchAPI<VODChannelsResponse>(`/listChannelsAOD/${APP_ID}/json`);
}

/**
 * Get latest AOD items
 */
export async function getLatestAOD(): Promise<AODItemsResponse> {
    const res = await fetchAPI<AODItemsResponse>(`/latestaoditemsByGroupe/${APP_ID}/json`);
    console.log("getLatestAOD Response:", res?.allitems?.length);
    return res;
}

/**
 * Get presenters/hosts
 */
export async function getPresenters(): Promise<PresentersResponse> {
    return fetchAPI<PresentersResponse>(`/presentateurs/${APP_ID}/json`);
}

/**
 * Get advertisement banners
 */
export async function getAds(): Promise<AdsResponse> {
    return fetchAPI<AdsResponse>(`/listPubs/${APP_ID}/json`);
}

/**
 * Get ads for a specific channel
 * @param channelId - The ID of the channel
 */
export async function getAdsByChannel(channelId: string): Promise<AdsResponse> {
    return fetchAPI<AdsResponse>(`/listPubsByChaine/${APP_ID}/${channelId}/json`);
}

/**
 * Get flash news
 */
export async function getFlashNews(): Promise<FlashNewsResponse> {
    return fetchAPI<FlashNewsResponse>(`/flashnews/${APP_ID}/json`);
}

/**
 * Get affiches (posters/banners)
 */
export async function getAffiches(): Promise<AffichesResponse> {
    return fetchAPI<AffichesResponse>(`/listAffichesByGroup/${APP_ID}/json`);
}

/**
 * Get affiches for a specific channel
 * @param channelId - The ID of the channel
 */
export async function getAffichesByChannel(channelId: string): Promise<AffichesResponse> {
    return fetchAPI<AffichesResponse>(`/listAffichesByChaine/${APP_ID}/${channelId}/json`);
}

/**
 * WordPress API Service Functions
 */


/**
 * Generic fetch wrapper for WordPress API
 */
async function fetchWordPressAPI<T>(endpoint: string): Promise<T> {
    try {
        const response = await fetch(`${WORDPRESS_API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            next: { revalidate: SITE_CONFIG.api.revalidateTime }, // Cache based on config
        });

        if (!response.ok) {
            throw new Error(`WordPress API Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch WordPress ${endpoint}:`, error);
        throw error;
    }
}

/**
 * Get all WordPress categories
 */
export async function getWordPressCategories(): Promise<import('../types/api').WordPressCategory[]> {
    return fetchWordPressAPI<import('../types/api').WordPressCategory[]>('/categories?per_page=100');
}

/**
 * Get WordPress category by slug
 * @param slug - The slug of the category (e.g., 'a-la-une')
 */
export async function getWordPressCategoryBySlug(slug: string): Promise<import('../types/api').WordPressCategory[]> {
    return fetchWordPressAPI<import('../types/api').WordPressCategory[]>(`/categories/?slug=${slug}`);
}

/**
 * Get WordPress posts by category
 * @param categoryId - The ID or IDs of the category (can be comma-separated string)
 * @param perPage - Number of posts to retrieve (default: 10)
 */
export async function getWordPressPosts(
    categoryId: number | string,
    perPage: number = 10,
    page: number = 1
): Promise<import('../types/api').WordPressPost[]> {
    return fetchWordPressAPI<import('../types/api').WordPressPost[]>(
        `/posts?_embed=wp:featuredmedia,wp:term&per_page=${perPage}&page=${page}&categories=${categoryId}`
    );
}

/**
 * Get a single WordPress post by ID
 * @param postId - The ID of the post
 */
export async function getWordPressPostById(postId: string | number): Promise<import('../types/api').WordPressPost> {
    return fetchWordPressAPI<import('../types/api').WordPressPost>(`/posts/${postId}?_embed=wp:featuredmedia,wp:term`);
}

/**
 * Get latest WordPress posts (all categories)
 * @param perPage - Number of posts to retrieve (default: 10)
 * @param page - Page number (default: 1)
 */
export async function getWordPressLatestPosts(perPage: number = 10, page: number = 1): Promise<import('../types/api').WordPressPost[]> {
    return fetchWordPressAPI<import('../types/api').WordPressPost[]>(`/posts?_embed=wp:featuredmedia,wp:term&per_page=${perPage}&page=${page}`);
}


export async function getWordPressAlaunePost(): Promise<import('../types/api').WordPressPost[]> {
    // Category ID from config
    return getWordPressPosts(SITE_CONFIG.categories.news.alaune, 20);
}
