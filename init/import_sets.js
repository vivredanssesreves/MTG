import fs from 'fs';
import fetch from 'node-fetch';
const filePath = '../bdd/sets.json';

async function importAllSets() {

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Existing file deleted.');
    }

    fs.writeFileSync(filePath, '[]');
    console.log('New file created with empty array.');

    const url = "https://api.scryfall.com/sets";
    const response = await fetch(url);
    const json = await response.json();
    //console.log(json);

    const mainTypes = ["digital", "treasure_chest", "minigame", "memorabilia"];

    const interSet = json.data.filter(set => !mainTypes.includes(set.set_type))
    const filteredSets = interSet.map(set => ({
        code: set.code,
        name: set.name,
        icon_svg_uri: set.icon_svg_uri,
        uri: createUri(set.code, false),
        uri_fr: createUri(set.code, true),
        released_at: set.released_at,
        cards_count: set.card_count,
        type: set.set_type,
        sousSets: set.code.length <= 3 ? getSousSets(set.code, interSet) : []
    }));

    fs.writeFileSync(filePath, JSON.stringify(filteredSets, null, 2));
    console.log('sets.json file updated successfully');
}

function getSousSets(code, json) {
    return json
        .filter(set => set.code.includes(code) && set.code !== code)
        .map(set => ({ code: set.code, type: set.set_type }));
}

//importAllSets()
function createUri(code, fr) {
    //https://api.scryfall.com/cards/search?q=set:fem&order=name&dir=asc&unique=prints
    //https://api.scryfall.com/cards/search?q=lang:fr+set:ltr&unique=prints
    //https://api.scryfall.com/cards/search?q=lang:fr+set:ltr&unique=prints

    let uri = "https://api.scryfall.com/cards/search?q=";

    uri = uri.concat("set:");
    uri = uri.concat(code);
    if (fr) {
        uri = uri.concat("+lang:fr");
    }
    uri = uri.concat("&unique=prints");
    uri = uri.concat("&order=set");
    return uri;

}


export { importAllSets };