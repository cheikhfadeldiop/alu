"use client";

import * as React from "react";

import { usePathname } from "../../i18n/navigation";
import { PageContainer } from "./PageContainer";

export function MainBackground({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMediaDarkRoute =
    pathname.includes("/live") ||
    pathname.includes("/replay") ||
    pathname.includes("/radio") ||
    pathname.includes("/playback");

  return (
    <div
      className={`relative mx-auto flex-1 overflow-x-hidden ${
        isMediaDarkRoute
          ? "min-h-screen w-full max-w-none bg-[#171717] text-[#E8E8E8]"
          : "w-full max-w-[1728px] bg-background"
      }`}
    >
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

      <main className={`relative z-10 pb-3xl ${isMediaDarkRoute ? "bg-[#171717]" : ""}`}>
        <PageContainer>{children}</PageContainer>
      </main>
    </div>
  );
}
