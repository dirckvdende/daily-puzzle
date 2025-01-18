
export { load, helpPopup };
import { showSolvedDisplay } from "./utils.mjs";
import { getPuzzleHTML } from "./filesystem.mjs";
import { random } from "./random.mjs";
import { showPopup } from "./popup.mjs";

const content = document.getElementById("content");

// Current numbers
let state = [0, 0, 0];
// History of states (undo history as a stack)
let stateHistory = [];
// All possible actions with their probability weights
let actions = [];
// State query
let query = [];
// Minimum number of moves to get to query from [0, 0, 0]
let optimal = -1;

/**
 * Load this puzzle into the page
 */
function load() {
    getPuzzleHTML("operator", function (html) {
        content.innerHTML = html;
        init();
        showPopup("hello", "test", "testo");
    });
}

/**
 * Returns what should be displayed when a user presses the help button
 * @returns An object with properties that indicate the different text/HTML
 * components
 */
function helpPopup() {
    return {
        content: "Hello, World!"
    };
}

/**
 * Returns what should be displayed when the user finishes the puzzle
 * @returns An object with properties that indicate the different text/HTML
 * components
 */
function solvedPopup() {
    return {
        title: "yOu DiD iT!",
        content: "aaaaaa",
        shareText: "I solved!",
    };
}

/**
 * Initialize puzzle, after the HTML has been loaded
 */
function init() {
    addButtonAction("add-one-button", 60, () => { state[2]++; });
    addButtonAction("remove-one-button", 20, () => { state[2]--; });
    addButtonAction("zero-button", 10, () => { state[2] = 0; });
    addButtonAction("swap-button", 20, () => {
        let tmp = state[0];
        state[0] = state[2];
        state[2] = tmp;
    });
    addButtonAction("cycle-button", 40, () => {
        let tmp = state[2];
        state[2] = state[1];
        state[1] = state[0];
        state[0] = tmp;
    });
    addButtonAction("negate-button", 20, () => { state[2] = -state[2]; });
    addButtonAction("add-button", 20, () => {
        state[2] = state[0] + state[1];
    });
    addButtonAction("multiply-button", 5, () => {
        state[2] = state[0] * state[1];
    });
    document.getElementById("undo-button").addEventListener("click",
    undoAction);
    document.getElementById("reset-button").addEventListener("click",
    resetAction);
    generateRandomQuery();
    // Calculate minimum number of moves after 1 second, to avoid too much
    // performance cost
    setTimeout(function () {
        let startTime = performance.now();
        optimal = minimumMoves();
        let endTime = performance.now();
        console.log("Minimum number of moves:", optimal);
        console.log(`Time to calculate: ${endTime - startTime} ms`);
    }, 1000);
}

/**
 * Add an action to perform once a button has been pressed. Apart from this
 * action the undo counter and history will also be updated. The action will
 * also be registered for generating a random puzzle
 * @param {string} id The ID of the HTML element that is the button
 * @param {number} weight The weight to assign the action for random query
 * generation
 * @param {function} action The action to perform once the button has been
 * pressed, as a function that does not accept any arguments
 */
function addButtonAction(id, weight, action) {
    let elt = document.getElementById(id);
    actions.push({action: action, weight: weight});
    elt.addEventListener("click", function () {
        stateHistory.push(state.slice());
        let undoCounter = document.getElementById("undo-counter");
        undoCounter.style.display = "block";
        undoCounter.innerText = String(stateHistory.length);
        action();
        updateDisplay();
        // If the action did not do anything or it yields a value that is too
        // large, undo it immediately
        let allEqual = true;
        for (let i = 0; i < 3; i++)
            if (stateHistory[stateHistory.length - 1][i] != state[i])
                allEqual = false;
        if (allEqual || !isValidState(state))
            undoAction();
        checkCorrectAnswer();
    });
}

/**
 * Check if a certain state is valid
 * @param {Array} state The state to check validity of
 * @returns Whether the state is valid
 */
function isValidState(state) {
    let valueTooLarge = false;
    for (let i = 0; i < 4; i++)
        if (Math.abs(state[i]) >= 100)
            valueTooLarge = true;
    return !valueTooLarge;
}

/**
 * Undo the last action by setting the current state to the top of the history
 * stack, and removing the top of the history stack from the stack. If an undo
 * is not possible, nothing possible. Display of undo counter is also updated
 */
function undoAction() {
    if (stateHistory.length == 0)
        return;
    state = stateHistory.pop();
    let undoCounter = document.getElementById("undo-counter");
    if (stateHistory.length == 0) {
        undoCounter.style.display = "none";
    } else {
        undoCounter.style.display = "block";
        undoCounter.innerText = stateHistory.length;
    }
    updateDisplay();
}

/**
 * Reset history and current state and update display
 */
function resetAction() {
    stateHistory = [];
    state = [0, 0, 0];
    let undoCounter = document.getElementById("undo-counter");
    undoCounter.style.display = "none";
    updateDisplay();
}

