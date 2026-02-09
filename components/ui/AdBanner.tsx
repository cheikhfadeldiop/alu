import Image from "next/image";

/**
 * Bannière pub placeholder : dimension 1460 × 370.
 * Texte "Mettez vos annonces ici !" + "Dimension 1460 X 370".
 */
export function AdBanner({ className }: { className?: string }) {
  return (
    <section
      className={
        " pt-10 pb-16 overflow-hidden rounded-2xl " +
        (className ?? "")
      }
    >
      <div className="relative aspect-[1460/370] w-full min-h-[140px] ">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Image src="/assets/banner/ban1.png" alt="Pub" width={1460} height={370} />
        </div>
      </div>
    </section>
  );
}
