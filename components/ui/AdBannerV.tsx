import Image from "next/image";

/**
 * Bannière pub placeholder : dimension 1460 × 370.
 * Texte "Mettez vos annonces ici !" + "Dimension 1460 X 370".
 */
export function AdBannerV({ className }: { className?: string }) {
  return (
    <section
      className={
        " pb-5 overflow-hidden  " +
        (className ?? "")
      }
    >
      <div className="relative w-full max-w-[370px] mx-auto">
        <Image
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
