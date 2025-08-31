import fs from 'fs';
import path from 'path';

const pathSrc = '../../../src/';
const pathSrcBddPoke = `${pathSrc}data/pokemon/`;
const pathBddOnePoke = `${pathSrcBddPoke}oneByOne/`;
const pathBddBase = `${pathSrcBddPoke}base/`;

const pathBddExt = `../../../bdd/pokemon/base/`;
const pathBddDex = `${pathBddExt}tcg-dex/`;
const pathBddTcg = `${pathBddExt}pokemon-tcg-data/`;

// const bddPath = '../../../bdd/pokemon/';
// const bddBasePath = `${bddPath}base/`;
// const pathBddDex = `${bddBasePath}tcg-dex/`;
const langs = ['fr', 'en', 'zh-cn', 'zh-tw', 'ja', 'ko'];

export function createSets() {
    console.log(`\n----------------\n`);
    for (const lang of langs) {
        const pathSetsNew = `${pathBddBase}${lang}/sets_update.json`;
        const pathSets = `${pathBddDex}${lang}/sets.json`;

        const dir = path.dirname(pathSetsNew);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        if (fs.existsSync(pathSetsNew)) {
            fs.unlinkSync(pathSetsNew);
            console.log('Existing file deleted.');
        }

        const sets = JSON.parse(fs.readFileSync(pathSets, 'utf-8'));
        let newSets = [];
        for (const set of sets) {
            let date = set.releaseDate;
            if (!date && set.name.contains("onald's Collection")) {
                const year = set.name.match(/\d{4}/);
                if (year) date = `${year}-01-01`;
            }
            newSets.push({
                "id": set.id,
                "name": set.name,
                "releaseDate": date || null,
                "images": {
                    "logo": `${set.logo}.png` || null,
                    "symbol": `${set.symbol}.png` || null,
                },
                "serie": {
                    "id": set.serie.id || null,
                    "name": set.serie.name || null
                },
                "abbreviation": set.abbreviation || null
            });
        }
        fs.writeFileSync(pathSetsNew, JSON.stringify(newSets, null, 2), 'utf-8')
    }

}

createSets();