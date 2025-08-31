import fs from 'fs';


const pathSrc = '../../../src/';
const pathSrcBddPoke = `${pathSrc}data/pokemon/`;
const pathBddOnePoke = `${pathSrcBddPoke}oneByOne/`;
const pathBddBase = `${pathSrcBddPoke}base/`;

const pathBddExt = `../../../bdd/pokemon/base/`;
const pathBddDex = `${pathBddExt}tcg-dex/`;
const pathBddTcg = `${pathBddExt}pokemon-tcg-data/`;

// const bddPath = '../../bdd/pokemon/';
// const bddBasePath = `${bddPath}base/`;
// const bddDexPath = `${bddBasePath}tcg-dex/`;
// const bddTcgPath = `${bddBasePath}pokemon-tcg-data/`;
const langs = ['fr', 'en', 'zh-cn', 'zh-tw', 'ja', 'ko'];

export function fixPokemons() {
    const pathIndex = `${pathBddBase}index_eevees.json`;
    const index = JSON.parse(fs.readFileSync(pathIndex, 'utf-8'));
    for (const poke of index) {
        fixOnePokeDuplicate(poke.ids.en);
    }

}

function fixOnePokeDuplicate(pokemonName) {
    const pokePath = `${pathBddOnePoke}${pokemonName.toLowerCase()}.json`;
    if (!fs.existsSync(pokePath)) {
        console.log(`File not found: ${pokePath}`);
        return;
    }
    const pokeCards = JSON.parse(fs.readFileSync(pathPoke, 'utf-8'));
    const uniqueCards = [];
    
    for (const card of pokeCards) {
        const isUnique = isUniqueCard(card, uniqueCards);
        if (isUnique) {
            uniqueCards.push(card);
        } 
    }

}
function isUniqueCard(card, allCards) {
    for (const existingCard of allCards) {

        const langMatch = existingCard.lang === card.lang;
        if (!langMatch) continue;

        const localIdMatch = existingCard.localId === card.localId;
        const setIdmatch = existingCard.set.id === card.set.id;
        const serieIdMatch = existingCard.set.serie.id === card.set.serie.id;
        
    }
    
    return true;

}