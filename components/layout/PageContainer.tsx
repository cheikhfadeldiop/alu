import * as React from "react";

/**
 * Contenu centré, max-width 1440px, padding horizontal constant :
 * 24px (mobile), 32px (tablet), 40px (desktop).
 */
export function PageContainer({ children }: { children: React.ReactNode }) {
  return (

    <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-10">

      {children}
    </div>
  );
}

