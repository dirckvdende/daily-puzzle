
export { load };
import { random } from "../../js/random.mjs";
import { DisjointUnion } from "./dsu.mjs";

// Size of the graph grid (both width and height). Some nodes are left out
// depending on next constant
const graphSize = 5;
// Number of nodes to generate on the grid
const nodeCount = 16;
// Minimum number of connections (if it is possible to make this many
// connections)
const minConnections = 18;

// Graph as adjacency lists (indices of adjecent nodes)
let graph = null;
// Current state with properties node (current node) and visited (array of
// booleans; current node should be visited)
let state = null;
// Movement history stored as a stack
let history = [];
// Grid of indices of nodes. An index of -1 corresponds to a place that is not
// present in the graph
let indexGrid = null;
// List of positions of nodes by index
let positions = null;
// Minimum number of moves to solve (null means uncalculated)
let minMoves = null;

function load() {
    generateGraph();
    displayGraph();
    generateInitialState();
    addInteraction();
    updateDisplay();
    setTimeout(calcMinimumMoves, 500);
}

/**
 * Generate the problem graph (does not display it)
 */
function generateGraph() {
    let index = 0;
    graph = [];
    positions = [];
    indexGrid = [];
    for (let i = 0; i < graphSize * graphSize; i++) {
        if (i % graphSize == 0)
            indexGrid.push([]);
        // Determine if this position should be included in the graph
        let spotsLeft = graphSize * graphSize - i;
        let leftToFill = nodeCount - index;
        let included = random() < leftToFill / spotsLeft;
        if (!included) {
            indexGrid[indexGrid.length - 1].push(-1);
            continue;
        }
        indexGrid[indexGrid.length - 1].push(index);
        positions.push([indexGrid.length - 1, indexGrid[indexGrid.length -
        1].length - 1]);
        graph.push([]);
        index++;
    }
    if (graph.length != nodeCount) {
        console.error("Number of nodes in graph is not the expected number");
        return;
    }
    let connections = 0;
    let failures = 0;
    let dsu = new DisjointUnion(nodeCount);
    while (failures < 100 && (connections < minConnections || dsu.parts > 1)) {
        let index = Math.floor(random() * nodeCount);
        let result = connectRandomNeighbour(index, dsu);
        failures = result ? 0 : failures + 1;
        if (result)
            connections++;
    }
    // The graph needs to be connected to be solvable
    if (dsu.parts > 1) {
        console.warn("Failed to generate graph, trying again");
        generateGraph();
    }
}

/**
 * Connect a node to a random neighbour (up, down, left, right) in the index
 * grid
 * @param {number} index The index of the node to connect a random neighbour of
 * @param {DisjointUnion} dsu The DSU to keep track of connected parts of the
 * graph
 * @returns A boolean indicating if a new connection was made
 */
function connectRandomNeighbour(index, dsu) {
    let neighbours = getNeighboursInGrid(index);
    // Filter neighbours that are already connected
    let filteredNeighbours = [];
    for (const nb of neighbours)
        if (!graph[index].includes(nb))
            filteredNeighbours.push(nb);
    if (filteredNeighbours.length == 0)
        return false;
    let neighbour = filteredNeighbours[Math.floor(random() *
    filteredNeighbours.length)];
    graph[index].push(neighbour);
    graph[neighbour].push(index);
    dsu.join(index, neighbour);
    return true;
}

/**
 * Get the neighbours (up, down, left, right) of a node with the given index in
 * the index grid
 * @param {number} index The index of the node
 * @returns An array of all node indices that are neighbours of the given node
 * in the index grid. Note that this may be empty
 */
function getNeighboursInGrid(index) {
    let pos = positions[index];
    let dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    let out = [];
    for (const dir of dirs) {
        let target = [pos[0] + dir[0], pos[1] + dir[1]];
        let inGrid = (pos) => (0 <= target[0] && target[0] < graphSize && 0 <=
        target[1] && target[1] < graphSize);
        while (inGrid(target) && indexGrid[target[0]][target[1]] == -1)
            target = [target[0] + dir[0], target[1] + dir[1]];
        if (!inGrid(target))
            continue;
        out.push(indexGrid[target[0]][target[1]]);
    }
    return out;
}

/**
 * Get the distance between two points
 * @param {number[]} posA First position
 * @param {number[]} posB Second position
 * @returns The distance between the two positions
 */
function dist(posA, posB) {
    let sq = (x) => x * x;
    return Math.sqrt(sq(posA[0] - posB[0]) + sq(posA[1] - posB[1]));
}

/**
 * Measure the angle that a horizontal line would have to be rotated to align
 * with posB - posA
 * @param {number[]} posA First position
 * @param {number[]} posB Second position
 * @returns The angle from the x-axis of posB - posA, between -PI/2 and PI/2
 */
function angle(posA, posB) {
    let vec = [posB[0] - posA[0], posB[1] - posA[1]];
    if (Math.abs(vec[0]) < 1e-5)
        return Math.PI / 2;
    return Math.tan(vec[1] / vec[0]);
}

/**
 * Display the generated problem graph with nodes at the given positions
 * @param {number[][]} positions An array of positions (arrays [x, y]) where
 * positions are given as integers starting from 0 (top-left corner)
 */
