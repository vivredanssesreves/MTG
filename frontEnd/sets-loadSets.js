const response = await fetch('/bdd/sets.json');
    const sets = await response.json();

    const today = new Date().toISOString().split('T')[0];
    const container = document.getElementById('sets');

    sets
      .filter(set => set.released_at <= today)
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

    const toggleBtn = document.querySelector('.icon-moon');
    toggleBtn.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      document.body.classList.toggle('dark');

      if (document.documentElement.classList.contains('dark')) {
        localStorage.setItem('darkMode', 'enabled');
        
      } else {
        localStorage.removeItem('darkMode');
        
      }
    });