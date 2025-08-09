
import fs from 'fs';
import fetch from 'node-fetch';

const setCode = 'ltr'; // Code du set à exporter
const pathAllCards = `../bdd/sets/${setCode}.json`; // TOUTES les cartes du set
const pathMyCards = `../MYBDD/json/${setCode}.json`; // Mes cartes personnelles
const pathToMyCSVs = '../MYBDD/CSV/';

function exportCSV() {
    // Lire TOUTES les cartes du set
    const allCards = JSON.parse(fs.readFileSync(pathAllCards, 'utf-8'));
    
    // Lire mes cartes personnelles
    let mySetData = { cards: [] };
    if (fs.existsSync(pathMyCards)) {
        mySetData = JSON.parse(fs.readFileSync(pathMyCards, 'utf-8'));
    }

    let csvContent;
    let pathMyCSV = pathToMyCSVs + `${setCode}.csv`;

    if (fs.existsSync(pathMyCSV)) {
        fs.unlinkSync(pathMyCSV);
        console.log('Existing file deleted.');
    }

    if (!allCards) {
        console.log("Failed to read set data");
        return;
    }

    console.log(`\n--------\nStarting\n${setCode}`);
    let csvLines = ["number;no_foil;foil"];
    
    // Sort cards by 'number' (ascending)
    const sortedCards = allCards.slice().sort((a, b) => {
        // Si number est numérique, trier comme nombre
        const numA = isNaN(a.number) ? a.number : Number(a.number);
        const numB = isNaN(b.number) ? b.number : Number(b.number);
        if (numA < numB) return -1;
        if (numA > numB) return 1;
        return 0;
    });
    
    sortedCards.forEach(card => {
        // Chercher si cette carte est dans mes cartes personnelles
        const myCard = mySetData.cards.find(c => c.number === card.number);
        const no_foil = myCard ? myCard.no_foil : false;
        const foil = myCard ? myCard.foil : false;
        
        csvLines.push(`${card.number};${no_foil};${foil}`);
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
