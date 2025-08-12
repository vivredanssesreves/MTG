import { progress } from '../frontEnd/set-loadCards.js';
document.addEventListener('click', async (e) => {

  if (e.target.classList.contains('small-clickable')) {
    e.target.classList.toggle('active');
    const isActive = e.target.classList.contains('active');
    const setCode = e.target.dataset.set;
    const cardN = e.target.dataset.num;
    const type = e.target.dataset.type;
    
    let info = {
      'code': setCode,
      'cardNum': cardN,
      'isActive': isActive,
      'isFoil': isFoil(type)
    }
    
    await fetch('/editMyBDD', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(info)
    });

    progress(window.currentCards);
  }
});



function isFoil(type) {
  if (type.includes('no_')) {
    return false;
  }
  return true;
}



