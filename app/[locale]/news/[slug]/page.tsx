import { Metadata } from "next";
import { NewsDetailPageClient } from "@/components/news/NewsDetailPageClient";
import { getWordPressPostBySlug, ensureAbsoluteUrl, getSiteAbsoluteUrl } from "@/services/api";
import { SITE_CONFIG } from "@/constants/site-config";
import { decodeHtmlEntities } from "@/utils/text";

interface NewsDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await getWordPressPostBySlug(slug);
    if (!post) throw new Error("Post not found");

    const title = decodeHtmlEntities(post.title?.rendered || "Actualités");
    const description = decodeHtmlEntities(post.excerpt?.rendered || post.content?.rendered || "")
      .substring(0, 160)
      .replace(/<[^>]*>/g, "");
    const rawImage = post.acan_image_url || post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "";
    const imageUrl = ensureAbsoluteUrl(rawImage).replace(/^http:\/\//i, "https://") || getSiteAbsoluteUrl(SITE_CONFIG.theme.placeholders.news);

    return {
      title: `${title} - ${SITE_CONFIG.name} News`,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: `Actualités - ${SITE_CONFIG.name}`,
    };
  }
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  return <NewsDetailPageClient slug={slug} />;
}
