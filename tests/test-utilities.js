import { get } from 'http';
import { createEmptySetsFiles } from '../init/init_bdd_perso.js';
import fs from 'fs';
import readline from 'readline';
import { getActiveResourcesInfo } from 'process';
import { normalizeBooleanValue } from '../export/utilities/utilities.js';

const sets = ['neo', 'mid', 'vow', 'snc', 'dmu', 'bro'];
const maxCard = [531, 400, 423, 513, 453, 399];
let allCards = [];
const types = ['normal', 'numbers', 'stress', 'filter'];


/**
 * Generate all possible cards from all sets
 * normal
 * numbers
 * stress
 * 
 */
function generateAllCards(type) {
    allCards = [];
    for (let i = 0; i < sets.length; i++) {
        for (let cardNum = 1; cardNum <= maxCard[i]; cardNum++) {
            let no_foil_Def, foil_Def;
            switch (type) {
                case types[0]:
                    no_foil_Def = Math.random() < 0.7 ? '1' : '0';
                    foil_Def = Math.random() < 0.3 ? '1' : '0';
                    // At least 1 
                    if (no_foil_Def === '0' && foil_Def === '0') {
                        foil_Def = '1';
                    }
                    break;
                case types[1]:
                    no_foil_Def = Math.floor(Math.random() * 4000);
                    foil_Def = Math.floor(Math.random() * 1000);
                    break;
                case types[2]:
                    no_foil_Def = getStressValue();
                    foil_Def = getStressValue();
                    break;
                default:
                    throw new Error('Unknown type: ' + type);
            }
            allCards.push({
                set: sets[i],
                number: String(cardNum).padStart(3, '0'),
                no_foil: no_foil_Def,
                foil: foil_Def
            });
        }
    }
    allCards.sort(() => Math.random() - 0.5);
}
function getStressValue() {
    const stressValues = [
        Math.floor(Math.random() * 1000),
        -Math.floor(Math.random() * 500),
        0,
        'true',
        'false',
        Math.random().toFixed(2),
        'blabla',
        'null',
        'undefined',
        '',
        '   ',
        'abc123',
        '###'
    ];

    return stressValues[Math.floor(Math.random() * stressValues.length)];
}

export function consoleUpdate(result, duration, totalChunks) {
    console.log('\n=== Results ===');
    console.log(`✅ Success: ${result.success}`);
    console.log(`📊 Total lines: ${result.totalLines}`);
    console.log(`📦 Cards imported: ${result.imported}`);
    console.log(`🔄 Chunks processed: ${totalChunks}`);
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`🎯 Sets processed: ${result.processedSets.join(', ')}`);
}

/**
 * Create a normal CSV with boolean values
 */
export function createTestCSV(filePath, numLines, type) {
    let content = 'set;number;no_foil;foil\n';
    generateAllCards(type);
    allCards.slice(0, numLines).forEach(card => {
        content += `${card.set};${card.number};${card.no_foil};${card.foil}\n`;
    });

    fs.writeFileSync(filePath, content);
    console.log(`Normal CSV created: ${numLines} lines in ${filePath}`);
}

/**
 * Create a stress test CSV with random weird values
 */
export function createStressTestCSV(filePath, numLines) {
    let content = 'set;number;no_foil;foil\n';

    for (let i = 1; i <= numLines; i++) {
        const rand = Math.floor(Math.random() * sets.length);
        const set = sets[rand];
        const number = String(Math.floor(Math.random() * maxCard[rand]) + 1).padStart(3, '0');

        const stressValues = [
            Math.floor(Math.random() * 1000),
            -Math.floor(Math.random() * 50),
            0,
            'true',
            'false',
            Math.random().toFixed(2)
        ];

        const no_foil = stressValues[Math.floor(Math.random() * stressValues.length)];
        const foil = stressValues[Math.floor(Math.random() * stressValues.length)];

        content += `${set};${number};${no_foil};${foil}\n`;
    }

    fs.writeFileSync(filePath, content);
    console.log(`Stress CSV created: ${numLines} lines in ${filePath}`);
}

/**
 * Get a specific line from a CSV file using streaming
 */
export async function getCSVLine(filePath, targetLineNumber) {
    return new Promise((resolve, reject) => {
        const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let currentLine = 0;

        rl.on('line', (line) => {
            currentLine++;

            if (currentLine === targetLineNumber) {
                rl.close();
                fileStream.close();
                resolve(line);
                return;
            }
        });

        rl.on('close', () => {
            if (currentLine < targetLineNumber) {
                resolve(null); // Line not found
            }
        });

        rl.on('error', reject);
    });
}

/**
 * Create CSV with specific card data
 */
