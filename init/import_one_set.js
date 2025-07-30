import fs from 'fs';
import fetch from 'node-fetch';

const missingPath = './missing_sets.log';

async function importOneSet(setSelected) {

    let setPath = '../bdd/sets/' + setSelected.code + '.json';

    if (fs.existsSync(setPath)) {
        fs.unlinkSync(setPath);
        console.log('Existing file deleted.');
    }

    let url_en = setSelected.uri;
    let url_fr = setSelected.uri_fr;
    let activeUrl = url_fr;
    let data;
    const allCards = [];
    let fr = true;

    do {

        await delay(1000); //  second
        const response = await fetch(activeUrl);
        const text = await response.text();

        try {
            data = JSON.parse(text);

            if (!data.data) {
                activeUrl = url_en;
                logMissingSet(setSelected, false);
                await delay(2000); //  second
                fr = false;
                continue
                //console.log(data);
            }


            let cards = data.data;

            cards.forEach(card => {
                if (fr) {
                    // console.log(card);
                }
                const number = card.collector_number || "";
                const name_en = card.name || "";
                const name_fr = card.printed_name ? card.printed_name : "";
                const imageUrl = card.image_uris ? card.image_uris.normal : "";
                const link = card.related_uris.gatherer ? card.related_uris.gatherer : generateGathererLink(setSelected.code, number, name_en);

                allCards.push({
                    number,
                    name_en,
                    name_fr,
                    imageUrl,
                    link
                });
            });

            activeUrl = data.has_more ? data.next_page : null;

        } catch (e) {
            console.error(text);
        }
    } while (activeUrl);

    fs.writeFileSync(setPath, JSON.stringify(allCards, null, 2));
    console.log(`${setSelected.code} - Saved ${allCards.length} cards to ${setPath}`);
}

// Dummy function - replace with your actual logic
function generateGathererLink(code, number, name) {
    let safeName = name
        .toLowerCase()
        .replace(/,/g, '')
        .replace(/'/g, '')
        .replace(/\s+/g, '-');

    let safeCode = String(code).toUpperCase();
    return `https://gatherer.wizards.com/${safeCode}/en-us/${number}/${safeName}`;
}

// `=HYPERLINK("${MTGurl}/${safeCode}/en-us/${number}/${safeName}")`;
//https://gatherer.wizards.com/LTR/en-us/1/banish-from-edoras

function logMissingSet(set, fr) {
    let line = '';
    if (!fr) {
        line = line.concat('no fr - ');
    }
    line = line.concat(`${set.code} - ${set.name}\n`);
    console.error(line);
    fs.appendFileSync(missingPath, line, 'utf-8');
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export { importOneSet };
