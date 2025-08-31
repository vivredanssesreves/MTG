
/**
 * CSV Export Utilities
 * 
 * Functions:
 * - exportCSV(code: string) 
 *     -> void 
 *     - Export a specific set to CSV (exported)
 * 
 * - exportAllToCSV() 
 *     -> array 
 *     - Export all sets to CSV and return missing sets (exported)
 */

import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';

const pathSrc = '../../../src/';
const pathDataMtg = `${pathSrc}data/mtg/`;
const pathDataMtgSets = `${pathDataMtg}sets/`;
const pathMyDataMtgJson = `${pathSrc}data-user/mtg/json/`;
const pathMyDataMtgCSV = `${pathSrc}data-user/mtg/CSV/`;

// const pathBdd = `../bdd/sets/`; // ALL cards from the set
// const pathMyBdd = `../MYBDD/json/`; // My personal cards
// const pathToMyCSVs = '../MYBDD/CSV/';

export function exportCSV(code) {

    let pathAllCards = `${pathDataMtgSets}${code}.json`; // ALL cards from the set
    let pathMyCards = `${pathMyDataMtgJson}${code}.json`; // My personal cards
    
    // Read ALL cards from the set
    const allCards = JSON.parse(fs.readFileSync(pathAllCards, 'utf-8'));

    // Read my personal cards
    let mySetData = { cards: [] };
    if (fs.existsSync(pathMyCards)) {
        mySetData = JSON.parse(fs.readFileSync(pathMyCards, 'utf-8'));
    }

    let csvContent;
    let pathMyCSV = pathMyDataMtgCSV + `${code}.csv`;

    if (fs.existsSync(pathMyCSV)) {
        fs.unlinkSync(pathMyCSV);
    }

    if (!allCards) {
        console.log("Failed to read set data");
        return;
    }

   // console.log(`\n--------\nStarting\n${code}`);
    let csvLines = ["set;number;no_foil;foil"];

    // Sort cards by 'number' (ascending)
    const sortedCards = allCards.slice().sort((a, b) => {
        // If number is numeric, sort as number
        const numA = isNaN(a.number) ? a.number : Number(a.number);
        const numB = isNaN(b.number) ? b.number : Number(b.number);
        if (numA < numB) return -1;
        if (numA > numB) return 1;
        return 0;
    });

    sortedCards.forEach(card => {
        // Check if this card is in my personal cards
        const myCard = mySetData.cards.find(c => c.number === card.number);
        const no_foil = myCard ? myCard.no_foil : false;
        const foil = myCard ? myCard.foil : false;

        csvLines.push(`${code};${card.number};${no_foil};${foil}`);
    });
    csvContent = csvLines.join('\n');

    // Write the CSV file
    fs.writeFile(pathMyCSV, csvContent, 'utf8', (err) => {
        if (err) {
            //console.error("CSV write error:", err);
        } else {
            //console.log("CSV generated: " + pathMyCSV);
        }
    });
}

export function exportAllToCSV() {
    // pathDataMtgSets
    // const sets = JSON.parse(fs.readFileSync('../bdd/sets.json', 'utf-8'));
    const sets = JSON.parse(fs.readFileSync(`${pathDataMtg}sets.json`, 'utf-8'));
    let missingSets= [];
    sets.forEach(set => {
        pathMyDataMt
        const setFilePath = `${pathDataMtgSets}${set.code}.json`;
        if (fs.existsSync(setFilePath)) {
            exportCSV(set.code);
        } else {
            missingSets.push(set.code);
        }
    });
    return missingSets;
}



// For direct testing
if (process.argv[2]) {
    const setCode = process.argv[2];
    exportCSV(setCode);
} else {
    // exportCSV(); // Commented to avoid automatic execution
}
