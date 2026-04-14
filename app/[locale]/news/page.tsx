import { Suspense } from "react";
import { NewsPageClient } from "../../../components/news/NewsPageClient";
import { NewsHeroShimmer } from "@/components/ui/shimmer/NewsShimmers";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Actualités - CRTV",
  description: "Suivez toute l'actualité du Cameroun et du monde sur CRTV Web",
};

export default function NewsPage() {
  return (
    <Suspense fallback={<NewsHeroShimmer />}>
      <NewsPageClient />
    </Suspense>
  );
}
