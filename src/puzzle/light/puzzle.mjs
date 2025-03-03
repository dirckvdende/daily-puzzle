
export { load };
import { random } from "../../js/random.mjs";
import { showSolvedPopup } from "../../js/puzzle.mjs";

// Width and height of the grid
const WIDTH = 6, HEIGHT = 6;
// Base light level of a light source
const BASE_LIGHT_LEVEL = 6;
// Maximum number of bulbs with which the light targets are generated
const MAX_BULBS = 5;
// Maximum number of light levels to sample to generate targets
const MAX_TARGETS = 10;

// Current game state is a grid indicating which lights are turned on and off
let currentState = null;
// Light level targets (should have same dimensions as current state). Cells
// without a target will be -1
let lightTargets = null;
// The minimum number of moves, null if uncalculated
let minMoves = null;

/**
 * Load the puzzle
 */
function load() {
    prepareCurrentState();
    generateLightTargets();
    prepareGrid();
    displayLightTargets();
    displayState(currentState);
    addFunctionality();
    setTimeout(calcMinimumMoves, 500);
}

/**
 * Prepare the starting state (all lights turned off)
 */
function prepareCurrentState() {
    currentState = [];
    for (let i = 0; i < HEIGHT; i++)
        currentState.push(Array(WIDTH).fill(false));
}

/**
 * Generate random light targets by placing at most 5 light sources on the grid
 * and measuring light levels at random locations
 */
function generateLightTargets() {
    // Random light bulbs
    let state = [];
    for (let i = 0; i < HEIGHT; i++)
        state.push(Array(WIDTH).fill(false));
    for (let i = 0; i < MAX_BULBS; i++) {
        let x = Math.floor(random() * HEIGHT);
        let y = Math.floor(random() * WIDTH);
        state[x][y] = true;
    }
    // Randomly sample light levels
    let levels = getLightLevels(state);
    lightTargets = [];
    for (let i = 0; i < HEIGHT; i++)
        lightTargets.push(Array(WIDTH).fill(-1));
    for (let i = 0; i < MAX_TARGETS; i++) {
        let x = Math.floor(random() * HEIGHT);
        let y = Math.floor(random() * WIDTH);
        lightTargets[x][y] = levels[x][y];
    }
}

/**
 * Generate the grid that the game is played on
 */
function prepareGrid() {
    let container = document.getElementById("grid-container");
    for (let i = 0; i < HEIGHT; i++) {
        let row = document.createElement("div");
        row.classList.add("grid-row");
        for (let j = 0; j < WIDTH; j++) {
            let cell = document.createElement("div");
            cell.setAttribute("data-cell-x", String(i));
            cell.setAttribute("data-cell-y", String(j));
            cell.classList.add("grid-cell");
            let icon = document.createElement("span");
            icon.classList.add("material-symbols-outlined");
            icon.classList.add("bulb");
            icon.innerText = "lightbulb_2";
            cell.appendChild(icon);
            row.appendChild(cell);
        }
        container.appendChild(row);
    }
}

/**
 * Add a display of a light level target as an up/down arrow (or equals if light
 * level matches)
 */
function displayLightTargets() {
    for (let i = 0; i < HEIGHT; i++) {
        for (let j = 0; j < WIDTH; j++) {
            if (lightTargets[i][j] != -1)
                addLightLeveltarget(i, j);
        }
    }
}

/**
 * Get the HTML element corresponding to a cell on the grid
 * @param {number} x The x-coordinate of the cell
 * @param {number} y The y-coordinate of the cell
 * @returns The HTML element of the cell
 */
function getCellElement(x, y) {
    return document.querySelector(`div[data-cell-x="${x}"][data-cell-y="${y}"]`
    );
}

/**
 * Add a target arrow in the given grid cell
 * @param {number} x The x-coordinate of the target
 * @param {number} y The y-coordinate of the target
 */
function addLightLeveltarget(x, y) {
    let cell = getCellElement(x, y);
    let elt = document.createElement("div");
    elt.innerText = "arrow_upward";
    elt.classList.add("objective-number", "material-symbols-outlined");
    cell.appendChild(elt);
}

/**
 * Get the color that a cell should be given its light level
 * @param {number} level The light level
 * @returns The color as a valid CSS color value
 */
function lightLevelColor(level) {
    let pct = level / BASE_LIGHT_LEVEL * 100.0;
    return (`color-mix(in hsl, ` + 
    `var(--soft-background-color), var(--accent-color-orange) ${pct}%)`);
}

/**
 * Display a game state. Assumes grid cells and light level target elements are
 * already present
 * @param {number[][]} state The grid which is the state to display
 */
