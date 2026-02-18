"use client";

import * as React from "react";
import { WordPressPost } from "../../types/api";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AdBanner } from "../ui/AdBanner";
import { decodeHtmlEntities } from "../../utils/text";

interface CorporateNewsDetailProps {
    article: WordPressPost;
    relatedPosts: WordPressPost[];
    onBack: () => void;
}

export function CorporateNewsDetail({ article, relatedPosts, onBack }: CorporateNewsDetailProps) {
    const t = useTranslations("common");

    // Function to format content, highlight words, and split long paragraphs
    const formatContent = (html: string) => {
        let processed = html;

        // 1. Highlight keywords
        const keywords = [
            "CRTV", "Nomination", "Directeurs?", "Régionaux", "Communiqué",
            "Décision", "Décret", "Paul Biya", "Président", "République",
            "Cameroun", "Gouvernement", "Ministre", "Sécurité", "Urgent", "fort"
        ];
        keywords.forEach(word => {
            const regex = new RegExp(`(${word})`, "gi");
            processed = processed.replace(regex, '<span class="text-[color:var(--accent)] font-bold">$1</span>');
        });

        // 2. Sentence splitting: Insert a break after every 3 sentences in long text blocks 
        // to avoid dense "walls of text" as requested.
        let sentenceCount = 0;
        processed = processed.replace(/(\.\s+)([A-Z])/g, (match, p1, p2) => {
            sentenceCount++;
            if (sentenceCount % 3 === 0) {
                return `${p1}<br/><br/>${p2}`;
            }
            return match;
        });

        return processed;
    };

    // Extract citations (blockquotes) if they exist
    const extractCitation = (html: string) => {
        const match = html.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
        if (match) {
            return {
                citation: match[1],
                cleanHtml: html.replace(match[0], '')
            };
        }
        return { citation: null, cleanHtml: html };
    };

    const { citation, cleanHtml } = extractCitation(article.content.rendered);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Ad Banner - Top */}
            <div className="w-full">
                <AdBanner />
            </div>

            {/* Back Button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[color:var(--accent)] hover:opacity-70 transition-opacity"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Retour
            </button>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Main Content - 70% */}
                <div className="lg:w-[70%] space-y-8">
                    <div className="space-y-6">
                        {/* Title */}
                        <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight text-foreground">
                            {decodeHtmlEntities(article.title.rendered)}
                        </h1>

                        {/* Content */}
                        <div
                            className="prose prose-lg dark:prose-invert max-w-none 
                            pl-10
                            prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-10
                            prose-a:text-[color:var(--accent)] prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                            [&_strong]:text-[color:var(--accent)] [&_strong]:font-bold
                            [&_b]:text-[color:var(--accent)] [&_b]:font-bold
                            [&_img]:my-12 [&_img]:rounded-2xl [&_img]:shadow-lg
                            [&_figure]:my-12
                            [&_blockquote]:border-l-yellow-400 [&_blockquote]:italic [&_blockquote]:pl-6 [&_blockquote]:my-8
                            [&_cite]:text-[color:var(--accent)] [&_cite]:font-bold [&_cite]:not-italic
                            "
                        >
                            <div dangerouslySetInnerHTML={{ __html: formatContent(cleanHtml) }} />

                            {citation && (
                                <div className="my-12 border-2 border-yellow-400 p-12 md:p-16 relative bg-yellow-400/5 rounded-sm">
                                    <div className="absolute -top-4 -left-4 text-4xl text-yellow-500 font-serif opacity-50">"</div>
                                    <div
                                        className="text-base md:text-[17px] italic text-center text-foreground leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: formatContent(citation.replace(/<p[^>]*>/i, '').replace(/<\/p>/i, '')) }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar - 30% */}
                <div className="lg:w-[30%] space-y-8">
                    <div className="space-y-6">
                        {relatedPosts.slice(0, 5).map((post) => (
                            <Link
                                key={post.id}
                                href={`/corporate?id=${post.id}`}
                                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                                className={`block p-6 rounded-2xl border transition-all duration-300 group
                                ${post.id === article.id
                                        ? "border-[color:var(--accent)] bg-[color:var(--accent)]/5"
                                        : "border-muted/20 hover:border-[color:var(--accent)]/30 hover:bg-muted/5"}
                                `}
                            >
                                <div className="text-[color:var(--accent)] text-[10px] font-black uppercase tracking-widest mb-2">
                                    {t("pressRelease")}
                                </div>
                                <h4 className="text-sm font-bold leading-snug mb-3 group-hover:text-[color:var(--accent)] transition-colors line-clamp-2">
                                    {decodeHtmlEntities(post.title.rendered)}
                                </h4>
                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                                    <span>{t("readRelease")}</span>
                                    <span className="text-[color:var(--accent)]">→</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
