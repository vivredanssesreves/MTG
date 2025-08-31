import { get } from 'http';
import { createForOne } from './createOnePk.js';
import { createSets } from './utilities/setsUpdates.js';
import { createSeries } from './utilities/seriesUpdates.js';
import fs from 'fs';

// Charger les IDs depuis index_eevees.json
const pathSrc = '../../../src/';
const pathSrcBddPoke = `${pathSrc}data/pokemon/`;
const pathBddOnePoke = `${pathSrcBddPoke}oneByOne/`;
const pathBddBase = `${pathSrcBddPoke}base/`;

const bddBasePath = `${pathSrc}bdd/pokemon/`;

const eeveeIds = JSON.parse(fs.readFileSync(`${pathBddBase}index_eevees.json`, 'utf-8'));

export async function createBdd() {
    // Traiter chaque ID
    for (const poke of eeveeIds) {

        //createSeries();
        //createSets();
        await createForOne(poke.ids.en);

        break;
    }
}

createBdd();


