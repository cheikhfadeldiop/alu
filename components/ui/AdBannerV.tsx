import { SafeImage } from "./SafeImage";

export function AdBannerV({ className }: { className?: string }) {
  return (
    <section className={" pb-5 overflow-hidden " + (className ?? "")}>
      <div className="relative w-full max-w-[370px] mx-auto">
        <SafeImage
          src="/assets/banner/banv.png"
          alt="Pub"
          width={370}
          height={898}
          className="w-full h-auto object-contain"
          priority
        />
      </div>
    </section>
  );
}
