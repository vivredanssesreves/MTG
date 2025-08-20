/**
 * Pokemon Index Loading and Display
 * 
 * Event Listeners:
 * - DOMContentLoaded handler
 *     - Load and display pokemon list with dark mode support
 */

// Wait for DOM and dark mode to be ready before loading pokemon
document.addEventListener('DOMContentLoaded', async () => {
  // Ensure dark mode is applied before creating elements
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  }

  const response = await fetch('/bdd/pokemon/index_eevees.json');
  const pokemons = await response.json();

  const container = document.getElementById('sets');

  pokemons.forEach(pokemon => {
    const div = document.createElement('div');
    div.className = 'set';
    div.innerHTML = `
        <img src="${pokemon.image}" alt="${pokemon.name}" />
        <a href="pokemon.html?id=${pokemon.id}">${pokemon.name}</a>
        `;
    div.onclick = () => {
      sessionStorage.setItem('selectedPokemon', JSON.stringify(pokemon));
      window.location.href = `pokemon.html?id=${pokemon.id}`;
    };

    container.appendChild(div);
  });
});
