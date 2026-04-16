/**
 * TypeScript type definitions for API responses
 */

// App Configuration Types
export interface AppDetails {
    ACAN_API: AppConfig[];
}

export interface AppConfig {
    app_name: string;
    app_logo: string;
    app_data_toload: string;
    app_data_url: string;
    app_youtube_url: string;
    app_youtube_uid: string;
    app_google_apikey: string;
    app_news_url: string;
    app_fb_url: string;
    app_twitter_url: string;
    app_version: string;
    app_author: string;
    app_contact: string;
    app_email: string;
    app_website: string;
    app_info: string;
    app_description: string;
    app_developed_by: string;
    app_privacy_policy: string;
    publisher_id: string | null;
    android_app_id: string;
    ios_app_id: string;
    active_interstital_ad: string;
    android_interstital_ad_id: string | null;
    ios_interstital_ad_id: string | null;
    interstital_ad_click: string;
    active_banner_ad: string;
    android_banner_ad_id: string | null;
    ios_banner_ad_id: string | null;
}

// Main App Data Types
export interface AppData {
    allitems: AppDataItem[];
}

export interface AppDataItem {
    title: string;
    desc: string;
    sdimage: string;
    type: 'LIVE' | 'RADIO' | 'VOD' | 'slider' | 'news' | 'AOD' | 'EPG' | 'CINEMA' | 'LASTESTCINEMA' | 'presentateurs' | 'affiches' | 'FLASH' | 'ADS';
    feed_url: string;
    stream_url: string;
}

// Live Channel Types
export interface LiveChannelsResponse {
    allitems: LiveChannel[];
}

export interface LiveChannel {
    id: string;
    title: string;
    desc: string;
    logo: string;
    logo_url: string;
    type: 'TV' | 'RADIO';
    feed_url: string;
    alaune_feed: string;
    vod_feed: string;
    slug: string;
    guidetvnow: string;
    stream_url: string;
    affiche_url: string;
    start_time: string;
    end_time: string;
    duration: string;
    list_channels_by_category: string;
    list_pubs: string;
    // Radio specific fields
    sd_logo?: string;
    hd_logo?: string;
    emissions?: string;
}

// Direct Playback Types
export interface DirectPlayback {
    direct_url: string;
    android_url: string;
    web_url: string;
}

// VOD Types
export interface VODChannelsResponse {
    allitems: VODChannel[];
}

export interface VODChannel {
    id: string;
    title: string;
    desc: string;
    logo: string;
    logo_url: string;
    type: string;
    feed_url: string;
    slug: string;
    stream_url: string;
}

export interface VODItemsResponse {
    allitems: VODItem[];
}

export interface VODItem {
    id: string;
    title: string;
    desc: string;
    image: string;
    image_url: string;
    video_url: string;
    duration: string;
    published_at: string;
    category: string;
    slug: string;
    relatedItems?: string;
    android_url?: string;
    web_url?: string;
    stream_url?: string;
    feed_url?: string;
    webdetail_url?: string;
}

// Slider Types
export interface SlidersResponse {
    allitems: SliderItem[];
}

export interface SliderItem {
    id: string;
    title: string;
    desc: string;
    image: string;
    image_url: string;
    link_url: string;
    type: string;
    video_url?: string;
}

// Slider Video Types (from alaunesliders endpoint)
export interface SliderVideosResponse {
    allitems: SliderVideoItem[];
}

export interface SliderVideoItem {
    id: string;
    title: string;
    desc: string;
    type: string;
    views: string;
    logo: string;
    logo_url: string;
    video_url: string;
    relatedItems: string;
    feed_url: string;
    date: string;
    time: string;
    slug: string;
    channel_logo?: string;
    chaine_logo?: string;
    chaine_name?: string;
    stream_url?: string;
    android_url?: string;
    web_url?: string;
    webdetail_url?: string;
}

// Playlist Types (New for Short Videos)
export interface PlaylistResponse {
    details: {
        title: string;
        desc: string;
        type: string;
        slug: string;
        chaine_name: string;
        chaine_logo: string;
        subitems: {
            data: SliderVideoItem[];
            pagination: {
                next_page_url: string | null;
                previous_page_url: string | null;
            }
        }
    };
    links: {
        [key: string]: string;
    };
}

// Featured Content Types
export interface AlauneResponse {
    allitems: AlauneItem[];
}

export interface AlauneItem {
    id: string;
    title: string;
    desc: string;
    image: string;
    image_url: string;
    video_url: string;
    duration: string;
    published_at: string;
    category: string;
    slug: string;
    channel_id: string;
    channel_name: string;
}

// News Types
export interface NewsCategoriesResponse {
    allitems: NewsCategory[];
}

export interface NewsCategory {
    id: string;
    title: string;
    desc: string;
    slug: string;
    feed_url: string;
}

