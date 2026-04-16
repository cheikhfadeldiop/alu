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
    PlaylistResponse,
    AODItem,
    AluBootstrapResponse,
    AluBootstrapItem,
} from '../types/api';

export type { SliderVideoItem } from '../types/api';

import { SITE_CONFIG } from '../constants/site-config';

const API_BASE_URL = SITE_CONFIG.api.baseUrl;
const WORDPRESS_API_BASE_URL = SITE_CONFIG.api.wordpressBaseUrl;
const APP_ID = SITE_CONFIG.api.appId;

const ALU_BOOTSTRAP_URL: string | undefined = SITE_CONFIG.singleChannel?.bootstrapUrl;
const ALU_YT_CHANNEL_ID: string | undefined = SITE_CONFIG.singleChannel?.youtube?.channelId;
const ALU_YT_API_KEY_ENV: string | undefined = SITE_CONFIG.singleChannel?.youtube?.apiKeyEnv;

function getYouTubeApiKey(): string {
    const envName = ALU_YT_API_KEY_ENV || "YOUTUBE_API_KEY";
    const key = process.env[envName];
    if (!key) {
        throw new Error(`Missing YouTube API key. Please set ${envName} in environment variables.`);
    }
    return key;
}

async function getYouTubeRssVideos(maxResults: number = 12): Promise<SliderVideoItem[]> {
    if (!ALU_YT_CHANNEL_ID) return [];
    const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(ALU_YT_CHANNEL_ID)}`;
    const response = await fetch(url, {
        next: { revalidate: SITE_CONFIG.api.revalidateTime },
    });
    if (!response.ok) return [];
    const xml = await response.text();

    const entries = xml.split("<entry>").slice(1);
    const mapped = entries.map((entry, idx) => {
        const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] || "";
        const title = entry.match(/<title>([^<]+)<\/title>/)?.[1] || `Video ${idx + 1}`;
        const published = entry.match(/<published>([^<]+)<\/published>/)?.[1] || "";
        if (!id) return null;
        return {
            id,
            slug: id,
            title,
            desc: "",
            type: "youtube",
            views: "0",
            logo: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
            logo_url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
            video_url: `https://www.youtube.com/watch?v=${id}`,
            relatedItems: "",
            feed_url: "",
            date: published,
            time: "",
        } as SliderVideoItem;
    }).filter(Boolean) as SliderVideoItem[];

    return mapped.slice(0, maxResults);
}

/**
 * Map a raw VOD item or Slider item to a consistent SliderVideoItem structure
 */
