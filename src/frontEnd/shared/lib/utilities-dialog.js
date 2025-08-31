/**
 * Dialog Utilities
 * 
 * Functions:
 * - loadDialogTemplate() 
 *     -> Promise<void> 
 *     - Load dialog HTML template into page (internal)
 * - showImportDialog(onFileSelected) 
 *     -> void 
 *     - Show import dialog with drag & drop and file picker (exported)
 * - showExportDialog(onExportSelected) 
 *     -> void 
 *     - Show export dialog with all/set options (exported)
 * - handleFileSelection(file, onFileSelected) 
 *     -> void 
 *     - Handle file selection from drag & drop or file picker (internal)
 * - closeDialog(dialogId) 
 *     -> void 
 *     - Close specific dialog and cleanup (internal)
 */

let dialogsLoaded = false;

/**
 * Load dialog HTML template into page
 */
async function loadDialogTemplate() {
    if (dialogsLoaded) return;
    
    try {
        const response = await fetch('dialog.html');
        const html = await response.text();
        document.body.insertAdjacentHTML('beforeend', html);
        dialogsLoaded = true;
    } catch (error) {
        console.error('Error loading dialog template:', error);
    }
}

/**
 * Show import dialog with drag & drop and file picker
 * @param {Function} onFileSelected - Callback when file is selected
 */
export async function showImportDialog(onFileSelected) {
    await loadDialogTemplate();
    
    const dialog = document.getElementById('import-dialog');
    const dropZone = document.getElementById('drop-zone');
    const browseBtn = document.getElementById('browse-file');
    const fileInput = document.getElementById('file-input');
    const cancelBtn = document.getElementById('cancel-import');

    // Show dialog
    dialog.style.display = 'flex';

    // Drag & drop events
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelection(files[0], onFileSelected);
        }
    });

    // File picker events
    browseBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelection(e.target.files[0], onFileSelected);
        }
    });

    // Cancel button
    cancelBtn.addEventListener('click', () => {
        closeDialog('import-dialog');
    });

    // Close on overlay click
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            closeDialog('import-dialog');
        }
    });
}

/**
 * Show export dialog with all/set options
 * @param {Function} onExportSelected - Callback when export option is selected
 */
export async function showExportDialog(onExportSelected) {
    await loadDialogTemplate();
    
    const dialog = document.getElementById('export-dialog');
    const exportAllBtn = document.getElementById('export-all');
    const exportSetBtn = document.getElementById('export-set');
    const cancelBtn = document.getElementById('cancel-export');

    // Show dialog
    dialog.style.display = 'flex';

    // Export buttons
    exportAllBtn.addEventListener('click', () => {
        closeDialog('export-dialog');
        if (onExportSelected) {
            onExportSelected('all');
        }
    });

    exportSetBtn.addEventListener('click', () => {
        closeDialog('export-dialog');
        if (onExportSelected) {
            onExportSelected('set');
        }
    });

    // Cancel button
    cancelBtn.addEventListener('click', () => {
        closeDialog('export-dialog');
    });

    // Close on overlay click
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            closeDialog('export-dialog');
        }
    });
}

/**
 * Handle file selection from drag & drop or file picker
 * @param {File} file - Selected file
 * @param {Function} onFileSelected - Callback function
 */
function handleFileSelection(file, onFileSelected) {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('Please select a CSV file');
        return;
    }

    // Close dialog
    closeDialog('import-dialog');

    // Call callback with file
    if (onFileSelected) {
        onFileSelected(file);
    }
}

/**
 * Close specific dialog and cleanup
 * @param {string} dialogId - ID of dialog to close
 */
function closeDialog(dialogId) {
    const dialog = document.getElementById(dialogId);
    if (dialog) {
        dialog.style.display = 'none';
        
        // Clean up event listeners by cloning elements
        const dropZone = document.getElementById('drop-zone');
        const browseBtn = document.getElementById('browse-file');
        const fileInput = document.getElementById('file-input');
        
        if (dropZone) {
            const newDropZone = dropZone.cloneNode(true);
            dropZone.parentNode.replaceChild(newDropZone, dropZone);
        }
        
        if (browseBtn) {
            const newBrowseBtn = browseBtn.cloneNode(true);
            browseBtn.parentNode.replaceChild(newBrowseBtn, browseBtn);
        }
        
        if (fileInput) {
            fileInput.value = '';
        }
    }
}

/**
 * Import handler for uploaded CSV files - calls backend import endpoint
 * @param {File} file - Selected CSV file
 * @param {string} setCode - Optional set code for set-specific import
 */
export async function handleImportFile(file, setCode = null) {
    try {
        // Show loading state
        console.log(`Importing ${setCode ? `set ${setCode}` : 'all sets'} from file:`, file.name);
        
        // Read file content as text
        const csvContent = await file.text();
        
        // Prepare JSON payload with file content
        const payload = {
            csvContent: csvContent
        };
        
        if (setCode) {
            payload.setCode = setCode;
        }
        
        // Determine endpoint based on whether we're importing a specific set or all
        const endpoint = setCode ? '/api/import-set' : '/api/import-all';
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(result.message || `Import completed successfully!`);
            console.log('Import successful:', result);
            
            // Optionally refresh the current view
            if (typeof refreshCurrentView === 'function') {
                refreshCurrentView();
            }
        } else {
            throw new Error(result.error || 'Import failed');
        }
        
    } catch (error) {
        console.error('Import error:', error);
        alert(`Import failed: ${error.message}`);
    }
}

/**
 * Convenience function to show import dialog for all sets
 */
export function showImportAllDialog() {
    showImportDialog((file) => {
        handleImportFile(file); // No setCode = import all
    });
}

/**
 * Convenience function to show import dialog for specific set
 * @param {string} setCode - Set code to import
 */
export function showImportSetDialog(setCode) {
    showImportDialog((file) => {
        handleImportFile(file, setCode);
    });
}
