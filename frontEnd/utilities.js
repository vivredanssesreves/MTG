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
    // Gestion des boutons reset
    if (resetBddBtn) {
      resetBddBtn.onclick = () => {
        if (confirm('Voulez-vous vraiment réinitialiser toute votre BDD ?')) {
          // TODO: Ajoute ici la logique réelle de reset
          alert('Reset BDD demandé (à implémenter)');
        }
      };
    }
    if (resetSetBtn) {
      resetSetBtn.onclick = () => {
        if (confirm('Voulez-vous vraiment réinitialiser ce set ?')) {
          // TODO: Ajoute ici la logique réelle de reset du set
          alert('Reset du set demandé (à implémenter)');
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
 * Initialise le dark mode sur la page
 * @param {string} toggleId - id du bouton dark mode
 */
export function initDarkMode(toggleId = 'dark-toggle') {
  const darkToggle = document.getElementById(toggleId);
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  }
  function updateDarkIcon() {
    if (document.body.classList.contains('dark')) {
      darkToggle.textContent = '☀️';
      darkToggle.title = 'Switch to light mode';
      darkToggle.classList.add('sun');
    } else {
      darkToggle.textContent = '🌙';
      darkToggle.title = 'Switch to dark mode';
      darkToggle.classList.remove('sun');
    }
  }
  if (darkToggle) {
    updateDarkIcon();
    darkToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      document.documentElement.classList.toggle('dark');
      localStorage.setItem('darkMode', document.body.classList.contains('dark') ? 'enabled' : 'disabled');
      updateDarkIcon();
    });
  }
}