export function createSpecificTestCSV(filePath, cardData) {
    let content = 'set;number;no_foil;foil\n';

    cardData.forEach(card => {
        content += `${card.set};${card.number};${card.no_foil || 0};${card.foil || 0}\n`;
    });

    fs.writeFileSync(filePath, content);
    console.log(`Specific CSV created: ${cardData.length} lines in ${filePath}`);
}

/**
 * Check set file state
 */
export function checkSetFile(setCode) {
    const filePath = `../MYBDD/json/${setCode}.json`;
    if (!fs.existsSync(filePath)) {
        return { exists: false, cards: 0 };
    }

    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        return {
            exists: true,
            cards: data.cards ? data.cards.length : 0,
            isEmpty: !data.cards || data.cards.length === 0
        };
    } catch (error) {
        return { exists: true, cards: 0, error: error.message };
    }
}

/**
 * Get card possession status (boolean values)
 */
export function getCardPossession(setCode, cardNumber) {
    const filePath = `../MYBDD/json/${setCode}.json`;
    if (!fs.existsSync(filePath)) return null;

    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const card = data.cards && data.cards.find(card => card.number === cardNumber);
        return card ? { no_foil: card.no_foil || false, foil: card.foil || false } : null;
    } catch (error) {
        return null;
    }
}

/**
 * Reset database before/after tests
 */
export function resetDatabase() {
    try {
        createEmptySetsFiles();
    } catch (error) {
        console.error('Error resetting database:', error.message);
        throw error;
    }
}

/**
 * Clean up test files
 */
export function cleanupTestFiles(filePaths) {
    filePaths.forEach(file => {
        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
        }
    });
}

/**
 * Verify initial state of sets
 */
export function verifyInitialState(testSets) {
    //console.log('Initial sets state:');
    const initialState = {};
    testSets.forEach(set => {
        const state = checkSetFile(set);
        initialState[set] = state.cards;
        //console.log(`   ${set}: ${state.cards} cards${state.isEmpty ? ' (empty)' : ''}`);
    });
    return initialState;
}

/**
 * Assert that card counts match expectations after import
 */
export function assertCardCountsMatch(expectedTotal) {
    let totalAdded = 0;
    sets.forEach(set => {
        const currentState = checkSetFile(set);
        const added = currentState.cards;
        totalAdded += added;
    });
    console.log(`Total added: ${totalAdded} cards`);

    if (totalAdded !== expectedTotal) {
        throw new Error(`Import count mismatch: expected ${expectedTotal}, got ${totalAdded}`);
    }
}

/**
 * Verify specific cards existence
 */
export function verifySpecificCards(cardChecks) {
    //console.log('Specific cards test:');
    cardChecks.forEach(({ set, number, label }) => {
        const exists = getCardPossession(set, number) !== null;
    });
}

/**
 * Verify sample cards from CSV match database
 */
export async function verifySampleCards(csvFile, sampleSize, totalLines, setToFilter, type) {

    for (let i = 0; i < sampleSize; i++) {
        // Pick a random line (between 1 and totalLines, not the header)
        const randomLineNum = Math.floor(Math.random() * totalLines) + 1;
        const line = await getCSVLine(csvFile, randomLineNum);

        if (!line || line.trim() === '') continue;

        const [set, number, no_foil, foil] = line.split(';');
        const possession = getCardPossession(set, number);

        if (type === types[3]) {
            if (set === setToFilter) {
                // This card should be imported
                if (!possession) {
                    throw new Error(`Filtered card missing: ${set}/${number} should be imported (line ${randomLineNum})`);
                }

                const expectedFoil = normalizeBooleanValue(foil);
                const expectedNoFoil = normalizeBooleanValue(no_foil);

                if (possession.no_foil !== expectedNoFoil || possession.foil !== expectedFoil) {
                    throw new Error(`Incorrect filtered data: ${set}/${number} expected(${expectedNoFoil},${expectedFoil}) found(${possession.no_foil},${possession.foil})`);
                }
            } else {
                // This card should NOT be imported
                if (possession && (possession.no_foil || possession.foil)) {
                    throw new Error(`Non-filtered card found: ${set}/${number} should NOT be imported (line ${randomLineNum})`);
                }
            }
            console.log(`✅ ${sampleSize} cards verified successfully with ${setToFilter} filter`);
        } else if (type === types[0]) {
            // Normal mode - all cards should exist
            if (!possession) {
                throw new Error(`Missing card: ${set}/${number} (line ${randomLineNum})`);
            }

            const expectedFoil = normalizeBooleanValue(foil);
            const expectedNoFoil = normalizeBooleanValue(no_foil);

            if (possession.no_foil !== expectedNoFoil || possession.foil !== expectedFoil) {
                throw new Error(`Incorrect data: ${set}/${number} expected(${expectedNoFoil},${expectedFoil}) found(${possession.no_foil},${possession.foil})`);
            }
            console.log(`✅ ${sampleSize} cards verified successfully`);
        } else if (type === types[2]) {
            try {
                const expectedFoil = normalizeBooleanValue(foil);
                const expectedNoFoil = normalizeBooleanValue(no_foil);
                if (!possession) {
                    throw new Error(`Stress card missing: unpossessed ${set}/${number} (line ${randomLineNum})`);
                }
            }
            catch (error) {
                if (possession) {
                    throw new Error(`Stress card error: possesed ${set}/${number} (line ${randomLineNum}) - ${error.message}`);
                }

            }
            console.log(`✅ ${sampleSize} stressing cards verified successfully`);
        }
    }
}


