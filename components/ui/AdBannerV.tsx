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

export function AdBanV({ className }: { className?: string }) {
  return (
    <section className={"overflow-hidden rounded-sm " + (className ?? "")}>
      <div className="relative aspect-[578/1137]  w-full ">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <SafeImage src="/assets/banV.png" alt="Pub" width={578} height={1137} />
        </div>
      </div>
    </section>
  );
}

export function AdBanV2({ className }: { className?: string }) {
  return (
    <section className={"overflow-hidden rounded-sm " + (className ?? "")}>
      <div className="relative aspect-[465/824]  w-full ">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <SafeImage src="/assets/banner/banV2.png" alt="Pub" width={578} height={1137} />
        </div>
      </div>
    </section>
  );
}