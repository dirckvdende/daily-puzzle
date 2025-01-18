
import * as operatorPuzzle from "./operator.mjs";
import { copyToClipboard, showHelpDisplay } from "./utils.mjs";
import { dateIndex } from "./puzzle.mjs";
import { getFileContent } from "./filesystem.mjs";

// Map of puzzle names to puzzle modules
const puzzles = {
    operator: operatorPuzzle,
};

let shareTextTimeout = null;

window.onload = function() {
    loadPuzzle("operator");
    document.getElementById("solved-share-button").addEventListener("click",
    function () {
        document.getElementById("clipboard-text").style.display = "block";
        copyToClipboard(document.getElementById("solved-share-button")
        .getAttribute("data-share-text"));
        if (shareTextTimeout != null)
            clearTimeout(shareTextTimeout);
        shareTextTimeout = setTimeout(function () {
            document.getElementById("clipboard-text").style.display = "none";
        }, 2000);
    });
    preparePopups();
    // Dark mode button
    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark-mode");
    }
    document.getElementById("theme-button").addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const theme = body.classList.contains("dark-mode") ? "dark" : "light";
        localStorage.setItem("theme", theme);
    });
    // Help button
    getFileContent("./src/puzzle/operator/help.html", function (content) {
        document.getElementById("help-container").innerHTML = content;
    });
    document.getElementById("help-button").addEventListener("click",
    function () {
        showHelpDisplay();
    });
    // Add puzzle number to title
    let indexText = ` #${dateIndex}`;
    document.getElementById("main-title").innerText += indexText;
    document.getElementsByTagName("title")[0].innerText += indexText;
}

/**
 * Load a puzzle given its name
 * @param {string} name The name of the puzzle
 */
function loadPuzzle(name) {
    puzzles[name].load();
}

/**
 * Add functionality to popups, e.g. to close them by clicking on the cross
 * button
 */
function preparePopups() {
    document.querySelectorAll(".popup-background, .close-button").forEach(
    function (elt) {
        elt.addEventListener("click", function () {
            document.querySelectorAll(".popup").forEach(function (popup) {
                popup.style.display = "none";
            });
        });
    });
}