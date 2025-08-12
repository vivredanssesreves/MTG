/**
 * Initialise l'interaction du menu burger (ouverture/fermeture)
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
        // Fermer le menu si on clique en dehors
        document.addEventListener('mousedown', (e) => {
            if (sideMenu && sideMenu.classList.contains('open')) {
                if (!sideMenu.contains(e.target) && e.target !== burgerBtn) {
                    sideMenu.classList.remove('open');
                }
            }
        });
        // Gestion des boutons export
        if (exportBddBtn) {
            exportBddBtn.onclick = () => {
                if (confirm('Voulez-vous exporter toute votre BDD en CSV ?')) {
                    fetch('/api/export-all', { method: 'POST' })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                alert(data.message);
                            } else {
                                alert('Erreur lors de l\'export');
                            }
                        })
                        .catch(error => {
                            console.error('Export error:', error);
                            alert('Erreur lors de l\'export');
                        });
                }
            };
        }
        if (exportSetBtn) {
            exportSetBtn.onclick = () => {
                const params = new URLSearchParams(window.location.search);
                const setCode = params.get('code');
                if (!setCode) {
                    alert('Aucun code de set trouvé');
                    return;
                }
                if (confirm(`Voulez-vous exporter le set ${setCode} en CSV ?`)) {
                    fetch('/api/export-set', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ setCode })
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                alert(`Export set ${setCode}: done! Fichier CSV généré dans MYBDD/CSV/`);
                            } else {
                                alert('Erreur lors de l\'export');
                            }
                        })
                        .catch(error => {
                            console.error('Export error:', error);
                            alert('Erreur lors de l\'export');
                        });
                }
            };
        }
        // Gestion du bouton help
        if (helpBtn) {
            helpBtn.onclick = () => {
                window.open('https://github.com/vivredanssesreves/MTG/wiki', '_blank');
            };
        }
        // Gestion des boutons reset
        if (resetBddBtn) {
            resetBddBtn.onclick = () => {
                if (confirm('Voulez-vous vraiment réinitialiser toute votre BDD ?')) {
                    fetch('/api/reset-bdd', { method: 'POST' });
                    alert('Reset BDD: done');
                }
            };
        }
        if (resetSetBtn) {
            resetSetBtn.onclick = () => {
                if (confirm('Voulez-vous vraiment réinitialiser ce set ?')) {
                    const params = new URLSearchParams(window.location.search);
                    const setCode = params.get('code');
                    fetch('/api/reset-set', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ setCode })
                    })
                        .then(() => {
                            alert('Reset set: done');
                            location.reload(); // Recharge la page pour mettre à jour les icônes
                        });
                }
            };
        }
    }, 100);
}
// Utilitaires frontEnd pour le menu burger, dark mode, etc.

/**
 * Injecte le menu burger dans l'élément cible
 * @param {string} targetId - id du conteneur où injecter le menu
 * @param {string} menuHtmlPath - chemin du fichier HTML du menu
 */
export function injectMenuBurger(targetId = 'menu-burger', menuHtmlPath = 'menu-burger.html') {
    fetch(menuHtmlPath)
        .then(r => r.text())
        .then(html => {
            document.getElementById(targetId).innerHTML = html;
        });
}

/**
 * Met à jour l'icône du dark mode selon l'état actuel
 * @param {HTMLElement} iconDiv - L'élément contenant l'icône
 * @param {HTMLElement} darkToggle - Le bouton de toggle
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
 * Initialise le dark mode sur la page
 * @param {string} toggleId - id du bouton dark mode
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
