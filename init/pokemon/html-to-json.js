import fs from "fs";

function sanitize(text) {
    return text.replace(/\s+/g, " ").trim();
}

function extractCardType(text) {
    const cardTypes = ["Holo", "Reverse", "GX", "EX", "V", "VMAX", "VSTAR", "Tag Team", "Prime", "BREAK", "Level X", "Master Ball"];
    const foundTypes = [];
    const normalizedText = text.toLowerCase();

    for (const type of cardTypes) {
        if (normalizedText.includes(type.toLowerCase())) {
            foundTypes.push(type);
        }
    }

    return foundTypes;
}

function extractYear(text) {
    // Look for 4 digits between parentheses only
    const yearMatch = text.match(/\((\d{4})\)/);
    if (yearMatch) {
        const year = parseInt(yearMatch[1]);
        // Validation: Pokémon exists since 1996
        if (year >= 1996 && year <= 2025) {
            return year;
        }
    }
    return null;
}

function extractLanguage(html) {
    if (html.includes('class="en"') || html.includes('data-original-title="en"')) return "en";
    if (html.includes('class="fr"') || html.includes('data-original-title="fr"')) return "fr";
    return null;
}

function parseCard(cardHtml) {
    // Ignore cards with NoCard
    if (cardHtml.includes('href="NoCard"')) {
        return null;
    }

    // Extract image and name from alt
    const imageMatch = cardHtml.match(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"/s);
    if (!imageMatch) return null;

    const imageUrl = imageMatch[1];
    const name = sanitize(imageMatch[2].replace(/&amp;/g, '&'));

    // Extract language
    const lang = extractLanguage(cardHtml);

    // Split content into lines to extract set and ref
    const lines = cardHtml.split('\n').map(line => sanitize(line)).filter(line => line);

    let set = "Unknown";
    let ref = "";
    let year = null;

    // Look for reference (line containing "Ref.")
    let refFound = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith("Ref.")) {
            // Ref on one line: "Ref. 13/30"
            ref = line.replace("Ref.", "").trim();
            // Set is probably the previous line
            if (i > 0) {
                set = lines[i - 1];
            }
            refFound = true;
            break;
        } else if (line === "Ref.") {
            // Ref on two lines: "Ref." then "13/30"
            if (i + 1 < lines.length) {
                ref = lines[i + 1];
                // Set is probably 2 lines before
                if (i > 1) {
                    set = lines[i - 2];
                }
            }
            refFound = true;
            break;
        }
    }

    // If no reference found, try to extract set from remaining text
    if (!refFound) {
        // Skip image-related lines, language lines, and common card names
        const filteredLines = lines.filter(line => {
            return line !== "" && 
                   !line.includes("class=") && 
                   !line.includes("Vaporeon") && 
                   !line.includes("Aquali") && 
                   !line.includes("Eevee") && 
                   !line.includes("Evoli") &&
                   !line.match(/^\d{4}$/) && // Skip standalone years
                   !line.match(/^\(\d{4}\)$/) && // Skip years in parentheses
                   !["GX", "EX", "V", "VMAX", "Holo", "Reverse", "Master Ball"].includes(line);
        });

        if (filteredLines.length > 0) {
            set = filteredLines[filteredLines.length - 1]; // Take the last meaningful line as set
        }
        ref = ""; // No reference for these cards
    }

    // Look for year in all text
    const fullText = cardHtml.replace(/<[^>]*>/g, ' ');
    year = extractYear(fullText);

    // Extract card types from name and text
    const cardTypes = extractCardType(name + " " + fullText);

    return {
        name,
        set,
        ref,
        image: imageUrl,
        lang,
        year,
        cardType: cardTypes.length > 0 ? cardTypes : ["normal"]
    };
}

