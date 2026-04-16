import { AdBannerH, AdBannerH2 } from "../ui/AdBanner";
import { AdBanV } from "../ui/AdBannerV";
import { SafeImage } from "../ui/SafeImage";
import type { WordPressPost, SliderVideoItem } from "@/types/api";
import { decodeHtmlEntities, formatDate, getPostAuthor, parseToDate } from "@/utils/text";
import { Link } from "@/i18n/navigation";
import { SITE_CONFIG } from "@/constants/site-config";

const assets = {
  heroLeft: "https://www.figma.com/api/mcp/asset/fa34d6a9-4b04-4022-9d20-1ab9004e39f9",
  heroCenter: "https://www.figma.com/api/mcp/asset/bab8d949-a877-4548-a45e-ceb86fff29d3",
  adWoman: "https://www.figma.com/api/mcp/asset/08488ac8-a237-4ff4-b54f-e2ee2e9afae8",
  popular1: "https://www.figma.com/api/mcp/asset/25a782db-a14d-4b2c-a77c-5a057fee9130",
  popular2: "https://www.figma.com/api/mcp/asset/b10473dd-e215-4586-810c-3569bbcd1a24",
  popular3: "https://www.figma.com/api/mcp/asset/cf481e8a-26b4-4816-a810-5cb3f23626e7",
  popular4: "https://www.figma.com/api/mcp/asset/a2b3441e-c632-42ce-a244-e8c73d9a1536",
  featuredVideo: "https://www.figma.com/api/mcp/asset/956647df-8747-4f7f-8f4c-78bc039f8c55",
  secondVideo: "https://www.figma.com/api/mcp/asset/0921c896-77ae-4b78-84ec-16ae22cbd13f",
  short1: "https://www.figma.com/api/mcp/asset/58b7cb33-6fab-4001-b93d-a8006671c2dc",
  short2: "https://www.figma.com/api/mcp/asset/bf958bbc-3613-422f-b11a-866ea1fde031",
  short3: "https://www.figma.com/api/mcp/asset/a5308c76-401f-48e2-9fae-9115e9384c44",
  short4: "https://www.figma.com/api/mcp/asset/6d20387e-ccdc-4b11-8b90-c515829245d8",
  short5: "https://www.figma.com/api/mcp/asset/5adf1a1c-0fb8-4d5a-9d18-9de8317366cc",
  playLg: "https://www.figma.com/api/mcp/asset/d539a069-3bb4-499c-949b-87d267bbe062",
  playMd: "https://www.figma.com/api/mcp/asset/e9e95a62-dd7d-41bd-b405-b37539c344b7",
  playSm: "https://www.figma.com/api/mcp/asset/77c9ebe3-96b3-4aa8-bef3-83a65e6d5459",
  playSmAlt: "https://www.figma.com/api/mcp/asset/e09940cf-fab2-46b2-a858-2dc9a67a2d5f",
  playShort: "https://www.figma.com/api/mcp/asset/3adb1f72-cab4-46b6-8d8e-c2f8a1c27d52",
};

function wpImage(post: WordPressPost | null | undefined) {
  if (!post) return SITE_CONFIG.theme.placeholders.logo;
  const rawSrc =
    post.acan_image_url ||
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    SITE_CONFIG.theme.placeholders.logo;
  return rawSrc?.replace(/^http:\/\//i, "https://");
}

function hasRealWpImage(post: WordPressPost | null | undefined) {
  return Boolean(post?.acan_image_url || post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url);
}

function wpTitle(post: WordPressPost | null | undefined, fallback: string) {
  return decodeHtmlEntities(post?.title?.rendered || fallback);
}

function wpHref(post: WordPressPost | null | undefined) {
  return post ? `/news/${post.slug || post.id}` : "/news";
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="fig-h9 mb-4 border-b pb-3 font-medium uppercase tracking-wide text-[var(--fig-text-primary)] [border-color:var(--primary)]">
      {children}
    </h2>
  );
}

