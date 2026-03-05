import { SafeImage } from "./SafeImage";

export function AdBannerV({ className }: { className?: string }) {
  return (
    <section className={" pb-5 overflow-hidden " + (className ?? "")}>
      <div className="relative w-full max-w-[434px] mx-auto">
        <SafeImage
          src="/assets/banner/banv.png"
          alt="Pub"
          width={434}
          height={898}
          className="w-full h-auto object-contain"
          priority
        />
      </div>
    </section>
  );
}


export function AdBannerV2({ className }: { className?: string }) {
  return (
    <section className={" pb-5 overflow-hidden " + (className ?? "")}>
      <div className="relative w-full max-w-[578px] mx-auto">
        <SafeImage
          src="/assets/banner/bannerV2.png"
          alt="Pub"
          width={578}
          height={1137}
          className="w-full h-auto object-contain"
          priority
        />
      </div>
    </section>
  );
}
