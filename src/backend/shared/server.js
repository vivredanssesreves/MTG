/**
 * MTG Collection Server
 * 
 * Functions:
 * - showPopup(message: string) 
 *     -> void 
 *     - Show system popup notification (internal)
 * 
 * - openBrowser(url: string) 
 *     -> void 
 *     - Automatically open browser (internal)
 * 
 * API Routes:
 * - POST /editMyBDD - Update personal card collection
 * - POST /api/reset-bdd - Reset entire database
 * - POST /api/reset-set - Reset specific set
 * - POST /api/export-set - Export specific set to CSV
 * - POST /api/export-all - Export all sets to CSV
 * - POST /api/import-set - Import specific set from CSV
 * - POST /api/import-all - Import all sets from CSV
 */

// backEnd/server.js

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const _pathProject = path.join(__dirname, '..', '..', '..');

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { updateCard } from './utilities.js';
import { createEmptySetsFiles } from '../../../toDelete-maybe/init/init_bdd_perso.js';
import { createEmptySet } from '../../../toDelete-maybe/init/init_bdd_perso.js';
import { handleImportSet, handleImportAll } from '../../../toDelete-maybe/export/import-handlers.js';
import { handleExportSet, handleExportAll } from '../../../toDelete-maybe/export/export-handlers.js';



//const pathMyBddJson = `${_pathProject}/MYBDD/json/`;
const app = express();
const PORT = 3000;


const webPath = path.join(_pathProject, 'web');
const bddPath = path.join(_pathProject, 'bdd');
const backEndPath = path.join(_pathProject, 'backEnd');
const myBddPath = path.join(_pathProject, 'MYBDD');
const frontEndPath = path.join(_pathProject, 'frontEnd');
const initPath = path.join(_pathProject, 'init');
//const expImpPath = path.join(_pathProject, 'expImp');

const pathSrc = path.join(_pathProject, 'src');

const pathSrcFront = path.join(pathSrc, 'frontEnd');
const pathFrontMtg = path.join(pathSrcFront, 'mtg');
const pathFrontPoke = path.join(pathSrcFront, 'pokemon');
const pathFrontShared = path.join(pathSrcFront, 'shared');
const pathFrontStyles = path.join(pathFrontShared, 'styles');
const pathFrontLib = path.join(pathFrontShared, 'lib');

const pathMyData = path.join(pathSrc, 'data-user');
const pathMyDataMtg = path.join(pathMyData, 'mtg');
const pathMyMtgJson = path.join(pathMyDataMtg, 'json');
const pathMyMtgCsv = path.join(pathMyDataMtg, 'CSV');

const pathMyDataPoke = path.join(pathMyData, 'pokemon');

const pathPublic = path.join(_pathProject, 'public');
const pathPublicPoke = path.join(pathPublic, 'pokemon');
const pathPublicMtg = path.join(pathPublic, 'mtg');

// app.use('/pokemon', express.static(pathPublicPoke));
// app.use('/mtg', express.static(pathPublicMtg));

// app.use('/bdd', express.static(bddPath)); // JSON files
// app.use('/backEnd', express.static(backEndPath)); // back end path
// app.use('/MYBDD', express.static(myBddPath)); /
// app.use('/frontEnd', express.static(frontEndPath)); 
// app.use('/init', express.static(initPath));
// app.use('/expImp', express.static(expImpPath)); 

app.use('/public', express.static(pathPublic)); // public path
app.use('/public/pokemon', express.static(pathPublicPoke)); // public pokemon path
app.use('/public/mtg', express.static(pathPublicMtg)); // public mtg path

app.use('/src', express.static(pathSrc));

app.use('/src/frontEnd', express.static(pathSrcFront));
app.use('/src/frontEnd/mtg', express.static(pathFrontMtg));
app.use('/src/frontEnd/pokemon', express.static(pathFrontPoke));
app.use('/src/frontEnd/shared', express.static(pathFrontShared));
app.use('/src/frontEnd/shared/styles', express.static(pathFrontStyles));
app.use('/src/frontEnd/shared/lib', express.static(pathFrontLib));

app.use('/data-user', express.static(pathMyData));
app.use('/data-user/mtg', express.static(pathMyDataMtg));
app.use('/data-user/mtg/json', express.static(pathMyMtgJson));
app.use('/data-user/mtg/csv', express.static(pathMyMtgCsv));

app.use('/data-user/pokemon', express.static(pathMyDataPoke));

app.use(express.json());



app.get('/', (req, res) => {
  res.sendFile(path.join(pathPublic, 'index.html'));
});


app.post('/editMyBDD', (request, response) => {

  let info = request.body;
  if (!info || !info.code || !info.cardNum) {
    console.error("Invalid request data");
    return response.status(400).json({ error: "Invalid request data" });
  }
  //console.log(info);
  let pathMyCards = pathMyMtgJson + info.code + '.json';
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
      console.error('Failed to open browser:\n', error);
      showPopup('\n\nServeur MTG démarré !\\n\\nAllez sur: http://localhost:3000');
    }

  });
}

app.listen(PORT, () => {
  console.log(`✅ Server running: http://localhost:${PORT}`);
  openBrowser(`http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('\nServer error:\n', err);
});


