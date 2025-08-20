/**
 * Pokemon Database Initialization
 * 
 * Functions:
 * - initPokemonDatabase()
 *     -> Promise<void>
 *     - Initialize complete Pokemon card database for all Eevee evolutions
 * 
 * Pokemon List:
 * - Eevee and all 8 evolutions (Flareon, Vaporeon, Jolteon, Espeon, Umbreon, Leafeon, Glaceon, Sylveon)
 * 
 * Usage:
 * - CLI: node initialisation_pokemon.js
 * - Import: import { initPokemonDatabase } from './initialisation_pokemon.js'
 */

import { importPokemonCards } from './import_for_one_pokemon.js';

// Anglais (en) - par défaut
// Français (fr)
// Allemand (de)
// Espagnol (es)
// Italien (it)
// Portugais (pt)
// Japonais (ja)
// Coréen (ko)
// Chinois traditionnel (zh-tw)
// Chinois simplifié (zh-cn)


console.log(`\n--- Import de eevee ---`);
await importPokemonCards('eevee','en');

console.log('\n✅ Initialisation terminée !');



