
export { load };
import { showSolvedPopup } from "../../js/puzzle.mjs";

// Possible types of non-empty cells. Given by color, icon, and an action which
// returns all positions that the cell should spread to, given tick index and
// current cell position
const cellTypes = {
    leftRight: {
        name: "leftRight",
        color: "green",
        icon: "arrow_range",
        targetId: "left-right-target",
        action: (i, pos) => [[pos[0] - 1, pos[1]], [pos[0] + 1, pos[1]]],
    },
    right: {
        name: "right",
        color: "orange",
        icon: "arrow_right_alt",
        targetId: "right-target",
        action: (i, pos) => [[pos[0] + 1, pos[1]]],
    },
    all: {
        name: "all",
        color: "purple",
        icon: "drag_pan",
        targetId: "all-target",
        action: (i, pos) => [[pos[0] - 1, pos[1]], [pos[0] + 1, pos[1]],
        [pos[0], pos[1] - 1], [pos[0], pos[1] + 1]],
    },
    upDown: {
        name: "upDown",
        color: "blue",
        icon: "height",
        targetId: "up-down-target",
        action: (i, pos) => [[pos[0], pos[1] - 1], [pos[0], pos[1] + 1]],
    },
};
// Rows/columns of board
const boardSize = 5;
// Simulation step duration in ms
const stepDuration = 1000;

// Current board state, a 5x5 grid
let state = [];
for (let i = 0; i < boardSize; i++) {
    let row = [];
    for (let j = 0; j < boardSize; j++)
        row.push(null);
    state.push(row);
}
// Last user-entered state
let userState = state;
// Currently selected cell type
let selectedCellType = null;
// Indicates if simulation is currently currently running using a timeout. Is
// set to -1 when simulation is not running
let stepTimeout = -1;
// Query of numbers of all types
let query = null;
// Keeps track of number of cells that were filled by the player
let userFilledCells = -1;

/**
 * Load the puzzle
 */
function load() {
    prepareCellIcons();
    loadActions();
    generateRandomQuery();
}

/**
 * Load all allowed actions and given functionality to actions buttons and grid
 * cells
 */
function loadActions() {
    addAction("left-right-button", cellTypes.leftRight);
    addAction("right-button", cellTypes.right);
    addAction("all-button", cellTypes.all);
    addAction("up-down-button", cellTypes.upDown);
    for (const elt of document.getElementsByClassName("grid-cell")) {
        elt.addEventListener("click", () => {
            if (isBusy())
                return;
            let x = Number(elt.getAttribute("data-cell-x"));
            let y = Number(elt.getAttribute("data-cell-y"));
            if (state[x][y] != null && state[x][y].color ==
            selectedCellType.color)
                state[x][y] = null;
            else
                state[x][y] = selectedCellType;
            updateDisplay();
        });
    }
    document.getElementById("play-button").addEventListener("click", () => {
        // If busy, stop the sim and clear, otherwise start the sim
        if (isBusy())
            stopSim();
        else
            startSim();
    });
    document.getElementById("reset-button").addEventListener("click", () => {
        clearBoard();
        updateDisplay();
    });
}

/**
 * Add functionality to one of the action buttons by storing the selected cell
 * type
 * @param {String} id The ID of the HTML element that needs to be selected for
 * the action
 * @param {Function} cellType The cell type to store if the button is pressed
 */
function addAction(id, cellType) {
    let elt = document.getElementById(id);
    if (selectedCellType == null) {
        selectedCellType = cellType;
        elt.classList.add("action-button-selected");
    }
    elt.addEventListener("click", () => {
        selectedCellType = cellType;
        for (const other of document.getElementsByClassName("action-button"))
            other.classList.remove("action-button-selected");
        elt.classList.add("action-button-selected");
    });
}

/**
 * Add icons to all grid cells
 */
function prepareCellIcons() {
    for (const elt of document.getElementsByClassName("grid-cell"))
        elt.innerHTML = "<span class='material-symbols-outlined'></span>";
}

/**
 * Update the display of the board grid
 */
function updateDisplay() {
    for (const elt of document.getElementsByClassName("grid-cell")) {
        let x = Number(elt.getAttribute("data-cell-x"));
        let y = Number(elt.getAttribute("data-cell-y"));
        let icon = elt.getElementsByClassName("material-symbols-outlined")[0];
        if (state[x][y] == null) {
            elt.style.backgroundColor = "";
            elt.classList.remove("grid-cell-filled");
            continue;
        }
        icon.innerText = state[x][y].icon;
        elt.classList.add("grid-cell-filled");
        elt.style.backgroundColor = `var(--accent-color-${state[x][y].color})`;
    }
}

/**
 * Copy the current state and return the copy
 * @returns A copy of the current state
 */
function copyState() {
    let res = [];
    for (const row of state) {
        let cur = [];
        for (const cell of row)
            cur.push(cell);
        res.push(cur);
    }
    return res;
}

/**
 * Perform one spread step by going over the grid row by row, from left to right
 * and performing the actions that are registered to the cells. This function
 * only updates the state, not the display. Optionally the current iteration
 * can be given
 * @param {number} iteration The current iteration count
 */
function step(iteration = 0) {
    let prevState = copyState();
    for (let y = 0; y < boardSize; y++) for (let x = 0; x < boardSize; x++) {
        if (prevState[x][y] == null)
            continue;
        let targets = prevState[x][y].action(iteration, [x, y]);
        for (const target of targets) {
            let tx = target[0], ty = target[1];
            if (tx < 0 || tx >= boardSize || ty < 0 || ty >= boardSize)
                continue;
            if (state[tx][ty] != null)
                continue;
            state[tx][ty] = prevState[x][y];
        }
    }
}

