
import { trueDateIndex } from "./puzzle.mjs";
import { getPuzzleData } from "./puzzledata.mjs";

// Maximum number of days to display
const DAY_COUNT = 28;
// Earliest day that should be shown in history overview
const FIRST_DAY = 47;

loadHistoryItems();
loadHomeButton();

/**
 * Create all items in the history of puzzles on the page
 */
function loadHistoryItems() {
    let container = document.getElementById("history-container");
    for (let i = 0; i < DAY_COUNT; i++) {
        if (trueDateIndex - i < FIRST_DAY)
            return;
        let puzzleData = getPuzzleData(trueDateIndex - i);
        let item = document.createElement("a");
        if (i > 0)
            item.href = `../?p=${trueDateIndex - i}`;
        else
            item.href = "../";
        item.classList.add("history-item");
        let puzzleName = document.createElement("span");
        puzzleName.classList.add("puzzle-name");
        let puzzleNamePrefix = document.createElement("span");
        puzzleNamePrefix.classList.add("puzzle-name-prefix");
        puzzleNamePrefix.innerText = "Daily Puzzle ";
        let puzzleIndex = document.createElement("span");
        puzzleIndex.classList.add("puzzle-index");
        puzzleIndex.innerText = trueDateIndex - i;
        let numberText = document.createTextNode("#");
        puzzleName.appendChild(puzzleNamePrefix);
        puzzleName.appendChild(numberText);
        puzzleName.appendChild(puzzleIndex);
        let puzzleType = document.createElement("span");
        puzzleType.classList.add("puzzle-type");
        puzzleType.innerText = puzzleData.name;
        puzzleType.style.backgroundColor = (`var(--accent-color-` +
        `${puzzleData.color})`);
        item.appendChild(puzzleName);
        item.appendChild(puzzleType);
        container.appendChild(item);
    }
}

/**
 * Add functionality to the home button
 */
function loadHomeButton() {
    document.getElementById("home-button").addEventListener("click", () => {
        window.location.href = "..";
    });
}