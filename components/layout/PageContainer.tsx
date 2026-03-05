import * as React from "react";

/**
 * Contenu centré, max-width 1440px, padding horizontal constant :
 * 24px (mobile), 32px (tablet), 40px (desktop).
 */
export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1465px] px-4 sm:px-6 lg:px-8 py-8 md:py-16">
      {children}
    </div>
  );
}

