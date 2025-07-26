import fs from 'fs';
import { importOneSet } from './import_one_set.js';

async function importSetBySet() {

    const sets = JSON.parse(fs.readFileSync('../bdd/sets.json', 'utf-8'));

    sets.forEach(set => {
        console.log(`starting\n--------\nSet code: ${set.code}, name: ${set.name}`);
        importOneSet(set);
        console.log('ending\n--------\n');    
    })
}

export { importSetBySet };