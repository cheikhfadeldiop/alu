import * as React from "react";

import { FlagStripe } from "./FlagStripe";
import { Header } from "./Header";
import { MainBackground } from "./MainBackground";
import { Footer } from "./Footer";

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <MainBackground>{children}</MainBackground>
      <Footer />
    </div>
  );
}