function parseNoCard(cardHtml) {
    // Only process cards with NoCard
    if (!cardHtml.includes('href="NoCard"')) {
        return null;
    }

    // Extract image and name from alt
    const imageMatch = cardHtml.match(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"/s);
    if (!imageMatch) return null;

    const imageUrl = imageMatch[1];
    const name = sanitize(imageMatch[2].replace(/&amp;/g, '&'));

    // Extract language
    const lang = extractLanguage(cardHtml);

    // Split content into lines to extract set and ref
    const lines = cardHtml.split('\n').map(line => sanitize(line)).filter(line => line);

    let set = "Unknown";
    let ref = "";
    let year = null;

    // Look for reference (line containing "Ref.")
    let refFound = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith("Ref.")) {
            // Ref on one line: "Ref. 13/30"
            ref = line.replace("Ref.", "").trim();
            // Set is probably the previous line
            if (i > 0) {
                set = lines[i - 1];
            }
            refFound = true;
            break;
        } else if (line === "Ref.") {
            // Ref on two lines: "Ref." then "13/30"
            if (i + 1 < lines.length) {
                ref = lines[i + 1];
                // Set is probably 2 lines before
                if (i > 1) {
                    set = lines[i - 2];
                }
            }
            refFound = true;
            break;
        }
    }

    // If no reference found, try to extract set from remaining text
    if (!refFound) {
        // Skip image-related lines, language lines, and common card names
        const filteredLines = lines.filter(line => {
            return line !== "" && 
                   !line.includes("class=") && 
                   !line.includes("Vaporeon") && 
                   !line.includes("Aquali") && 
                   !line.includes("Eevee") && 
                   !line.includes("Evoli") &&
                   !line.match(/^\d{4}$/) && // Skip standalone years
                   !line.match(/^\(\d{4}\)$/) && // Skip years in parentheses
                   !["GX", "EX", "V", "VMAX", "Holo", "Reverse", "Master Ball"].includes(line);
        });

        if (filteredLines.length > 0) {
            set = filteredLines[filteredLines.length - 1]; // Take the last meaningful line as set
        }
        ref = ""; // No reference for these cards
    }

    // Look for year in all text
    const fullText = cardHtml.replace(/<[^>]*>/g, ' ');
    year = extractYear(fullText);

    // Determine item type based on set name
    let itemType = ["item"];
    if (set.includes("Action Figures")) itemType = ["figurine"];
    else if (set.includes("Mega Construx")) itemType = ["construction"];
    else if (set.includes("Nanoblock")) itemType = ["construction"];
    else if (set.includes("LOZ iBlock")) itemType = ["construction"];

    return {
        name,
        set,
        ref,
        image: imageUrl,
        lang,
        year,
        cardType: itemType
    };
}

function processHtmlFile(filePath) {
    try {
        const html = fs.readFileSync(filePath, 'utf8');
        console.log(`✅ Processing ${filePath}`);

        // Extract each <li>...</li>
        const cardMatches = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)];
        const cards = [];
        const noCards = [];

        for (const match of cardMatches) {
            const cardHtml = match[1];
            
            const card = parseCard(cardHtml);
            const noCard = parseNoCard(cardHtml);

            if (card) {
                cards.push(card);
            } else if (noCard) {
                noCards.push(noCard);
            }
        }

        console.log(`   → ${cards.length} cards extracted`);
        console.log(`   → ${noCards.length} no-cards extracted`);
        return { cards, noCards };

    } catch (error) {
        console.log(`❌ Error reading ${filePath}: ${error.message}`);
        return { cards: [], noCards: [] };
    }
}

function convertHtmlToJson(pokemonName) {
    console.log(`🔄 Converting HTML → JSON for: ${pokemonName}`);

    const folderPath = `pages/${pokemonName}`;

    if (!fs.existsSync(folderPath)) {
        console.log(`❌ Folder ${folderPath} not found`);
        return;
    }

    const htmlFiles = fs.readdirSync(folderPath)
        .filter(file => file.endsWith('.html'))
        .sort();

    if (htmlFiles.length === 0) {
        console.log("❌ No HTML files found");
        return;
    }

    console.log(`📁 ${htmlFiles.length} HTML files found`);

    const allCards = [];
    const allNoCards = [];

    // Process each HTML file
    for (const fileName of htmlFiles) {
        const filePath = `${folderPath}/${fileName}`;
        const result = processHtmlFile(filePath);
        allCards.push(...result.cards);
        allNoCards.push(...result.noCards);
    }

    console.log(`\n📊 Total: ${allCards.length} cards extracted`);
    console.log(`📊 Total: ${allNoCards.length} no-cards extracted`);

    // Create output folder if not exists
    if (!fs.existsSync("../../bdd/pokemon")) {
        fs.mkdirSync("../../bdd/pokemon", { recursive: true });
    }

    // Save cards as JSON
    const outputFile = `../../bdd/pokemon/${pokemonName}.json`;
    fs.writeFileSync(outputFile, JSON.stringify(allCards, null, 2));
    console.log(`✅ JSON generated: ${outputFile}`);

    // Save no-cards as JSON
    const noCardOutputFile = `../../bdd/pokemon/${pokemonName}-nocard.json`;
    fs.writeFileSync(noCardOutputFile, JSON.stringify(allNoCards, null, 2));
    console.log(`✅ JSON generated: ${noCardOutputFile}`);

}

async function main() {
    const pokemonName = "eevee"; // Change this to the desired Pokémon name
    convertHtmlToJson(pokemonName);
}

main();