export function mapVODToSliderItem(item: any, channelLogo?: string): SliderVideoItem {
    return {
        id: item.id || "",
        title: item.title || "",
        desc: item.desc || "",
        logo: ensureAbsoluteUrl(item.image || item.logo),
        logo_url: ensureAbsoluteUrl(item.image_url || item.logo_url),
        video_url: ensureAbsoluteUrl(item.video_url),
        feed_url: ensureAbsoluteUrl(item.feed_url || item.video_url),
        stream_url: ensureAbsoluteUrl(item.stream_url),
        android_url: ensureAbsoluteUrl(item.android_url),
        web_url: ensureAbsoluteUrl(item.web_url),
        webdetail_url: ensureAbsoluteUrl(item.webdetail_url),
        date: item.published_at || item.date || "",
        time: item.duration || item.time || "",
        slug: item.slug || item.id || String(Math.random()),
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

export function getSiteAbsoluteUrl(path: string): string {
    if (!path) return "";
    if (path.startsWith('http')) return path;
    const siteUrl = SITE_CONFIG.siteUrl.endsWith('/') ? SITE_CONFIG.siteUrl.slice(0, -1) : SITE_CONFIG.siteUrl;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${siteUrl}${cleanPath}`;
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(endpoint: string): Promise<T> {
    try {
        const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
            },
            next: { revalidate: SITE_CONFIG.api.revalidateTime }, // Cache based on config
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch (e) {
            // Attempt to recover from common API response corruption (trailing text)
            const cleanText = text.trim();
            const lastBrace = cleanText.lastIndexOf('}');
            const lastBracket = cleanText.lastIndexOf(']');
            const lastIndex = Math.max(lastBrace, lastBracket);

            if (lastIndex !== -1) {
                try {
                    return JSON.parse(cleanText.substring(0, lastIndex + 1));
                } catch (innerError) {
                    throw e; // throw original error if recovery fails
                }
            }
            throw e;
        }
    } catch (error) {
        console.error(`Failed to fetch ${endpoint}:`, error);
        throw error;
    }
}

async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: SITE_CONFIG.api.revalidateTime },
    });
    if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
    return (await response.json()) as T;
}

// -----------------------------------------------------------------------------
// ALU single-channel: bootstrap + live/radio mapping
// -----------------------------------------------------------------------------

export async function getAluBootstrap(): Promise<AluBootstrapResponse> {
    if (!ALU_BOOTSTRAP_URL) return { allitems: [] };
    return fetchJson<AluBootstrapResponse>(ALU_BOOTSTRAP_URL);
}

function toLiveChannelFromAlu(item: AluBootstrapItem) {
    const id = (item.type || "tv") === "radio" ? "alu-radio" : "alu-tv";
    const slug = id;
    const stream = item.hls_url || item.stream_url;
    return {
        id,
        title: item.title || "ALU",
        desc: item.des || "",
        logo: item.logo || "",
        logo_url: item.logo || "",
        type: (item.type || "tv").toLowerCase() === "radio" ? ("RADIO" as const) : ("TV" as const),
        feed_url: "",
        alaune_feed: "",
        vod_feed: "",
        slug,
        guidetvnow: "",
        stream_url: stream || "",
        affiche_url: item.logo || "",
        start_time: "",
        end_time: "",
        duration: "",
        list_channels_by_category: "",
        list_pubs: "",
        hd_logo: item.logo || "",
        sd_logo: item.logo || "",
    };
}

export async function getAluLiveChannels() {
    const boot = await getAluBootstrap().catch(() => ({ allitems: [] }));
    const tv = boot.allitems?.find((i) => (i.type || "").toLowerCase() === "tv");
    const radio = boot.allitems?.find((i) => (i.type || "").toLowerCase() === "radio");
    const mapped = [tv, radio].filter(Boolean).map((i) => toLiveChannelFromAlu(i as AluBootstrapItem));
    return { allitems: mapped };
}

export async function getAluLiveTVOnly() {
    const res = await getAluLiveChannels();
    return { allitems: (res.allitems || []).filter((c) => c.type === "TV") };
}

export async function getAluRadiosOnly() {
    const res = await getAluLiveChannels();
    return { allitems: (res.allitems || []).filter((c) => c.type === "RADIO") };
}

// -----------------------------------------------------------------------------
// YouTube Data API helpers (server-side only)
// -----------------------------------------------------------------------------

type YouTubePlaylist = {
    id: string;
    snippet?: {
        title?: string;
        description?: string;
        thumbnails?: Record<string, { url: string }>;
    };
};

type YouTubePlaylistItem = {
    snippet?: {
        title?: string;
        description?: string;
        thumbnails?: Record<string, { url: string }>;
        resourceId?: { videoId?: string };
        publishedAt?: string;
    };
};

function ytThumb(thumbnails?: Record<string, { url: string }>) {
    return thumbnails?.maxres?.url || thumbnails?.high?.url || thumbnails?.medium?.url || thumbnails?.default?.url || "";
}

export async function getYouTubePlaylists() {
    if (!ALU_YT_CHANNEL_ID) return [];
    const key = getYouTubeApiKey();
    const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&maxResults=50&channelId=${encodeURIComponent(ALU_YT_CHANNEL_ID)}&key=${encodeURIComponent(key)}`;
    const data = await fetchJson<{ items: YouTubePlaylist[] }>(url);
    return data.items || [];
}

export async function getYouTubePlaylistItems(playlistId: string) {
    const key = getYouTubeApiKey();
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${encodeURIComponent(playlistId)}&key=${encodeURIComponent(key)}`;
    const data = await fetchJson<{ items: YouTubePlaylistItem[] }>(url);
    return data.items || [];
}

type YouTubeSearchItem = {
    id?: { videoId?: string };
    snippet?: {
        title?: string;
        description?: string;
        thumbnails?: Record<string, { url: string }>;
        publishedAt?: string;
    };
};

export async function getYouTubeLatestVideos(maxResults: number = 12) {
    if (!ALU_YT_CHANNEL_ID) return [];
    let key = "";
    try {
        key = getYouTubeApiKey();
    } catch {
        // Public fallback without API key
        return getYouTubeRssVideos(maxResults);
    }
    // Use channel uploads playlist first (more complete than search).
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${encodeURIComponent(ALU_YT_CHANNEL_ID)}&key=${encodeURIComponent(key)}`;
    let channelData: { items?: Array<{ contentDetails?: { relatedPlaylists?: { uploads?: string } } }> };
    try {
        channelData = await fetchJson<{ items?: Array<{ contentDetails?: { relatedPlaylists?: { uploads?: string } } }> }>(channelUrl);
    } catch {
        return getYouTubeRssVideos(maxResults);
    }
    const uploadsId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (uploadsId) {
        const uploadItems = await getYouTubePlaylistItems(uploadsId);
        const mapped = uploadItems
            .map(mapYouTubeItemToReplay)
            .filter(Boolean) as SliderVideoItem[];
        if (mapped.length > 0) {
            return mapped.slice(0, maxResults);
        }
    }

    // Fallback to search if uploads playlist cannot be resolved.
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&order=date&type=video&maxResults=${maxResults}&channelId=${encodeURIComponent(ALU_YT_CHANNEL_ID)}&key=${encodeURIComponent(key)}`;
    let data: { items: YouTubeSearchItem[] };
    try {
        data = await fetchJson<{ items: YouTubeSearchItem[] }>(searchUrl);
    } catch {
        return getYouTubeRssVideos(maxResults);
    }
    const items = data.items || [];
    return items
        .map((it) => {
            const videoId = it.id?.videoId;
            if (!videoId) return null;
            const title = it.snippet?.title || "Video";
            const thumb = ytThumb(it.snippet?.thumbnails);
            const publishedAt = it.snippet?.publishedAt || "";
            return {
                id: videoId,
                slug: videoId,
                title,
                desc: it.snippet?.description || "",
                type: "youtube",
                views: "0",
                logo: thumb,
                logo_url: thumb,
                video_url: `https://www.youtube.com/watch?v=${videoId}`,
                relatedItems: "",
                feed_url: "",
                date: publishedAt,
                time: "",
            } as SliderVideoItem;
        })
        .filter(Boolean) as SliderVideoItem[];
}