function formatDisplayTime(date?: string | Date, explicitTime?: string) {
  if (explicitTime && explicitTime.trim()) return explicitTime;
  const parsed = parseToDate(date);
  if (!parsed) return "--:--";
  return parsed.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function CardMeta({ date, time, small = false }: { date?: string; time?: string; small?: boolean }) {
  const d = date ? formatDate(date) : formatDate(new Date());
  const t = formatDisplayTime(date, time);
  return (
    <p className={`${small ? "fig-b4" : "fig-b3"} mt-2 text-[var(--fig-text-secondary)]`}>
      {d} <span className="mx-1">•</span> {t}
    </p>
  );
}

function CategoryTag({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex h-[15px] items-center justify-center rounded-full border px-[8px] text-[8px] leading-[12px] text-[var(--fig-text-secondary)]"
      style={{ borderColor: color }}
    >
      {label}
    </span>
  );
}

function Dot() {
  return <span className="inline-block h-[4px] w-[4px] rounded-full bg-[var(--fig-text-secondary)]/70" />;
}

function stableItemKey(item: any, fallback: string) {
  const titleValue = typeof item?.title === "string" ? item.title : item?.title?.rendered;
  return String(item?.id || item?.slug || titleValue || fallback);
}

type FigmaHomePageProps = {
  posts: WordPressPost[];
  popularPosts: WordPressPost[];
  videos: SliderVideoItem[];
  shorts: SliderVideoItem[];
  newsCategoryId: number;
  labels: {
    latestNews: string;
    mostPopular: string;
    videos: string;
    shorts: string;
    fallbackShortTitle: string;
  };
};

export function FigmaHomePage({ posts, popularPosts, videos, shorts, labels }: FigmaHomePageProps) {
  const nowLabel = formatDate(new Date());
  const safePosts = posts && posts.length ? posts : [];
  const heroLeft = safePosts[0] || null;
  const heroCenter = safePosts[1] || null;
  const sideList = safePosts.slice(2, 6);

  const safePopular = popularPosts && popularPosts.length ? popularPosts : safePosts;
  const mostPopular = safePopular.slice(0, 8);
  const smallCards = safePopular.slice(8, 16);

  const normalizedVideos = videos.length
    ? Array.from({ length: Math.max(12, videos.length) }, (_, i) => videos[i % videos.length])
    : [];
  const primaryVideo = normalizedVideos[0] || null;
  const secondaryVideo = normalizedVideos[1] || null;
  const videoGrid = normalizedVideos.slice(2, 10);

  const logoPlaceholder = SITE_CONFIG.theme.placeholders.logo;
  const shortsPool = shorts && shorts.length
    ? shorts
    : normalizedVideos.length
      ? normalizedVideos
    : [
      { id: "short-fb-1", slug: "short-fb-1", title: labels.fallbackShortTitle, logo: logoPlaceholder, logo_url: logoPlaceholder, date: new Date().toISOString(), time: "", type: "youtube", views: "0", desc: "", video_url: "", relatedItems: "", feed_url: "" },
      { id: "short-fb-2", slug: "short-fb-2", title: labels.fallbackShortTitle, logo: logoPlaceholder, logo_url: logoPlaceholder, date: new Date().toISOString(), time: "", type: "youtube", views: "0", desc: "", video_url: "", relatedItems: "", feed_url: "" },
      { id: "short-fb-3", slug: "short-fb-3", title: labels.fallbackShortTitle, logo: logoPlaceholder, logo_url: logoPlaceholder, date: new Date().toISOString(), time: "", type: "youtube", views: "0", desc: "", video_url: "", relatedItems: "", feed_url: "" },
      { id: "short-fb-4", slug: "short-fb-4", title: labels.fallbackShortTitle, logo: logoPlaceholder, logo_url: logoPlaceholder, date: new Date().toISOString(), time: "", type: "youtube", views: "0", desc: "", video_url: "", relatedItems: "", feed_url: "" },
      { id: "short-fb-5", slug: "short-fb-5", title: labels.fallbackShortTitle, logo: logoPlaceholder, logo_url: logoPlaceholder, date: new Date().toISOString(), time: "", type: "youtube", views: "0", desc: "", video_url: "", relatedItems: "", feed_url: "" },
    ] as SliderVideoItem[];

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-12 bg-[var(--fig-bg)] px-4 py-8 text-[var(--fig-text-primary)] xl:px-0">
      <AdBannerH className="mx-auto max-w-[1280px]" />

      <section className="grid gap-[15px] lg:grid-cols-[369px_515px_366px]">
        <Link href={wpHref(heroLeft)} className="block rounded-[10px] hover-lift-primary">
        <article className="space-y-2">
          <SafeImage alt={wpTitle(heroLeft, "Article")} className="h-[321px] w-full rounded-[10px] object-cover" src={wpImage(heroLeft)} width={369} height={321} />
          <div className="h-[161px]  px-2 ">
            <h3 className="text-[20px] font-medium leading-[30px]">
              {wpTitle(heroLeft, "Actualité")}
            </h3>
            <div className="mt-2 flex items-center justify-between">
              <CardMeta date={heroLeft?.date} />
              <CategoryTag label={getPostAuthor(heroLeft) || "News"} color="var(--fig-tag-news)" />
            </div>
          </div>
        </article>
        </Link>

        <Link href={wpHref(heroCenter)} className="block rounded-[10px] hover-lift-primary">
        <article className="relative">
  <SafeImage
    alt={wpTitle(heroCenter, "Article")}
    className="h-[490px] w-full rounded-[10px] object-cover"
    src={wpImage(heroCenter)}
    width={515}
    height={490}
  />

  {/* Gradient */}
  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%] rounded-b-[10px] bg-gradient-to-t from-black/70 to-transparent" />

  {/* Content */}
  <div className="absolute bottom-0 z-10 flex w-full flex-col gap-2 p-4">
    <h3 className="fig-h9 uppercase text-white ">
      {wpTitle(heroCenter, "Actualité")}
    </h3>

    <div className="flex items-center gap-2 text-sm text-gray-300 justify-between">
      <div>
      <span>{heroCenter?.date ? formatDate(heroCenter.date) : nowLabel}</span>
      <Dot/>
      <span>{formatDisplayTime(heroCenter?.date)}</span>
      </div>
      <div>
      <span
      className="inline-flex h-[15px] items-center justify-center text-white rounded-full border border-[var(--fig-tag-religion)] px-[8px] text-[8px] leading-[12px] text-[var(--fig-text-secondary)]"
      
    >{getPostAuthor(heroCenter) || "News"}</span>
      </div>
    </div>
  </div>
</article>
        </Link>

        <div className="h-[490px]   rounded-[10px]  ">
          {Array.from({ length: 4 }, (_, i) => sideList[i] || null).map((post, i) => (
            <Link
              key={stableItemKey(post || {}, `side-${i}`)}
              href={wpHref(post)}
              className="block rounded-[5px] mb-2 hover-lift-primary"
            >
            <article className=" h-[115px] flex  justify-between  ">
              <div className="flex flex-col bg-surface pb-3 w-full p-2  px-2 rounded-md justify-between">
              <h4 className="text-[16px] font-medium leading-[24px]">
                {wpTitle(post, "Actualité")}
              </h4>
              <div className="mt-1 flex items-center  justify-between">
                <CardMeta date={post?.date} small />
                <CategoryTag label={getPostAuthor(post) || "News"} color="var(--fig-tag-news)" />
              </div>
              </div>
            </article>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className=" pt-10 grid gap-[22px] lg:grid-cols-[789px_469px] ">
          <div className="flex flex-col">
          <SectionTitle>{labels.mostPopular}</SectionTitle>
          <div className="grid gap-[19px] md:grid-cols-2">
            {[0, 1].map((col) => (
             <div key={col} className="space-y-[17px]">
  {/* Grand article */}
  <Link href={wpHref(mostPopular[col])} className="block rounded-[10px] hover-lift-primary">
    <article>
      <SafeImage
        alt={wpTitle(mostPopular[col], "Grande actualité")}
        className="h-[235px] w-full rounded-[10px] object-cover"
        src={wpImage(mostPopular[col])}
        width={380}
        height={235}
      />
      <div className="px-5 pt-[13px] pb-3">
        <h4 className="text-[20px] line-clamp-2 font-medium leading-[30px]">
          {wpTitle(mostPopular[col], "Actualité")}
        </h4>
        <div className="mt-1 flex items-center justify-between">
          <CardMeta date={mostPopular[col]?.date} />
          <CategoryTag
            label={getPostAuthor(mostPopular[col]) || "News"}
            color="var(--fig-tag-news)"
          />
        </div>
      </div>
    </article>
  </Link>

  {/* Petits articles */}
  {smallCards.slice(col * 4, col * 4 + 3).map((post, idx) => (
    <Link
      key={stableItemKey(post || {}, `popular-small-${col}-${idx}`)}
      href={wpHref(post)}
      className="block rounded-[10px] hover-lift-primary"
    >
    <article className="flex h-[120px] items-start gap-3 rounded-[10px] bg-surface px-[5px] py-[6.5px]">
      <div className="h-[107px] w-[103px] shrink-0 overflow-hidden rounded-[10px]"><SafeImage
        alt={stableItemKey(post || {}, `popular-small-${col}-${idx}`)}
        className={`h-full w-full rounded-[10px] ${hasRealWpImage(post) ? "object-cover" : "object-contain bg-black/20 p-2"}`}
        src={wpImage(post)}
        width={103}
        height={107}
      /></div>

      <div className="flex min-w-0 w-full flex-col justify-between pt-2">
        <h4 className="text-[13px] font-medium leading-[20px] line-clamp-2">
          {wpTitle(post, "Actualité")}
        </h4>

        <div className="mt-1 flex items-center justify-between">
          <CardMeta date={post?.date} small />
          <CategoryTag
            label={getPostAuthor(post) || "News"}
            color="var(--fig-tag-news)"
          />
        </div>
      </div>
    </article>
    </Link>
  ))}
</div>
            ))}
          </div>
          </div>
          <AdBanV className="h-full" />
        </div>
      </section>

      <section>
  <SectionTitle>{labels.latestNews}</SectionTitle>

  <div className="pt-6 pl-2 pb-10 overflow-x-auto no-scrollbar">
    <div className="flex gap-[20px]">
      
      {safePosts.slice(0, 4).map((post, i) => (
        <Link
          key={stableItemKey(post || {}, `latest-${i}`)}
          href={wpHref(post)}
          className="block w-[356px] shrink-0 rounded-[10px] hover-lift-primary"
        >
          <article className="rounded-[10px] h-[290px] flex flex-col overflow-hidden">
            
            {/* Image */}
            <SafeImage
              alt={wpTitle(post, "Article")}
              className="h-[200px] w-full object-cover rounded-[10px]"
              src={wpImage(post)}
              width={356}
              height={200}
            />

            {/* Content */}
            <div className="px-[10px]  pt-[1px] pb-2 h-[100px] flex flex-col justify-between">
              
              <h4 className="fig-h11 font-medium leading-[20px] line-clamp-2">
                {wpTitle(post, "Actualité")}
              </h4>

              <div className="flex items-center justify-between">
                <CardMeta date={post?.date} small />
                <CategoryTag
                  label={getPostAuthor(post) || "News"}
                  color="var(--fig-tag-news)"
                />
              </div>

            </div>

          </article>
        </Link>
      ))}

    </div>
  </div>
</section>
      <AdBannerH2 className="mx-auto max-w-[1280px] pb-6" />

      <section>
      <SectionTitle>{labels.videos}</SectionTitle>
      <div className="mt-10 flex flex-col gap-[45px]">
          <div className="flex flex-wrap gap-[25px] xl:flex-nowrap">
            <Link
              href={primaryVideo ? `/replay/${primaryVideo.slug}` : "/replay"}
              className="block rounded-[10px] hover-lift-primary"
            >
            <article className="relative h-[419px] w-full overflow-hidden rounded-[10px] xl:w-[730px]">
              <SafeImage alt={primaryVideo?.title || "Video en vedette"} className="h-full w-full object-cover" src={primaryVideo?.logo_url || assets.featuredVideo} width={730} height={419} />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
              <div className="absolute bottom-[18px] left-[24px] right-[24px] flex gap-[10px]">
                <img src={assets.playLg} alt="" className="h-[55px] w-[55px] shrink-0" />
                <div className="flex flex-col justify-center">
                  <h3 className="fig-h9 uppercase text-[var(--primary-text-light)]">
                    {primaryVideo?.title || "Video"}
                  </h3>
                  <div className="mt-[10px] flex items-center gap-[10px] text-[16px] text-[#bbb]">
                    <span>{primaryVideo?.date ? formatDate(primaryVideo.date) : nowLabel}</span>
                    <Dot />
                    <span>{formatDisplayTime(primaryVideo?.date, primaryVideo?.time)}</span>
                  </div>
                </div>
              </div>
            </article>
            </Link>

            <Link
              href={secondaryVideo ? `/replay/${secondaryVideo.slug}` : "/replay"}
              className="block rounded-[10px] hover-lift-primary"
            >
            <article className="w-full xl:w-[526px]">
              <SafeImage alt={secondaryVideo?.title || "Video secondaire"} className="h-[278px] w-full rounded-[10px] object-cover xl:w-[524px]" src={secondaryVideo?.logo_url || assets.secondVideo} width={524} height={278} />
              <div className="mt-[10px] flex gap-[10px]">
                <img src={assets.playMd} alt="" className="h-[55px] w-[55px] shrink-0" />
                <div>
                  <h3 className="fig-h10 text-[var(--fig-text-primary)]">
                    {secondaryVideo?.title || "Video"}
                  </h3>
                  <div className="mt-[10px] flex items-center gap-[10px] text-[16px] text-[var(--fig-text-secondary)]">
                    <span>{secondaryVideo?.date ? formatDate(secondaryVideo.date) : nowLabel}</span>
                    <Dot />
                    <span>{formatDisplayTime(secondaryVideo?.date, secondaryVideo?.time)}</span>
                  </div>
                </div>
              </div>
            </article>
            </Link>
          </div>

          <div className="flex flex-col gap-[18px]">
            {[videoGrid.slice(0, 4), videoGrid.slice(4)].map((row, rowIdx) => (
              <div key={rowIdx} className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
                {row.map((video, i) => (
                  <Link
                    key={stableItemKey(video, `video-${rowIdx}-${i}`)}
                    href={`/replay/${video.slug || video.id}`}
                    className="block rounded-[10px] hover-lift-primary"
                  >
                  <article className="w-full">
                    <div className="relative h-[172px] overflow-hidden rounded-[10px]">
                      <SafeImage alt={video.title || "Video"} className="h-full w-full object-cover" src={video.logo_url || video.logo} width={306} height={172} />
                      <img src={rowIdx === 1 && i === row.length - 1 ? assets.playSmAlt : assets.playSm} alt="" className="absolute left-[13px] top-[17px] h-[34px] w-[34px]" />
                    </div>
                    <div className="mt-2 px-2 pb-5">
                      <h4 className="text-[16px] leading-[24px] text-[var(--fig-text-primary)]">
                        {video.title || "Video"}
                      </h4>
                      <div className="mt-[10px] flex items-center gap-[10px]">
                        <CardMeta date={video.date} />
                       
                      </div>
                    </div>
                  </article>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
      <SectionTitle>{labels.shorts}</SectionTitle>

        <div className="mt-[25px] pt-5 flex gap-[25px] overflow-x-auto no-scrollbar pb-2">
          {shortsPool.slice(0, 10).map((video, i) => (
            <Link
              key={stableItemKey(video, `short-${i}`)}
              href={`/replay/${video.slug || video.id}`}
              className="block rounded-[10px] hover-lift-primary"
            >
            <article className="relative h-[370px] w-[282px] shrink-0 overflow-hidden rounded-[10px]">
              <SafeImage alt={video.title || "Short reel"} className="h-full w-full object-cover" src={video.logo_url || video.logo} width={282} height={370} />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90" />
              <div className="absolute left-[5px] top-[16px]">
                <img src={assets.playShort} alt="" className="h-[44px] w-[44px]" />
              </div>
              <div className="absolute bottom-4 left-[9px] right-[9px]">
                <p className="text-[16px] leading-[24px] text-white">
                  {video.title || "Short"}
                </p>
                <div className="mt-[10px] flex items-center gap-[10px] text-[12px] leading-[18px] text-[#a4a4a4]">
                  <span>{video.date ? formatDate(video.date) : nowLabel}</span>
                  <span className="inline-block h-[4px] w-[4px] rounded-full bg-[#a4a4a4]" />
                  <span>{formatDisplayTime(video.date, video.time)}</span>
                </div>
              </div>
            </article>
            </Link>
          ))}
        </div>
        <div className="mt-3 flex justify-center">
          <div className="h-px w-24 bg-[repeating-linear-gradient(to_right,var(--fig-border-soft),var(--fig-border-soft)_10px,transparent_10px,transparent_16px)] opacity-80" />
        </div>
      </section>
    </div>
  );
}
