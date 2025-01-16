
export { load };
import { getPuzzleHTML } from "./utils.mjs";

const content = document.getElementById("content");

// Current numbers
let state = [0, 0, 0];
// History of states (undo history as a stack)
let stateHistory = [];
// All possible actions with their probability weights
let actions = [];
// State query
let query = [];

/**
 * Load this puzzle into the page
 */
function load() {
    getPuzzleHTML("operator", function (html) {
        content.innerHTML = html;
        init();
    });
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
    addButtonAction("add-button", 20, () => { state[2] = state[0] + state[1]; });
    addButtonAction("multiply-button", 5, () => {
        state[2] = state[0] * state[1];
    });
    document.getElementById("undo-button").addEventListener("click",
    undoAction);
    generateRandomQuery();
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

const randomGameCount = 100;
const randomGameLength = 50;

/**
 * Generate a random puzzle by simulating some moves. Stores the query and
 * updates the query boxes
 */
function generateRandomQuery() {
    let bestScore = -Infinity;
    let bestQuery = [0, 0, 0];
    let totalWeight = 0;
    for (const action of actions)
        totalWeight += action.weight;
    for (let i = 0; i < randomGameCount; i++) {
        for (let j = 0; j < randomGameLength; j++) {
            let value = Math.random() * totalWeight;
            let cur = 0;
            let chosenAction = null;
            for (const action of actions) {
                cur += action.weight;
                if (cur >= value) {
                    chosenAction = action.action;
                    break;
                }
            }
            chosenAction();
            if (!isValidState(state))
                break;
            let score = queryScore(state);
            if (score > bestScore) {
                bestQuery = state.slice();
                bestScore = score;
            }
        }
        state = [0, 0, 0];
    }
    query = bestQuery;
    for (const elt of document.querySelectorAll("[data-query-box-index]")) {
        let index = Number(elt.getAttribute("data-query-box-index"));
        elt.children[0].innerText = String(query[index]);
    }
}

/**
 * Get the score of a query
 */
function queryScore(query) {
    let total = 0;
    for (const value of query)
        total += Math.abs(value)
    return total;
}