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
const pathBddPokemon = '../bdd/pokemon/'; // Path to pokemon database
let currentCards = [];

// Map des noms de Pokémon
const POKEMON_NAMES = {
    'eevee': 'Évoli',
    'vaporeon': 'Aquali'
};

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
import { initDarkMode } from './utilities.js';
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
    if (!pokemonId) {
        document.getElementById('pokemon-title').textContent = 'No pokemon id provided';
        throw new Error('No pokemon id provided in URL');
    }
    pokemon = { id: pokemonId, name: POKEMON_NAMES[pokemonId] || pokemonId };
    document.getElementById('pokemon-title').textContent = pokemon.name;
}

loadPokemonCards(pokemonId);

async function loadPokemonCards(id) {
    try {

        const resCards = await fetch(`${pathBddPokemon}${id}.json`);
        const resNoCards = await fetch(`${pathBddPokemon}${id}-nocard.json`);

        const cards = resCards.ok ? await resCards.json() : [];
        const noCards = resNoCards.ok ? await resNoCards.json() : [];

        document.getElementById('pokemon-title').innerHTML = `${pokemon.name}`;

        const container = document.getElementById('cards-container');
        const noCardsContainer = document.getElementById('nocards-container');
        container.innerHTML = '';
        if (noCardsContainer) noCardsContainer.innerHTML = '';

        // Load main cards
        if (cards.length > 0) {
            const cardSection = document.createElement('div');
            cardSection.innerHTML = `<h2>Cartes (${cards.length})</h2>`;
            container.appendChild(cardSection);

            cards.forEach(card => {
                const cardDiv = document.createElement('div');
                cardDiv.className = 'card';

                cardDiv.innerHTML = `
                    <img src="${card.image}" alt="${card.name}" />
                    <div class="card-info">
                        <div class="card-meta">
                            <h3>${card.name}</h3>
                            <p>${card.set}</p>
                            ${card.ref ? `<p>Ref: ${card.ref}</p>` : ''}
                            ${card.year ? `<p>${card.year}</p>` : ''}
                            <div class="card-types">
                                ${card.cardType.map(type => `<span class="card-type">${type}</span>`).join('')}
                            </div>
                            ${card.lang ? `<span class="card-lang">${card.lang}</span>` : ''}
                        </div>
                    </div>`;

                container.appendChild(cardDiv);
            });
        }

        // Load no-cards (figurines, objects)
        if (noCards.length > 0 && noCardsContainer) {
            const noCardSection = document.createElement('div');
            noCardSection.innerHTML = `<h2>Objets & Figurines (${noCards.length})</h2>`;
            noCardsContainer.appendChild(noCardSection);

            noCards.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'card';

                itemDiv.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" />
                    <div class="card-info">
                        <div class="card-meta">
                            <h3>${item.name}</h3>
                            <p>${item.set}</p>
                            ${item.ref ? `<p>Ref: ${item.ref}</p>` : ''}
                            ${item.year ? `<p>${item.year}</p>` : ''}
                            <div class="card-types">
                                ${item.cardType.map(type => `<span class="card-type item-type">${type}</span>`).join('')}
                            </div>
                        </div>
                    </div>`;

                noCardsContainer.appendChild(itemDiv);
            });
        }

        window.currentCards = [...cards, ...noCards];
        await progress([...cards, ...noCards]);
    } catch (error) {
        document.getElementById('pokemon-title').textContent = 'Error loading pokemon cards';
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
