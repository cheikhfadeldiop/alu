/**
 * CRTV Site Configuration - MASTER CONFIGURATION FILE
 * Centralized constants, URLs, colors, strings, and assets for the entire application.
 * All hardcoded values should be pulled from here.
 */

export const SITE_CONFIG = {
    // Brand Basics
    name: "CRTV",
    officialName: "Cameroon Radio Television",
    tagline: "L'organisme public camerounais de radio-télévision",
    description: "La Cameroon Radio Television est l'Office national de radio diffusion Télévision du Cameroun.",

    // URL & API Configurations de teste celui de larts
    api: {
        baseUrl: 'https://tveapi.acan.group/myapiv2',
        wordpressBaseUrl: 'https://actu.rts.sn/wp-json/wp/v2',
        appId: 'larts',
        revalidateTime: 60 * 30, // Default server-side revalidation (30min)

        // Refresh Controller (Client-side cache management)
        cache: {
            ttl: {
                /*
                static: 0, // 24h (App details, terms)
                standard: 0,     // 5 min (News, Replays)
                dynamic: 0,      // 2 min (EPG, Adverts)
                realtime: 0,         // 30 sec (Live status)
                */
                static: 1000 * 60 * 60 * 24, // 24h (App details, terms)
                standard: 1000 * 60 * 5,     // 5 min (News, Replays)
                dynamic: 1000 * 60 * 2,      // 2 min (EPG, Adverts)
                realtime: 1000 * 30,         // 30 sec (Live status)
            }
        }
    },

    // Social Media Links (DIRECT)
    social: {
        facebook: 'https://www.facebook.com/CRTVweb/?locale=fr_FR',
        youtube: 'https://www.youtube.com/@Crtvweb',
        twitter: 'https://x.com/CRTV_web?lang=fr',
        instagram: 'https://www.instagram.com/crtvweb/?hl=fr',
        tiktok: 'https://www.tiktok.com/@crtvweb?lang=fr',
        linkedin: 'https://cm.linkedin.com/company/crtv-cameroon-radio-television',
    },

    // Store & Application Links
    apps: {
        googlePlay: '#',
        appleStore: '#',
    },

    // Contact & Logistics
    contact: {
        address: 'MBALLA II, Yaoundé, Cameroun.',
        phones: '(+237) 222 214 088',
        fax: '(+237) 222 214 047',
        email: 'contact@crtv.cm',
        map: {
            latitude: 3.866667,
            longitude: 11.516667,
            zoom: 13
        }
    },

    // Design System (Synced with globals.css)
    theme: {
        colors: {
            primary: '#d1121f', // Red-600/Accent
            secondary: '#009e49', // Green-500 (Flag)
            tertiary: '#fcd116', // Yellow (Flag)
            success: '#22c55e',
            error: '#dc2626',
            warning: '#f59e0b',
        },
        placeholders: {
            news: "/assets/placeholders/actu_regional_469x246.png",
            video: "/assets/placeholders/live_tv_frame.png",
            avatar: "/assets/placeholders/presentateur_336x442.png",
            arrow: "/assets/placeholders/arrow2.png",
            radio: "/assets/placeholders/radio_icon_sur_card.png",
            logo: "/assets/logo/logo.png",
        }
    },

    // Content Organization & Logic
    categories: {
        news: {
            alaune: 121,
            trending: 141,
            regional: 145,
            matam: 133,
            agriculture: 153,
            radioJournals: 141, // Placeholder for radio journals
            tvJournals: 121,    // Placeholder for TV journals
            groups: [
                { id: "a-la-une", name: "A LA UNE", matchIds: [121], keywords: ["une", "actualit", "general"] },
                { id: "regions", name: "RÉGIONS", matchIds: [145], keywords: ["dakar", "matam", "region", "saint-louis", "louga", "tambacounda", "diourbel", "kaolack", "fatick", "kolda", "ziguinchor", "sedhiou", "kedougou", "kaffrine"] },
                { id: "international", name: "INTERNATIONAL", matchIds: [128], keywords: ["monde", "world", "afrique", "europe", "asie", "amerique"] },
                { id: "societe-politique", name: "SOCIÉTÉ & POLITIQUE", matchIds: [136, 132, 151, 123, 129], keywords: ["politique", "economie", "sante", "education", "societe", "justice", "gouvernance"] },
                { id: "loisirs-tech", name: "LOISIRS & TECH", matchIds: [125, 612, 148, 116], keywords: ["sport", "culture", "tech", "musique", "cinema", "loisirs", "variet"] },
            ]
        }
    },

    // Default Fallback Strings (Internationalization should be preferred, but these are system-level)
    strings: {
        editorialTeam: "La rédaction",
        liveLabel: "LIVE",
        replayLabel: "REPLAY",
        unavailabilityMsg: "Flux indisponible pour le moment.",
    },

    // Channel Metadata (Dynamic Resolution)
    channels: [
        { id: '50004', slug: 'crtv', name: 'CRTV', logo: "https://cdn.tve.static.acan.group/images/channel_1731344652.png" },
        { id: '50005', slug: 'crtv-news', name: 'CRTV NEWS', logo: "https://cdn.tve.static.acan.group/images/channel_1731344640.png" },
        { id: '50006', slug: 'crtv-sport', name: 'CRTV SPORT', logo: "https://cdn.tve.static.acan.group/images/channel_1731344621.png" },
    ]
};

{/*
    salut.... tu peux analyse le code entier objectivement et crre un fichier md de manier struturer pour deceller les faille et point faire et tout l'aspect non profetionne de tout les page et de maniere global de la page.. par rapport au point fort du code... je doit je corriger et les presenter a mon developper senior donc je comppte sur toit */}
