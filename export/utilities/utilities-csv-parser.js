/**
 * CSV Parser Utilities
 * 
 * Functions:
 * - isHeaderLine(line: string) 
 *     -> boolean 
 *     - Check if CSV line is a header (exported)
 * - parseCSVLine(line: string, lineNumber: number) 
 *     -> {success: boolean, data: object|null, error: string|null} 
 *     - Parse a CSV line into card object (exported)
 */

/**
 * Check if a line is a header
 * @param {string} line - Line to check
 * @returns {boolean} - True if it's a header
 */
export function isHeaderLine(line) {
    if (!line || line.trim() === '') return false;

    const lowerLine = line.toLowerCase();
    const headerKeywords = ['set', 'number', 'no_foil', 'foil', 'carte', 'nom'];

    // If the line contains multiple header keywords, it's probably a header
    const foundKeywords = headerKeywords.filter(keyword => lowerLine.includes(keyword));
    return foundKeywords.length >= 2;
}

/**
 * Parse a CSV line and return a card object
 * @param {string} line - CSV line
 * @param {number} lineNumber - Line number (for errors)
 * @returns {object} - {success: boolean, data: object|null, error: string|null}
 */
export function parseCSVLine(line, lineNumber) {
    if (!line || line.trim() === '') {
        return {
            success: false,
            data: null,
            error: `Line ${lineNumber}: empty line`
        };
    }

    const parts = line.split(';').map(part => part.trim());

    if (parts.length !== 4) {
        return {
            success: false,
            data: null,
            error: `Line ${lineNumber}: invalid line format`
        };
    }

    const set = parts[0];
    const number = parts[1];
    const no_foil = parts[2];
    const foil = parts[3];

    return {
        success: true,
        data: { set, number, no_foil, foil },
        error: null
    };
}