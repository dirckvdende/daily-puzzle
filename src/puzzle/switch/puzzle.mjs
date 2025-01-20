
export { load };
import { getFileContent } from "../../js/filesystem.mjs";
import { random } from "../../js/random.mjs";
import { showSolvedPopup } from "../../js/puzzle.mjs";

// Current game state
let state = [
    [ false, false, false, false ],
    [ false, false, false, false ],
    [ false, false, false, false ],
    [ false, false, false, false ],
];
// History of game states as a stack
let stateHistory = [];
// List of all possible actions
let actions = [];
// Currently selected action
let selectedAction = null;
// Cache of optimal moves per possible state
let optimalCache = null;
// Optimal moves from starting position
let optimal = -1;

/**
 * Load the puzzle
 */
function load() {
    loadIcons();
    loadActions();
    calcMinimumMoves(() => {
        generateInitialGameState();
        optimal = getMinimumMoves();
    });
}

/**
 * Load icons on the action buttons
 */
function loadIcons() {
    loadIcon(document.getElementById("full-rect-button").children[0], [[10, 10],
    [10, 50], [10, 90], [50, 10], [50, 50], [50, 90], [90, 10], [90, 50],
    [90, 90]]);
    loadIcon(document.getElementById("plus-button").children[0], [[10, 50],
    [50, 10], [50, 50], [50, 90], [90, 50]]);
    loadIcon(document.getElementById("times-button").children[0], [[10, 10],
    [10, 90], [50, 50], [90, 10], [90, 90]]);
}

/**
 * Load an action button icon into an SVG element
 * @param {HTMLElement} svg The SVG element to load icon into
 * @param {Array} positions Array of positions to place dots, given as [x, y]
 */
function loadIcon(svg, positions) {
    for (const pos of positions) {
        let x = pos[0], y = pos[1];
        // Need namespaced create element here before of SVG
        let elt = document.createElementNS("http://www.w3.org/2000/svg",
        "rect");
        elt.setAttribute("x", x - 15);
        elt.setAttribute("y", y - 15);
        elt.setAttribute("width", 30);
        elt.setAttribute("height", 30);
        elt.setAttribute("rx", 10);
        elt.setAttribute("fill", "white");
        svg.appendChild(elt);
    }
}

/**
 * Load all allowed actions and give functionality to action buttons and grid
 * cells
 */
function loadActions() {
    addAction("full-rect-button", (x, y) => {
        for (let dx = -1; dx <= 1; dx++)
            for (let dy = -1; dy <= 1; dy++)
                flip(x + dx, y + dy);
    });
    addAction("plus-button", (x, y) => {
        flip(x - 1, y);
        flip(x, y);
        flip(x + 1, y);
        flip(x, y - 1);
        flip(x, y + 1);
    });
    addAction("times-button", (x, y) => {
        flip(x, y);
        flip(x - 1, y - 1);
        flip(x - 1, y + 1);
        flip(x + 1, y - 1);
        flip(x + 1, y + 1);
    });
    document.getElementById("undo-button").addEventListener("click",
    undoAction);
    document.getElementById("reset-button").addEventListener("click",
    resetAction);
    for (const elt of document.getElementsByClassName("grid-cell")) {
        elt.addEventListener("click", () => {
            let x = Number(elt.getAttribute("data-cell-x"));
            let y = Number(elt.getAttribute("data-cell-y"));
            // Create deep copy of state and add to history
            stateHistory.push(copyState());
            selectedAction(x, y);
            updateDisplay();
            checkSolved();
        });
    }
}

/**
 * Add an action to the given button, and store the action
 * @param {HTMLElement} id The ID of the HTML element that needs to be selected
 * for the action
 * @param {Function} action A function (x, y) => action;
 */
function addAction(id, action) {
    let elt = document.getElementById(id);
    if (selectedAction == null) {
        selectedAction = action;
        elt.classList.add("action-button-selected");
    }
    actions.push(action);
    elt.addEventListener("click", () => {
        selectedAction = action;
        for (const other of document.getElementsByClassName("action-button"))
            other.classList.remove("action-button-selected");
        elt.classList.add("action-button-selected");
    });
}

/**
 * Update the display of the game state and the undo counter
 */
