
export { load };
import { random } from "../../js/random.mjs";

// Maximum number of cells to have in a game state
const cellCount = 6;
// Number of random reversed moves to do to generate initial state
const initialStateMoves = 40;
const initialStateBranches = 5;
const initialStateTries = 40;
// Definition of all actions
// Cell states are represented by an index in this array
const actions = [
    {
        name: "empty",
        color: "",
        icons: [],
        apply: function (state, index) {
            return null;
        },
        applyReverse: function (state, index) {
            state = copyState(state);
            state[index] = 5; // Replace with "erase" cell
            return state;
        },
    }, {
        name: "invert",
        color: "pink",
        icons: ["arrow_downward_alt", "invert_colors"],
        apply: function (state, index) {
            state = copyState(state);
            let nextIndex = getNextNonEmpty(state, index);
            if (nextIndex != -1)
                state[nextIndex] = (state[nextIndex] + 2) % 6 + 1;
            return state;
        },
        applyReverse: function (state, index) {
            return this.apply(state, index);
        },
    }, {
        name: "colder",
        color: "blue",
        icons: ["arrow_upward_alt", "ac_unit"],
        apply: function (state, index) {
            state = copyState(state);
            let prevIndex = getNextNonEmpty(state, index, -1);
            if (index != -1) {
                state[prevIndex]--;
                if (state[prevIndex] <= 0)
                    state[prevIndex] += 6;
            }
            return state;
        },
        applyReverse: function (state, index) {
            state = copyState(state);
            let prevIndex = getNextNonEmpty(state, index, -1);
            if (prevIndex != -1)
                state[prevIndex] = state[prevIndex] % 6 + 1;
            return state;
        },
    }, {
        name: "swap",
        color: "cyan",
        icons: ["swap_vert"],
        apply: function (state, index) {
            let newState = copyState(state);
            let prev = getNextNonEmpty(state, index, -1);
            let next = getNextNonEmpty(state, index, 1);
            if (prev != -1 && next != -1) {
                newState[prev] = state[next];
                newState[next] = state[prev];
            }
            return newState;
        },
        applyReverse: function (state, index) {
            return this.apply(state, index);
        },
    }, {
        name: "move-down",
        color: "green",
        icons: ["arrow_downward"],
        apply: function (state, index) {
            let newState = copyState(state);
            let nextIndex = getNextNonEmpty(state, index);
            if (nextIndex != -1) {
                newState[index] = state[nextIndex];
                newState[nextIndex] = state[index];
            }
            return newState;
        },
        applyReverse: function (state, index) {
            let newState = copyState(state);
            let prevIndex = getNextNonEmpty(state, index, -1);
            if (prevIndex != -1) {
                newState[index] = state[prevIndex];
                newState[prevIndex] = state[index];
            }
            return newState;
        },
    }, {
        name: "erase",
        color: "yellow",
        icons: ["close"],
        apply: function (state, index) {
            state = copyState(state);
            state[index] = 0;
            return state;
        },
        applyReverse: function (state, index) {
            return null;
        },
    }, {
        name: "hotter",
        color: "red",
        icons: ["arrow_upward_alt", "local_fire_department"],
        apply: function (state, index) {
            state = copyState(state);
            let prevIndex = getNextNonEmpty(state, index, -1);
            if (prevIndex != -1)
                state[prevIndex] = state[prevIndex] % 6 + 1;
            return state;
        },
        applyReverse: function (state, index) {
            state = copyState(state);
            let prevIndex = getNextNonEmpty(state, index, -1);
            if (prevIndex != -1) {
                state[prevIndex]--;
                if (state[prevIndex] <= 0)
                    state[prevIndex] += 6;
            }
            return state;
        },
    },
];

// The current game state as an array of cell indices
let currentState = null;
// Minimum number of moves to finish the puzzle, if calculated
let minimumMoves = null;
// History of states that the user has been through
let stateHistory = [];

/**
 * Load the puzzle
 */
function load() {
    loadHTML();
    generateInitialState();
    updateDisplay();
    setTimeout(() => {
        let start = performance.now();
        minimumMoves = calculateMinimumMoves(currentState);
        let end = performance.now();
        console.log("Minimum number of moves:", minimumMoves);
        console.log("Time to calculate:", end - start, "ms");
    }, 1);
    document.getElementById("undo-button").addEventListener("click", undoMove);
    document.getElementById("reset-button").addEventListener("click",
    resetHistory);
}

/**
 * Load the HTML that the puzzle uses (that is not already in puzzle.html)
 */
function loadHTML() {
    let container = document.getElementById("action-button-container");
    for (let i = 0; i < cellCount; i++) {
        let elt = document.createElement("div");
        elt.setAttribute("data-cell-index", String(i));
        elt.classList.add("action-button");
        elt.addEventListener("click", () => {
            let action = actions[currentState[i]];
            let targetState = action.apply(currentState, i);
            let statesEqual = true;
            for (let i = 0; i < currentState.length; i++)
                if (currentState[i] != targetState[i])
                    statesEqual = false;
            if (!statesEqual) {
                stateHistory.push(currentState);
                currentState = targetState;
                updateDisplay();
            }
        });
        container.append(elt);
    }
}

function updateDisplay() {
    displayState(currentState);
    let undoCounter = document.getElementById("undo-counter");
    if (stateHistory.length == 0) {
        undoCounter.style.display = "none";
    } else {
        undoCounter.style.display = "block";
        undoCounter.innerText = stateHistory.length;
    }
}

/**
 * Display a given state to the puzzle screen
 * @param {number} state The state to display
 */