/**
 * Check if there is currently a spread simulation being run
 * @returns A boolean indicating if simulaton is being run
 */
function isBusy() {
    return stepTimeout != -1;
}

/**
 * Start the spread sim, if it has not started yet
 */
function startSim() {
    userState = copyState();
    userFilledCells = filledCells();
    if (isBusy())
        return;
    let updateStep = (iteration) => {
        let prevState = copyState();
        step(iteration);
        updateDisplay();
        document.getElementById("play-counter").innerText = String(iteration +
        1);
        let hasChanged = false;
        for (let x = 0; x < boardSize; x++) for (let y = 0; y < boardSize; y++)
            if (prevState[x][y] != state[x][y])
                hasChanged = true;
        // Stop sim if the board if nothing has changed and show result
        if (!hasChanged) {
            checkBoard();
            stopSim();
            return;
        }
        stepTimeout = setTimeout(() => updateStep(iteration + 1), stepDuration);
    };
    document.getElementById("play-icon").innerText = "stop";
    document.getElementById("play-counter").style.display = "";
    document.getElementById("play-counter").innerText = "0";
    stepTimeout = setTimeout(() => updateStep(0), stepDuration);
}

/**
 * Stop the sim, if it was running. This resets the board to the last user state
 */
function stopSim() {
    if (!isBusy())
        return;
    clearTimeout(stepTimeout);
    stepTimeout = -1;
    state = userState;
    updateDisplay();
    document.getElementById("play-icon").innerText = "play_arrow";
    document.getElementById("play-counter").style.display = "none";
}

/**
 * Clear all cells on the board. If the sim was running, stop it first
 */
function clearBoard() {
    // Check if sim is still running
    if (isBusy())
        stopSim();
    // Clear the board
    state = [];
    for (let i = 0; i < boardSize; i++) {
        let row = [];
        for (let j = 0; j < boardSize; j++)
            row.push(null);
        state.push(row);
    }
}

/**
 * Check if the current state matches the query
 * @returns A boolean indicating if current state is correct
 */
function isCorrect() {
    let typeCounts = countCellTypes();
    for (const key in query)
        if (!(key in typeCounts) || typeCounts[key] != query[key])
            return false;
    return true;
}

/**
 * Check if the current board meets the requirements to be correct. Show a popup
 * accordingly
 */
function checkBoard() {
    if (isCorrect())
        showSuccessScreen();
    else
        showFailScreen();
}

function showFailScreen() {
    let content = ("The amounts of cells of each type do not match the " +
    "amounts you needed to have.<div style='margin-top: 2em;'></div>");
    let typeCounts = countCellTypes();
    for (const key in typeCounts) {
        if (query[key] != typeCounts[key]) {
            let icon = `<span
            class='material-symbols-outlined'>${cellTypes[key].icon}</span>`
            content += `<div class='amount-error'>
                <div class='amount-error-action'>
                    <div class='action-button'
                    style='background-color:
                    var(--accent-color-${cellTypes[key].color})'>${icon}</div>
                </div>
                <div class='amount-error-given'>
                    <div>${typeCounts[key]}x</div>
                </div>
                <div class='amount-error-required'>
                    <div>${query[key]}x</div>
                </div>
            </div>`;
        }
    }
    content += ("<div style='margin-top: 2em;'></div>Required amounts are " +
    "below the buttons!");
    let shareText = "I did not solve today's puzzle 😭";
    showSolvedPopup("You failed 😭", content, shareText);
}

/**
 * Count the number of cells of each type on the board and return the result
 * @returns An object where every key matches one of the keys in the cellTypes
 * constant. The values are the counts of the cell types
 */
function countCellTypes() {
    let counts = {};
    for (const key in cellTypes)
        counts[key] = 0;
    for (const row of state) for (const cell of row) {
        if (cell == null)
            continue;
        counts[cell.name]++;
    }
    return counts;
}

/**
 * Show the success screen
 */
function showSuccessScreen() {
    // Displayed text
    let optimal = Object.keys(cellTypes).length;
    let minText = `The minimum number of initial placements is ${optimal}. `;
    let titleText = null;
    if (userFilledCells <= optimal) {
        titleText = "Perfect! 🏆";
        minText = "That's the minimum number of placements! ";
    }
    // Share text
    let shareText = (`I solved today's puzzle with ${userFilledCells} ` +
    `placements.`);
    if (userFilledCells <= optimal)
        shareText += " 🏆";
    let boxes = "";
    for (let i = 0; i < userFilledCells; i++) {
        if (i % 10 == 0)
            boxes += "\n";
        boxes += "🟧";
    }
    shareText += boxes;
    showSolvedPopup(titleText, `You solved today's puzzle with ` +
    `${userFilledCells} placements. ${minText} But how do you compare ` +
    `against your friends?`, shareText);
}

/**
 * Generate a random query by randomly placing initial cells and simulating
 */
function generateRandomQuery() {
    // TODO: Implement properly
    query = {};
    for (const key in cellTypes)
        query[key] = 1;
    for (const key in query)
        document.getElementById(cellTypes[key].targetId).innerText = query[key];
}

/**
 * Count the number of non-empty cells on the board
 * @returns Number of non-empty cells
 */
function filledCells() {
    let count = 0;
    for (const row of state) for (const cell of row)
        if (cell != null)
            count++;
    return count;
}