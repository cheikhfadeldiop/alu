"use client";

import { AdBannerH } from "../ui/AdBanner";
import { AdBanV } from "../ui/AdBannerV";

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

const smallCards = new Array(8).fill(null).map((_, i) => ({
  id: i + 1,
  title: "Sabon Shugaban Karamar Hukumar Kebbe Alh. Musa Garba Kuci Ya Lashe",
  image: i % 2 === 0 ? assets.heroLeft : assets.heroCenter,
}));

const videoCards = [
  "https://www.figma.com/api/mcp/asset/fbe73563-fd7d-405c-91cc-6a133b74d7a3",
  "https://www.figma.com/api/mcp/asset/9a8259e4-3212-4b1d-a5d8-b0da398e7904",
  "https://www.figma.com/api/mcp/asset/a6f31c88-1d6a-45ba-8d23-c2da07acecaa",
  "https://www.figma.com/api/mcp/asset/88c4905a-41ad-4303-9dc2-e639cdfd399a",
  "https://www.figma.com/api/mcp/asset/ddc745b2-15ae-4769-81a1-90efe0533621",
  "https://www.figma.com/api/mcp/asset/33481889-d364-4e39-b563-d827d1f7434f",
  "https://www.figma.com/api/mcp/asset/6775dd9d-ef76-4fec-ab6a-00c2527029fb",
];

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="fig-h9 mb-4 border-b pb-3 font-medium uppercase tracking-wide text-[var(--fig-text-primary)] [border-color:var(--primary)]">
      {children}
    </h2>
  );
}