function displayState(state) {
    let container = document.getElementById("action-button-container");
    let first = null, last = null;
    for (let i = 0; i < cellCount; i++) {
        if (first == null && state[i] != 0)
            first = i;
        if (state[i] != 0)
            last = i;
    }
    for (let i = 0; i < cellCount; i++) {
        let action = actions[state[i]];
        for (const elt of container.querySelectorAll(`[data-cell-index="${i}"]`))
        {
            elt.classList.toggle("action-button-hidden", state[i] == 0);
            if (state[i] == 0)
                elt.style.backgroundColor = "var(--soft-background-color)";
            else
                elt.style.backgroundColor = (`var(--accent-color-` +
                `${action.color})`);
            elt.innerHTML = "";
            for (const icon of action.icons) {
                let iconElt = document.createElement("span");
                iconElt.classList.add("material-symbols-outlined");
                iconElt.innerText = icon;
                elt.append(iconElt);
            }
            elt.classList.toggle("action-button-first", i == first);
            elt.classList.toggle("action-button-last", i == last);
        }
    }
}

/**
 * Generate an initial state to start from by sampling the best initial state
 * from randomly generated ones
 */
function generateInitialState() {
    let maxScore = -Infinity, maxState = null;
    for (let i = 0; i < initialStateTries || maxState == null; i++) {
        let state = getRandomInitialState();
        let score = stateScore(state);
        if (score > maxScore) {
            maxScore = score;
            maxState = state;
        }
    }
    currentState = maxState;
}

/**
 * Generate a random initial state by repeatedly taking a random action. The
 * best out of a few options is taken every time, based on the scoring function
 * stateScore
 * @returns The generated state
 */
function getRandomInitialState() {
    let state = [];
    for (let i = 0; i < cellCount; i++)
        state.push(0);
    let startAction = [1, 2, 6][Math.floor(random() * 3)];
    let startIndex = startAction == 1 ? 0 : cellCount - 1;
    state[startIndex] = startAction;
    for (let i = 0; i < initialStateMoves; i++) {
        let maxScore = -Infinity, maxState = null;
        for (let j = 0; j < initialStateBranches; j++) {
            let index = Math.floor(random() * state.length);
            let curState = actions[state[index]].applyReverse(state, index);
            if (curState == null)
                continue;
            let curScore = stateScore(curState);
            if (curScore > maxScore) {
                maxScore = curScore;
                maxState = curState;
            }
        }
        if (maxState != null)
            state = maxState;
    }
    return state;
}

/**
 * Give a score to a state based on variety and the number of empty cells
 * @param {number[]} state The state to get the score of
 * @returns The score of the state
 */
function stateScore(state) {
    let total = 0;
    let isIncluded = [];
    for (let i = 0; i < actions.length; i++)
        isIncluded.push(false);
    for (let i = 0; i < cellCount; i++) {
        if (state[i] == 5 || state[i] == 0)
            total--;
        isIncluded[state[i]] = true;
    }
    for (let i = 1; i < actions.length; i++)
        if (isIncluded[i])
            total++;
    return total;
}

/**
 * Copy a state and return the copy
 * @param {number[]} state The state to copy
 * @returns A copy of the state
 */
function copyState(state) {
    let out = [];
    for (let i = 0; i < state.length; i++)
        out.push(state[i]);
    return out;
}

/**
 * Get the next non-empty cell index starting from an index
 * @param {number[]} state The state to get the next non-empty cell from
 * @param {number} index The index to start searching from (but not including
 * the index itself)
 * @param {number} step (default -1) The step size to search. Can be negative to
 * search backward
 * @returns The index of the next non-empty cell. Returns -1 if this cell does
 * not exist
 */
function getNextNonEmpty(state, index, step = 1) {
    index += step;
    while (index >= 0 && index < state.length && state[index] == 0)
        index += step;
    if (index < 0 || index >= state.length)
        return -1;
    return index;
}

/**
 * Calculate the minimum number of moves required to be left with one cell
 * @param {number[]} state The starting state
 * @returns The minimum number of moves
 */
function calculateMinimumMoves(state) {
    let totalStates = Math.pow(7, cellCount);
    let mem = Array.from({length: totalStates}, (k, v) => false);
    let q = [[state, 0]];
    mem[q[0][1]] = true;
    let index = 0;
    while (index < q.length) {
        let curState = q[index][0], moves = q[index][1];
        for (const nextState of nextStates(curState)) {
            let nextEncoded = encodeState(nextState);
            if (mem[nextEncoded])
                continue;
            q.push([nextState, moves + 1]);
            mem[nextEncoded] = true;
            if (isEndState(nextState))
                return moves + 1;
        }
        index++;
    }
    return -1;
}

function encodeState(state) {
    let total = 0;
    let m = 1;
    for (let i = 0; i < state.length; i++) {
        total += m * state[i];
        m *= 7;
    }
    return total;
}

function decodeState(num) {
    let state = [];
    for (let i = 0; i < cellCount; i++) {
        state.push(num % 7);
        num = Math.floor(num / 7);
    }
    return state;
}

function nextStates(state) {
    let result = [];
    for (let i = 0; i < state.length; i++) {
        let action = actions[state[i]];
        let target = action.apply(state, i);
        if (target != null)
            result.push(target);
    }
    return result;
}

function isEndState(state) {
    let total = 0;
    for (let i = 0; i < state.length; i++) {
        if (state[i] != 0)
            total++;
        if (total > 1)
            return false;
    }
    return true;
}

/**
 * Undo the last move the user did by resetting to the top of the state history
 * stack
 */
function undoMove() {
    if (stateHistory.length == 0)
        return;
    currentState = stateHistory.pop();
    updateDisplay();
}

/**
 * Reset back to the initial state by emptying the state history stack
 */
function resetHistory() {
    if (stateHistory.length == 0)
        return;
    currentState = stateHistory[0];
    stateHistory = [];
    updateDisplay();
}