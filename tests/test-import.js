import { importCSVFileStreaming } from '../export/fromCSV.js';
import fs from 'fs';
import {

    createTestCSV,
    checkSetFile,
    getCardPossession,
    resetDatabase,
    cleanupTestFiles,
    consoleUpdate,
    verifyInitialState,
    assertCardCountsMatch,
    verifySpecificCards,
    verifyCardPossession,
    verifySampleCards,
    verifyCsvDataIntegrity,
    howManyOfSet
} from './test-utilities.js';
const types = ['normal', 'numbers', 'stress'];
const testSets = ['neo', 'mid', 'vow', 'snc', 'dmu', 'bro'];

// Verify some specific cards
//bro;A-58;false;false

// CSV mal formaté - mauvais nombre de colonnes
// Headers manquants - pas de ligne d'en-tête
// Encodage invalide - caractères bizarres
// Sets inexistants - codes de sets qui n'existent pas
// Numéros de cartes invalides - formats bizarres
// Fichier vide - CSV complètement vide
// Lignes partiellement vides - certaines colonnes manquantes
// Valeurs extrêmes - nombres énormes, chaînes très longues

// Streaming test
async function testStreaming() {
    const testFile = './test-big-collection.csv';
    const lineNumber = 2500;

    console.log('\n\n================================\n=== Streaming CSV Test ===\n');

    resetDatabase();
    const initialState = verifyInitialState(testSets);
    createTestCSV(testFile, lineNumber, types[0]);
    verifyCsvDataIntegrity(testFile, false);

    let totalChunks = 0;
    let totalCards = 0;

    const startTime = Date.now();

    try {
        const result = await importCSVFileStreaming(testFile, {
            onProgress: (progress) => {
                totalChunks = progress.chunk;
                totalCards = progress.totalImported;
            }
        });

        const endTime = Date.now();
        const duration = endTime - startTime;

        consoleUpdate(result, duration, totalChunks);

        assertCardCountsMatch(lineNumber);
        await verifySampleCards(testFile, 10, lineNumber, null);


        if (result.stats.errors.length > 0) {
            console.log(`⚠️  Non-blocking errors: ${result.stats.errors.length}`);
            result.stats.errors.slice(0, 5).forEach(error => console.log(`   - ${error}`));
            if (result.stats.errors.length > 5) {
                console.log(`   ... and ${result.stats.errors.length - 5} other errors`);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }

    // Cleanup
    cleanupTestFiles([testFile]);
    resetDatabase();


}

// Test with set filtering
async function testSetFilter() {
    const testFile = './test-filtered-collection.csv';
    const setCode = 'neo';
    const lineNumber = 500;

    console.log('\n\n================================\n=== Set filtering test ===\n');

    resetDatabase();
    const initialState = verifyInitialState(testSets);
    createTestCSV(testFile, lineNumber, types[0]);
    verifyCsvDataIntegrity(testFile, false);
    const setCardCount = howManyOfSet(testFile, setCode);

    try {
        const result = await importCSVFileStreaming(testFile, {
            setFilter: setCode,
            onProgress: (progress) => { }
        });

        console.log(`✅ ${setCode} import: ${result.imported} cards out of ${result.totalLines} lines`);

    } catch (error) {
        console.error('❌ Error:', error);
    }

    assertCardCountsMatch(setCardCount);
    await verifySampleCards(testFile, 25, lineNumber, setCode);

    cleanupTestFiles([testFile]);
    resetDatabase();
}

// Test data updates (reimport)
async function testDataUpdate() {
    const testFile1 = './test-initial-import.csv';
    const testFile2 = './test-update-import.csv';

    console.log('\n\n================================\n=== Data update test ===\n');

    resetDatabase();

    // 1. Initial import with specific cards
    console.log('📦 Initial import...');
    const initialCards = [
        { set: 'neo', number: '001', no_foil: 1, foil: 0 },    // Has non-foil only
        { set: 'neo', number: '042', no_foil: 0, foil: 1 },    // Has foil only
        { set: 'mid', number: '125', no_foil: 1, foil: 0 },    // Has non-foil only
        { set: 'bro', number: '089', no_foil: 0, foil: 1 }     // Has foil only
    ];

    createTestCSV(testFile1, 10, types[0]);

    try {
        const result1 = await importCSVFileStreaming(testFile1);
        console.log(`✅ Initial import: ${result1.imported} cards`);

        // Check initial quantities
        console.log('\n🔍 Possessions after initial import:');
        initialCards.forEach(card => {
            const possession = getCardPossession(card.set, card.number);
            if (possession) {
                const noFoilText = possession.no_foil ? 'YES' : 'NO';
                const foilText = possession.foil ? 'YES' : 'NO';
                console.log(`   ${card.set}/${card.number}: non-foil: ${noFoilText}, foil: ${foilText}`);
            }
        });

        // 2. Update import (same cards, different/added finishes)
        console.log('\n🔄 Update import...');

        createTestCSV(testFile2, 10, types[0]);

        const result2 = await importCSVFileStreaming(testFile2);
        console.log(`✅ Update import: ${result2.imported} cards`);

    } catch (error) {
        console.error('❌ Error:', error);
    }

    cleanupTestFiles([testFile1, testFile2]);
    resetDatabase();
}


// Vérifier que certaines erreurs sont bien détectées - assert qu'il y a au moins X erreurs
// Vérifier les types d'erreurs - assert que certains types d'erreurs spécifiques sont présents
// Vérifier que l'import ne plante pas - assert que ça termine sans exception fatale
// Vérifier que les bonnes cartes sont importées - assert que seules les cartes valides sont ajoutées
// Vérifier les stats - assert sur le nombre de lignes traitées vs importées
async function testBadCSVFormats() {
    const stressFile = './test-stress.csv';
    const lineNumber = 200;

    console.log('\n\n================================\n📋 Test: Stress CSV (weird values)');

    try {
        resetDatabase();
        createTestCSV(stressFile, lineNumber, types[2]);
        verifyCsvDataIntegrity(stressFile, true);

        const result = await importCSVFileStreaming(stressFile, {
            onProgress: (progress) => {
                console.log(`   Stress - Chunk ${progress.chunk}: ${progress.imported} cards`);
            }
        });

        result.stats.errors.forEach(error => console.log(`   - ${error}`));
        
        console.log(`✅ Stress import: ${result.imported} cards imported out of ${result.totalLines} lines`);

        // Assert: We should have errors with stress data
        if (result.stats.errors.length === 0) {
            throw new Error('Expected errors with stress CSV, but got none');
        }

        // Assert: Import should complete successfully despite errors
        if (!result.success) {
            throw new Error('Import should complete successfully even with stress data errors');
        }
        
        
        // Assert: Should have processed all lines
        if (result.totalLines !== lineNumber +1 ) {
            throw new Error(`Expected ${lineNumber} lines to be processed, but got ${result.totalLines}`);
        }

        assertCardCountsMatch(result.imported);
        await verifySampleCards(stressFile, 25, lineNumber, null);
        
        console.log(`✅ Stress import completed successfully: processed ${result.totalLines} lines`);

        
    } catch (error) {
        console.error('❌ Stress CSV error:', error.message);
    }

    cleanupTestFiles([stressFile]);
    resetDatabase();
}

// Run tests
(async () => {
    try {
        await testStreaming();
        await testSetFilter();
        //await testDataUpdate();
        await testBadCSVFormats();
        console.log('\n\n================================================================\n\n\n========\n========\n========\n✅ All tests completed');
    } catch (error) {
        console.error('❌ Error in tests:', error);
    }
})();


