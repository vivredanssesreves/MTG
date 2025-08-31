import fs from 'fs';
import { getCardPicture } from './urlUpdate.js';
import { type } from 'os';

const pathSrc = '../../../src/';
const pathSrcBddPoke = `${pathSrc}data/pokemon/`;
const pathBddOnePoke = `${pathSrcBddPoke}oneByOne/`;
const pathBddBase = `${pathSrcBddPoke}base/`;

const pathBddExt = `../../../bddExt/`;
const pathBddDex = `${pathBddExt}tcg-dex/`;
const pathBddTcg = `${pathBddExt}tcg-data/`;

// const bddBasePath = '../../bdd/pokemon/base/';
// const bddDexPath = `${bddBasePath}tcg-dex/`;
// const bddTcgPath = `${bddBasePath}pokemon-tcg-data/`;


export function getSet(setId, lang) {

    let bddSetsPath = `${pathBddBase}${lang}/sets_update.json`;
    let allSets = JSON.parse(fs.readFileSync(bddSetsPath, 'utf-8'));
    let tempSet = allSets.find(set => set.id === setId);
    let serie = null;
    let foundSet = null;

    if (tempSet) {
        return tempSet;
    }

    if (lang === 'en') {

        bddSetsPath = `${pathBddTcg}/sets/en.json`;
        const allSets = JSON.parse(fs.readFileSync(bddSetsPath, 'utf-8'));
        tempSet = allSets.find(set => set.id === setId);
        serie = getSerie(tempSet.series, lang);
        let date = null;
        const setFromUpdatedSerie = serie ? serie.sets.find(s => s.id === setId) : null;
        if (setFromUpdatedSerie && setFromUpdatedSerie.releaseDate) {
            date = setFromUpdatedSerie.releaseDate;
        }
        foundSet = {
            "id": tempSet.id,
            "name": tempSet.name,
            "releaseDate": date ? date : tempSet.releaseDate || null,
            "images": {
                "logo": tempSet.images.logo || null,
                "symbol": tempSet.images.symbol || null
            },
            "serie": {
                "id": serie ? serie.id : tempSet.series || null,
                "name": serie ? serie.name : null
            },
            "abbreviation": null
        };
    }

    return foundSet;

}

function getSerie(serieId, lang) {
    let bddSetsPath = `${pathBddBase}${lang}/series_update.json`;
    let allSeries = JSON.parse(fs.readFileSync(bddSetsPath, 'utf-8'));
    let tempSerie = allSeries.find(serie => serie.id === serieId);
    if (!tempSerie) {
        tempSerie = allSeries.find(serie => serie.name === serieId);
    }
    if (!tempSerie) console.log(`Serie not found: ${serieId} in ${lang}`);
    return tempSerie;
}
export async function createJsonForCard(card, lang) {
    let simpleCard = {};
    if (card.supertype) {
        // base 1
        let pos = card.id.lastIndexOf('-');
        let setId = card.id.slice(0, pos);
        //let globale = setId + card.localId;
        const set = getSet(setId, lang);

        if (!set) {
            console.log(`${setId}:${lang}`);
        }

        simpleCard = {
            "base": 1,
            "lang": lang,
            //"globalId": globale ,
            "category": card.supertype,
            "id": card.id,
            "illustrator": card.artist,
            "localId": card.number,
            "name": card.name,
            "rarity": card.rarity,
            "set": {
                "serie": {
                    "id": set.serie.id,
                    "name": set.serie.name
                },
                "id": set.id,
                "name": set.name,
                "images": {
                    "symbol": set.images.symbol,
                    "logo": set.images.logo
                }
            },
            "variants": {
                "firstEdition": null,
                "holo": null,
                "normal": null,
                "reverse": null,
                "wPromo": null,
                "V": null,
                "Vmax": null
            },
            "types": card.types,
            "releaseDate": set.releaseDate || null,
            "images": {
                "low": card.images.small,
                "high": card.images.large
            }
        };
    }
    if (card.category) {
        // base Dex
        const set = getSet(card.set.id, lang);

        simpleCard = {
            "base": 'Dex',
            "lang": lang,
            "category": card.category,
            "id": card.id,
            "illustrator": card.illustrator,
            "localId": card.localId,
            "name": card.name,
            "rarity": card.rarity,
            "set": {
                "serie": {
                    "id": set.serie.id || null,
                    "name": set.serie.name || null
                },
                "id": set.id,
                "name": set.name,
                "images": {
                    "symbol": set.images.symbol || null,
                    "logo": set.images.logo || null
                }
            },
            "variants": {
                "firstEdition": card.variants.firstEdition || null,
                "holo": card.variants.holo || null,
                "normal": card.variants.normal || null,
                "reverse": card.variants.reverse || null,
                "wPromo": card.variants.wPromo || null,
                "V": null,
                "Vmax": null

            },
            "types": card.types,
            "releaseDate": set.releaseDate || null,
            "images": {
                "low": `${card.image}/low.png` || null,
                "high": `${card.image}/high.png` || null
            }
        };

    }
    let imagesLow = simpleCard.images.low;
    let imagesHigh = simpleCard.images.high;
    if (imagesLow.includes("undefin")) {
        imagesLow = await getCardPicture(simpleCard, 'low');
    }
    if (imagesHigh.includes("undefin")) {
        imagesHigh = await getCardPicture(simpleCard, 'high');
    }
    simpleCard.images.low = imagesLow;
    simpleCard.images.high = imagesHigh;
    return simpleCard;
}
export function normalizeForSearch(text) {
    if (!text) return '';
    return String(text)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '');
}

function getType() {
    // to do
}

function getCss(card, lang) {
    // "variants" = {
    //     "firstEdition": card.variants.firstEdition || null,
    //     "holo": card.variants.holo || null,
    //     "normal": card.variants.normal || null,
    //     "reverse": card.variants.reverse || null,
    //     "wPromo": card.variants.wPromo || null,
    //     "V": null,
    //     "Vmax": null
    // card_front card_glare card_shine
    // 
    // pokemon-card
    // holo	
    // shine	
    // glare	
    // active	
    // animated
    // rainbow
    // stars
    // sparkle
    let bddTypePath = `${pathBddBase}all_card_type.json`;
    let allTypes = JSON.parse(fs.readFileSync(pathBddBase, 'utf-8'));


    let css = [];
    if (card.variants) {
        let typeTemp = null;

        if (card.variants.holo) {
            typeTemp = allTypes.find(type => normalizeForSearch(type.id.en) === 'holo');
            css.push(typeTemp ? typeTemp.css : 'holo');
        }
        if (card.variants.reverse) {
            typeTemp = allTypes.find(type => normalizeForSearch(type.id.en) === 'reverse');
            css.push(typeTemp ? typeTemp.css : 'reverse');
        }
        if (card.variants.wPromo) {
            typeTemp = allTypes.find(type => normalizeForSearch(type.id.en) === 'wpromo');
            css.push(typeTemp ? typeTemp.css : 'wpromo');
        }
        if (card.variants.V) {
            typeTemp = allTypes.find(type => normalizeForSearch(type.id.en) === 'v');
            css.push(typeTemp ? typeTemp.css : 'v');
        }
        if (card.variants.Vmax) {
            typeTemp = allTypes.find(type => normalizeForSearch(type.id.en) === 'vmax');
            css.push(typeTemp ? typeTemp.css : 'vmax');
        }
    }




}