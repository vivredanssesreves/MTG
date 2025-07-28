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

    const mainTypes = ["expansion", "core", "draft_innovation", "commander"];

    const filteredSets = json.data
        .filter(set => mainTypes.includes(set.set_type))
        .map(set => ({
            code: set.code,
            name: set.name,
            icon_svg_uri: set.icon_svg_uri,
            uri: `https://api.scryfall.com/cards/search?order=set&q=e%3A${set.code}+lang%3Afr&unique=prints`,
            released_at: set.released_at,
            cards_count: set.card_count
        }));

    fs.writeFileSync(filePath, JSON.stringify(filteredSets, null, 2));
    console.log('sets.json file updated successfully');
}

//importAllSets()


export { importAllSets };