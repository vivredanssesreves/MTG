/**
 * Pokemon Energies Import Module
 * 
 * Functions:
 * - Main IIFE execution for Pokemon energies import
 * 
 * Features:
 * - Uses TCGdx SDK for Pokemon energy types
 * - Fetches energy types in French and English
 * - Combines and deduplicates data
 * - Saves to '../../bdd/pokemon/base/' directory
 * 
 * Output Files:
 * - all_energies_cards.json - Combined energy data
 */
import TCGdex from '@tcgdex/sdk';
import fs from 'fs';

const pathSrc = '../../../src/';
const pathSrcBddPoke = `${pathSrc}data/pokemon/`;
const pathBddOnePoke = `${pathSrcBddPoke}oneByOne/`;
const pathBddBase = `${pathSrcBddPoke}base/`;

const pathBddExt = `../../../bddExt/`;
const pathBddDex = `${pathBddExt}tcg-dex/`;
const pathBddTcg = `${pathBddExt}tcg-data/`;

//const pathBdd = '../../bdd/pokemon/base/';
const pathBddEnergies = `${pathBddBase}all_energies_cards.json`;
const pathBddSets = `${pathBddBase}all_sets.json`;
const pathBddSeries = `${pathBddBase}all_series.json`;

(async () => {
    const tcgdexfr = new TCGdex('fr');
    const tcgdexen = new TCGdex('en');
    let allBasicInfo = []
    let allInfo = [];
/*
    allBasicInfo.push(...await tcgdexfr.fetch('types'));
    allBasicInfo.push(...await tcgdexen.fetch('types'));

    if (fs.existsSync(pathBddEnergies)) {
        fs.unlinkSync(pathBddEnergies);
    }
    fs.writeFileSync(pathBddEnergies, JSON.stringify(allBasicInfo, null, 2), 'utf-8');

    allBasicInfo = [];
    allBasicInfo.push(...await tcgdexfr.fetch('series'));
    allBasicInfo.push(...await tcgdexen.fetch('series'));
    if (fs.existsSync(pathBddSeries)) {
        fs.unlinkSync(pathBddSeries);
    }
    allInfo = await getSeries(allBasicInfo);
    fs.writeFileSync(pathBddSeries, JSON.stringify(allInfo, null, 2), 'utf-8');
*/
    allBasicInfo = [];
    allBasicInfo.push(...await tcgdexfr.fetch('sets'));
    allBasicInfo.push(...await tcgdexen.fetch('sets'));

    if (fs.existsSync(pathBddSets)) {
        fs.unlinkSync(pathBddSets);
    }
    allInfo = await getSets(allBasicInfo);
    fs.writeFileSync(pathBddSets, JSON.stringify(allInfo, null, 2), 'utf-8');



})();

async function getSetInfo(setCode) {
    const tcgdex = new TCGdex();
    let set = await tcgdex.set.get(setCode);

    const setInfo = {
        "id": set.id,
        "logo": set.logo + '.png',
        "name": set.name,
        "releaseDate": set.releaseDate,
        "serie": {
            "id": set.serie?.id || null,
            "name": set.serie?.name || null
        },
        "symbol": set.symbol + '.png',
    };
    return setInfo;
}

async function getSerieInfo(serieId) {
    const tcgdex = new TCGdex();

    const serie = await tcgdex.serie.get(serieId);
    const serieInfo = {
        "id": serie.id,
        "name": serie.name,
        "releaseDate": serie.releaseDate,
        "logo": serie.logo + '.png',
    }
    return serieInfo;
}

async function getSets(allSets) {
    let detailedSets = [];

    for (const set of allSets) {
        try {
            const detailedSet = await getSetInfo(set.id);
            detailedSets.push(detailedSet);
        } catch (error) {
            console.warn(`⚠️  Erreur pour le set ${set.id}:`, error.message);
        }
    }
    return detailedSets;
}

async function getSeries(allSeries) {
    let detailedSeries = [];

    for (const serie of allSeries) {
        try {
            const detailedSerie = await getSerieInfo(serie.id);
            detailedSeries.push(detailedSerie);
        } catch (error) {
            console.warn(`⚠️  Erreur pour le set ${serie.id}:`, error.message);
        }
    }
    return detailedSeries;
}