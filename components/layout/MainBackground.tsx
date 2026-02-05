"use client";

import * as React from "react";

import { usePathname } from "../../i18n/navigation";
import { PageContainer } from "./PageContainer";

const PATTERN_ROUTES = ["/", "/radio", "/replay", "/news", "/live", "/contact"];

export function MainBackground({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showPattern = PATTERN_ROUTES.some((route) =>
    route === "/" ? pathname === "/" : pathname.startsWith(route),
  );

  return (
    <div className="relative w-full flex-1 bg-background">
      {/* Decorative pattern (rolled stripe) — in layout background only */}
      {showPattern ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            backgroundImage: "url('/assets/rouleau.png')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "top center",
            backgroundSize: "100% auto",
          }}
        />
      ) : null}

      <main className="relative z-10 py-10">
        <PageContainer>{children}</PageContainer>
      </main>
    </div>
  );
}
