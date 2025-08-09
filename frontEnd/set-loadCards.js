// Get query param "code"
const params = new URLSearchParams(window.location.search);
const setCode = params.get('code');
const pathMyCards = '../MYBDD/json/'; // Chemin vers mes cartes personnelles
const pathBddSet = '../bdd/sets/'; // Chemin vers les sets de la BDD
let currentCards = [];

// Back button (attendre que le DOM soit prêt)
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

loadSetCards(setCode);

async function loadSetCards(code) {
    try {

        const resCards = await fetch(`${pathBddSet}${code}.json`);
        const resMyCards = await fetch(`${pathMyCards}${code}.json`);

        if (!resCards.ok || !resMyCards.ok) throw new Error('Erreur de chargement');

        const cards = await resCards.json();
        const setMyData = await resMyCards.json();

        document.getElementById('set-title').innerHTML = `<img src="${set.icon_svg_uri}" alt="${set.name}" class="icone_title"/> ${set.name}`;

        const container = document.getElementById('cards-container');
        container.innerHTML = '';

        cards.forEach(card => {
            const cardDiv = document.createElement('div');
            const owned = setMyData.cards.find(c => c.number === card.number) || { no_foil: false, foil: false };

            cardDiv.className = 'card';

            cardDiv.innerHTML = `
                        <img src="${card.imageUrl}" title="${card.name_fr}" />
                        <div class="card-info">
                            <div class="card-meta">
                            <div class="card-images">
                                <img src="${set.icon_svg_uri}" data-type="no_foil" data-set="${code}" data-num=${card.number} class="small-clickable ${owned.no_foil ? 'active' : ''}" />
                                <img src="${set.icon_svg_uri}" data-type="foil" data-set="${code}" data-num=${card.number} class="small-clickable foil ${owned.foil ? 'active' : ''}" />
                            </div>
                            <div class="icon-card-right "># ${card.number} 
                                <a href="${card.link}" >
                                       <img src="https://www.freeiconspng.com/uploads/search-icon-png-5.png" class="icon-search"/>                                    
                                </a>
                            </div>
                            </div>
                        </div>`;

            container.appendChild(cardDiv);
        });
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
    console.log(myCards);
    const totalCards = cards.length;
    const ownedCards = myCards.filter(c => c.no_foil || c.foil).length;
    const percent = (ownedCards / totalCards) * 100;


    cardsProgress.innerHTML = `
        <div class="progress_container">
            ${ownedCards} / ${totalCards} cartes
            <div class="putin_de_bar">
                <div id="progress-bar" class="progress_bar"></div>
            </div>
        </div>
    `;
    console.log(cardsProgress);
    document.getElementById('cards-progress').replaceChildren(cardsProgress) //.appendChild(cardsProgress);

    // Maintenant que la barre est dans le DOM, on peut la manipuler
    document.getElementById('progress-bar').style.width = `${percent}%`;
}

export { progress };
/**/

