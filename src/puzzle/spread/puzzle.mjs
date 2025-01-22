
export { load };

// Possible types of non-empty cells. Given by color, icon, and an action which
// returns all positions that the cell should spread to, given tick index and
// current cell position
const cellTypes = [
    {
        color: "green",
        icon: "arrow_range",
        action: (i, pos) => [[pos[0] - 1, pos[1]], [pos[0] + 1, pos[1]]],
    }, {
        color: "orange",
        icon: "arrow_right_alt",
        action: (i, pos) => [[pos[0] + 1, pos[1]]],
    }, {
        color: "purple",
        icon: "drag_pan",
        action: (i, pos) => [[pos[0] - 1, pos[1]], [pos[0] + 1, pos[1]],
        [pos[0], pos[1] - 1], [pos[0], pos[1] + 1]],
    }, {
        color: "blue",
        icon: "height",
        action: (i, pos) => [[pos[0], pos[1] - 1], [pos[0], pos[1] + 1]],
    }
];
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
// Currently selected cell type
let selectedCellType = null;
// Indicates if simulation is currently currently running using a timeout. Is
// set to -1 when simulation is not running
let stepTimeout = -1;

/**
 * Load the puzzle
 */
function load() {
    prepareCellIcons();
    loadActions();
}

/**
 * Load all allowed actions and given functionality to actions buttons and grid
 * cells
 */
function loadActions() {
    addAction("left-right-button", cellTypes[0]);
    addAction("right-button", cellTypes[1]);
    addAction("all-button", cellTypes[2]);
    addAction("up-down-button", cellTypes[3]);
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
    // TODO: Implement this by doing a step every second
    document.getElementById("play-button").addEventListener("click", () => {
        // If busy, stop the sim and clear, otherwise start the sim
        if (isBusy())
            stopSim();
        else
            startSim();
    });
    document.getElementById("reset-button").addEventListener("click", () =>
    clearBoard);
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
    if (isBusy())
        return;
    let updateStep = (iteration = 0) => {
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
            stopSim();
            checkBoard();
            clearBoard();
            return;
        }
        setTimeout(updateStep, stepDuration);
    };
    document.getElementById("play-icon").innerText = "stop";
    document.getElementById("play-counter").style.display = "";
    stepTimeout = setTimeout(updateStep, 1);
}

/**
 * Stop the sim, if it was running. This does not clear the board
 */
function stopSim() {
    if (!isBusy())
        return;
    clearTimeout(stepTimeout);
    stepTimeout = -1;
    document.getElementById("play-icon").innerText = "play_arrow";
    document.getElementById("play-counter").style.display = "none";
}

/**
 * Clear all cell on the board. If the sim was running, stop it first
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
 * Checks if the board state is completely full
 * @returns True if the board is full, false otherwise
 */
function fullBoard() {
    for (const row of state) for (const cell of row)
        if (cell == null)
            return false;
    return true;
}

/**
 * Check if the current board meets the requirements to be correct. Show a popup
 * accordingly
 */
function checkBoard() {
    // TODO: Implement
}
