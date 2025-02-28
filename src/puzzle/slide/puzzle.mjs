
export { load };
import { random } from "../../js/random.mjs";

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
const INITIAL_SHUFFLE = 30;

// The current state, which will be filled once the initial state is generated
let currentState = null;

/**
 * Load the puzzle
 */
function load() {
    displayTargetState();
    generateInitialState();
    prepareGrid(document.getElementById("current-grid"));
    displayCurrentState();
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
            icon.classList.add("material-symbols-outlined");
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
        for (let j = 0; j < elements[i].length; i++) {
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
    element.getElementsByClassName("material-symbols-outlined")[0].innerText = (
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
 * Perform a move on the given grid
 * @param {number} x The x-coordinate of the move
 * @param {number} y The y-coordinate of the move
 * @param {number[][]} grid The grid to perform the move on. Note that this grid
 * is modified in-place
 */
function doMove(x, y, grid) {
    // TODO: Implement
}

/**
 * Get all possible moves on a given grid
 * @param {number[][]} grid The grid to get the possible moves of
 * @returns A list of [x, y] coordinates of possible moves
 */
function possibleMoves(grid) {
    // TODO: Implement
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