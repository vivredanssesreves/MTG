import fs from 'fs';
import readline from 'readline';
import { isHeaderLine, parseCSVLine } from './utilities/utilities-csv-parser.js';
import { importChunkForSet, createChunks, processChunkBySets } from './utilities/utilities-chunk.js';
import { normalizeBooleanValue, validateCard } from './utilities/utilities.js';
const pathMyBdd = `../MYBDD/json/`; // My personal cards
const CHUNK_SIZE = 250; // Chunk size for import






/**
 * Parse a CSV file line by line with streaming (Node.js)
 * @param {string} filePath - Path to the CSV file
 * @param {function} onChunk - Callback called for each chunk of valid cards
 * @param {function} onComplete - Callback called at the end with stats
 * @param {function} onError - Callback called on error
 */
async function parseCSVStreaming(filePath, onChunk, onComplete, onError) {
    const stats = {
        totalLines: 0,
        headerDetected: false,
        processed: 0,
        valid: 0,
        errors: []
    };

    let currentChunk = [];
    let lineNumber = 0;
    let headerProcessed = false;

    try {
        const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity // To handle Windows line endings
        });

        for await (const line of rl) {
            lineNumber++;
            stats.totalLines++;

            if (line.trim() === '') continue; // Ignore empty lines

            // Detect header on first non-empty line
            if (!headerProcessed) {
                if (isHeaderLine(line)) {
                    stats.headerDetected = true;
                    headerProcessed = true;
                    continue;
                }
                headerProcessed = true;
            }

            // Ignore headers that can appear in the middle
            if (isHeaderLine(line)) {
                continue;
            }

            stats.processed++;

            const parseResult = parseCSVLine(line, lineNumber);

            if (parseResult.success) {
                try {
                    const validation = validateCard(parseResult.data);

                    currentChunk.push(validation.data);
                    stats.valid++;

                    // If the chunk is full, process it
                    if (currentChunk.length >= CHUNK_SIZE) {
                        try {
                            await onChunk(currentChunk.slice()); // Copy of the chunk
                            currentChunk = []; // Empty the chunk
                        } catch (chunkError) {
                            stats.errors.push(`Error processing chunk line ${lineNumber}: ${chunkError.message}`);
                            onError(chunkError);
                            return;
                        }
                    }
                } catch (error) {
                    stats.errors.push(`Line ${lineNumber}: ${error.message}`);
                }
            } else {
                stats.errors.push(parseResult.error);
            }
        }

        // Process the last chunk if it's not empty
        if (currentChunk.length > 0) {
            try {
                await onChunk(currentChunk);
            } catch (chunkError) {
                stats.errors.push(`Error processing last chunk: ${chunkError.message}`);
                onError(chunkError);
                return;
            }
        }

        onComplete(stats);

    } catch (error) {
        onError(error);
    }
}



/**
 * Import CSV file with streaming (for large files)
 * @param {string} filePath - Path to the CSV file
 * @param {object} options - Options { setFilter: string|null, onProgress: function|null }
 * @returns {Promise<object>} - Import result with statistics
 */
async function importCSVFileStreaming(filePath, options = {}) {
    const { setFilter, onProgress } = options;

    const result = {
        success: true,
        totalLines: 0,
        imported: 0,
        errors: [],
        processedSets: new Set(),
        stats: null
    };

    let totalImported = 0;
    let chunkCount = 0;

    const onChunk = async (cards) => {
        chunkCount++;

        // Filter by set if specified
        let filteredCards = cards;
        if (setFilter) {
            filteredCards = cards.filter(card => card.set === setFilter);
        }

        if (filteredCards.length === 0) return;

        try {
            const setResults = await processChunkBySets(filteredCards);
            const chunkImported = setResults.reduce((sum, r) => sum + r.imported, 0);
            totalImported += chunkImported;

            // Mark processed sets
            setResults.forEach(r => result.processedSets.add(r.setCode));

            if (onProgress) {
                onProgress({
                    chunk: chunkCount,
                    cardsInChunk: filteredCards.length,
                    imported: chunkImported,
                    totalImported: totalImported
                });
            }

        } catch (error) {
            result.success = false;
            result.errors.push(error.message);
        }
    };

    const onComplete = (stats) => {
        result.totalLines = stats.totalLines;
        result.imported = totalImported;
        result.stats = {
            ...stats,
            chunksProcessed: chunkCount,
            setsProcessed: result.processedSets.size
        };
        result.processedSets = Array.from(result.processedSets);
    };

    const onError = (error) => {
        result.success = false;
        result.errors.push(error.message);
    };

    return new Promise((resolve) => {
        parseCSVStreaming(filePath, onChunk,
            (stats) => {
                onComplete(stats);
                resolve(result);
            },
            (error) => {
                onError(error);
                resolve(result);
            }
        );
    });
}

/**
 * Detect current context and get set ID if on a set page
 * @returns {object} - {isSetPage: boolean, setCode: string|null}
 */
function detectContext() {
    const urlParams = new URLSearchParams(window.location.search);
    const setParam = urlParams.get('set');

    return {
        isSetPage: !!setParam,
        setCode: setParam
    };
}

//
// Export functions
export {
    
    parseCSVStreaming, // Streaming function
    importCSVFileStreaming, // Main function for large files
    detectContext
};