function CardMeta({ small = false }: { small?: boolean }) {
  return (
    <p className={`${small ? "fig-b4" : "fig-b3"} mt-2 text-[var(--fig-text-secondary)]`}>
      15 juin 2024 <span className="mx-1">•</span> 15:47
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

export function FigmaHomePage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-12 bg-[var(--fig-bg)] px-4 py-8 text-[var(--fig-text-primary)] xl:px-0">
      <AdBannerH className="mx-auto max-w-[1280px]" />

      <section className="grid gap-[15px] lg:grid-cols-[369px_515px_366px]">
        <article className="space-y-2">
          <img alt="Article principal" className="h-[321px] w-full rounded-[10px] object-cover" src={assets.heroLeft} />
          <div className="h-[161px]">
            <h3 className="text-[20px] font-medium leading-[30px]">
              Sabon Shugaban Karamar Hukumar Kebbe Alh. Musa Garba Kuci Ya Lashe Takobin Kawo Karshen Matsalar
            </h3>
            <div className="mt-2 flex items-center justify-between">
              <CardMeta />
              <CategoryTag label="Religion" color="var(--fig-tag-religion)" />
            </div>
          </div>
        </article>

        <article className="relative">
  <img
    alt="Article central"
    className="h-[490px] w-full rounded-[10px] object-cover"
    src={assets.heroCenter}
  />

  {/* Gradient */}
  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%] rounded-b-[10px] bg-gradient-to-t from-black/70 to-transparent" />

  {/* Content */}
  <div className="absolute bottom-0 z-10 flex w-full flex-col gap-2 p-4">
    <h3 className="fig-h9 uppercase text-white">
      Sabon Shugaban Karamar Hukumar Kebbe Alh. <br />
      Musa Garba Kuci Ya Lashe
    </h3>

    <div className="flex items-center gap-2 text-sm text-gray-300 justify-between">
      <div>
      <span>15 juin 2024</span>
      <Dot />
      <span>15:47</span>
      </div>
      <div>
      <span
      className="inline-flex h-[15px] items-center justify-center text-white rounded-full border border-[var(--fig-tag-religion)] px-[8px] text-[8px] leading-[12px] text-[var(--fig-text-secondary)]"
      
    >Economy</span>
      </div>
    </div>
  </div>
</article>

        <div className="h-[490px]   rounded-[10px]  ">
          {new Array(4).fill(null).map((_, i) => (
            <article key={i} className=" h-[122px] flex pb-3 justify-between  ">
              <div className="flex flex-col bg-surface p-2 rounded-md justify-between">
              <h4 className="text-[16px] font-medium leading-[24px]">
                Sabon Shugaban Karamar Hukumar Kebbe Alh. Musa Garba Kuci Ya Lashe Takobin
              </h4>
              <div className="mt-1 flex items-center  justify-between">
                <CardMeta small />
                <CategoryTag label={i % 2 === 0 ? "Sport" : "Religion"} color={i % 2 === 0 ? "var(--fig-tag-sport)" : "var(--fig-tag-religion)"} />
              </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className=" pt-10 grid gap-[22px] lg:grid-cols-[789px_469px] ">
          <div className="flex flex-col">
          <SectionTitle>Most Popular</SectionTitle>
          <div className="grid gap-[19px] md:grid-cols-2">
            {[0, 1].map((col) => (
              <div key={col} className="space-y-[17px]">
                <article>
                  <img
                    alt="Grande actualite"
                    className="h-[235px] w-full rounded-[10px] object-cover"
                    src={col === 0 ? assets.heroLeft : assets.heroCenter}
                  />
                  <div className="px-5 pt-[13px]">
                    <h4 className="text-[20px] font-medium leading-[30px]">
                      Sabon Shugaban Karamar Hukumar Kebbe Alh. Musa Garba Kuci Ya Lashe Takobin
                    </h4>
                    <div className="mt-1 flex items-center justify-between">
                      <CardMeta />
                      <CategoryTag label="Religion" color="var(--fig-tag-religion)" />
                    </div>
                  </div>
                </article>

                {smallCards.slice(col * 4, col * 4 + 3).map((card) => (
                  <article key={`${col}-${card.id}`} className="h-[120px] rounded-[10px] gap-2  bg-surface px-[5px] py-[6.5px]">
                    <div className="flex gap-2">
                      <img alt="Miniature article" className="h-[107px] w-[103px] rounded-[10px] object-cover" src={card.image} />
                      <div className="pt-2 flex flex-col justify-between">
                        <h4 className="text-[13px] font-medium leading-[20px]">{card.title}</h4>
                        <div className="mt-1 flex items-center justify-between ">
                          <CardMeta small />
                          <CategoryTag label={card.id % 2 === 0 ? "Sport" : "Actualité"} color={card.id % 2 === 0 ? "var(--fig-tag-sport)" : "var(--fig-tag-news)"} />
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ))}
          </div>
          </div>
          <AdBanV className="h-full" />
        </div>
      </section>

      <section >
        <SectionTitle>Most Popular</SectionTitle>
        <div className="grid gap-[15px] sm:grid-cols-2 lg:grid-cols-4 pt-6 pb-10 ">
          {[assets.popular1, assets.popular2, assets.popular3, assets.popular4].map((src, i) => (
            <article key={i}>
              <img alt="Article populaire" className="h-[179px] w-full rounded-[10px] object-cover" src={src} />
              <h4 className="mt-2 fig-h11 font-medium leading-[18px]">
                Sabon Shugaban Karamar Hukumar Kebbe Alh. Musa Garba Kuci Ya
              </h4>
              <div className="mt-1 flex items-center justify-between">
                <CardMeta small />
                <CategoryTag label={i % 2 === 0 ? "Sport" : "Religion"} color={i % 2 === 0 ? "var(--fig-tag-sport)" : "var(--fig-tag-religion)"} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <AdBannerH className="mx-auto max-w-[1280px] pb-6" />

      <section>
      <SectionTitle>Video</SectionTitle>
      <div className="mt-10 flex flex-col gap-[45px]">
          <div className="flex flex-wrap gap-[25px] xl:flex-nowrap">
            <article className="relative h-[419px] w-full overflow-hidden rounded-[10px] xl:w-[730px]">
              <img alt="Video en vedette" className="h-full w-full object-cover" src={assets.featuredVideo} />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
              <div className="absolute bottom-[18px] left-[24px] right-[24px] flex gap-[10px]">
                <img src={assets.playLg} alt="" className="h-[55px] w-[55px] shrink-0" />
                <div className="flex flex-col justify-center">
                  <h3 className="fig-h9 uppercase text-[var(--primary-text-light)]">
                    Sabon Shugaban Karamar Hukumar Kebbe Alh. <br />
                    Musa Garba Kuci Ya Lashe
                  </h3>
                  <div className="mt-[10px] flex items-center gap-[10px] text-[16px] text-[#bbb]">
                    <span>15 juin 2024</span>
                    <Dot />
                    <span>15:47</span>
                  </div>
                </div>
              </div>
            </article>

            <article className="w-full xl:w-[526px]">
              <img alt="Video secondaire" className="h-[278px] w-full rounded-[10px] object-cover xl:w-[524px]" src={assets.secondVideo} />
              <div className="mt-[10px] flex gap-[10px]">
                <img src={assets.playMd} alt="" className="h-[55px] w-[55px] shrink-0" />
                <div>
                  <h3 className="fig-h10 text-[var(--fig-text-primary)]">
                    Sabon Shugaban Karamar Hukumar Kebbe Alh. Musa Garba Kuci Ya Lashe
                  </h3>
                  <div className="mt-[10px] flex items-center gap-[10px] text-[16px] text-[var(--fig-text-secondary)]">
                    <span>15 juin 2024</span>
                    <Dot />
                    <span>15:47</span>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div className="flex flex-col gap-[18px]">
            {[videoCards.slice(0, 4), videoCards.slice(4)].map((row, rowIdx) => (
              <div key={rowIdx} className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
                {row.map((src, i) => (
                  <article key={`${rowIdx}-${i}`} className="w-full">
                    <div className="relative h-[172px] overflow-hidden rounded-[10px]">
                      <img alt="Video" className="h-full w-full object-cover" src={src} />
                      <img src={rowIdx === 1 && i === row.length - 1 ? assets.playSmAlt : assets.playSm} alt="" className="absolute left-[13px] top-[17px] h-[34px] w-[34px]" />
                    </div>
                    <div className="mt-2">
                      <h4 className="text-[16px] leading-[24px] text-[var(--fig-text-primary)]">
                        Sabon Shugaban Karamar Hukumar Kebbe Alh. Musa Garba Kuci Ya
                      </h4>
                      <div className="mt-[10px] flex items-center gap-[10px]">
                        <CardMeta />
                       
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
      <SectionTitle>Shorts videos reels</SectionTitle>

        <div className="mt-[25px] flex gap-[25px] overflow-x-auto pb-2">
          {[assets.short1, assets.short2, assets.short3, assets.short4, assets.short5].map((src, i) => (
            <article key={i} className="relative h-[370px] w-[282px] shrink-0 overflow-hidden rounded-[10px]">
              <img alt="Short reel" className="h-full w-full object-cover" src={src} />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90" />
              <div className="absolute left-[5px] top-[16px]">
                <img src={assets.playShort} alt="" className="h-[44px] w-[44px]" />
              </div>
              <div className="absolute bottom-4 left-[9px] right-[9px]">
                <p className="text-[16px] leading-[24px] text-white">
                  Sabon Shugaban Karamar Hukumar Kebbe Alh. Musa Garba Kuci Ya Lashe
                </p>
                <div className="mt-[10px] flex items-center gap-[10px] text-[12px] leading-[18px] text-[#a4a4a4]">
                  <span>15 juin 2024</span>
                  <span className="inline-block h-[4px] w-[4px] rounded-full bg-[#a4a4a4]" />
                  <span>15:47</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
