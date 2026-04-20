/**
 * Utility functions for text processing
 */

import { SITE_CONFIG } from "@/constants/site-config";

/**
 * Decodes HTML entities like &eacute; into their character equivalent
 * This is useful for WordPress metadata which often contains encoded entities
 */
export function decodeHtmlEntities(text: string): string {
    if (!text) return '';

    const entities: { [key: string]: string } = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&rsquo;': "'",
        '&lsquo;': "'",
        '&ldquo;': '"',
        '&rdquo;': '"',
        '&eacute;': 'é',
        '&Eacute;': 'É',
        '&agrave;': 'à',
        '&Agrave;': 'À',
        '&acirc;': 'â',
        '&Acirc;': 'Â',
        '&icirc;': 'î',
        '&Icirc;': 'Î',
        '&ocirc;': 'ô',
        '&Ocirc;': 'Ô',
        '&ucirc;': 'û',
        '&Ucirc;': 'Û',
        '&ecirc;': 'ê',
        '&Ecirc;': 'Ê',
        '&egrave;': 'è',
        '&Egrave;': 'È',
        '&euml;': 'ë',
        '&Euml;': 'Ë',
        '&iuml;': 'ï',
        '&Iuml;': 'Ï',
        '&ccedil;': 'ç',
        '&Ccedil;': 'Ç',
        '&ndash;': '–',
        '&mdash;': '—',
        '&nbsp;': ' ',
        '<p>': '',
        '</p>': '',
    };

    return text.replace(/&[a-z0-9#]+;/g, (match) => entities[match] || match).replace(/<[^>]*>/g, '');
}

/**
 * Extracts a display label (category or author) from a WordPress post
 * Preferring the category name from embedded terms
 */
export function getPostAuthor(post: any): string {
    if (!post) return '';

    // 1. Try to get category name from WordPress embedded terms
    const terms = post._embedded?.['wp:term'];
    if (Array.isArray(terms)) {
        // Collect all available categories
        const categories: any[] = [];
        for (const group of terms) {
            if (Array.isArray(group)) {
                for (const term of group) {
                    if (term && term.name && term.taxonomy === 'category') {
                        categories.push(term);
                    }
                }
            }
        }

        if (categories.length > 0) {
            // Find common "Top Level" or "Meta" category to de-prioritize
            // We use the ID from config
            // Calculate "apparent depth" for each category to pick the most specific one
            const scoredCategories = categories.map(cat => {
                let depth = 0;
                let current = cat;
                
                // Trace up the hierarchy if possible within the embedded terms
                const visited = new Set();
                while (current && current.parent !== 0 && !visited.has(current.id)) {
                    visited.add(current.id);
                    depth++;
                    const parent = categories.find(c => c.id === current.parent);
                    if (parent) {
                        current = parent;
                    } else {
                        // Parent is outside the embedded set, but we know it's deeper than root
                        break;
                    }
                }
                
                // Penalty for being the "Main/Alaune" category if others exist
                let score = depth * 10;
                const lowPrioritySlugs = ['a-la-une', 'featured', 'une', 'general', 'uncategorized'];
                const isLowPriority = lowPrioritySlugs.some(s => cat.slug?.toLowerCase().includes(s)) || cat.name?.toLowerCase().includes('une');
                
                if (isLowPriority) {
                    score -= 5;
                }

                return { name: cat.name, score };
            });

            // Sort by score descending (highest depth/relevance first)
            scoredCategories.sort((a, b) => b.score - a.score);
            return scoredCategories[0].name;
        }

        // Fallback to tags or any other term if no categories
        for (const group of terms) {
            if (Array.isArray(group)) {
                for (const term of group) {
                    if (term && term.name) return term.name;
                }
            }
        }
    }

    // 2. Try to get category name from common custom fields
    if (post.category && typeof post.category === 'string') return post.category;
    if (post.category_name) return post.category_name;

    // 3. Try to get channel name for VOD items/Replays
    if (post.chaine_name) return post.chaine_name;
    if (post.channel_name) return post.channel_name;

    // 4. Final fallback
    return "";
}

/**
 * Extracts a display category from an EPG program
 */
export function getProgramCategory(program: any): string | null {
    if (!program) return null;
    return program.categoryName || program.subcategoryName || null;
}

/**
 * Parses a date input into a Date object securely.
 * Handles DD/MM/YYYY and other common formats.
 */
export function parseToDate(dateInput: string | number | Date | null | undefined): Date | null {
    if (!dateInput) return null;

    if (dateInput instanceof Date) return dateInput;
    if (typeof dateInput === 'number') return new Date(dateInput);

    try {
        const value = String(dateInput).trim();
        // Check for DD/MM/YYYY format specifically
        const dmYMatch = value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
        if (dmYMatch) {
            const [, day, month, year] = dmYMatch;
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }

        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
    } catch (e) {
        return null;
    }
}

/**
 * Formats a date string into a robust "12 février 2026" format.
 * Handles ISO strings, timestamps, and various other string formats securely.
 * @param dateInput - The date to format (string, number or Date object)
 * @param locale - The locale to use (defaults to 'fr-FR')
 */
export function formatDate(dateInput: string | number | Date | null | undefined, locale: string = 'fr-FR'): string {
    if (!dateInput) return "";

    try {
        let date: Date | null = parseToDate(dateInput);

        if (!date || isNaN(date.getTime())) return String(dateInput);

        return date.toLocaleDateString(locale, {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    } catch (e) {
        console.error("formatDate error:", e);
        return String(dateInput);
    }
}
