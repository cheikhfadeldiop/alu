"use client";

import * as React from "react";

import { usePathname } from "../../i18n/navigation";
import { PageContainer } from "./PageContainer";

export function MainBackground({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative w-full max-w-[1728px] mx-auto flex-1 bg-background overflow-x-hidden">
      {/* Decorative pattern (rolled stripe) — in layout background only */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0
          "
        style={{
          //  backgroundImage: "url('/assets/flags/b0.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "top center",
          backgroundSize: "100% auto",
          filter: "var(--pattern-invert) grayscale(1)",
        }}
      />

      <main className="relative z-10  pb-3xl ">
        <PageContainer>{children}</PageContainer>
      </main>
    </div>
  );
}
