
export { load };

// Maximum number of cells to have in a game state
const cellCount = 6;
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
            if (index != -1)
                state[prevIndex] = (state[prevIndex] - 2) % 6 + 1;
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
        name: "move_down",
        color: "green",
        icons: ["arrow_downward"],
        apply: function (state, index) {
            let newState = copyState(state);
            let nextIndex = getNextNonEmpty(state, index);
            if (nextIndex != -1) {
                newState[index] = newState[nextIndex];
                newState[nextIndex] = newState[index];
            }
            return newState;
        },
        applyReverse: function (state, index) {
            let newState = copyState(state);
            let prevIndex = getNextNonEmpty(state, index, -1);
            if (prevIndex != -1) {
                newState[index] = newState[prevIndex];
                newState[prevIndex] = newState[index];
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
            return index;
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
            if (prevIndex != -1)
                state[prevIndex] = (state[prevIndex] - 2) % 6 + 1;
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
        container.append(elt);
    }
}

/**
 * Display a given state to the puzzle screen
 * @param {number} state The state to display
 */
function displayState(state) {
    let container = document.getElementById("action-button-container");
    for (let i = 0; i < cellCount; i++) {
        let action = actions[state[i]];
        for (const elt of container.querySelectorAll(`[data-cell-index="${i}"]`))
        {
            // TODO: Hide empty cells
            elt.style.backgroundColor = `var(--accent-color-${action.color})`;
            elt.innerHTML = "";
            for (const icon of action.icons) {
                let iconElt = document.createElement("span");
                iconElt.classList.add("material-symbols-outlined");
                iconElt.innerText = icon;
                elt.append(iconElt);
            }
        }
    }
}

/**
 * Generate an initial state to start from by taking actions in reverse
 */
function generateInitialState() {
    currentState = [1, 2, 3, 0, 1, 4];
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