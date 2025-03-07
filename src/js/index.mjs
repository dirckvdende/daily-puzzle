
import { dateIndex } from "./puzzle.mjs";
import { getFileContent } from "./filesystem.mjs";
import { showPopup } from "./popup.mjs";
import { getPuzzleData } from "./puzzledata.mjs";

// Today's puzzle, from the above list
let currentPuzzle;

// Intial function
loadCurrentPuzzle();
initHistoryButton();
initDarkMode();
updateTitle();
updateFooter();

/**
 * Load the puzzle that should be loaded given the current day (dateIndex). If
 * no requirements are met, loads the last puzzle in the array
 */
function loadCurrentPuzzle() {
    loadPuzzle(getPuzzleData(dateIndex));
}

/**
 * Load a puzzle given its name
 * @param {object} puzzle The puzzle object with name and module, from the
 * "puzzles" array
 */
function loadPuzzle(puzzle) {
    console.log(`Loading puzzle "${puzzle.name}"`);
    currentPuzzle = puzzle;
    // Add CSS of puzzle
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = `./src/puzzle/${puzzle.name}/puzzle.css`;
    document.getElementsByTagName("head")[0].appendChild(link);
    // Load HTML of the puzzle. After this initialize the puzzle
    getFileContent(`./src/puzzle/${puzzle.name}/puzzle.html`, (html) => {
        document.getElementById("content").innerHTML = html;
        puzzle.module.load();
    });
    // Load help page
    getFileContent(`./src/puzzle/${puzzle.name}/help.html`, (html) => {
        document.getElementById("help-button").addEventListener("click", () => {
            showPopup("How to solve", html);
        });
    });
    // Load history button
    
}

/**
 * Initialize history button functionality
 */
function initHistoryButton() {
    document.getElementById("history-button").addEventListener("click", () => {
        window.location.href = "./history/";
    });
}

/**
 * Update titles to display puzzle number
 */
function updateTitle() {
    document.getElementById("title-puzzle-index").innerText = `#${dateIndex}`;
    document.getElementsByTagName("title")[0].innerText += ` #${dateIndex}`;
}

/**
 * Update footer text to show current puzzle
 */
function updateFooter() {
    let footer = document.getElementsByTagName("footer")[0];
    let puzzleName = currentPuzzle.name.toUpperCase();
    footer.innerHTML = `Today's puzzle: ${puzzleName}<br>` + footer.innerHTML;
}

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