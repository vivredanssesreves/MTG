/**
 * Frontend Utilities
 * 
 * Functions:
 * - updateDarkIcon(iconDiv, darkToggle) 
 *     -> void 
 *     - Update dark mode icon according to current state (internal)
 * - initDarkMode(toggleId = 'dark-toggle') 
 *     -> void 
 *     - Initialize dark mode toggle functionality (exported)
 */

/**
 * Update dark mode icon according to current state
 * @param {HTMLElement} iconDiv - Element containing the icon
 * @param {HTMLElement} darkToggle - Toggle button
 */
function updateDarkIcon(iconDiv, darkToggle) {
    if (iconDiv) {
        if (document.body.classList.contains('dark')) {
            iconDiv.innerHTML = '<i class="far fa-lightbulb"></i>';
            darkToggle.title = 'Switch to light mode';
            iconDiv.classList.remove('sun');
        } else {
            iconDiv.innerHTML = '<i class="far fa-moon"></i>';
            darkToggle.title = 'Switch to dark mode';
            iconDiv.classList.remove('sun');
        }
    }
}

/**
 * Initialize dark mode on page
 * @param {string} toggleId - id of dark mode button
 */
export function initDarkMode(toggleId = 'dark-toggle') {
    const darkToggle = document.getElementById(toggleId);
    const iconDiv = darkToggle ? darkToggle.querySelector('.icon-moon') : null;
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
    }
    if (darkToggle && iconDiv) {
        updateDarkIcon(iconDiv, darkToggle);
        darkToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark');
            document.documentElement.classList.toggle('dark');
            localStorage.setItem('darkMode', document.body.classList.contains('dark') ? 'enabled' : 'disabled');
            updateDarkIcon(iconDiv, darkToggle);
        });
    }
}
