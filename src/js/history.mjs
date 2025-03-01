
import { trueDateIndex } from "./puzzle.mjs";
import { getPuzzleData } from "./puzzledata.mjs";

// Number of days to display
const DAY_COUNT = 7;

loadHistoryItems();

function loadHistoryItems() {
    let container = document.getElementById("history-container");
    for (let i = 0; i < DAY_COUNT; i++) {
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