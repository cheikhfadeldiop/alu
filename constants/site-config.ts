/**
 * Site Configuration - MASTER CONFIGURATION FILE
 * Centralized constants, URLs, colors, strings, and assets for the entire application.
 * All hardcoded values should be pulled from here.
 */

type SiteMode = 'crtv' | 'rts' | 'alutv';

// CHANGE THIS VALUE TO SWITCH SITES
const ACTIVE_SITE: SiteMode = 'alutv';

const SITE_DEFAULTS = {
    crtv: {
        name: "CRTV",
        officialName: "Cameroon Radio Television",
        tagline: "L'organisme public camerounais de radio-télévision",
        description: "La Cameroon Radio Television est l'Office national de radio diffusion Télévision du Cameroun.La Cameroon Radio Television est l'Office national de radio diffusion Télévision du Cameroun.",
        siteUrl: 'https://crtv.cm',
        api: {
            baseUrl: 'https://tveapi.acan.group/myapiv2',
            wordpressBaseUrl: 'https://actu.crtv.cm/wp-json/wp/v2',
            appId: 'lacrtv',
        },
        social: {
            facebook: 'https://www.facebook.com/CRTVweb/?locale=fr_FR',
            youtube: 'https://www.youtube.com/@Crtvweb',
            twitter: 'https://x.com/CRTV_web?lang=fr',
            instagram: 'https://www.instagram.com/crtvweb/?hl=fr',
            tiktok: 'https://www.tiktok.com/@crtvweb?lang=fr',
            linkedin: 'https://cm.linkedin.com/company/crtv-cameroon-radio-television',
        },
        contact: {
            address: 'MBALLA II, Yaoundé, Cameroun.',
            phones: '(+237) 222 214 088',
            fax: '(+237) 222 214 047',
            email: 'contact@crtv.cm',
            whatsapp: '237222214088',
            map: { latitude: 3.866667, longitude: 11.516667, zoom: 13 }
        },
        theme: {
            primary: '#d1121f',
            secondary: '#009e49',
            tertiary: '#fcd116',
        },
        channels: [
            { id: '50004', slug: 'crtv', name: 'CRTV', logo: "https://cdn.tve.static.acan.group/images/channel_1731344652.png" },
            { id: '50005', slug: 'crtv-news', name: 'CRTV NEWS', logo: "https://cdn.tve.static.acan.group/images/channel_1731344640.png" },
            { id: '50006', slug: 'crtv-sport', name: 'CRTV SPORT', logo: "https://cdn.tve.static.acan.group/images/channel_1731344621.png" },
        ]
    },
    rts: {
        name: "RTS",
        officialName: "Radio Télévision Sénégalaise",
        tagline: "Le service public de l'audiovisuel au Sénégal",
        description: "La RTS est l'entreprise publique de télévision et de radio du Sénégal.",
        siteUrl: 'https://rts.sn',
        api: {
            baseUrl: 'https://tveapi.acan.group/myapiv2',
            wordpressBaseUrl: 'https://actu.rts.sn/wp-json/wp/v2',
            appId: 'larts',
        },
        social: {
            facebook: 'https://www.facebook.com/rts.sn',
            youtube: 'https://www.youtube.com/@RTS1_Senegal',
            twitter: 'https://twitter.com/RTS1_Senegal',
            instagram: 'https://www.instagram.com/rts1_senegal',
            tiktok: 'https://www.tiktok.com/@rts1_senegal',
            linkedin: '#',
        },
        contact: {
            address: 'Triangle Sud, Dakar, Sénégal.',
            phones: '(+221) 33 839 12 12',
            fax: '',
            email: 'contact@rts.sn',
            whatsapp: '221338391212',
            map: { latitude: 14.6937, longitude: -17.4441, zoom: 13 }
        },
        theme: {
            primary: '#009e49',
            secondary: '#d1121f',
            tertiary: '#fcd116',
        },
        channels: [
            { id: '1', slug: 'rts1', name: 'RTS 1', logo: "https://cdn.tve.static.acan.group/images/channel_1.png" },
            { id: '2', slug: 'rts2', name: 'RTS 2', logo: "https://cdn.tve.static.acan.group/images/channel_2.png" },
        ]
    },
    alutv: {
        name: "ALU TV",
        officialName: "ALU TV Nigeria",
        tagline: "News, Live & Replay",
        description: "ALU TV — Votre portail complet d'actualités : Direct TV et Radio, émissions exclusives et replays. Suivez en temps réel l'info nationale et internationale, revivez vos programmes favoris et écoutez nos débats en podcast, 24h/24.",
        siteUrl: 'https://acangroup.org',
        api: {
            // ALU mode: we don't use tveapi for streams/videos.
            // Keep a stable origin for helpers that build absolute URLs.
            baseUrl: 'https://acangroup.org',
            // Temporary: keep CRTV WordPress for news until ALU news API is ready.
            wordpressBaseUrl: 'https://actu.crtv.cm/wp-json/wp/v2',
            // Not used by tveapi in ALU mode; kept to avoid breaking config shape.
            appId: 'alutv',
        },
        singleChannel: {
            bootstrapUrl: "https://acangroup.org/aar/alutv/api.php",
            youtube: {
                channelId: "UCAUyALRtbHt_0Uu7xMAp1gg",
                apiKeyEnv: "YOUTUBE_API_KEY",
            },
        },
        social: {
            youtube: 'https://www.youtube.com/@AluTv-Nigeria',
            facebook: '#',
            twitter: '#',
            instagram: '#',
            tiktok: '#',
            linkedin: '#',
        },
        contact: {
            address: 'No.9 Maixduguri Road Zoo lane Area, Sokoto',
            phones: '07 06 715 5424 - 07036988610',
            fax: '',
            email: 'alutvnig@gmail.com',
            whatsapp: '',
            map: { latitude: 9.0765, longitude: 7.3986, zoom: 12 }
        },
        theme: {
            primary: '#8658A8',
            secondary: '#5F3974',
            tertiary: '#C8ABD7',
        },
        channels: [
            { id: 'alutv', slug: 'alutv', name: 'ALU TV', logo: "https://acangroup.org/aar/logo/assamadiyyahtv.png" },
        ]
    }
};