export async function getYouTubeShorts(maxResults: number = 12) {
    if (!ALU_YT_CHANNEL_ID) return [];
    let key = "";
    try {
        key = getYouTubeApiKey();
    } catch {
        // Let UI fallback to fictive shorts as requested.
        return [];
    }
    // Best-effort: YouTube doesn't have an official "isShort" filter in Data API v3.
    // We approximate with videoDuration=short and a 'shorts' query.
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&order=date&type=video&videoDuration=short&maxResults=${maxResults}&q=${encodeURIComponent("shorts")}&channelId=${encodeURIComponent(ALU_YT_CHANNEL_ID)}&key=${encodeURIComponent(key)}`;
    const data = await fetchJson<{ items: YouTubeSearchItem[] }>(url);
    const items = data.items || [];
    return items
        .map((it) => {
            const videoId = it.id?.videoId;
            if (!videoId) return null;
            const title = it.snippet?.title || "Short";
            const thumb = ytThumb(it.snippet?.thumbnails);
            const publishedAt = it.snippet?.publishedAt || "";
            return {
                id: videoId,
                slug: videoId,
                title,
                desc: it.snippet?.description || "",
                type: "youtube",
                views: "0",
                logo: thumb,
                logo_url: thumb,
                video_url: `https://www.youtube.com/watch?v=${videoId}`,
                relatedItems: "",
                feed_url: "",
                date: publishedAt,
                time: "",
            } as SliderVideoItem;
        })
        .filter(Boolean) as SliderVideoItem[];
}

