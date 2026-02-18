import { Suspense } from "react";
import { NewsPageClient } from "../../../components/news/NewsPageClient";
import { NewsHeroShimmer } from "@/components/ui/shimmer/NewsShimmers";
import { Metadata } from "next";
import { getWordPressPostById, getSiteAbsoluteUrl, ensureAbsoluteUrl } from "@/services/api";
import { SITE_CONFIG } from "@/constants/site-config";
import { decodeHtmlEntities } from "@/utils/text";

interface NewsPageProps {
  searchParams: Promise<{ id?: string }>;
}

export async function generateMetadata({ searchParams }: NewsPageProps): Promise<Metadata> {
  const { id } = await searchParams;

  if (!id) {
    return {
      title: "Actualités - CRTV",
      description: "Suivez toute l'actualité du Cameroun et du monde sur CRTV Web",
    };
  }

  try {
    const post = await getWordPressPostById(id);
    if (!post) throw new Error("Post not found");

    const title = decodeHtmlEntities(post.title?.rendered || "Actualités");
    const description = decodeHtmlEntities(post.excerpt?.rendered || post.content?.rendered || "").substring(0, 160).replace(/<[^>]*>/g, '');
    const imageUrl = ensureAbsoluteUrl(post.acan_image_url) || getSiteAbsoluteUrl(SITE_CONFIG.theme.placeholders.news);

    return {
      title: `${title} - CRTV News`,
      description,
      openGraph: {
        title,
        description,
        images: [{
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title
        }],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      }
    };
  } catch (error) {
    return {
      title: "Actualités - CRTV",
    };
  }
}

export default function NewsPage() {
  return (
    <Suspense fallback={<NewsHeroShimmer />}>
      <NewsPageClient />
    </Suspense>
  );
}