const current = SITE_DEFAULTS[ACTIVE_SITE];

export const SITE_CONFIG = {
    // Brand Basics
    name: current.name,
    officialName: current.officialName,
    tagline: current.tagline,
    description: current.description,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || current.siteUrl,

    // URL & API Configurations
    api: {
        ...current.api,
        revalidateTime: 60 * 30, // Default server-side revalidation (30min)
        cache: {
            ttl: {
                static: 1000 * 60 * 60 * 24, // 24h
                standard: 1000 * 60 * 5,     // 5 min
                dynamic: 1000 * 60 * 2,      // 2 min
                realtime: 1000 * 30,         // 30 sec
            }
        }
    },

    // Social Media Links
    social: current.social,

    // Single-channel config (ALU mode)
    singleChannel: (current as any).singleChannel,

    // Store & Application Links
    apps: {
        googlePlay: '#',
        appleStore: '#',
    },

    // Contact & Logistics
    contact: current.contact,

    // Design System
    theme: {
        colors: {
            primary: current.theme.primary,
            secondary: current.theme.secondary,
            tertiary: current.theme.tertiary,
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
    cacheLimit: 5,

    // Default Fallback Strings
    strings: {
        editorialTeam: "La rédaction",
        liveLabel: "LIVE",
        replayLabel: "REPLAY",
        unavailabilityMsg: "Flux indisponible pour le moment.",
    },

    // Channel Metadata
    channels: current.channels
};

{/*
    salut.... tu peux analyse le code entier objectivement et crre un fichier md de manier struturer pour deceller les faille et point faire et tout l'aspect non profetionne de tout les page et de maniere global de la page.. par rapport au point fort du code... je doit je corriger et les presenter a mon developper senior donc je comppte sur toit
    
    🔁 Comment envoyer tes modifications au repo principal

Tu fais tes modifications
dep tr

Tu fais :

git add .
git commit -m "modifications"
git push


Sur GitHub → bouton "Compare & Pull Request"

Tu crées une Pull Request vers acangroup/crtv-web

Le propriétaire accepte → et ça fusionne

👉 C’est la méthode standard en entreprise.

🔄 Comment récupérer les mises à jour du repo principal

Si le repo original change, tu dois le synchroniser.

Dans ton projet :

git remote add upstream https://github.com/acangroup/crtv-web.git
git fetch upstream
git merge upstream/main


Ou plus simple :

Sur GitHub → bouton “Sync fork”
    
    */}