export function mapYouTubePlaylistToShow(pl: YouTubePlaylist) {
    const title = pl.snippet?.title || "Program";
    const thumb = ytThumb(pl.snippet?.thumbnails);
    return {
        id: pl.id,
        slug: pl.id,
        title,
        desc: pl.snippet?.description || "",
        logo: thumb,
        logo_url: thumb,
        relatedItems: "",
    };
}

export function mapYouTubeItemToReplay(item: YouTubePlaylistItem): SliderVideoItem | null {
    const videoId = item.snippet?.resourceId?.videoId;
    if (!videoId) return null;
    const title = item.snippet?.title || "Video";
    const thumb = ytThumb(item.snippet?.thumbnails);
    const publishedAt = item.snippet?.publishedAt || "";
    return {
        id: videoId,
        slug: videoId,
        title,
        desc: item.snippet?.description || "",
        type: "youtube",
        views: "0",
        logo: thumb,
        logo_url: thumb,
        video_url: `https://www.youtube.com/watch?v=${videoId}`,
        relatedItems: "",
        feed_url: "",
        date: publishedAt,
        time: "",
    };
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
 * Get short videos from the new playlist endpoint
 * @param groupeCode - The group code (defaults to APP_ID)
 * @param channelSlug - Optional channel slug to filter by
 */
export async function getShortVideos(groupeCode: string = APP_ID, channelSlug?: string): Promise<SliderVideosResponse> {
    const baseUrl = `/details/playlist/short-videos/${groupeCode}`;
    const url = channelSlug ? `${baseUrl}?channel=${channelSlug}` : `${baseUrl}`;

    try {
        const res = await fetchAPI<PlaylistResponse>(url);
        const rawItems = res.details?.subitems?.data || [];

        // Fallback to slider videos if list is empty
        if (rawItems.length === 0) {
            console.log("Shorts playlist is empty, falling back to slider videos...");
            return getSliderVideos();
        }

        // Map to consistent SliderVideoItem format
        const items: SliderVideoItem[] = rawItems.map(item => ({
            id: item.id?.toString() || "",
            title: (item as any).titre || item.title || "",
            desc: (item as any).desc || (item as any).description || "",
            type: "vod",
            views: (item as any).views || "0",
            logo: (item as any).image || item.logo || "",
            logo_url: (item as any).image_url || item.logo_url || (item as any).image || "",
            video_url: (item as any).lien || item.video_url || "",
            feed_url: (item as any).lien || (item as any).feed_url || "",
            relatedItems: (item as any).relatedItems || "",
            date: (item as any).date || "",
            time: (item as any).time || "",
            slug: item.slug || item.id?.toString() || ""
        }));

        return { allitems: items };
    } catch (error) {
        console.error("Error fetching short videos, falling back to slider videos:", error);
        return getSliderVideos().catch(() => ({ allitems: [] }));
    }
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
            const itemSlug = String(item?.slug || item?.id || "");
            if (!item || !itemSlug || seenSlugs.has(itemSlug)) return false;
            seenSlugs.add(itemSlug);
            return true;
        });

        // Robust date parsing for sorting
        const parseDate = (d: any) => {
            if (!d) return 0;
            const date = new Date(d);
            return isNaN(date.getTime()) ? 0 : date.getTime();
        };

        // Sort by date (descending)
        return uniqueItems
            .sort((a, b) => parseDate(b.date) - parseDate(a.date))
            .slice(0, limit);
    } catch (error) {
        console.error("Error fetching latest aggregate replays:", error);
        return [];
    }
}

/**
 * Robust search for a specific replay by identifier (slug or id)
 */
