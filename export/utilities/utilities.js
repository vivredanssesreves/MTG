
/**
 * General Utilities
 * 
 * Functions exported:
 * - normalizeBooleanValue(value: any) 
 *     -> boolean 
 *     - Normalize any value to boolean, throws error for invalid values
 * 
 * - validateCard(card: object) 
 *     -> {valid: boolean, error: string|null, data: object} 
 *     - Validate and normalize card data
 */

/**
 * Normalize a value to boolean
 * @param {any} value - Value to normalize
 * @returns {boolean} - Normalized boolean value
 */
export function normalizeBooleanValue(value) {
    // if true with string or number 
    if (value === 'true' || value === true || value === '1') {
        return true;
    }
    // if false with string or number
    else if (value === 'false' || value === false || value === '0') {
        return false;
    }
    // if true with number > 0
    else if (!isNaN(value) && parseInt(value) > 0) {
        return true; // If it's a number > 0, consider as true
    }
    // if any other weird value
    else {
        throw new Error(`Invalid value for foil or no foil`);
    }
}

/**
 * Validate and normalize card data
 * @param {object} card - Card object with {set, number, no_foil, foil}
 * @returns {object} - {valid: boolean, error: string|null, data: object}
 */
export function validateCard(card) {
    if (!card.set || card.set.trim() === '') {
        return { valid: false, error: 'Missing or empty set', data: null };
    }

    if (!card.number || card.number.trim() === '') {
        return { valid: false, error: 'Missing or empty card number', data: null };
    }

    // Normalize no_foil and foil 
    try {
        const normalizedNoFoil = normalizeBooleanValue(card.no_foil);
        const normalizedFoil = normalizeBooleanValue(card.foil);

        return {
            valid: true,
            error: null,
            data: {
                set: card.set.trim(),
                number: card.number.trim(),
                no_foil: normalizedNoFoil,
                foil: normalizedFoil
            }
        };
    } catch (error) {
        throw new Error(error.message);
    }
}