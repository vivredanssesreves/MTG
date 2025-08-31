/**
 * Sets Loading and Display
 * 
 * Event Listeners:
 * - DOMContentLoaded handler
 *     - Load and display sets list with filtering and dark mode support
 */

// const pathBdd = '../../../bdd/'; 
const pathSrc = '../../../src/';
const pathSrcBddMtg = `${pathSrc}data/mtg/`;

// Back button (wait for DOM to be ready)
document.addEventListener('DOMContentLoaded', () => {
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.onclick = () => {
            window.location.href = `http://localhost:3000`;
        };
    }
});

// Wait for DOM and dark mode to be ready before loading sets
document.addEventListener('DOMContentLoaded', async () => {
  // Ensure dark mode is applied before creating elements
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  }

  const response = await fetch(`${pathSrcBddMtg}/sets.json`);
  const sets = await response.json();

  const today = new Date().toISOString().split('T')[0];
  const container = document.getElementById('sets');

  sets
    .filter(set => set.released_at <= today && set.code.length <= 3)
    .forEach(set => {

      const div = document.createElement('div');
      div.className = 'set';
      div.innerHTML = `
          <img src="${set.icon_svg_uri}" alt="${set.code}" />
          <a href="set.html?code=${set.code}">${set.name}</a>
          `;
      div.onclick = () => {
        sessionStorage.setItem('selectedSet', JSON.stringify(set));
        window.location.href = `set.html?code=${set.code}`;
      };

      container.appendChild(div);
    });
});