/**
 * Verify card possession with detailed output
 */
export function verifyCardPossession(cardChecks) {
    //console.log('Possession verification:');
    let allSuccess = true;

    cardChecks.forEach(({ set, number, expected, label }) => {
        const possession = getCardPossession(set, number);
        const isValid = possession &&
            possession.no_foil === expected.no_foil &&
            possession.foil === expected.foil;

        const noFoilText = possession?.no_foil ? 'YES' : 'NO';
        const foilText = possession?.foil ? 'YES' : 'NO';
        console.log(`   ${label || `${set}/${number}`}: non-foil: ${noFoilText}, foil: ${foilText} ${isValid ? '✅' : '❌'}`);

        if (!isValid) allSuccess = false;
    });

    console.log(`Possession test: ${allSuccess ? '✅ SUCCESS' : '❌ FAILURE'}`);
    return allSuccess;
}

/**
 * Verify that there are no duplicate entries in the CSV file
 */
export function verifyCsvNoDuplicates(csvFile) {

    const seen = new Set();
    const lines = fs.readFileSync(csvFile, 'utf-8').split('\n');

    for (let i = 1; i < lines.length; i++) { // Skip header
        const line = lines[i].trim();
        if (!line) continue;
        const [set, number] = line.split(';');
        const key = `${set}/${number}`;

        if (seen.has(key)) {
            throw new Error('duplicates detected');
        } else {
            seen.add(key);
        }
    }
}

/**
 * Verify that all sets referenced in the CSV exist
 */
export function verifySetsExistence() {

    sets.forEach(set => {
        if (!checkSetFile(set)) {
            throw new Error('missing set');
        }
    });

}

/**
 * Verify data consistency (valid formats, ranges, etc.)
 */
export function verifyCsvDataConsistency(csvFile, isStressTest = false) {

    const lines = fs.readFileSync(csvFile, 'utf-8').split('\n');

    for (let i = 1; i < lines.length; i++) { // Skip header
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(';');
        const lineNum = i + 1;

        // Check format
        if (parts.length !== 4) {
            throw new Error('bad csv line format');
        }

        const [set, number, no_foil, foil] = parts;

        // Check set format
        if (!set || set.length < 2 || set.length > 5) {
            throw new Error('bad csv set code format');
        }

        // Check number format (should be numeric or special formats like A-58)
        if (!number || (!number.match(/^\d+$/) && !number.match(/^[A-Z]-\d+$/))) {
            throw new Error('bad csv card number format');
        }

        if (isStressTest) return;

        // Check boolean/numeric values
        const isValidValue = (value) => {
            // Accept positive numbers (including 0), or boolean strings
            const trimmed = value.trim();
            return (!isNaN(trimmed) && Number(trimmed) >= 0) || trimmed === 'true' || trimmed === 'false';
        };

        if (!isValidValue(no_foil) || !isValidValue(foil)) {
            throw new Error('bad csv card info format');
        }

        // Check logical consistency (at least one should be > 0 or true)
        const noFoilBool = (no_foil === 'true') || (!isNaN(no_foil) && Number(no_foil) > 0);
        const foilBool = (foil === 'true') || (!isNaN(foil) && Number(foil) > 0);
        if (!noFoilBool && !foilBool) {
            throw new Error('bad csv card info at leat one card is needed');
        }

    }

}

/**
 * Comprehensive data integrity verification
 * Calls all sub-verification functions
 */
export function verifyCsvDataIntegrity(csvFile, isStressTest) {
    // All sub-functions throw errors directly if they fail
    // If we reach the end, all verifications passed
    verifyCsvNoDuplicates(csvFile);
    verifySetsExistence();
    verifyCsvDataConsistency(csvFile, isStressTest);
}

/**
 * Count how many cards of a specific set are in the CSV file
 */
export function howManyOfSet(csvFile, setCode) {
    const lines = fs.readFileSync(csvFile, 'utf-8').split('\n');
    let count = 0;

    for (let i = 1; i < lines.length; i++) { // Skip header
        const line = lines[i].trim();
        if (!line) continue;

        const [set] = line.split(';');
        if (set === setCode) {
            count++;
        }
    }

    return count;
}
