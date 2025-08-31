/**
 * CSV Size Calculator
 * 
 * Script to calculate the exact maximum size of a CSV file containing
 * all MTG cards in the format: set;numCarte;boolean;boolean
 */

// 📈 Nombre exact de cartes : 103,126 cartes
// 📁 Taille EXACTE : 1.99 MB (2,039 KB / 2,087,780 bytes)
// 📏 Format utilisé : setcode;001;false;false (pire cas avec "false" au lieu de "true")

const fs = require('fs');
const path = require('path');

// Load sets.json from parent directory
const setsPath = path.join(__dirname, '..', 'bdd', 'sets.json');
const sets = JSON.parse(fs.readFileSync(setsPath, 'utf8'));

let totalCards = 0;
let totalSizeBytes = 0;

console.log('🃏 MTG CSV Size Calculator');
console.log('==========================');
console.log('Calculating EXACT maximum CSV size...');
console.log('Format: set;numCarte;boolean;boolean');
console.log('');

// For each set, calculate exact size
sets.forEach(set => {
  if (set.cards_count > 0) {
    // For each card in this set
    for (let cardNum = 1; cardNum <= set.cards_count; cardNum++) {
      // Format: setcode;001;false;false\n (worst case = longest)
      // Using actual set code length and worst case booleans
      const setCode = set.code;
      const cardNumber = String(cardNum).padStart(3, '0'); // '001', '002', etc
      const boolean1 = 'false'; // 5 chars (longer than 'true')
      const boolean2 = 'false'; // 5 chars (longer than 'true')
      
      // Exact line: 'setcode;001;false;false\n'
      const line = setCode + ';' + cardNumber + ';' + boolean1 + ';' + boolean2 + '\n';
      totalSizeBytes += line.length;
      totalCards++;
    }
  }
});

// Calculate different units
const totalSizeMB = totalSizeBytes / (1024 * 1024);
const totalSizeKB = totalSizeBytes / 1024;

console.log('📊 EXACT Statistics:');
console.log('Total sets with cards:', sets.filter(s => s.cards_count > 0).length);
console.log('Total cards:', totalCards.toLocaleString());
console.log('Total size EXACT:', totalSizeBytes.toLocaleString(), 'bytes');
console.log('Total size EXACT:', Math.round(totalSizeKB).toLocaleString(), 'KB');
console.log('Total size EXACT:', Math.round(totalSizeMB * 100) / 100, 'MB');
console.log('');

// Show example lines to verify calculation
console.log('📝 Example lines (with byte count):');
let exampleCount = 0;
sets.forEach(set => {
  if (set.cards_count > 0 && exampleCount < 5) {
    const setCode = set.code;
    const line = setCode + ';001;false;false';
    console.log(`"${line}" = ${line.length + 1} bytes (with newline)`);
    exampleCount++;
  }
});

console.log('');

// Show biggest sets for context
const bigSets = sets
  .filter(s => s.cards_count > 0)
  .sort((a, b) => b.cards_count - a.cards_count)
  .slice(0, 5);

console.log('🏆 Top 5 biggest sets:');
bigSets.forEach((set, index) => {
  const sizeForThisSet = set.cards_count * (set.code.length + 1 + 3 + 1 + 5 + 1 + 5 + 1); // approx
  console.log(`${index + 1}. ${set.code}: ${set.name} - ${set.cards_count.toLocaleString()} cards (~${Math.round(sizeForThisSet / 1024)} KB)`);
});

console.log('');
console.log('💡 Conclusion:');
console.log(`Maximum CSV file size would be ${Math.round(totalSizeMB * 100) / 100} MB`);
console.log('This is very reasonable for browser upload/download!');

module.exports = {
  totalCards,
  totalSizeBytes,
  totalSizeKB: Math.round(totalSizeKB),
  totalSizeMB: Math.round(totalSizeMB * 100) / 100
};
