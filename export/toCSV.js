
import fs from 'fs';
import fetch from 'node-fetch';
const pathMyCards = '../MYBDD/myCards.json';
const pathToMyCSVs = '../MYBDD/CSV/';



function exportCSV() {
    const sets = JSON.parse(fs.readFileSync(pathMyCards, 'utf-8'));
    const set = sets.sets.find(s => s.code === 'ltr');

    let csvContent;
    let pathMyCSV = pathToMyCSVs + set.code + '.csv';

    if (fs.existsSync(pathMyCSV)) {
        fs.unlinkSync(pathMyCSV);
        console.log('Existing file deleted.');
    }

    if (!set) {
        console.log("Failed to read set data");
        return;
    }

    console.log(`\n--------\nStarting\n${set.code}`);
    let csvLines = ["number;no_foil;foil"];
    // Sort cards by 'number' (ascending)
    const sortedCards = set.cards.slice().sort((a, b) => {
        // Si number est numérique, trier comme nombre
        const numA = isNaN(a.number) ? a.number : Number(a.number);
        const numB = isNaN(b.number) ? b.number : Number(b.number);
        if (numA < numB) return -1;
        if (numA > numB) return 1;
        return 0;
    });
    sortedCards.forEach(card => {
        csvLines.push(`${card.number};${card.no_foil};${card.foil}`);
    });
    csvContent = csvLines.join('\n');

    // Write the CSV file
    fs.writeFile(pathMyCSV, csvContent, 'utf8', (err) => {
        if (err) {
            console.error("CSV write error:", err);
        } else {
            console.log("CSV generated: " + pathMyCSV);
        }
    });
}

exportCSV();
