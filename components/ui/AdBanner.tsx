import { SafeImage } from "./SafeImage";

export function AdBanner({ className }: { className?: string }) {
  return (
    <section className={" pb-l md:pb-2xl overflow-hidden rounded-sm " + (className ?? "")}>
      <div className="relative aspect-[1460/370] w-full min-h-[140px] ">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <SafeImage src="/assets/banner/ban1.png" alt="Pub" width={1460} height={370} />
        </div>
      </div>
    </section>
  );
}

export function AdBannerH({ className }: { className?: string }) {
  return (
    <section className={"overflow-hidden rounded-sm " + (className ?? "")}>
      <div className="relative aspect-[1280/247] w-full ">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <SafeImage src="/assets/banner/banH.png" alt="Pub" width={1460} height={370} />
        </div>
      </div>
    </section>
  );
}
export function AdBannerHD({ className }: { className?: string }) {
  return (
    <section className={"overflow-hidden rounded-sm " + (className ?? "")}>
      <div className="relative aspect-[1280/247] w-full ">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <SafeImage src="/assets/banner/banHD.png" alt="Pub" width={1460} height={370} />
        </div>
      </div>
    </section>
  );
}