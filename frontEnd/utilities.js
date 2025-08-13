/**
 * Frontend Utilities
 * 
 * Functions:
 * - initBurgerMenu() 
 *     -> void 
 *     - Initialize burger menu interaction with export/import buttons (exported)
 * - injectMenuBurger(targetId = 'menu-burger', menuHtmlPath = 'menu-burger.html') 
 *     -> void 
 *     - Inject burger menu HTML into target element (exported)
 * - updateDarkIcon(iconDiv, darkToggle) 
 *     -> void 
 *     - Update dark mode icon according to current state (internal)
 * - initDarkMode(toggleId = 'dark-toggle') 
 *     -> void 
 *     - Initialize dark mode toggle functionality (exported)
 */

/**
 * Initialize burger menu interaction (open/close)
 */
export function initBurgerMenu() {
    setTimeout(() => {
        const burgerBtn = document.getElementById('burger-menu');
        const sideMenu = document.getElementById('side-menu');
        const closeBtn = document.getElementById('close-menu');
        const resetBddBtn = document.getElementById('reset-bdd');
        const resetSetBtn = document.getElementById('reset-set');
        const exportBddBtn = document.getElementById('export-bdd');
        const exportSetBtn = document.getElementById('export-set');
        const helpBtn = document.getElementById('help-toggle');
        if (burgerBtn && sideMenu) {
            burgerBtn.onclick = () => {
                sideMenu.classList.add('open');
            };
        }
        if (closeBtn && sideMenu) {
            closeBtn.onclick = () => {
                sideMenu.classList.remove('open');
            };
        }
        // Close menu when clicking outside
        document.addEventListener('mousedown', (e) => {
            if (sideMenu && sideMenu.classList.contains('open')) {
                if (!sideMenu.contains(e.target) && e.target !== burgerBtn) {
                    sideMenu.classList.remove('open');
                }
            }
        });
        // Handle export buttons
        if (exportBddBtn) {
            exportBddBtn.onclick = () => {
                if (confirm('Do you want to export your entire database to CSV?')) {
                    fetch('/api/export-all', { method: 'POST' })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                alert(data.message);
                            } else {
                                alert('Export error');
                            }
                        })
                        .catch(error => {
                            console.error('Export error:', error);
                            alert('Export error');
                        });
                }
            };
        }
        if (exportSetBtn) {
            exportSetBtn.onclick = () => {
                const params = new URLSearchParams(window.location.search);
                const setCode = params.get('code');
                if (!setCode) {
                    alert('No set code found');
                    return;
                }
                if (confirm(`Do you want to export set ${setCode} to CSV?`)) {
                    fetch('/api/export-set', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ setCode })
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                alert(`Export set ${setCode}: done! CSV file generated in MYBDD/CSV/`);
                            } else {
                                alert('Export error');
                            }
                        })
                        .catch(error => {
                            console.error('Export error:', error);
                            alert('Export error');
                        });
                }
            };
        }
        // Handle help button
        if (helpBtn) {
            helpBtn.onclick = () => {
                window.open('https://github.com/vivredanssesreves/MTG/wiki', '_blank');
            };
        }
        // Handle reset buttons
        if (resetBddBtn) {
            resetBddBtn.onclick = () => {
                if (confirm('Do you really want to reset your entire database?')) {
                    fetch('/api/reset-bdd', { method: 'POST' });
                    alert('Reset BDD: done');
                }
            };
        }
        if (resetSetBtn) {
            resetSetBtn.onclick = () => {
                if (confirm('Do you really want to reset this set?')) {
                    const params = new URLSearchParams(window.location.search);
                    const setCode = params.get('code');
                    fetch('/api/reset-set', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ setCode })
                    })
                        .then(() => {
                            alert('Reset set: done');
                            location.reload(); // Reload page to update icons
                        });
                }
            };
        }
    }, 100);
}
// Frontend utilities for burger menu, dark mode, etc.

/**
 * Inject burger menu into target element
 * @param {string} targetId - id of container where to inject menu
 * @param {string} menuHtmlPath - path to menu HTML file
 */
export function injectMenuBurger(targetId = 'menu-burger', menuHtmlPath = 'menu-burger.html') {
    fetch(menuHtmlPath)
        .then(r => r.text())
        .then(html => {
            document.getElementById(targetId).innerHTML = html;
        });
}

/**
 * Update dark mode icon according to current state
 * @param {HTMLElement} iconDiv - Element containing the icon
 * @param {HTMLElement} darkToggle - Toggle button
 */
function updateDarkIcon(iconDiv, darkToggle) {
    if (iconDiv) {
        if (document.body.classList.contains('dark')) {
            iconDiv.innerHTML = '<i class="far fa-lightbulb"></i>';
            darkToggle.title = 'Switch to light mode';
            iconDiv.classList.remove('sun');
        } else {
            iconDiv.innerHTML = '<i class="far fa-moon"></i>';
            darkToggle.title = 'Switch to dark mode';
            iconDiv.classList.remove('sun');
        }
    }
}

/**
 * Initialize dark mode on page
 * @param {string} toggleId - id of dark mode button
 */
export function initDarkMode(toggleId = 'dark-toggle') {
    const darkToggle = document.getElementById(toggleId);
    const iconDiv = darkToggle ? darkToggle.querySelector('.icon-moon') : null;
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
    }
    if (darkToggle && iconDiv) {
        updateDarkIcon(iconDiv, darkToggle);
        darkToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark');
            document.documentElement.classList.toggle('dark');
            localStorage.setItem('darkMode', document.body.classList.contains('dark') ? 'enabled' : 'disabled');
            updateDarkIcon(iconDiv, darkToggle);
        });
    }
}
