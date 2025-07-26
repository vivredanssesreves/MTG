import fs from 'fs';
import { importOneSet } from './import_one_set.js';

async function importSetBySet() {

    const sets = JSON.parse(fs.readFileSync('../bdd/sets.json', 'utf-8'));

    for (let set of sets) {
        console.log(`starting\n--------\nSet code: ${set.code}, name: ${set.name}`);
        const today = new Date().toISOString().split('T')[0]; // format: YYYY-MM-DD

        if (set.released_at > today) {
            console.log(`Skipping future set: ${set.code}`);
            continue; // dans une boucle for...of
        }

        importOneSet(set);
        console.log('ending\n--------\n');
        await delay(1500); // 1 second    
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


export { importSetBySet };