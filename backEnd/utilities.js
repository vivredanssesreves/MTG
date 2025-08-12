// Utility functions for MTG backend

export function updateCard(set, cardNumber, active, isFoil) {
    let card = set.cards.find(c => c.number === cardNumber);

    if (card) {
        if (isFoil) {
            card.foil = active;
        } else {
            card.no_foil = active;
        }
    } else {
        if (isFoil) {
            set.cards.push({ number: cardNumber, no_foil: false, foil: active });
        } else {
            set.cards.push({ number: cardNumber, no_foil: active, foil: false });
        }
    }
    // Sort cards by number (numeric if possible)
    set.cards.sort((a, b) => {
        const numA = isNaN(a.number) ? a.number : Number(a.number);
        const numB = isNaN(b.number) ? b.number : Number(b.number);
        if (numA < numB) return -1;
        if (numA > numB) return 1;
        return 0;
    });
}


