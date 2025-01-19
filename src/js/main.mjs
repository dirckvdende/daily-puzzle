
import * as operatorPuzzle from "./operator.mjs";
import { dateIndex } from "./puzzle.mjs";
import { getFileContent, getPuzzleHTML } from "./filesystem.mjs";
import { showPopup } from "./popup.mjs";

// Map of puzzle names to puzzle modules
const puzzles = {
    operator: operatorPuzzle,
};

// Intial function
window.addEventListener("load", () => {
    loadPuzzle("operator");
    initDarkMode();
    updateTitle();
});

/**
 * Load a puzzle given its name
 * @param {string} name The name of the puzzle
 */
function loadPuzzle(name) {
    // Load HTML of the puzzle. After this initialize the puzzle
    getPuzzleHTML(name, (html) => {
        document.getElementById("content").innerHTML = html;
        puzzles[name].load();
    });
    // Load help page
    getFileContent(`./src/puzzle/${name}/help.html`, (html) => {
        document.getElementById("help-button").addEventListener("click", () => {
            showPopup("How to solve", html);
        });
    });
}

/**
 * Update titles to display puzzle number
 */
function updateTitle() {
    let indexText = ` #${dateIndex}`;
    document.getElementById("main-title").innerText += indexText;
    document.getElementsByTagName("title")[0].innerText += indexText;
}

/**
 * Handle dark mode settings and add functionality to dark mode button
 */
function initDarkMode() {
    if (localStorage.getItem("theme") === "dark")
        body.classList.add("dark-mode");
    document.getElementById("theme-button").addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const theme = body.classList.contains("dark-mode") ? "dark" : "light";
        localStorage.setItem("theme", theme);
    });
}