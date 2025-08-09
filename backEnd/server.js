// backEnd/server.js
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { updateCard } from './utilities.js';
import { createEmptySetsFiles } from '../init/init_bdd_perso.js';
import { createEmptySet } from '../init/init_bdd_perso.js';


const pathMyBddJson = '../MYBDD/json/';
const app = express();
const PORT = 3000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webPath = path.join(__dirname, '..', 'web');
const bddPath = path.join(__dirname, '..', 'bdd');
const backEndPath = path.join(__dirname, '..', 'backEnd');
const myBddPath = path.join(__dirname, '..', 'MYBDD');
const frontEndPath = path.join(__dirname, '..', 'frontEnd');
const initPath = path.join(__dirname, '..', 'init');

app.use(express.static(webPath));       // Frontend (HTML/JS/CSS)
app.use(express.json());

app.use('/bdd', express.static(bddPath)); // JSON files
app.use('/backEnd', express.static(backEndPath)); // back end path
app.use('/MYBDD', express.static(myBddPath)); // my json path
app.use('/frontEnd', express.static(frontEndPath)); // my json path
app.use('/init', express.static(initPath));

app.post('/editMyBDD', (request, response) => {

  let info = request.body;
  if (!info || !info.code || !info.cardNum) {
    console.error("Invalid request data");
    return response.status(400).json({ error: "Invalid request data" });
  }
  console.log(info);
  let pathMyCards = pathMyBddJson + info.code + '.json';
  console.log(pathMyCards);
  if (!fs.existsSync(pathMyCards)) {
    fs.writeFileSync(pathMyCards, JSON.stringify({ cards: [] }, null, 2));
    console.log('New file created with empty array.');
  }

  const data = fs.readFileSync(pathMyCards, 'utf-8');
  const set = JSON.parse(data);
  updateCard(set, info.cardNum, info.isActive, info.isFoil);
  fs.writeFileSync(pathMyCards, JSON.stringify(set, null, 2), 'utf-8');
  response.json({ success: true });
});

// Reset toute la BDD
app.post('/api/reset-bdd', (req, res) => {
  try {
    createEmptySetsFiles();
    res.json({ success: true });
  } catch (error) {
    console.error('Error resetting BDD:', error);
    res.status(500).json({ error: 'Failed to reset BDD' });
  }
});

// Reset un set spécifique
app.post('/api/reset-set', (req, res) => {
  try {
    const { setCode } = req.body;
    if (!setCode) {
      return res.status(400).json({ error: 'setCode is required' });
    }
    createEmptySet(setCode);
    res.json({ success: true });
  } catch (error) {
    console.error('Error resetting set:', error);
    res.status(500).json({ error: 'Failed to reset set' });
  }
});


app.listen(PORT, () => {
  console.log(`✅ Server running: http://localhost:${PORT}`);
});


