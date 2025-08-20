/**
 * Pokemon TCG Card Import Utility
 * 
 * Functions:
 * - fetchPokemonCardsForLanguage(pokemonName: string, language: string)
 *     -> Promise<Array>
 *     - Fetch all cards for a Pokemon name in specific language from TCG API
 * 
 * - saveCardsToFile(pokemonName: string, cards: Array)
 *     -> void
 *     - Save cards array to JSON file with sorting by release date
 * 
 * - importPokemonCards(pokemonName: string)
 *     -> Promise<void>
 *     - Main import function, fetches and saves cards for given Pokemon
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const bddPath = '../../bdd/pokemon/';

// Create directory if it doesn't exist
if (!fs.existsSync(bddPath)) {
    fs.mkdirSync(bddPath, { recursive: true });
}

/**
 * Get all Pokemon cards for a given name in a specific language
 * @param {string} pokemonName - Pokemon name in the language (ex: "eevee", "évoli")
 * @param {string} language - Language code (ex: "en", "fr")
 * @returns {Promise<Array>} - Cards list
 */
export async function fetchPokemonCardsForLanguage(pokemonName, language) {
    try {
        

        // Pokemon TCG API - fetch all cards with this name
        const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:*${pokemonName}*&orderBy=-set.releaseDate&pageSize=250`);
        //  https://api.pokemontcg.io/v2/cards?q=name:Eevee&orderBy=-set.releaseDate


        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        console.log(`Found ${data.data.length} cards `);

        return data.data.map(card => ({
            id: card.id,
            name: card.name,
            set: card.set.name,
            setId: card.set.id,
            releaseDate: card.set.releaseDate || null,
            year: card.set.releaseDate ? new Date(card.set.releaseDate).getFullYear() : null,

            types: card.types || [],

            images: {
                small: card.images.small,
                large: card.images.large
            },
            tcgplayer: card.tcgplayer ? card.tcgplayer.url : null,
            cardmarket: card.cardmarket ? card.cardmarket.url : null
        }));

    } catch (error) {
        console.error(`Error retrieving cards for ${pokemonName}:`, error);
        return [];
    }
}

/**
 * Save cards to JSON file
 * @param {string} pokemonName - Pokemon name
 * @param {string} language - Language code
 * @param {Array} cards - Cards list
 */
function saveCardsToFile(pokemonName, language, cards) {
    const pokemonDir = bddPath + pokemonName.toLowerCase();
    const filepath = pokemonDir + '/' + language + '.json';

    // Create pokemon directory if it doesn't exist
    if (!fs.existsSync(pokemonDir)) {
        fs.mkdirSync(pokemonDir, { recursive: true });
    }

    // Sort cards by date (oldest to newest)
    const sortedCards = cards.sort((a, b) => {
        // If no release date, put at the end
        if (!a.releaseDate && !b.releaseDate) return 0;
        if (!a.releaseDate) return 1;
        if (!b.releaseDate) return -1;
        
        // Compare dates
        return new Date(a.releaseDate) - new Date(b.releaseDate);
    });

    const data = {
        pokemon: pokemonName,
        totalCards: sortedCards.length,
        lastUpdated: new Date().toISOString(),
        cards: sortedCards
    };

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    console.log(`Cards saved to: ${filepath}`);
}

/**
 * Main import for a Pokemon
 * @param {string} pokemonName - Pokemon name to import
 * @param {string} language - Language code (default: 'en')
 */
export async function importPokemonCards(pokemonName, language) {
    console.log(`=== Import cards ===`);

    const cards = await fetchPokemonCardsForLanguage(pokemonName, language);

    if (cards.length > 0) {
        saveCardsToFile(pokemonName, language, cards);
        console.log(`✅ Import completed: ${cards.length} cards`);
    } else {
        console.log(`❌ No cards found for ${pokemonName}`);
    }
}