export async function findReplay(identifier: string): Promise<SliderVideoItem | null> {
    if (!identifier) return null;
    try {
        // 1. Try initial aggregate list (Latest)
        const initial = await getLatestAggregateReplays();
        let found = initial.find(v => v.slug === identifier || v.id === identifier);
        if (found) return found;

        // 2. Try matching a SHOW (Category) directly
        const showsRes = await getVODShows();
        const shows = showsRes.allitems || [];
        const showMatch = shows.find(s => s.slug === identifier || s.id === identifier);
        if (showMatch) {
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
                found = (replays.allitems || []).find(v => v.slug === identifier || v.id === identifier);
                if (found) {
                    return {
                        ...found,
                        channel_logo: channel.logo_url || channel.logo
                    };
                }
            } catch { continue; }
        }

        // 4. Try matching by TITLE (as last resort fallback for slug)
        found = shows.find(s => s.title.toLowerCase().replace(/\s+/g, '-') === identifier);
        if (found) {
            if (found.relatedItems && found.relatedItems !== "null") {
                const archives = await getRelatedItems(found.relatedItems).catch(() => []);
                if (archives.length > 0) return mapVODToSliderItem(archives[0], found.chaine_logo || found.channel_logo);
            }
            return found;
        }

        // 5. ULTIMATE FALLBACK: Search through items INSIDE shows
        for (const show of shows.slice(0, 40)) {
            if (show.feed_url && show.feed_url !== "null") {
                try {
                    const showItems = await getVODItems(show.feed_url.split('/').slice(-2, -1)[0] || "");
                    const item = (showItems.allitems || []).find(v =>
                        v.slug === identifier ||
                        v.id === identifier ||
                        v.title.toLowerCase().replace(/\s+/g, '-') === identifier
                    );
                    if (item) {
                        return mapVODToSliderItem(item, show.chaine_logo || show.channel_logo);
                    }
                } catch { continue; }
            }
        }

        return null;
    } catch (error) {
        console.error("Error finding replay:", error);
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
 * @param limit - Number of items to fetch
 */
export async function getLatestAOD(limit: number = 20): Promise<AODItemsResponse> {
    try {
        let allAggregatedItems: any[] = [];

        // 1. Try to get latest from the group (often only returns 1 or 2 items)
        try {
            const res = await fetchAPI<AODItemsResponse>(`/latestaoditemsByGroupe/${APP_ID}/json`);
            if (res && res.allitems) {
                allAggregatedItems = [...res.allitems];
            }
        } catch (e) {
            console.error("Latest AOD fetch failed:", e);
        }

        // 2. To get more (like the 10+ items the user wants), we MUST visit each radio
        // This ensures we get the "LE 13H DU POSTE NATIONAL" and others mentioned by the user
        try {
            const channelsRes = await fetchAPI<any>(`/listChannelsAOD/${APP_ID}/json`);
            // The API returns an array where the first item contains the radios list
            const radioLists = channelsRes.allitems?.[0]?.list_channels_AOD_by_radio || [];

            // Fetch from all available radios to be thorough
            const radiosPromises = radioLists.map(async (radio: any) => {
                if (!radio.list_channels_AOD_By_radio) return [];

                // Clean the endpoint URL
                const endpoint = radio.list_channels_AOD_By_radio.replace(API_BASE_URL, '');
                const showsRes = await fetchAPI<any>(endpoint).catch(() => ({ allitems: [] }));
                const shows = showsRes.allitems || [];

                // Fetch from the top 5 latest shows for this radio
                const showsPromises = shows.slice(0, 5).map(async (show: any) => {
                    if (!show.feed_url) return [];
                    const feedEndpoint = show.feed_url.replace(API_BASE_URL, '');
                    const itemsRes = await fetchAPI<any>(feedEndpoint).catch(() => ({ allitems: [] }));
                    const items = itemsRes.allitems || [];

                    return items.map((item: any) => ({
                        ...item,
                        radio: item.radio || show.radio || radio.radio_name || "CRTV",
                        showLogo: item.showLogo || show.logo || radio.radio_sdLogo || "",
                        showName: item.showName || show.title || "",
                    }));
                });

                const showResults = await Promise.all(showsPromises);
                return showResults.flat();
            });

            const radioResults = await Promise.all(radiosPromises);
            allAggregatedItems = [...allAggregatedItems, ...radioResults.flat()];
        } catch (aggErr) {
            console.error("Secondary AOD aggregation failed:", aggErr);
        }

        // 3. Map to consistent format
        const mappedItems = allAggregatedItems.map((item: any) => {
            const id = String(item.id || item.slug || Math.random());
            const slug = item.slug || id;
            return {
                ...item,
                id,
                slug,
                title: item.title || item.titre || "",
                desc: item.desc || item.description || "",
                image: item.logo || item.image || item.showLogo || item.logo_url || "",
                logo: item.logo || item.showLogo || item.logo_url || "",
                image_url: item.logo || item.image_url || item.showLogo || "",
                audio_url: item.radio_url || item.audio_url || item.audio || item.lien || item.stream_url || "",
                channel_name: item.showName || item.channel_name || item.radio || "CRTV",
                published_at: item.date || item.published_at || new Date().toISOString(),
                type: 'audio'
            };
        });

        // 4. Deduplicate and Sort
        const seenSlugs = new Set();
        const uniqueItems = mappedItems
            .filter((item: any) => {
                const itemSlug = String(item.slug);
                if (!item || !itemSlug || seenSlugs.has(itemSlug)) return false;
                seenSlugs.add(itemSlug);
                return true;
            });

        // Robust date parsing for sorting
        const parseDate = (d: any) => {
            if (!d) return 0;
            const date = new Date(d);
            return isNaN(date.getTime()) ? 0 : date.getTime();
        };

        // Sort by date (descending)
        const sortedItems = uniqueItems.sort((a, b) => parseDate(b.published_at) - parseDate(a.published_at));

        return { allitems: sortedItems.slice(0, limit) };
    } catch (error) {
        console.error("Error in getLatestAOD:", error);
        return { allitems: [] };
    }
}

/**
 * Find a specific audio by slug or ID
 */
export async function findAudio(identifier: string): Promise<AODItem | null> {
    if (!identifier) return null;
    try {
        // 1. Check latest AOD items first
        const latest = await getLatestAOD(100);
        const found = latest.allitems.find(a => a.slug === identifier || a.id === identifier);
        if (found) return found;

        // 2. If not found, try searching by title-slug match
        const searchSlug = identifier.toLowerCase().replace(/\s+/g, '-');
        const foundByTitle = latest.allitems.find(a => a.title.toLowerCase().replace(/\s+/g, '-') === searchSlug);
        if (foundByTitle) return foundByTitle;

        return null;
    } catch (error) {
        console.error("Error finding audio:", error);
        return null;
    }
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
 */
export async function getWordPressPostById(postId: string | number): Promise<import('../types/api').WordPressPost> {
    return fetchWordPressAPI<import('../types/api').WordPressPost>(`/posts/${postId}?_embed=wp:featuredmedia,wp:term`);
}

/**
 * Get a single WordPress post by slug
 * Note: WP API returns an array for slug filter, so we take the first item
 */
export async function getWordPressPostBySlug(slug: string): Promise<import('../types/api').WordPressPost | null> {
    const results = await fetchWordPressAPI<import('../types/api').WordPressPost[]>(`/posts?slug=${slug}&_embed=wp:featuredmedia,wp:term`);
    return results && results.length > 0 ? results[0] : null;
}

/**
 * Robust fetcher that handles either ID or Slug
 */
export async function getWordPressPost(identifier: string | number): Promise<import('../types/api').WordPressPost | null> {
    if (!identifier) return null;

    // If it's a number or a string that looks like a number, try ID first
    if (!isNaN(Number(identifier))) {
        try {
            return await getWordPressPostById(identifier);
        } catch (e) {
            // Fallback to slug if ID fails (might be a numeric slug)
            return await getWordPressPostBySlug(identifier.toString());
        }
    }

    return await getWordPressPostBySlug(identifier.toString());
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
