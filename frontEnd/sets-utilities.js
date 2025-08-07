// Utility script for burger menu, dark mode, and reset button
document.addEventListener('DOMContentLoaded', () => {
  // Initialisation du mode sombre au chargement
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  }
  // Burger menu open/close
  const burger = document.getElementById('burger-menu');
  const sideMenu = document.getElementById('side-menu');
  const closeMenu = document.getElementById('close-menu');

  if (burger && sideMenu) {
    burger.addEventListener('click', () => {
      sideMenu.classList.add('open');
    });
  }
  if (closeMenu && sideMenu) {
    closeMenu.addEventListener('click', () => {
      sideMenu.classList.remove('open');
    });
  }

  // Dark mode toggle
  const darkToggle = document.getElementById('dark-toggle');
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
  // Correction : synchronise l'icône au chargement selon le mode
  if (darkToggle) {
    updateDarkIcon();
    darkToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      document.documentElement.classList.toggle('dark');
      localStorage.setItem('darkMode', document.body.classList.contains('dark') ? 'enabled' : 'disabled');
      updateDarkIcon();
    });
  }

  // Reset button
  const resetBtn = document.getElementById('reset-bdd');
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to reset your card collection? This cannot be undone.')) {
        await fetch('/resetMyBDD', { method: 'POST' });
        location.reload();
      }
    });
  }
});