export interface NewsItemsResponse {
    allitems: NewsItem[];
}

export interface NewsItem {
    id: string;
    title: string;
    desc: string;
    content: string;
    image: string;
    image_url: string;
    published_at: string;
    category: string;
    slug: string;
    author: string;
}

// EPG Types
export interface EPGResponse {
    allitems: EPGItem[];
}

export interface EPGItem {
    id: string;
    channel_id: string;
    channel_name: string;
    channel_logo: string;
    program_title: string;
    program_desc: string;
    start_time: string;
    end_time: string;
    duration: string;
    is_current: boolean;
}

export interface FullEPGChannel {
    id: string;
    logo: string;
    titre: string;
    streamName: string;
    today: string;
    subitems: {
        direct: string;
        matin: FullEPGProgram[];
        soir: FullEPGProgram[];
        day: string;
    };
}

export interface FullEPGProgram {
    channelId: string;
    title: string;
    streamName: string;
    logo: string;
    startTime: string;
    endTime: string;
    categoryName: string;
    subcategoryName: string;
    daysInWeek: string;
    description: string | null;
    presentateurs: string;
    feed_url: string;
    slug: string;
    channelLogo?: string;
    channelName?: string;
}

// Cinema Types
export interface CinemaCategoriesResponse {
    allitems: CinemaCategory[];
}

export interface CinemaCategory {
    id: string;
    title: string;
    desc: string;
    slug: string;
    feed_url: string;
    type: 'movie' | 'series';
}

export interface CinemaItemsResponse {
    allitems: CinemaItem[];
}

export interface CinemaItem {
    id: string;
    title: string;
    desc: string;
    image: string;
    image_url: string;
    video_url: string;
    duration: string;
    year: string;
    rating: string;
    genre: string;
    slug: string;
    type: 'movie' | 'series';
    season?: string;
    episode?: string;
}

// Podcast/AOD Types
export interface AODItemsResponse {
    allitems: AODItem[];
}

export interface AODItem {
    id: string;
    title: string;
    desc: string;
    image: string;
    logo: string;
    image_url: string;
    audio_url: string;
    duration: string;
    published_at: string;
    category: string;
    slug: string;
    channel_name?: string;
}

// Presenters Types
export interface PresentersResponse {
    allitems: Presenter[];
}

export interface Presenter {
    id: string;
    name: string;
    bio: string;
    photo: string;
    photo_url: string;
    slug: string;
}

// Ads/Banners Types
export interface AdsResponse {
    allitems: AdItem[];
}

export interface AdItem {
    id: string;
    title: string;
    image: string;
    image_url: string;
    link_url: string;
    position: string;
    type: string;
}

// Flash News Types
export interface FlashNewsResponse {
    allitems: FlashNewsItem[];
}

export interface FlashNewsItem {
    id: string;
    title: string;
    content: string;
    published_at: string;
}

// Affiche Types
export interface AffichesResponse {
    allitems: AfficheItem[];
}

export interface AfficheItem {
    id: string;
    title: string;
    image: string;
    image_url: string;
    link_url: string;
    channel_id: string;
}

// WordPress API Types
export interface WordPressCategory {
    id: number;
    count: number;
    description: string;
    link: string;
    name: string;
    slug: string;
    taxonomy: string;
    parent: number;
    meta: any[];
    _links: any;
}

export interface WordPressCategoriesResponse {
    categories: WordPressCategory[];
}

export interface WordPressFeaturedMedia {
    id: number;
    source_url: string;
    alt_text: string;
    media_details?: {
        width: number;
        height: number;
        sizes?: any;
    };
}

export interface WordPressPost {
    id: number;
    date: string;
    date_gmt: string;
    modified: string;
    modified_gmt: string;
    slug: string;
    status: string;
    type: string;
    link: string;
    title: {
        rendered: string;
    };
    content: {
        rendered: string;
        protected: boolean;
    };
    excerpt: {
        rendered: string;
        protected: boolean;
    };
    author: number;
    featured_media: number;
    comment_status: string;
    ping_status: string;
    sticky: boolean;
    template: string;
    format: string;
    meta: any;
    categories: number[];
    tags: number[];
    acan_image_url?: string;
    _embedded?: {
        'wp:featuredmedia'?: WordPressFeaturedMedia[];
        'wp:term'?: any[][];
    };
    _links: any;
}

export interface WordPressPostsResponse {
    posts: WordPressPost[];
}

// ---- ALU single-channel bootstrap ----
export interface AluBootstrapResponse {
    allitems: AluBootstrapItem[];
}

export interface AluBootstrapItem {
    title: string;
    des: string;
    type: 'tv' | 'radio' | string;
    logo: string;
    stream_url: string;
    hls_url?: string;
    api_key?: string;
    yt_channel_id?: string;
}
