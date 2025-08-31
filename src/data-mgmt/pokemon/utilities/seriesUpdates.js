import fs from 'fs';

const pathSrc = '../../../src/';
const pathSrcBddPoke = `${pathSrc}data/pokemon/`;
const pathBddOnePoke = `${pathSrcBddPoke}oneByOne/`;
const pathBddBase = `${pathSrcBddPoke}base/`;

const pathBddExt = `../../../bddExt/`;
const pathBddDex = `${pathBddExt}tcg-dex/`;
const pathBddTcg = `${pathBddExt}tcg-data/`;

// const bddPath = '../../bdd/pokemon/';
// const bddBasePath = `${bddPath}base/`;
// const bddDexPath = `${bddBasePath}tcg-dex/`;
const langs = ['fr', 'en', 'zh-cn', 'zh-tw', 'ja', 'ko'];

export function createSeries() {
    console.log(`\n----------------\n`);
    for (const lang of langs) {
        let series = [];
        const pathSeriesNew = `${pathBddBase}${lang}/series_update.json`;
        const pathSets = `${pathBddDex}${lang}/sets.json`;

        if (fs.existsSync(pathSeriesNew)) {
            fs.unlinkSync(pathSeriesNew);
            console.log('Existing file deleted.');
        }
        const sets = JSON.parse(fs.readFileSync(pathSets, 'utf-8'));
        for (const set of sets) {
            const serieId = set.serie.id;
            if (!series.find(serie => serie.id === serieId)) {
                let date = set.releaseDate;
                if (!date && set.name.contains("onald's Collection")) {
                    const year = set.name.match(/\d{4}/);
                    if (year) date = `${year}-01-01`;
                }
                series.push({
                    id: serieId,
                    name: set.serie.name,
                    logo: null,
                    sets: [{
                        id: set.id,
                        name: set.name,
                        releaseDate: date
                    }]
                });
            } else {
                const existingSerie = series.find(s => s.id === serieId);
                existingSerie.sets.push({
                    id: set.id,
                    name: set.name,
                    releaseDate: set.releaseDate
                });
            }
        }
        fs.writeFileSync(pathSeriesNew, JSON.stringify(series, null, 2), 'utf-8')
    }

}

createSeries();