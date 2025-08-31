/**
 * Set Card Loading Utilities
 * 
 * Functions:
 * - loadSetCards(code: string) 
 *     -> Promise<array> 
 *     - Load cards data for a specific set (internal)
 * 
 * - progress(cards: array) 
 *     -> Promise<void> 
 *     - Update progress indicators (exported)
 */
//../../../bdd
// Get query param "code"
const pathDir = '../../../';
const params = new URLSearchParams(window.location.search);
const setCode = params.get('code');
const pathMyCards = `${pathDir}MYBDD/json/`; // Path to my personal cards
const pathBddSet = `${pathDir}bdd/sets/`; // Path to database sets
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
import { initDarkMode } from './shared/utilities.js';
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode('dark-toggle');
});

const setData = sessionStorage.getItem('selectedSet');
let set;

if (setData) {
    set = JSON.parse(setData);
} else {
    const params = new URLSearchParams(window.location.search);
    const setCode = params.get('code');
    if (!setCode) {
        document.getElementById('set-title').textContent = 'No set code provided';
        throw new Error('No set code provided in URL');
    }
    set = { code: setCode, name: setCode.toUpperCase() };
    document.getElementById('set-title').textContent = set.name;
}

// Filter state
let currentFilter = 'all'; // 'all', 'owned', 'missing'
let allCards = [];
let myCardsData = {};

loadSetCards(setCode);

// Add filter buttons
function createFilterButtons() {
    const header = document.querySelector('.header');
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container';
    filterContainer.innerHTML = `
        <div class="filter-buttons">
            <button id="filter-all" class="filter-btn active">Toutes</button>
            <button id="filter-owned" class="filter-btn">Que j'ai</button>
            <button id="filter-missing" class="filter-btn">Manquantes</button>
        </div>
    `;
    header.appendChild(filterContainer);

    // Add event listeners
    document.getElementById('filter-all').addEventListener('click', () => applyFilter('all'));
    document.getElementById('filter-owned').addEventListener('click', () => applyFilter('owned'));
    document.getElementById('filter-missing').addEventListener('click', () => applyFilter('missing'));
}

function applyFilter(filter) {
    currentFilter = filter;
    
    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`filter-${filter}`).classList.add('active');
    
    // Re-render cards with filter
    renderCards(allCards, myCardsData, filter);
    
    // Update progress stats
    progress(allCards);
}

function renderCards(cards, setMyData, filter = 'all') {
    const container = document.getElementById('cards-container');
    container.innerHTML = '';

    const filteredCards = cards.filter(card => {
        const owned = setMyData.cards.find(c => c.number === card.number) || { no_foil: false, foil: false };
        const hasCard = owned.no_foil || owned.foil;
        
        switch(filter) {
            case 'owned': return hasCard;
            case 'missing': return !hasCard;
            default: return true; // 'all'
        }
    });

    filteredCards.forEach(card => {
        const cardDiv = document.createElement('div');
        const owned = setMyData.cards.find(c => c.number === card.number) || { no_foil: false, foil: false };

        cardDiv.className = 'card';

        cardDiv.innerHTML = `
                    <img src="${card.imageUrl}" title="${card.name_fr}" />
                    <div class="card-info">
                        <div class="card-meta">
                        <div class="card-images">
                            <img src="${set.icon_svg_uri}" data-type="no_foil" data-set="${setCode}" data-num=${card.number} class="small-clickable ${owned.no_foil ? 'active' : ''}" />
                            <img src="${set.icon_svg_uri}" data-type="foil" data-set="${setCode}" data-num=${card.number} class="small-clickable foil ${owned.foil ? 'active' : ''}" />
                        </div>
                        <div class="icon-card-right"># ${card.number} 
                            <a target="_blank" href="${card.link}" ><i class="icon-search fas fa-share-alt"></i></a>
                        </div>
                        </div>
                    </div>`;

        container.appendChild(cardDiv);
    });
}

async function loadSetCards(code) {
    try {

        const resCards = await fetch(`${pathBddSet}${code}.json`);
        const resMyCards = await fetch(`${pathMyCards}${code}.json`);

        if (!resCards.ok || !resMyCards.ok) throw new Error('Erreur de chargement');

        const cards = await resCards.json();
        const setMyData = await resMyCards.json();

        // Store data globally
        allCards = cards;
        myCardsData = setMyData;

        document.getElementById('set-title').innerHTML = `<img src="${set.icon_svg_uri}" alt="${set.name}" class="icone_title"/> ${set.name}`;

        // Create filter buttons
        createFilterButtons();

        // Render cards with current filter
        renderCards(cards, setMyData, currentFilter);

        window.currentCards = cards;
        await progress(cards);
    } catch (error) {
        document.getElementById('set-title').textContent = 'Error loading cards';
        console.error(error);
    }


}

async function progress(cards) {

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    const cardsProgress = document.createElement('div');

    const resMyCards = await fetch(`../MYBDD/json/${code}.json`);
    const myCardsJson = await resMyCards.json();
    const myCards = myCardsJson.cards;

    if (!cards || !myCards) {
        cardsProgress.innerHTML = `
        <div class="progress_container">
            no data
        </div>
    `;
        document.getElementById('cards-progress').appendChild(cardsProgress);
        return;
    }
    //console.log(myCards);
    const totalCards = cards.length;
    const ownedCards = myCards.filter(c => c.no_foil || c.foil).length;
    const percent = (ownedCards / totalCards) * 100;

    // Calculate filtered stats
    const filteredCards = cards.filter(card => {
        const owned = myCards.find(c => c.number === card.number) || { no_foil: false, foil: false };
        const hasCard = owned.no_foil || owned.foil;
        
        switch(currentFilter) {
            case 'owned': return hasCard;
            case 'missing': return !hasCard;
            default: return true; // 'all'
        }
    });

    const filterText = currentFilter === 'all' ? '' : ` (${currentFilter === 'owned' ? 'possédées' : 'manquantes'})`;

    cardsProgress.innerHTML = `
        <div class="progress_container">
            ${ownedCards} / ${totalCards} cartes possédées
            <br>
            <small>${filteredCards.length} cartes affichées${filterText}</small>
            <div class="putin_de_bar">
                <div id="progress-bar" class="progress_bar"></div>
            </div>
        </div>
    `;
    //console.log(cardsProgress);
    document.getElementById('cards-progress').replaceChildren(cardsProgress) //.appendChild(cardsProgress);

    // Maintenant que la barre est dans le DOM, on peut la manipuler
    document.getElementById('progress-bar').style.width = `${percent}%`;
}

export { progress };
/**/

