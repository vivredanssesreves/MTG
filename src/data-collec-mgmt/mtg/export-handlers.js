/**
 * Export Handlers
 * 
 * Functions:
 * - handleExportSet(req: object, res: object) 
 *     -> void 
 *     - Handle export of a specific set to CSV (exported)
 * 
 * - handleExportAll(req: object, res: object) 
 *     -> void 
 *     - Handle export of all sets to CSV (exported)
 */

// Export handlers for MTG collection management
import { exportCSV, exportAllToCSV } from './toCSV.js';

// Handle export of a specific set to CSV
export function handleExportSet(req, res) {
    try {
        const setCode = req.body.setCode;
        if (!setCode) {
            return res.status(400).json({ error: 'setCode is required' });
        }
        exportCSV(setCode);
        res.json({ success: true, message: `CSV exported for set ${setCode}` });
    } catch (error) {
        console.error('Error exporting set:', error);
        res.status(500).json({ error: 'Failed to export set' });
    }
}

// Handle export of all sets to CSV
export function handleExportAll(req, res) {
    try {
        const missingSets = exportAllToCSV();
        if (missingSets.length > 0) {
            let messageMissing = `Some sets were not exported: ${missingSets.join(', ')}`;
            messageMissing += `\nAll other sets exported to CSV`;
            res.json({ success: true, message: messageMissing });
        } else {
            res.json({ success: true, message: 'All sets exported to CSV' });
        }
    } catch (error) {
        console.error('Error exporting all sets:', error);
        res.status(500).json({ error: 'Failed to export all sets' });
    }
}
