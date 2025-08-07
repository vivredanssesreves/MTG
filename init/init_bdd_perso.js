import fs from 'fs';
import path from 'path';
const pathSets = '../bdd/sets.json';
const pathMyCardsDir = '../MYBDD/json/';

function createEmptySetFiles() {
    if (!fs.existsSync(pathMyCardsDir)) {
        fs.mkdirSync(pathMyCardsDir, { recursive: true });
    }
    const sets = JSON.parse(fs.readFileSync(pathSets, 'utf-8'));
    sets.forEach(set => {
        const filePath = path.join(pathMyCardsDir, set.code + '.json');
        fs.writeFileSync(filePath, JSON.stringify({ cards: [] }, null, 2));
    });
    console.log('All set files initialized in MYBDD/json/.');
}

createEmptySetFiles();