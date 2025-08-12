import fs from 'fs';
import path from 'path';
const pathSets = '../bdd/sets.json';
const pathMyCardsDir = '../MYBDD/json/';

function createEmptySetsFiles() {
    if (!fs.existsSync(pathMyCardsDir)) {
        fs.mkdirSync(pathMyCardsDir, { recursive: true });
    }
    const sets = JSON.parse(fs.readFileSync(pathSets, 'utf-8'));
    sets.forEach(set => {
        createEmptySet(set.code);
    });
    console.log('All set files initialized for my BDD.');
}

function createEmptySet(setCode) {
    const filePath = path.join(pathMyCardsDir, setCode + '.json');
    fs.writeFileSync(filePath, JSON.stringify({ cards: [] }, null, 2));
}


export { createEmptySetsFiles };
export { createEmptySet };