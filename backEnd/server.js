// backEnd/server.js
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { updateCard } from './utilities.js';
import { createEmptySetsFiles } from '../init/init_bdd_perso.js';
import { createEmptySet } from '../init/init_bdd_perso.js';
import { handleImportSet, handleImportAll } from '../export/import-handlers.js';
import { handleExportSet, handleExportAll } from '../export/export-handlers.js';


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
const expImpPath = path.join(__dirname, '..', 'expImp');

app.use(express.static(webPath));       // Frontend (HTML/JS/CSS)
app.use(express.json());

app.use('/bdd', express.static(bddPath)); // JSON files
app.use('/backEnd', express.static(backEndPath)); // back end path
app.use('/MYBDD', express.static(myBddPath)); // my json path
app.use('/frontEnd', express.static(frontEndPath)); // my json path
app.use('/init', express.static(initPath));
app.use('/expImp', express.static(expImpPath)); // export/import path



app.post('/editMyBDD', (request, response) => {

  let info = request.body;
  if (!info || !info.code || !info.cardNum) {
    console.error("Invalid request data");
    return response.status(400).json({ error: "Invalid request data" });
  }
  //console.log(info);
  let pathMyCards = pathMyBddJson + info.code + '.json';
  //console.log(pathMyCards);
  if (!fs.existsSync(pathMyCards)) {
    fs.writeFileSync(pathMyCards, JSON.stringify({ cards: [] }, null, 2));
    //console.log('New file created with empty array.');
  }

  const data = fs.readFileSync(pathMyCards, 'utf-8');
  const set = JSON.parse(data);
  updateCard(set, info.cardNum, info.isActive, info.isFoil);
  fs.writeFileSync(pathMyCards, JSON.stringify(set, null, 2), 'utf-8');
  response.json({ success: true });
});

// Reset entire BDD
app.post('/api/reset-bdd', (req, res) => {
  try {
    createEmptySetsFiles();
    res.json({ success: true });
  } catch (error) {
    console.error('Error resetting BDD:', error);
    res.status(500).json({ error: 'Failed to reset BDD' });
  }
});

// Reset a specific set
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

// Export a specific set to CSV
app.post('/api/export-set', handleExportSet);

// Export all sets to CSV
app.post('/api/export-all', handleExportAll);

// Import a specific set from CSV
app.post('/api/import-set', handleImportSet);

// Import all sets from CSV
app.post('/api/import-all', handleImportAll);// Function to show a system popup
function showPopup(message) {
  let command;
  
  switch (process.platform) {
    case 'darwin':  // macOS
      command = `osascript -e 'tell application "System Events" to display dialog "${message}" with title "MTG Server" buttons {"OK"} default button "OK"'`;
      break;
    case 'win32':   // Windows
      command = `powershell -Command "Add-Type -AssemblyName PresentationFramework; [System.Windows.MessageBox]::Show('${message}', 'MTG Server')"`;
      break;
    default:        // Linux
      command = `zenity --info --text="${message}" --title="MTG Server" 2>/dev/null || notify-send "MTG Server" "${message}"`;
      break;
  }
  
  exec(command);
}

// Function to automatically open browser
function openBrowser(url) {
  let command;
  
  switch (process.platform) {
    case 'darwin':  // macOS
      command = `open ${url}`;
      break;
    case 'win32':   // Windows
      command = `start ${url}`;
      break;
    default:        // Linux et autres
      command = `xdg-open ${url}`;
      break;
  }
  
  exec(command, (error) => {
    if (error) {
      showPopup('Serveur MTG démarré !\\n\\nAllez sur: http://localhost:3000');
    }
  });
}

app.listen(PORT, () => {
  console.log(`✅ Server running: http://localhost:${PORT}`);
  
  // Wait 1 second then open browser
  setTimeout(() => {
    openBrowser(`http://localhost:${PORT}`);
  }, 1000);
});


