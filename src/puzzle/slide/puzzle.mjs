
export { load };
import { random } from "../../js/random.mjs";

// Number should range 0 to TILES.length - 1
const TILES = {
    empty: 0,
    heart: 1,
    star: 2,
    circle: 3,
};
const STYLE_SETTINGS = [
    { color: "--", icon: "--" },
    { color: "pink", icon: "favorite" },
    { color: "yellow", icon: "star" },
    { color: "green", icon: "circle" },
];
// NOTE: The height and width of this state are used to generate grids
const TARGET_STATE = [
    [ TILES.star, TILES.circle, TILES.circle, TILES.star ],
    [ TILES.circle, TILES.heart, TILES.heart, TILES.circle ],
    [ TILES.circle, TILES.heart, TILES.heart, TILES.circle ],
    [ TILES.star, TILES.circle, TILES.circle, TILES.empty ],
];
const INITIAL_SHUFFLE = 300;

// The current state, which will be filled once the initial state is generated
let currentState = null;
// History of states from the initial state
let history = [];
// Minimum number of moves to solve
let minMoves = null;

/**
 * Load the puzzle
 */
function load() {
    displayTargetState();
    generateInitialState();
    prepareGrid(document.getElementById("current-grid"));
    displayCurrentState();
    addCellFunctions();
    // Undo and reset buttons
    document.getElementById("undo-button").addEventListener("click", undo);
    document.getElementById("reset-button").addEventListener("click", reset);
    setTimeout(calcMinimumMoves, 500);
}

/**
 * Add functionality to the current state grid cells
 */
function addCellFunctions() {
    let i = 0;
    for (const row of document.getElementById("current-grid").children) {
        let j = 0;
        for (const cell of row.children) {
            let ci = i, cj = j;
            cell.addEventListener("click", () => {
                if (!cell.classList.contains("grid-cell-active"))
                    return;
                doMoveOnCurrentState(ci, cj);
                displayCurrentState();
            });
            j++;
        }
        i++;
    }
}

/**
 * Display the target state in the target grid
 */
function displayTargetState() {
    prepareGrid(document.getElementById("target-grid"));
    displayGrid(TARGET_STATE, document.getElementById("target-grid"), false);
}

/**
 * Add elements required to display a grid to the given container
 * @param {HTMLElement} container The container to prepare for displaying a grid
 */
function prepareGrid(container) {
    for (let i = 0; i < TARGET_STATE.length; i++) {
        let row = document.createElement("div");
        row.classList.add("grid-row");
        for (let j = 0; j < TARGET_STATE[0].length; j++) {
            let cell = document.createElement("div");
            cell.classList.add("grid-cell");
            let icon = document.createElement("span");
            icon.classList.add("icon", "material-symbols-outlined");
            cell.appendChild(icon);
            row.appendChild(cell);
        }
        container.appendChild(row);
    }
}

/**
 * Update the display of the given HTML grid container to display the given
 * grid. This function assumes the grid rows and cells are already present such
 * that they are only modified
 * @param {number[][]} grid The grid to display
 * @param {HTMLElement} container The container to display the grid on
 * @param {boolean} activeCells Whether to make cells next to empty cells active
 */
function displayGrid(grid, container, activeCells = true) {
    // Gather grid cell elements
    let elements = [];
    for (const row of container.children) {
        let cur = [];
        for (const cell of row.children)
            cur.push(cell);
        elements.push(cur);
    }
    // Update display of individual cells
    for (let i = 0; i < elements.length; i++)
        for (let j = 0; j < elements[i].length; j++)
            displayCell(grid[i][j], elements[i][j]);
    if (!activeCells)
        return;
    // Make cells next to empty cell active
    for (let i = 0; i < elements.length; i++) {
        for (let j = 0; j < elements[i].length; j++) {
            elements[i][j].classList.toggle("grid-cell-active",
            isNextToEmpty(i, j, grid));
        }
    }
}

/**
 * Check if a given cell is next to an empty cell
 * @param {number} x The x-coordinate of the cell
 * @param {number} y The y-coordinate of the cell
 * @param {number[][]} grid The grid to check for empty cells
 * @returns If the given cell is next to an empty cell. If the cell itself is
 * empty, always returns false
 */
function isNextToEmpty(x, y, grid) {
    if (grid[x][y] == TILES.empty)
        return false;
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
        if (x + dx < 0 || x + dx >= grid.length || y + dy < 0 || y + dy >=
        grid[x].length)
            continue;
        if (dx != 0 && dy != 0)
            continue;
        if (grid[x + dx][y + dy] == TILES.empty)
            return true;
    }
    return false;
}

/**
 * Update the display of a grid cell to the given value
 * @param {number} value The value to update the cell to
 * @param {HTMLElement} element The HTML element to update
 */
function displayCell(value, element) {
    if (value == TILES.empty) {
        element.classList.remove("grid-cell-filled");
        element.style.backgroundColor = "";
        return;
    }
    element.getElementsByClassName("icon")[0].innerText = (
    STYLE_SETTINGS[value].icon);
    element.classList.add("grid-cell-filled");
    element.style.backgroundColor = (`var(--accent-color-` +
    `${STYLE_SETTINGS[value].color})`);
}

/**
 * Update the display of the current state
 */
function displayCurrentState() {
    displayGrid(currentState, document.getElementById("current-grid"));
    // Update undo counter
    let undoCounter = document.getElementById("undo-counter");
    undoCounter.style.display = history.length == 0 ? "none" : "";
    undoCounter.innerText = String(history.length);
}

