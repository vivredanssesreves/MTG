import fs from 'fs';
import fetch from "node-fetch";
import TCGdex from '@tcgdex/sdk'

const bddPath = '../../bdd/pokemon/';
const bddBasePath = `${bddPath}base/`;
const bddDexPath = `${bddBasePath}tcg-dex/`;
const langs = ['fr', 'en', 'zh-cn', 'zh-tw', 'ja', 'ko'];


export async function getCardPicture(card, quality) {
    const urlBase = 'https://assets.tcgdex.net/';
    let url = null;
    //https://assets.tcgdex.net/en/sm/smp/SM175/high.png
    if (card.images.low.includes('undefin') && quality === 'low') {
        url = `${urlBase}${card.lang}/${card.set.serie.id}/${card.set.id}/${card.localId}/low.png`;
    }
    if (card.images.high.includes('undefin') && quality === 'high') {
        url = `${urlBase}${card.lang}/${card.set.serie.id}/${card.set.id}/${card.localId}/high.png`;
    }
    //url = await testUrl(url, card);
    return url;
}

export async function testUrl(url,card) {
     const tcgdex = new TCGdex(card.lang);

    if (url) {
        let isImage = await checkImage(url);
        if (!isImage) {
            
            const cardTemp = await tcgdex.card.get(card.id);
            const urlTemp = cardTemp.image+ '/high.png';
            console.log(`URL for ${card.id} updated to ${urlTemp}`);
            await checkImage(urlTemp);

        }
    }

    return url;

}

async function checkImage(url) {
    try {
        const res = await fetch(url);

        const type = res.headers.get("content-type");
        if (type && type.startsWith("image/")) {
            console.log(`✅ C'est une image (${type}) - ${url}`);
            return true;
        }
        console.log(`❌ Pas une image (${type}) - ${url}`);
        return false;

    } catch (err) {
        console.error("Erreur:", err.message);
        return false;
    }
}

// await checkImage("https://images.pokemontcg.io/mcd18/11_hires.png");
// console.log('---');
// await checkImage("https://assets.tcgdex.net/fr/base/base2/51/high.png");
// console.log('---');
// await checkImage("https://assets.tcgdex.net/en/mc/2019sm/12/high.png");
// console.log('---');
// await checkImage("https://images.pokemontcg.io/mcd19/12_hire.png");
// console.log('---');
