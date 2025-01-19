
import * as operatorPuzzle from "../puzzle/operator/puzzle.mjs";
import * as switchPuzzle from "../puzzle/switch/puzzle.mjs";
import { dateIndex } from "./puzzle.mjs";
import { getFileContent } from "./filesystem.mjs";
import { showPopup } from "./popup.mjs";

// List of puzzles, with a name and a module reference. In addition a
// "dayRequirement" field can be added which is a function from a date index to
// a boolean indicating if the puzzle should be played on this specific day.
// The first puzzle in the list passing this requirement (or having no
// requirement) is loaded
const puzzles = [
    { name: "switch", module: switchPuzzle }, // TODO: Add day restriction!
    { name: "operator", module: operatorPuzzle },
];

// Intial function
window.addEventListener("load", () => {
    loadCurrentPuzzle();
    initDarkMode();
    updateTitle();
});

/**
 * Load the puzzle that should be loaded given the current day (dateIndex). If
 * no requirements are met, loads the last puzzle in the array
 */
function loadCurrentPuzzle() {
    for (const puzzle of puzzles) {
        if ("dayRequirement" in puzzle && !puzzle.dayRequirement(dateIndex))
            continue;
        loadPuzzle(puzzle);
        return;
    }
    console.warn("No puzzle first date requirement, picking last");
    loadPuzzle(puzzles[puzzles.length - 1]);
}

/**
 * Load a puzzle given its name
 * @param {object} puzzle The puzzle object with name and module, from the
 * "puzzles" array
 */
function loadPuzzle(puzzle) {
    console.log(`Loading puzzle "${puzzle.name}"`);
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