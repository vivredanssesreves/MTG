import fs from 'fs';
import fetch from 'node-fetch';
const pathMyCards = '../MYBDD/myCards.json';
const pathSets = '../bdd/sets.json';

function createEmptyCollectionFile() {
    if (fs.existsSync(pathMyCards)) {
        fs.unlinkSync(pathMyCards);
        console.log('Existing file deleted.');
    }

    const sets = JSON.parse(fs.readFileSync(pathSets, 'utf-8'));

    const newCollection = {
        sets: sets.map(set => ({
            code: set.code,
            cards: []
        }))
    };

    fs.writeFileSync(pathMyCards, JSON.stringify(newCollection, null, 2));
}

createEmptyCollectionFile();