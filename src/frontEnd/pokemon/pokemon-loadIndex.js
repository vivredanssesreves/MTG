/**
 * Pokemon Index Loading and Display
 * 
 * Event Listeners:
 * - DOMContentLoaded handler
 *     - Load and display pokemon list with dark mode support
 */

// Wait for DOM and dark mode to be ready before loading pokemon
const pathSrc = '../../../src/';
const pathPublic = '../../../public/';
const pathSrcBddPoke = `${pathSrc}data/pokemon/`; 
const pathBddBase = `${pathSrcBddPoke}base/`;
const pathDataIndex = `${pathBddBase}index_eevees.json`; 
//const pathIndex = '../../../bdd/pokemon/base/index_eevees.json'; 


// Back button (wait for DOM to be ready)
document.addEventListener('DOMContentLoaded', () => {
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.onclick = () => {
            window.location.href = `http://localhost:3000`;
        };
    }
});

document.addEventListener('DOMContentLoaded', async () => {
  // Ensure dark mode is applied before creating elements
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  }

  const response = await fetch(pathDataIndex);
  // const response = await fetch(pathIndex);
  const pokemons = await response.json();

  const container = document.getElementById('sets');

  pokemons.forEach(pokemon => {
    const div = document.createElement('div');
    div.className = 'set';
    div.innerHTML = `
        <img src="${pokemon.image}" alt="${pokemon.ids.fr}" />
        <a href="pokemon.html?id=${pokemon.ids.en}">${pokemon.ids.fr}</a>
        `;
    div.onclick = () => {
      sessionStorage.setItem('selectedPokemon', JSON.stringify(pokemon.ids.en));
      window.location.href = `pokemon.html?id=${pokemon.ids.en}`;
    };

    container.appendChild(div);
  });
});
