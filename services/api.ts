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
} from '../types/api';

const API_BASE_URL = 'https://tveapi.acan.group/myapiv2';
const WORDPRESS_API_BASE_URL = 'https://actu.rts.sn/wp-json/wp/v2';
const APP_ID = 'lacrtv';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(endpoint: string): Promise<T> {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            next: { revalidate: 60 }, // Cache for 60 seconds
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
 * Get VOD channels/categories
 */
export async function getVODChannels(): Promise<VODChannelsResponse> {
    return fetchAPI<VODChannelsResponse>(`/listChannels/${APP_ID}/json`);
}

/**
 * Get VOD items for a specific channel
 * @param channelId - The ID of the channel
 */
export async function getVODItems(channelId: string): Promise<VODItemsResponse> {
    return fetchAPI<VODItemsResponse>(`/listChannelsByChaine/${APP_ID}/${channelId}/json`);
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

/**
 * Get aggregated replays from all channels, sorted by date (latest first)
 */
export async function getAllChannelReplays(): Promise<import('../types/api').SliderVideoItem[]> {
    try {
        // 1. Get all live channels
        const channelsData = await getLiveChannels();
        const channels = channelsData.allitems || [];

        // 2. Fetch replays for each channel in parallel
        const replaysPromises = channels.map(channel =>
            getAlauneByChannel(channel.id)
                .then(res => {
                    const items = res.allitems || [];
                    return items.map(item => ({
                        ...item,
                        channel_logo: channel.logo_url || channel.logo
                    }));
                })
                .catch(() => [])
        );

        const allReplaysNested = await Promise.all(replaysPromises);

        // 3. Flatten the array
        const allReplays = allReplaysNested.flat();

        // 4. Sort by date and time descending
        return allReplays.sort((a, b) => {
            // Parse date "dd/mm/yyyy"
            const parseDate = (dateStr: string, timeStr: string) => {
                const [day, month, year] = dateStr.split('/').map(Number);
                const [hours, minutes] = timeStr.split(':').map(Number);
                return new Date(year, month - 1, day, hours, minutes).getTime();
            };

            const timeA = parseDate(a.date, a.time);
            const timeB = parseDate(b.date, b.time);

            return timeB - timeA;
        });

    } catch (error) {
        console.error("Error fetching all channel replays:", error);
        return [];
    }
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
export async function getEPGAll(): Promise<EPGResponse> {
    return fetchAPI<EPGResponse>(`/guidetvall/${APP_ID}/today/json`);
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
    return fetchAPI<AODItemsResponse>(`/latestaoditemsByGroupe/${APP_ID}/json`);
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
            next: { revalidate: 60 }, // Cache for 60 seconds
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
 * Get latest WordPress posts (all categories)
 * @param perPage - Number of posts to retrieve (default: 10)
 */
export async function getWordPressLatestPosts(perPage: number = 10): Promise<import('../types/api').WordPressPost[]> {
    return fetchWordPressAPI<import('../types/api').WordPressPost[]>(`/posts?_embed=wp:featuredmedia,wp:term&per_page=${perPage}`);
}


/**
 * Get WordPress posts for "À la une" category
 */
export async function getWordPressAlaunePost(): Promise<import('../types/api').WordPressPost[]> {
    // Category ID 121 is "À LA UNE" - fetch 20 articles for pagination
    return getWordPressPosts(121, 20);
}
