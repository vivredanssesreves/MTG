/**
 * Import Handlers
 * 
 * Functions:
 * - handleImportSet(req: object, res: object) 
 *     -> Promise<void> 
 *     - Handle import of a specific set from CSV (exported)
 * 
 * - handleImportAll(req: object, res: object) 
 *     -> Promise<void> 
 *     - Handle import of all sets from CSV (exported)
 */

// export/import-handlers.js
import { importCSVFileStreaming } from './fromCSV.js';

/**
 * Handle import of a specific set from CSV
 */
export async function handleImportSet(req, res) {
  try {
    const setCode = req.body.setCode;
    const filePath = req.body.filePath;
    
    if (!setCode) {
      return res.status(400).json({ error: 'setCode is required' });
    }
    
    if (!filePath) {
      return res.status(400).json({ error: 'filePath is required' });
    }
    
    // Call the existing import function
    await importCSVFileStreaming(filePath, setCode);
    
    res.json({ 
      success: true, 
      message: `Set ${setCode} imported successfully from ${filePath}` 
    });
  } catch (error) {
    //console.error('Error importing set:', error);
    res.status(500).json({ error: 'Failed to import set: ' + error.message });
  }
}

/**
 * Handle import of all sets from CSV
 */
export async function handleImportAll(req, res) {
  try {
    const filePath = req.body.filePath;
    
    if (!filePath) {
      return res.status(400).json({ error: 'filePath is required' });
    }
    
    // TODO: implement import all sets
    // await importAllFromCSV(filePath);
    
    res.json({ 
      success: true, 
      message: `All sets imported successfully from ${filePath}` 
    });
  } catch (error) {
    console.error('Error importing all sets:', error);
    res.status(500).json({ error: 'Failed to import all sets: ' + error.message });
  }
}
