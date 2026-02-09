/**
 * Utility functions for text processing
 */

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
    };

    return text.replace(/&[a-z0-9#]+;/g, (match) => entities[match] || match);
}
