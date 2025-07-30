// backEnd/server.js
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const pathMyCards = '../MYBDD/myCards.json';
const app = express();
const PORT = 3000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webPath = path.join(__dirname, '..', 'web');
const bddPath = path.join(__dirname, '..', 'bdd');
const backEndPath = path.join(__dirname, '..', 'backEnd');
const myBddPath = path.join(__dirname, '..', 'MYBDD');
const frontEndPath = path.join(__dirname, '..', 'frontEnd');

app.use(express.static(webPath));       // Frontend (HTML/JS/CSS)
app.use(express.json());  

app.use('/bdd', express.static(bddPath)); // JSON files
app.use('/backEnd', express.static(backEndPath)); // back end path
app.use('/MYBDD', express.static(myBddPath)); // my json path
app.use('/frontEnd', express.static(frontEndPath)); // my json path


app.post('/editMyBDD', (request, response) => {
  
  let info = request.body;
  updateCard(info.code, info.cardNum, info.isActive, info.isFoil);
  response.json({ success: true });
});


app.listen(PORT, () => {
  console.log(`✅ Server running: http://localhost:${PORT}`);
});

function updateCard(setCode, cardNumber, active, isFoil) {
  const data = fs.readFileSync(pathMyCards, 'utf-8');
  const collection = JSON.parse(data);
  const set = collection.sets.find(s => s.code === setCode);
  if (!set) {
    console.log("Set non trouvé");
    return;
  }
  let card = set.cards.find(c => c.number === cardNumber);

  if (card) {
    if (isFoil) {
      card.foil = active;
    } else {
      card.no_foil = active;
    }
  } else {
    if (isFoil) {
      set.cards.push({ number: cardNumber, no_foil: false, foil: active });
    } else {
      set.cards.push({ number: cardNumber, no_foil: active, foil: false });
    }
  }

  // Réécrire le fichier JSON après modif
  fs.writeFileSync(pathMyCards, JSON.stringify(collection, null, 2), 'utf-8');
}
