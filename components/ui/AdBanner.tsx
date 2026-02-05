import * as React from "react";

/**
 * Bannière pub placeholder : dimension 1460 × 370.
 * Texte "Mettez vos annonces ici !" + "Dimension 1460 X 370".
 */
export function AdBanner({ className }: { className?: string }) {
  return (
    <section
      className={
        "overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] " +
        (className ?? "")
      }
    >
      <div className="relative aspect-[1460/370] w-full min-h-[140px] bg-[color:var(--surface-2)]">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-4 text-center">
          <span className="text-xs font-semibold tracking-widest text-[color:var(--muted)]">
            Dimension 1460 × 370
          </span>
          <span className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Mettez vos annonces ici !
          </span>
        </div>
      </div>
    </section>
  );
}
