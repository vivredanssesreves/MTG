import fs from 'fs';
import { importOneSet } from './import_one_set.js';

async function importSetBySet() {

    const sets = JSON.parse(fs.readFileSync('../bdd/sets.json', 'utf-8'));
    const missingPath = './missing_sets.log';

    if (fs.existsSync(missingPath)) {
        fs.unlinkSync(missingPath);
        console.log('Existing file deleted.');
    }

    const today = new Date().toISOString().split('T')[0]; // format: YYYY-MM-DD
    for (let set of sets) {
        console.log(`\n--------\nstarting\n${set.code} - ${set.name}`);

        if (set.released_at > today) {
            console.log(`Skipping future set`);
            console.log('ending\n--------\n');
            continue;
        }

        await importOneSet(set);
        //await delay(5000); //  second   
        console.log('ending\n--------\n');

    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


export { importSetBySet };