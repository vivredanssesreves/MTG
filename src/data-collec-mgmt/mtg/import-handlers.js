/**
 * Import Handlers
 * 
 * Functions:
 * - handleImportSet(req: object, res: object) 
 *     -> Promise<void> 
 *     - Handle import of a specific set from CSV (supports filePath or file upload) (exported)
 * 
 * - handleImportAll(req: object, res: object) 
 *     -> Promise<void> 
 *     - Handle import of all sets from CSV (supports filePath or file upload) (exported)
 */

// export/import-handlers.js
import { importCSVFileStreaming } from './fromCSV.js';
import fs from 'fs';
import path from 'path';

/**
 * Handle import of a specific set from CSV
 * Supports both filePath (old mode) and file upload (new mode)
 */
export async function handleImportSet(req, res) {
  try {
    const setCode = req.body.setCode;
    
    if (!setCode) {
      return res.status(400).json({ error: 'setCode is required' });
    }
    
    let filePath = req.body.filePath;
    
    // Check if we have an uploaded file (FormData mode)
    if (req.file) {
      // File uploaded via multer or similar
      filePath = req.file.path;
    } else if (req.body.csvContent) {
      // File content sent directly in body
      const tempFilePath = path.join(process.cwd(), 'temp', `import_${Date.now()}.csv`);
      
      // Create temp directory if it doesn't exist
      const tempDir = path.dirname(tempFilePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Write content to temp file
      fs.writeFileSync(tempFilePath, req.body.csvContent, 'utf8');
      filePath = tempFilePath;
      
      // Clean up temp file after processing
      setTimeout(() => {
        try {
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        } catch (error) {
          console.warn('Could not clean up temp file:', tempFilePath);
        }
      }, 5000);
    }
    
    if (!filePath) {
      return res.status(400).json({ 
        error: 'Either filePath, file upload, or csvContent is required' 
      });
    }
    
    // Call the existing import function
    await importCSVFileStreaming(filePath, setCode);
    
    res.json({ 
      success: true, 
      message: `Set ${setCode} imported successfully` 
    });
  } catch (error) {
    //console.error('Error importing set:', error);
    res.status(500).json({ error: 'Failed to import set: ' + error.message });
  }
}

/**
 * Handle import of all sets from CSV
 * Supports both filePath (old mode) and file upload (new mode)
 */
export async function handleImportAll(req, res) {
  try {
    let filePath = req.body.filePath;
    
    // Check if we have an uploaded file (FormData mode)
    if (req.file) {
      // File uploaded via multer or similar
      filePath = req.file.path;
    } else if (req.body.csvContent) {
      // File content sent directly in body
      const tempFilePath = path.join(process.cwd(), 'temp', `import_all_${Date.now()}.csv`);
      
      // Create temp directory if it doesn't exist
      const tempDir = path.dirname(tempFilePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Write content to temp file
      fs.writeFileSync(tempFilePath, req.body.csvContent, 'utf8');
      filePath = tempFilePath;
      
      // Clean up temp file after processing
      setTimeout(() => {
        try {
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        } catch (error) {
          console.warn('Could not clean up temp file:', tempFilePath);
        }
      }, 5000);
    }
    
    if (!filePath) {
      return res.status(400).json({ 
        error: 'Either filePath, file upload, or csvContent is required' 
      });
    }
    
    // Call import without setCode filter (imports all)
    await importCSVFileStreaming(filePath);
    
    res.json({ 
      success: true, 
      message: 'All sets imported successfully' 
    });
  } catch (error) {
    console.error('Error importing all sets:', error);
    res.status(500).json({ error: 'Failed to import all sets: ' + error.message });
  }
}
