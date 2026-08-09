const toggleSwitch = document.querySelector('#toggle-switch');

// Swithc Theme Dynamically
function toggleDarkLighteMode(isDark) {
    if (window.lucide) {
        // Re-init icons in case they weren't
        // lucide.createIcons();
    }
}

function switchTheme(event) {
    if (event.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        toggleDarkLighteMode(true);
        localStorage.setItem('theme', 'dark');

    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        toggleDarkLighteMode(false);
        localStorage.setItem('theme', 'light');
    }
}

// Event Listener
if(toggleSwitch) {
    toggleSwitch.addEventListener('change', switchTheme);
}


// Check Local Storage
const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark' && toggleSwitch) {
        toggleSwitch.checked = true;
        toggleDarkLighteMode(true);
    }
}