function displayState(state) {
    let levels = getLightLevels(state);
    for (let i = 0; i < HEIGHT; i++) {
        for (let j = 0; j < WIDTH; j++) {
            let cell = getCellElement(i, j);
            // Background color
            cell.style.backgroundColor = lightLevelColor(
            levels[i][j]);
            // Light bulb
            cell.classList.toggle("grid-cell-active", state[i][j]);
            // Target arrow
            if (lightTargets[i][j] == -1)
                continue;
            let icon = "equal";
            if (levels[i][j] < lightTargets[i][j])
                icon = "arrow_upward";
            else if (levels[i][j] > lightTargets[i][j])
                icon = "arrow_downward";
            let targetNumber = cell.querySelector(".objective-number");
            targetNumber.innerText = icon;
        }
    }
}

/**
 * Get the light levels from the current grid state
 * @param {boolean[][]} state The grid which is the state of the game
 * @returns A grid with the light level at each grid cell
 */
function getLightLevels(state) {
    let levels = [];
    for (let i = 0; i < HEIGHT; i++)
        levels.push(Array(WIDTH).fill(0));
    for (let i = 0; i < HEIGHT; i++) {
        for (let j = 0; j < WIDTH; j++) {
            if (!state[i][j])
                continue;
            for (let ti = 0; ti < HEIGHT; ti++) {
                for (let tj = 0; tj < WIDTH; tj++) {
                    let distance = Math.abs(i - ti) + Math.abs(j - tj);
                    let brightness = Math.max(0, BASE_LIGHT_LEVEL - distance);
                    levels[ti][tj] = Math.max(levels[ti][tj], brightness);
                }
            }
        }
    }
    return levels;
}

/**
 * Check if a certain game state is a solution to the light targets set
 * @param {boolean[][]} state The grid which is the state of the game
 * @returns A boolean indicating if the given state is a solution
 */
function isSolution(state) {
    let levels = getLightLevels(state);
    for (let i = 0; i < HEIGHT; i++)
        for (let j = 0; j < WIDTH; j++)
            if (lightTargets[i][j] != -1 && lightTargets[i][j] != levels[i][j])
                return false;
    return true;
}

/**
 * Get the number of bulbs in the given state which are turned on
 * @param {number[][]} state The game state to count the number of bulbs of
 * @returns The number of bulbs turned on in the given game state
 */
function bulbCount(state) {
    let count = 0;
    for (let i = 0; i < HEIGHT; i++)
        for (let j = 0; j < WIDTH; j++)
            if (state[i][j])
                count++;
    return count;
}

/**
 * Check if the current state is a solution and if so display finished popup
 */
function checkFinished() {
    if (!isSolution(currentState))
        return;
    // Show result screen
    let moveCount = bulbCount(currentState);
    // Displayed text
    let minText = "";
    if (minMoves >= 0)
        minText = `The minimum number of bulbs is ${minMoves}. `;
    let titleText = null;
    if (moveCount <= minMoves) {
        titleText = "Perfect! 🏆";
        minText = "That's the minimum number of bulbs! ";
    }
    // Share text
    let shareText = `I solved today's puzzle using ${moveCount} light bulbs.`;
    if (moveCount <= minMoves)
        shareText += " 🏆";
    let moveBoxes = "";
    for (let i = 0; i < moveCount; i++) {
        if (i % 10 == 0)
            moveBoxes += "\n";
        moveBoxes += "🟫";
    }
    shareText += moveBoxes;
    showSolvedPopup(titleText, `You solved today's puzzle using ${moveCount} ` +
    `light bulbs. ${minText} But how do you compare against your friends?`,
    shareText);
}

/**
 * Add functionality to grid cells
 */
function addFunctionality() {
    for (const cell of document.getElementsByClassName("grid-cell")) {
        cell.addEventListener("click", () => {
            let x = Number(cell.getAttribute("data-cell-x"));
            let y = Number(cell.getAttribute("data-cell-y"));
            currentState[x][y] = !currentState[x][y];
            displayState(currentState);
            checkFinished();
        });
    }
}

/**
 * Calculate the minimum number of moves
 */
function calcMinimumMoves() {
    // TODO: Implement
    let state = [];
    for (let i = 0; i < HEIGHT; i++)
        state.push(Array(WIDTH).fill(false));
    // Return the number of bulbs to space when trying placements. Given is the
    // number of bulbs still to spare and the starting position
    let tryBulbPlace = (bulbs, x, y) => {
        if (bulbs <= 0)
            return 0;
        if (isSolution(state))
            return bulbs;
        let mx = 0;
        for (let i = x; i < HEIGHT; i++) {
            for (let j = (i == x ? y : 0); j < WIDTH; j++) {
                state[i][j] = true;
                let nextX = j + 1 >= WIDTH ? i + 1 : i;
                let nextY = j + 1 >= WIDTH ? 0 : j + 1;
                mx = Math.max(mx, tryBulbPlace(bulbs - 1, nextX, nextY));
                state[i][j] = false;
            }
        }
        return mx;
    };
    let startTime = performance.now();
    minMoves = MAX_BULBS - tryBulbPlace(MAX_BULBS, 0, 0);
    let endTime = performance.now();
    console.log("Minimum bulbs:", minMoves);
    console.log("Time to calculate:", endTime - startTime, "ms");
}