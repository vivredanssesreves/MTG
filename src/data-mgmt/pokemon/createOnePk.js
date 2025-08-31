import fs from 'fs';
import { createJsonForCard, normalizeForSearch } from './utilities/utilitiesForOneCard.js';

const pathSrc = '../../../src/';
const pathSrcBddPoke = `${pathSrc}data/pokemon/`;
const pathBddOnePoke = `${pathSrcBddPoke}oneByOne/`;
const pathBddBase = `${pathSrcBddPoke}base/`;

const pathBddExt = `../../../bddExt/`;
const bddDexPath = `${pathBddExt}tcg-dex/`;
const bddTcgPath = `${pathBddExt}tcg-data/`;


// const bddPath = `${pathSrc}bdd/pokemon/`;
// const bddBasePath = `${bddPath}base/`;

const langs = ['fr', 'en', 'zh-cn', 'zh-tw', 'ja', 'ko'];

export async function createForOne(pokemonName) {
    const pokePath = `${pathBddOnePoke}${pokemonName.toLowerCase()}.json`;
    console.log(`\n----------------\n🔍 : ${pokemonName}`);

    if (fs.existsSync(pokePath)) {
        fs.unlinkSync(pokePath);
        console.log('Existing file deleted.');
    }
    console.log(pokePath);
    for (const lang of langs) {

        const files = getAllFilesPath(lang);
        const pokeNameByLang = getPokeNameByLang(lang, pokemonName);
        if (!pokeNameByLang) continue;

        const cards = await getMachingCards(files, pokeNameByLang, lang);
        console.log(`🌍 : ${lang}: ${cards.length}`);
        addToFile(cards, pokePath);
    }
    checkEndComma(pokePath);
    sortCardsByDate(pokePath);
    console.log(`----------------\n`);
}

function getPokeNameByLang(lang, pokemonName) {
    const langFile = `${pathBddBase}index_eevees.json`;
    const index = JSON.parse(fs.readFileSync(langFile, 'utf-8'));
    const poke = index.find(entry => normalizeForSearch(entry.ids.en) === normalizeForSearch(pokemonName));

    if (poke.ids && poke.ids[lang]) {

        return poke.ids[lang];
    }
    return null;
}

async function getMachingCards(files, pokemonName, lang) {

    let allCards = [];
    for (const file of files) {
        const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
        allCards.push(...data);
    }
    const matchingCards = await findMatchingCardsInOne(allCards, pokemonName, lang);
    return matchingCards;
}

function sortCardsByDate(path) {
    const data = JSON.parse(fs.readFileSync(path, 'utf-8'));
    let cards = data;
    cards.sort((a, b) => {
        const dateA = new Date(a.releaseDate);
        const dateB = new Date(b.releaseDate);
        return dateA - dateB;
    });
    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
    }
    fs.writeFileSync(path, JSON.stringify(cards, null, 2), 'utf-8');
}



function addToFile(cards, path) {
    if (fs.existsSync(path)) {
        const data = JSON.parse(fs.readFileSync(path, 'utf-8'));
        data.push(...cards);
        fs.unlinkSync(path);
        fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
        return;
    }
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, JSON.stringify(cards, null, 2), 'utf-8');
        return;
    }
    console.error('Error: File should have exited or not WTF?');

}

function checkEndComma(path) {
    let fileContent = fs.readFileSync(path, 'utf-8').trim();
    // check end got , and ] ?
    let pos = fileContent.lastIndexOf('}');
    let end = fileContent.slice(pos);
    if (end.includes(',')) {
        // Remove the trailing comma
        let fixedContent = fileContent.replace(/,(\s*\])/, '$1');
        fs.writeFileSync(path, fixedContent, 'utf-8');
    }
}

function getAllFilesPath(language) {
    let files = [];

    //dex
    const pathDexLang = `${bddDexPath}${language}/cards.json`;
    files.push(pathDexLang);

    if (language === 'en') {
        //tcg
        const pathTcgcards = `${bddTcgPath}cards/en`;

        const tcgFiles = fs.readdirSync(pathTcgcards).filter(file =>
            file.endsWith('.json')
        ).map(file => `${pathTcgcards}/${file}`);
        files.push(...tcgFiles);
    }

    return files;
}

async function findMatchingCardsInOne(cardBundle, pokemonName, lang) {

    const PokeNameNormalized = normalizeForSearch(pokemonName);
    const matchingCards = cardBundle.filter(card =>
        normalizeForSearch(card.name).includes(PokeNameNormalized)
    );
    const normalizedCards = await normalizeMatchedCard(matchingCards, lang);

    return normalizedCards;
}

async function normalizeMatchedCard(cards, lang) {

    let simpleCards = [];
    for (const card of cards) {
        const simpleCard = await createJsonForCard(card, lang);
        if (simpleCard.set.serie.id == "tcgp") continue;
        simpleCards.push(simpleCard);
    }
    return simpleCards;
}








