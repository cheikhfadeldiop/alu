# Mapping migration vers **single-channel** (ALU TV)

Ce document décrit le **mapping data** entre le projet actuel (multi-sources `tveapi` + WordPress) et le nouveau projet **single channel** basé sur l’endpoint externe:

- `https://acangroup.org/aar/alutv/api.php`

## 1) Sources actuelles (projet existant)

### Live / Radio / Replay (API aCAN “tveapi”)
- Base: `https://tveapi.acan.group/myapiv2`
- AppId: `lacrtv` (dans `constants/site-config.ts`)
- Pages impactées:
  - `app/[locale]/live/*`
  - `app/[locale]/radio/*`
  - `app/[locale]/replay/*`

### Actualités (WordPress)
- Base: `https://actu.crtv.cm/wp-json/wp/v2`
- Pages impactées:
  - `app/[locale]/news/*` via `hooks/useData` (`useWordPressNews`)

## 2) Source cible (single channel)

### Bootstrap “chaîne unique”
Endpoint:

- `GET https://acangroup.org/aar/alutv/api.php`

Structure (snapshot: `scripts/api-snapshots/external/acangroup.aar.alutv.api.php.json`):
- `allitems[]` contient des entrées `type: "tv"` et `type: "radio"` avec:
  - `title`
  - `des`
  - `logo`
  - `stream_url` / `hls_url`
  - `yt_channel_id`
  - `api_key`

Interprétation:
- **Live TV**: item `type === "tv"` → player HLS via `hls_url`
- **Radio**: item `type === "radio"` → audio stream via `stream_url`
- **Shorts + émissions + replays**: dérivés de YouTube (via `yt_channel_id` + `api_key`)

## 3) Contrats de données par page (cible)

### 3.1 `/[locale]` (Home Figma)
Sections attendues (d’après `components/home/FigmaHomePage.tsx`):
- Hero actualités
- Most Popular (news)
- Vidéos (longs)
- Shorts (reels)
- Bannières pubs (placeholders)

Mapping cible proposé:
- **Actualités**: soit (A) flux WordPress dédié ALU, soit (B) playlist/onglet YouTube “news” si le client veut tout sur YouTube.
  - Décision à prendre côté produit (car l’API `api.php` ne donne pas les news).
- **Vidéos + Shorts**: YouTube Data API (playlistItems/search).

### 3.2 `/[locale]/live`
- Source actuelle: `getLiveChannels()` + EPG
- Source cible:
  - `api.php` → item TV (`hls_url`) + metadata (`title`, `logo`)
  - EPG: **non fourni** par `api.php` → prévoir fallback UI (pas d’EPG) ou nouvelle source EPG si disponible.

### 3.3 `/[locale]/radio`
- Source actuelle: `getLiveRadios()` + EPG now
- Source cible:
  - `api.php` → item radio (`stream_url`) + metadata
  - EPG radio: non fourni → fallback.

### 3.4 `/[locale]/replay`
Objectif produit: “émissions” + “replay par émission”
- Source actuelle: `getVODShows()` + `getVODItems(showId)` depuis `tveapi`
- Source cible (YouTube):
  - **Emissions**: playlists YouTube (chaîne) → chaque playlist = une émission
  - **Replays par émission**: `playlistItems` de la playlist
  - **Détail vidéo**: `videos.list` (durée, stats) + embed/stream via YouTube

Notes:
- Si le replay doit être HLS (pas YouTube), il faut une autre API “VOD catalog”. `api.php` ne la fournit pas.

### 3.5 `/[locale]/news`
Source cible à décider:
- Option A (recommandée si vraie rédaction): WordPress / CMS ALU (similaire à CRTV)
- Option B: posts “Community” YouTube (limité) + vidéos “news”
- Option C: autre endpoint “news” à fournir par le client

## 4) Modifs prévues dans le code (prochaine étape)

### 4.1 Configuration
Créer un nouveau “site mode” dans `constants/site-config.ts` (ex: `alutv`) avec:
- `api` (si on garde `tveapi`: non)
- `singleChannel.bootstrapUrl = "https://acangroup.org/aar/alutv/api.php"`
- `singleChannel.youtube.channelId`
- `singleChannel.youtube.apiKey` (idéalement via `process.env`, pas en dur)
- Logos / brand / contact / social

### 4.2 Nouveau service API (non destructif)
Ajouter dans `services/api.ts` (ou `services/alutv.ts`) des fonctions:
- `getSingleChannelBootstrap()` → lit `api.php`
- `getSingleLiveTv()` / `getSingleRadio()`
- `getYouTubePlaylists()` (émissions)
- `getYouTubePlaylistItems(playlistId)` (replays)
- `getYouTubeShorts()` (shorts) via search/playlist dédiée

### 4.3 Pages à adapter sans casser le pixel-perfect
Adapter uniquement la **source de données** (props), sans toucher au layout:
- `app/[locale]/live/page.tsx` → remplacer `getLiveChannels` par `getSingleLiveTv`
- `app/[locale]/radio/page.tsx` → remplacer `getLiveRadios` par `getSingleRadio`
- `app/[locale]/replay/*` → brancher playlists YouTube
- `hooks/useData` (news) → brancher nouvelle source définie

## 5) Gaps / risques identifiés
- `api.php` ne fournit pas:
  - EPG
  - Catalogue émissions/replay (hors YouTube)
  - News texte/images
- `api_key` YouTube dans la réponse `api.php`: à éviter côté client (risque d’abus). Préférer:
  - stocker la clé côté serveur (`process.env.YT_API_KEY`) et ignorer celle de `api.php`, ou
  - proxy server-side (Next.js route handler) si nécessaire.

