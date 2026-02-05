import * as React from "react";

/**
 * Bande drapeau (signature visuelle) : Vert / Rouge / Jaune
 * séparés par diagonales obliques. 2–3 % hauteur viewport, 100 % largeur.
 */
export function FlagStripe() {
  return (
    <div
      aria-hidden
      className="w-full"
      style={{
        height: "clamp(6px, 0.5vh, 24px)",
        background:
          "linear-gradient(115deg, var(--flag-green) 0% 33.333%, var(--flag-red) 33.333% 66.666%, var(--flag-yellow) 66.666% 100%)",
      }}
    />
  );
}