/**
 * Generate the initial state and put it in the currentState variable
 */
function generateInitialState() {
    currentState = copyState(TARGET_STATE);
    for (let i = 0; i < INITIAL_SHUFFLE; i++) {
        let moves = possibleMoves(currentState);
        let chosenMove = moves[Math.floor(random() * moves.length)];
        doMove(chosenMove[0], chosenMove[1], currentState);
    }
}

/**
 * Perform a move on the current state
 * @param {number} x The x-coordinate of the move
 * @param {number} y The y-coordinate of the move
 */
function doMoveOnCurrentState(x, y) {
    history.push(copyState(currentState));
    console.log(history);
    doMove(x, y, currentState);
}

/**
 * Perform a move on the given grid
 * @param {number} x The x-coordinate of the move
 * @param {number} y The y-coordinate of the move
 * @param {number[][]} grid The grid to perform the move on. Note that this grid
 * is modified in-place
 */
function doMove(x, y, grid) {
    let target = emptyCell(grid);
    let tx = target[0], ty = target[1];
    grid[tx][ty] = grid[x][y];
    grid[x][y] = TILES.empty;
}

/**
 * Get all possible moves on a given grid
 * @param {number[][]} grid The grid to get the possible moves of
 * @returns A list of [x, y] coordinates of possible moves
 */
function possibleMoves(grid) {
    let empty = emptyCell(grid);
    let ex = empty[0], ey = empty[1];
    let moves = [];
    if (ex > 0)
        moves.push([ex - 1, ey]);
    if (ex + 1 < grid.length)
        moves.push([ex + 1, ey]);
    if (ey > 0)
        moves.push([ex, ey - 1]);
    if (ey + 1 < grid[0].length)
        moves.push([ex, ey + 1]);
    return moves;
}

/**
 * Get the coordinates of the empty grid cell on the given grid
 * @param {number[][]} grid The grid to find the empty grid cell of
 * @returns The coordinates of the empty grid cell as [x, y]
 */
function emptyCell(grid) {
    for (let i = 0; i < grid.length; i++)
        for (let j = 0; j < grid[0].length; j++)
            if (grid[i][j] == TILES.empty)
                return [i, j];
    return [-1, -1];
}

/**
 * Create a copy of the given grid state
 * @param {number[][]} grid The grid to copy
 * @returns The copy of the grid
 */
function copyState(grid) {
    let newState = [];
    for (const row of grid) {
        let cur = [];
        for (const cell of row)
            cur.push(cell);
        newState.push(cur);
    }
    return newState;
}

/**
 * Undo the last move, if a move can be undone
 */
function undo() {
    if (history.length == 0)
        return;
    currentState = history[history.length - 1];
    history.pop();
    displayCurrentState();
}

/**
 * Reset the puzzle and remove undo history
 */
function reset() {
    if (history.length == 0)
        return;
    currentState = history[0];
    history = [];
    displayCurrentState();
}

/**
 * Encode a grid state to a number
 * @param {number[][]} grid The grid to encode to a number
 * @returns The grid encoded as a number
 */
function encodeState(grid) {
    let p = 1;
    let out = 0;
    let numTiles = Object.keys(TILES).length;
    for (let i = 0; i < TARGET_STATE.length; i++) {
        for (let j = 0; j < TARGET_STATE[0].length; j++) {
            out += p * grid[i][j];
            p *= numTiles;
        }
    }
    return out;
}

/**
 * Decode an encoded grid state
 * @param {number} encodedGrid The grid encoded as a number
 * @returns The number decoded to a grid state
 */
function decodeState(encodedGrid) {
    let grid = [];
    let cur = encodedGrid;
    let numTiles = Object.keys(TILES).length;
    for (let i = 0; i < TARGET_STATE.length; i++) {
        let row = [];
        for (let j = 0; j < TARGET_STATE[0].length; j++) {
            row.push(cur % numTiles);
            cur = Math.floor(cur / numTiles);
        }
        grid.push(row);
    }
    return grid;
}

/**
 * Get an upper bound for the number encodeState will return
 * @returns The upper bound as a number
 */
function stateCount() {
    let numTiles = Object.keys(TILES).length;
    return Math.pow(numTiles, TARGET_STATE.length + TARGET_STATE[0].length);
}

/**
 * Calculate the minimum number of moves required to solve the puzzle. Set the
 * variable minMoves to this value. This function can be very slow (especially
 * on lower-end devices)
 */
function calcMinimumMoves() {
    let startTime = performance.now();
    let done = new Array(stateCount()).fill(false);
    let target = encodeState(TARGET_STATE);
    let start = encodeState(currentState);
    // Queue with pairs [state, number of moves]
    let q = [[start, 0]];
    done[start] = true;
    let index = 0;
    while (index < q.length) {
        let cur = q[index][0], moves = q[index][1];
        cur = decodeState(cur);
        index++;
        for (const move of possibleMoves(cur)) {
            let nextState = copyState(cur);
            doMove(move[0], move[1], nextState);
            nextState = encodeState(nextState);
            if (done[nextState])
                continue;
            done[nextState] = true;
            q.push([nextState, moves + 1]);
            if (nextState == target) {
                let endTime = performance.now();
                minMoves = moves + 1;
                console.log("Minimum moves:", minMoves);
                console.log("Time to calculate:", endTime - startTime, "ms");
                return;
            }
        }
    }
    console.error("Could not find minimum number of moves");
}