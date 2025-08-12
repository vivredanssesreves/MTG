/**
 * Chunk Processing Utilities
 * 
 * Functions exported:
 * - importChunkForSet(setCode: string, cards: array) 
 *     -> {success: boolean, imported: number, errors: array} 
 *     - Import chunk for specific set
 * 
 * - processChunkBySets(cards: array) 
 *     -> Promise<array> 
 *     - Process chunk by grouping cards by set
 * 
 * - createChunks(array: array, size: number = 250) 
 *     -> array 
 *     - Split array into chunks of specified size
 */

import fs from 'fs';
import readline from 'readline';

const pathMyBdd = `../MYBDD/json/`; // My personal cards
const CHUNK_SIZE = 250; // Chunk size for import

/**
 * Import a chunk of cards for a specific set
 * @param {string} setCode - Set code
 * @param {array} cards - Cards to import
 * @returns {object} - {success: boolean, imported: number, errors: array}
 */
export function importChunkForSet(setCode, cards) {
    const pathMyCards = `${pathMyBdd}${setCode}.json`;

    // Load existing data
    let mySetData = { cards: [] };
    if (fs.existsSync(pathMyCards)) {
        try {
            mySetData = JSON.parse(fs.readFileSync(pathMyCards, 'utf-8'));
        } catch (error) {
            return {
                success: false,
                imported: 0,
                errors: [`Error reading file ${setCode}: ${error.message}`]
            };
        }
    }

    let imported = 0;
    const errors = [];

    // Process each card in the chunk
    cards.forEach(card => {
        if (card.set !== setCode) return; // Skip if not the right set

        // Look for existing card
        const existingIndex = mySetData.cards.findIndex(c => c.number === card.number);

        if (existingIndex >= 0) {
            // Update existing card
            mySetData.cards[existingIndex].no_foil = card.no_foil;
            mySetData.cards[existingIndex].foil = card.foil;
        } else {
            // Add new card
            mySetData.cards.push({
                number: card.number,
                no_foil: card.no_foil,
                foil: card.foil
            });
        }
        imported++;
    });

    // Save the file
    try {
        fs.writeFileSync(pathMyCards, JSON.stringify(mySetData, null, 2));
    } catch (error) {
        return {
            success: false,
            imported: 0,
            errors: [`Error writing file ${setCode}: ${error.message}`]
        };
    }

    return {
        success: true,
        imported,
        errors
    };
}

/**
 * Process a chunk of cards by grouping them by set
 * @param {array} cards - Cards to process
 * @returns {Promise} - Promise that resolves when the chunk is processed
 */
export async function processChunkBySets(cards) {
    // Group cards by set
    const cardsBySet = {};
    cards.forEach(card => {
        if (!cardsBySet[card.set]) {
            cardsBySet[card.set] = [];
        }
        cardsBySet[card.set].push(card);
    });

    // Process each set
    const promises = Object.entries(cardsBySet).map(([setCode, setCards]) => {
        return new Promise((resolve, reject) => {
            const result = importChunkForSet(setCode, setCards);
            if (result.success) {
                resolve({ setCode, imported: result.imported });
            } else {
                reject(new Error(`Set ${setCode}: ${result.errors.join(', ')}`));
            }
        });
    });

    return Promise.all(promises);
}

/**
 * Split an array into chunks
 * @param {array} array - Array to split
 * @param {number} size - Size of each chunk
 * @returns {array} - Array of chunks
 */
export function createChunks(array, size = CHUNK_SIZE) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}