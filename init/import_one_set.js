import fs from 'fs';
import fetch from 'node-fetch';

const missingPath = './missing_sets.log';

async function importOneSet(setSelected) {

    let setPath = '../bdd/' + setSelected.code + '.json';

    if (fs.existsSync(setPath)) {
        fs.unlinkSync(setPath);
        console.log('Existing file deleted.');
    }

    let url = setSelected.uri;
    const allCards = [];

    do {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.data) {
            console.error('No cards data found in API response: '+ setSelected.name);
            logMissingSet(setSelected);
            return;
        }
        const cards = data.data;


        cards.forEach(card => {
            const number = card.collector_number || "";
            const name = card.name || "";
            const imageUrl = card.image_uris ? card.image_uris.normal : "";
            const link = generateGathererLink(setSelected.code, number, name);

            allCards.push({
                number,
                name,
                imageUrl,
                link
            });
        });

        url = data.has_more ? data.next_page : null;
    } while (url);

    const outputPath = `../bdd/cards_${setSelected.code}.json`;
    fs.writeFileSync(outputPath, JSON.stringify(allCards, null, 2));
    console.log(`Saved ${allCards.length} cards to ${outputPath}`);
}

// Dummy function - replace with your actual logic
function generateGathererLink(code, number, name) {
    let safeName = name
        .toLowerCase()
        .replace(/,/g, '')
        .replace(/\s+/g, '-');

    let safeCode = String(code).toUpperCase();
    return `https://gatherer.wizards.com/${safeCode}/en-us/${number}/${safeName}`;
}

// `=HYPERLINK("${MTGurl}/${safeCode}/en-us/${number}/${safeName}")`;
//https://gatherer.wizards.com/LTR/en-us/1/banish-from-edoras

function logMissingSet(set) {
  const line = `${set.code} - ${set.name}\n`;
  fs.appendFileSync(missingPath, line, 'utf-8');
}
export { importOneSet };
