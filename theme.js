const themeButton = document.getElementById('themeButton');
const savedTheme = localStorage.getItem('abrar-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

function applyTheme(isDark) {
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  document.body.classList.toggle('dark-mode', isDark);
  themeButton.textContent = isDark ? '\u2600' : '\u263E';
  themeButton.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
}

applyTheme(savedTheme ? savedTheme === 'dark' : prefersDark);
themeButton.addEventListener('click', () => {
  const isDark = document.documentElement.dataset.theme !== 'dark';
  applyTheme(isDark);
  localStorage.setItem('abrar-theme', isDark ? 'dark' : 'light');
});