// Last box update performed per number box
var lastBoxUpdate = [null, null, null];

/**
 * Show a box update animation
 * @param {HTMLElement} elt The box to show an update animation for
 */
function numberBoxUpdateAnimation(elt) {
    let index = Number(elt.getAttribute("data-box-index"));
    elt.style.transition = "all .1s";
    elt.style.color = "white";
    elt.style.backgroundColor = "#8b43bf";
    if (lastBoxUpdate[index] != null)
        clearTimeout(lastBoxUpdate[elt]);
    lastBoxUpdate[index] = setTimeout(function () {
        lastBoxUpdate[index] = null;
        elt.style.transition = "all .5s";
        elt.style.color = "";
        elt.style.backgroundColor = "";
    }, 500);
}

/**
 * Update the display of the numbers based on the current state
 */
function updateDisplay() {
    for (const elt of document.querySelectorAll("[data-box-index]")) {
        let index = Number(elt.getAttribute("data-box-index"));
        let value = Number(elt.children[0].innerText);
        if (value != state[index]) {
            elt.children[0].innerText = String(state[index]);
            numberBoxUpdateAnimation(elt);
        }
    }
}

/**
 * Generate a random puzzle by simulating some moves. Stores the query and
 * updates the query boxes
 */
function generateRandomQuery() {
    let bestScore = -Infinity;
    let bestQuery = [0, 0, 0];
    for (let i = 0; i < 10; i++) {
        let curQuery = sampleRandomQuery();
        let curScore = queryScore(curQuery);
        if (curScore > bestScore) {
            bestScore = curScore;
            bestQuery = curQuery;
        }
    }
    query = bestQuery;
    for (const elt of document.querySelectorAll("[data-query-box-index]")) {
        let index = Number(elt.getAttribute("data-query-box-index"));
        elt.children[0].innerText = String(query[index]);
    }
}

/**
 * Generates a single random query of three numbers
 * @returns The random query
 */
function sampleRandomQuery() {
    let query = [0, 0, 0];
    for (let i = 0; i < query.length; i++) {
        let cur;
        if (random() < 0.8) {
            const choices = [0, 1, 1, 1, 2, 2, 3, 4, 5, 6];
            cur = choices[Math.floor(random() * choices.length)];
        } else {
            let x = Math.floor(random() * 6);
            let y = Math.floor(random() * 4);
            let z = Math.floor(random() * 5 - 2);
            cur = x * x + y + z;
            if (random() < 0.1)
                cur += Math.floor(random() * 20)
        }
        if (random() < 0.2)
            cur = -cur;
        query[i] = cur;
    }
    return query;
}

/**
 * Get the score of a query, which is given by the following sum:
 *   total absolute value / 5
 * + total sum / 5
 * + # positive values * 10
 * + largest diff in abs values ** 2 / 4
 * @param {Array} query The query to get the score of
 * @returns The score of the query
 */
function queryScore(query) {
    let total = 0;
    let smallestAbs = 100, largestAbs = 0;
    for (const value of query) {
        total += Math.abs(value) / 5;
        total += value / 5;
        if (value > 0)
            total += 10;
        smallestAbs = Math.min(smallestAbs, value);
        largestAbs = Math.min(largestAbs, value);
    }
    total += (largestAbs - smallestAbs) * (largestAbs - smallestAbs) / 4;
    return total;
}

/**
 * Check if the current state is equal to the query state. If this is the case,
 * show the result screen to the user
 */
function checkCorrectAnswer() {
    // Check correct answer
    for (let i = 0; i < 3; i++)
        if (state[i] != query[i])
            return;
    // Show result screen
    let moveCount = stateHistory.length;
    // Displayed text
    let minText = "";
    if (optimal >= 0)
        minText = `The minimum number of moves is ${optimal}. `
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
    for (let i = 0; i < moveCount; i++) {
        if (i % 10 == 0)
            moveBoxes += "\n";
        moveBoxes += "🟪";
    }
    shareText += moveBoxes;
    showSolvedDisplay(`You solved today's puzzle in ${moveCount} moves. ` +
    `${minText} But how do you compare against your friends?`, shareText,
    titleText)
}

/**
 * Calculate the minimum number of moves required to go from the state to the
 * query
 * @returns The minimum number of moves required
 * @note This function is asynchronous to avoid some performance problems!
 */
function minimumMoves() {
    let initialState = state.slice();
    let mem = {};
    mem[state.toString()] = 0;
    let queue = [state];
    let queryString = query.toString();
    while (queue.length > 0) {
        let cur = queue[0];
        queue.shift();
        let value = mem[cur.toString()];
        for (const action of actions) {
            state = cur.slice();
            if (!isValidState(state))
                continue;
            action.action();
            let stateString = state.toString();
            if (stateString == queryString) {
                state = initialState;
                return value + 1;
            }
            if (!(stateString in mem)) {
                mem[stateString] = value + 1;
                queue.push(state);
            }
        }
    }
    console.error("Could not find minimum number of moves");
    state = initialState;
    return -1;
}