function updateDisplay() {
    for (const elt of document.getElementsByClassName("grid-cell")) {
        let x = Number(elt.getAttribute("data-cell-x"));
        let y = Number(elt.getAttribute("data-cell-y"));
        if (state[x][y])
            elt.classList.add("grid-cell-active");
        else
            elt.classList.remove("grid-cell-active");
    }
    let undoCounter = document.getElementById("undo-counter");
    undoCounter.innerText = String(stateHistory.length);
    undoCounter.style.display = stateHistory.length == 0 ? "none" : "";
}

/**
 * Flip the cell at the given coordinates. If this position is outside the
 * board this has no effect
 * @param {number} x The x-coordinate
 * @param {number} y The y-coordinate
 */
function flip(x, y) {
    if (x < 0 || y < 0)
        return;
    if (x >= state.length || y >= state[x].length)
        return;
    state[x][y] = !state[x][y];
}

/**
 * Make a deep copy of the current state
 * @returns The deep copy
 */
function copyState() {
    return JSON.parse(JSON.stringify(state));
}

/**
 * Perform a single undo (if possible)
 */
function undoAction() {
    if (stateHistory.length == 0)
        return;
    state = stateHistory.pop();
    updateDisplay();
}

/**
 * Reset the state and grid
 */
function resetAction() {
    if (stateHistory.length == 0)
        return;
    state = stateHistory[0];
    stateHistory = [];
    updateDisplay();
}

/**
 * Randomly generate an initial game state by performing some random moves
 */
function generateInitialGameState() {
    // Generate 10 configs, choose the hardest
    let maxMoves = 0, maxState = null;
    let baseState = copyState();
    for (let i = 0; i < 10; i++) {
        let moveCount = Math.floor(random() * 5) + 10;
        for (let i = 0; i < moveCount; i++) {
            let x = Math.floor(random() * state.length);
            let y = Math.floor(random() * state[x].length);
            let action = actions[Math.floor(random() * actions.length)];
            action(x, y);
        }
        let moves = getMinimumMoves();
        if (moves >= maxMoves) {
            maxMoves = moves;
            maxState = copyState();
        }
        state = baseState;
        state = copyState();
    }
    state = maxState;
    updateDisplay();
}

/**
 * Check if the puzzle has been solved, meaning all boxes are unchecked
 * @returns A boolean indicating if puzzle has been solved
 */
function isSolved() {
    for (const row of state) for (const cell of row)
        if (cell)
            return false;
    return true;
}

/**
 * Check if the puzzle has been solved and show the solved screen if this is the
 * case
 */
function checkSolved() {
    if (!isSolved())
        return;
    // Show result screen
    let moveCount = stateHistory.length;
    // Displayed text
    let minText = "";
    if (optimal >= 0)
        minText = `The minimum number of moves is ${optimal}. `;
    let titleText = null;
    if (moveCount <= optimal) {
        titleText = "Perfect! 🏆";
        minText = "That's the minimum number of moves! ";
    }
    // Share text
    let shareText = `I solved today's puzzle in ${moveCount} moves.`;
    if (moveCount <= optimal)
        shareText += " 🏆";
    let moveBoxes = "";
    for (let i = 0; i < moveCount; i++)
        moveBoxes += "🟦";
    shareText += moveBoxes;
    showSolvedPopup(titleText, `You solved today's puzzle in ${moveCount} ` +
    `moves. ${minText} But how do you compare against your friends?`,
    shareText);
}

/**
 * Get the minimum number of moves necessary for every possible game state. This
 * function needs to be run and finished before getMinimumMoves
 * @param {Function | null} callback Function to call once minimum moves have
 * been determined. From here getMinimumMoves can be called
 */
function calcMinimumMoves(callback = null) {
    if (optimalCache != null) {
        if (callback != null)
            callback();
        return;
    }
    getFileContent("./src/puzzle/switch/optimal.txt", (txt) => {
        optimalCache = [];
        for (const value of txt.split(","))
            if (value != "")
                optimalCache.push(Number(value));
        if (callback != null)
            callback();
    });
}

/**
 * Get the minimum number of moves to solve the puzzle from the current state
 * @returns The minimum number of moves
 */
function getMinimumMoves() {
    let index = 0, i = 0;
    for (const row of state) for (const cell of row) {
        if (cell)
            index += 1 << i;
        i++;
    }
    return optimalCache[index];
}
