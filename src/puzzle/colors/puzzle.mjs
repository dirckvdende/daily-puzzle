
export { load };
// import { random } from "../../js/random.mjs";

let random = Math.random;

// Maximum number of cells to have in a game state
const cellCount = 6;
// Number of random reversed moves to do to generate initial state
const initialStateMoves = 40;
const initialStateBranches = 5;
const initialStateTries = 10;
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

/**
 * Load the puzzle
 */
function load() {
    loadHTML();
    generateInitialState();
    console.log(currentState);
    displayState(currentState);
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
            currentState = action.apply(currentState, i);
            displayState(currentState);
        });
        container.append(elt);
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
 * Generate an initial state to start from by taking actions in reverse
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