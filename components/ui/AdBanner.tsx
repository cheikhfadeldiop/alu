import { SafeImage } from "./SafeImage";

export function AdBanner({ className }: { className?: string }) {
  return (
    <section className={" pb-4 md:pb-6 overflow-hidden rounded-sm " + (className ?? "")}>
      <div className="relative aspect-[1460/370] w-full min-h-[140px] ">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <SafeImage src="/assets/banner/ban1.png" alt="Pub" width={1460} height={370} />
        </div>
      </div>
    </section>
  );
}
