import fs from "fs";

function sanitize(text) {
  return text.replace(/\s+/g, " ").trim();
}

function scanPokemonFolder(pokemonName) {
  const folderPath = `pages/${pokemonName}`;
  
  if (!fs.existsSync(folderPath)) {
    console.log(`❌ Dossier ${folderPath} non trouvé`);
    return [];
  }
  
  const files = fs.readdirSync(folderPath)
    .filter(file => file.endsWith('.html'))
    .sort();
  
  console.log(`📁 Dossier ${folderPath} : ${files.length} fichiers HTML trouvés`);
  return files.map(file => `${folderPath}/${file}`);
}

function readHtmlFile(filePath) {
  try {
    const html = fs.readFileSync(filePath, 'utf8');
    console.log(`✅ Fichier ${filePath} lu`);
    return html;
  } catch (error) {
    console.log(`❌ Erreur lecture ${filePath}: ${error.message}`);
    return '';
  }
}

function parseCards(html) {
  const cards = [];

  // Nouvelle regex basée sur la structure réelle de Coleka
  const cardMatches = [...html.matchAll(/<li class="col-md-4 col-xs-6 col-lg-3">([\s\S]*?)<\/li>/g)];

  for (const match of cardMatches) {
    const cardHtml = match[1];

    // Extraction du nom depuis le span class="t"
    const nameMatch = cardHtml.match(/<span class="t">.*?>(.*?)<\/span>/);
    const name = nameMatch ? sanitize(nameMatch[1]) : "Eevee";

    // Extraction du set depuis le span class="st"
    const setMatch = cardHtml.match(/<span class="st">(.*?)<\/span>/);
    const setName = setMatch ? sanitize(setMatch[1]) : "Unknown";

    // Extraction du numéro depuis span class="ref"
    const numberMatch = cardHtml.match(/<span class="ref">Ref\.\s*(\d+\/\d+)<\/span>/);
    const number = numberMatch ? numberMatch[1] : "0";

    // Extraction de l'année
    const yearMatch = cardHtml.match(/<span class="an">\((\d{4})\)<\/span>/);
    const releaseDate = yearMatch ? `${yearMatch[1]}-01-01` : null;

    // Extraction de l'image
    const imageMatch = cardHtml.match(/<img src="(.*?)" alt=/);
    const imageUrl = imageMatch ? imageMatch[1] : null;

    const setId = setName.toLowerCase().replace(/\s+/g, "-");

    cards.push({
      name,
      set: {
        id: setId,
        name: setName,
      },
      releaseDate,
      number,
      images: {
        small: imageUrl,
        large: imageUrl
      }
    });
  }

  return cards;
}

function processPokemon(pokemonName) {
  console.log(`🔍 Scanning pour : ${pokemonName}`);
  
  const allCards = [];
  const htmlFiles = scanPokemonFolder(pokemonName);
  
  if (htmlFiles.length === 0) {
    console.log("❌ Aucun fichier HTML trouvé");
    return;
  }
  
  // Traiter chaque fichier HTML
  for (const filePath of htmlFiles) {
    const html = readHtmlFile(filePath);
    if (html) {
      const cards = parseCards(html);
      const fileName = filePath.split('/').pop();
      console.log(`   → ${cards.length} cartes trouvées dans ${fileName}`);
      allCards.push(...cards);
    }
  }

  console.log(`\n📊 Total : ${allCards.length} cartes récupérées`);

  // Trier par date
  allCards.sort((a, b) => {
    if (!a.releaseDate) return 1;
    if (!b.releaseDate) return -1;
    return new Date(a.releaseDate) - new Date(b.releaseDate);
  });

  // Créer le dossier test s'il n'existe pas
  if (!fs.existsSync("test")) {
    fs.mkdirSync("test");
  }

  const outputFile = `test/${pokemonName}_cards_clean.json`;
  fs.writeFileSync(outputFile, JSON.stringify(allCards, null, 2));
  console.log(`✅ JSON généré : ${outputFile} avec ${allCards.length} cartes`);
}

async function main() {
  const pokemonName = "eevee";
  processPokemon(pokemonName);
}

main();