function displayGraph() {
    let container = document.getElementById("graph-container");
    // Display connections
    for (let i = 0; i < graph.length; i++) for (const j of graph[i]) {
        let posA = toPercentPosition(positions[i]);
        let posB = toPercentPosition(positions[j]);
        let center = [(posA[0] + posB[0]) / 2, (posA[1] + posB[1]) / 2];
        let child = document.createElement("div");
        child.classList.add("graph-connection");
        child.style.left = `${center[0]}%`;
        child.style.top = `${center[1]}%`;
        child.style.width = `${dist(posA, posB)}%`;
        child.style.transform = (`translate(-50%, -50%) ` +
        `rotate(${angle(posA, posB)}rad)`);
        container.appendChild(child);
    }
    // Display nodes
    for (let i = 0; i < positions.length; i++) {
        let child = document.createElement("div");
        let pos = toPercentPosition(positions[i]);
        child.classList.add("graph-node");
        child.style.left = `${pos[0]}%`;
        child.style.top = `${pos[1]}%`;
        child.setAttribute("data-node-index", String(i));
        container.appendChild(child);
    }
}

/**
 * Convert integer coordiantes to percentage coordinates (ranging 5%~95%)
 * @param {number[]} pos The position as integer coordinates
 * @returns The position as percentage coordinates
 */
function toPercentPosition(pos) {
    return [
        pos[0] / (graphSize - 1) * 90 + 5,
        pos[1] / (graphSize - 1) * 90 + 5,
    ]
}

/**
 * Update the display of the graph
 */
function updateDisplay() {
    for (const elt of document.getElementsByClassName("graph-node")) {
        let index = Number(elt.getAttribute("data-node-index"));
        // Remove all existing extra classes
        elt.classList.remove("graph-node-clickable", "graph-node-visited",
        "graph-node-current");
        // Current node
        if (index == state.node)
            elt.classList.add("graph-node-current");
        // Adjacent nodes
        if (graph[state.node].includes(index))
            elt.classList.add("graph-node-clickable");
        // Visited nodes
        if (state.visited[index])
            elt.classList.add("graph-node-visited");
    }
    // Update undo counter
    let undoCounter = document.getElementById("undo-counter");
    undoCounter.style.display = history.length == 0 ? "none" : "";
    undoCounter.innerText = String(history.length);
}

/**
 * Generate an initial state of the game and store it in the state variable
 */
function generateInitialState() {
    let node = Math.floor(random() * graph.length);
    let visited = [];
    for (let i = 0; i < graph.length; i++)
        visited.push(i == node);
    state = {
        node: node,
        visited: visited,
    };
}

/**
 * Create a copy of the current game state
 * @returns A copy of the current state
 */
function copyState() {
    return JSON.parse(JSON.stringify(state));
}

/**
 * Move to a different node. If this is not possible from the current node this
 * function has no effect. Old state is added to history
 * @param {number} index The index of the node to move to
 */
function moveTo(index) {
    // First check if move is possible
    if (!graph[state.node].includes(index))
        return;
    history.push(copyState());
    state.node = index;
    state.visited[index] = true;
    updateDisplay();
}

/**
 * Undo the last move in the history and update display. Has no effect if there
 * is nothing in the history
 */
function undo() {
    if (history.length == 0)
        return;
    state = history.pop();
    updateDisplay();
}

/**
 * Reset the puzzle to the first item in this history and update display. If the
 * history is empty this has no effect
 */
function reset() {
    if (history.length == 0)
        return;
    state = history[0];
    history = [];
    updateDisplay();
}

/**
 * Add all interactions to the puzzle, including undo and reset buttons
 */
function addInteraction() {
    // Node interaction
    for (const elt of document.getElementsByClassName("graph-node")) {
        let index = Number(elt.getAttribute("data-node-index"));
        elt.addEventListener("click", () => moveTo(index));
    }
    // Undo and reset buttons
    document.getElementById("undo-button").addEventListener("click", undo);
    document.getElementById("reset-button").addEventListener("click", reset);
}

/**
 * Calculate the minimum number of moves needed to visited every node (from the
 * current state). Stores this value in the minMoves global. Uses BFS with
 * memoization
 */
function calcMinimumMoves() {
    // Combinations of visited/unvisited are representated using bitsets
    // mem is a 2-D array indexed by [current node][visited nodes]
    let startTime = performance.now();
    let mem = [];
    for (let i = 0; i < nodeCount; i++) {
        let row = [];
        for (let j = 0; j < (1 << nodeCount); j++)
            row.push(-1);
        mem.push(row);
    }
    let b = 0;
    for (let i = 0; i < nodeCount; i++)
        if (state.visited[i])
            b |= 1 << i;
    mem[state.node][b] = 0;
    let index = 0;
    let q = [[state.node, b]];
    let filledBitstring = (1 << nodeCount) - 1;
    while (index < q.length) {
        let node = q[index][0], b = q[index][1];
        index++;
        for (const nb of graph[node]) {
            let target = [nb, b | (1 << nb)];
            if (mem[target[0]][target[1]] != -1)
                continue;
            let moves = mem[node][b] + 1;
            mem[target[0]][target[1]] = moves;
            q.push(target);
            if (target[1] == filledBitstring) {
                let endTime = performance.now();
                minMoves = moves;
                console.log(`Minimum moves: ${minMoves}`);
                console.log(`Time to calculate: ${endTime - startTime} ms`);
                return;
            }
        }
    }
    console.error("Could not determine minimum number of moves");
}