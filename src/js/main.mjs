
// Initial functions
initDarkMode();

/**
 * Handle dark mode settings and add functionality to dark mode button
 */
function initDarkMode() {
    if (localStorage.getItem("theme") === "dark")
        document.body.classList.add("dark-mode");
    document.getElementById("theme-button").addEventListener("click", () => {
        document.body.classList.add("dark-mode-transition");
        document.body.classList.toggle("dark-mode");
        const theme = (document.body.classList.contains("dark-mode") ? "dark" :
        "light");
        localStorage.setItem("theme", theme);
        setTimeout(() => document.body.classList.remove("dark-mode-transition"),
        700);
    });
}