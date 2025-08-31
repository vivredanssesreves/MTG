/**
 * Pokemon Card Loading Utilities
 * 
 * Functions:
 * - loadPokemonCards(id: string) 
 *     -> Promise<array> 
 *     - Load cards data for a specific pokemon (internal)
 * 
 * - progress(cards: array) 
 *     -> Promise<void> 
 *     - Update progress indicators (exported)
 */

// Get query param "id"
const params = new URLSearchParams(window.location.search);
const pokemonId = params.get('id');
const pathSrc = '../../../src/';
const pathSrcBddPoke = `${pathSrc}data/pokemon/`;
const pathBddOnePoke = `${pathSrcBddPoke}oneByOne/`;
//const pathBddPokemon = '../../../bdd/pokemon/';
let currentCards = [];


// Back button (wait for DOM to be ready)
document.addEventListener('DOMContentLoaded', () => {
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.onclick = () => {
            window.location.href = 'index.html';
        };
    }
});

// Dark mode toggle
import { initDarkMode } from '../shared/utilities.js';
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode('dark-toggle');
});
const pokemonData = sessionStorage.getItem('selectedPokemon');
let pokemon;

if (pokemonData) {
    pokemon = JSON.parse(pokemonData);
} else {

    const params = new URLSearchParams(window.location.search);
    const pokemonId = params.get('id');
    console.log(pokemonId);

    if (!pokemonId) {
        document.getElementById('set-title').textContent = 'No pokemon id provided';
        throw new Error('No pokemon id provided in URL');
    }
    pokemon = { id: pokemonId, name: pokemonId };

    document.getElementById('set-title').textContent = pokemonId;
}


loadPokemonCards(pokemonId);

async function loadPokemonCards(id) {

    try {

        //const resCards = await fetch(`${pathBddPokemon}${id}.json`);

        let lowerId = id.toLowerCase();
        let pathTemp = `${pathBddOnePoke}${lowerId}.json`;

        const resCards = await fetch(pathTemp);
        const cards = resCards.ok ? await resCards.json() : [];

        document.getElementById('set-title').innerHTML = `${pokemonId}`;

        const container = document.getElementById('cards-container');

        container.innerHTML = '';



        // Load main cards
        if (cards.length > 0) {

            //Sort cards by year (oldest to newest)
            cards.sort((a, b) => a.releaseDate - b.releaseDate);

            cards.forEach(card => {

                let cardDiv = document.createElement('div');
                cardDiv.className = 'card';

                cardDiv.innerHTML = `
                    <img src="${card.images.low}" title="${card.name}" />
                    <div class="card-info">
                        <div class="card-meta">
                            <div class="card-images">
                                <img src="${card.set.images.symbol}" data-type="no_foil" data-set="${card.set.id}" data-num=${card.id} class="small-clickable" />
                                <img src="${card.set.images.symbol}" data-type="foil" data-set="${card.set.id}" data-num=${card.id} class="small-clickable foil" />
                            </div>
                            <div class="icon-card-right"> #${card.set.id}
                                <a target="_blank" href="${card.images.high}" ><i class="icon-search fas fa-share-alt"></i></a>
                            </div>
                        </div>
                    </div>`;

                container.appendChild(cardDiv);
            });
        }



        window.currentCards = [...cards];
        // await progress([...cards]);
    } catch (error) {
        document.getElementById('set-title').textContent = 'Error loading pokemon cards';
        console.error(error);
    }
}

async function progress(items) {

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    const cardsProgress = document.createElement('div');

    if (!items) {
        cardsProgress.innerHTML = `
        <div class="progress_container">
            no data
        </div>
    `;
        document.getElementById('cards-progress').appendChild(cardsProgress);
        return;
    }

    const totalItems = items.length;

    cardsProgress.innerHTML = `
            <div class="progress_container">
                ${totalItems} éléments chargés
                <div class="putin_de_bar">
                    <div id="progress-bar" class="progress_bar"></div>
                </div>
            </div>
        `;

    document.getElementById('cards-progress').replaceChildren(cardsProgress);

    // Maintenant que la barre est dans le DOM, on peut la manipuler
    document.getElementById('progress-bar').style.width = `100%`;

}

export { progress };
