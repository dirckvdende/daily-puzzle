
export { load };
import { random } from "../../js/random.mjs";
import { DisjointUnion } from "./dsu.mjs";
import { showSolvedPopup } from "../../js/puzzle.mjs";

// Size of the graph grid (both width and height). Some nodes are left out
// depending on next constant
const graphSize = 6;
// Number of nodes to generate on the grid
const nodeCount = 18;
// Minimum number of connections (if it is possible to make this many
// connections)
const minConnections = 35;
// Minimum distance of any node to a connection line, apart from the two lines
// that are connected by the line
const minLineDistance = 0.45;
// A bias factor for choosing closer nodes to connect to. The higher the value
// the more it is biased to closer nodes, but also the longer the runtime
const closenessBias = 3.0;

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
    let start = performance.now();
    generateGraph();
    let end = performance.now();
    console.log("Time to generate graph:", end - start, "ms");
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
    generateGraphNodes();
    generateGraphConnections();
}

/**
 * Generate the graph nodes and put their positions in the positions variable.
 * Also generates the indexGrid variable and prepares the graph variable
 */
function generateGraphNodes() {
    let valid = false;
    while (!valid) {
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
        // Make sure the bottom/top rows and left/right cols have at least one
        // node
        let filledCols = [], filledRows = [];
        for (let i = 0; i < graphSize; i++) {
            filledCols.push(false);
            filledRows.push(false);
        }
        for (let i = 0; i < graphSize; i++) for (let j = 0; j < graphSize; j++)
        {
            if (indexGrid[i][j] != -1) {
                filledRows[i] = true;
                filledCols[j] = true;
            }
        }
        if (filledCols[0] && filledCols[filledCols.length - 1] &&
        filledRows[0] && filledRows[filledRows.length - 1])
            valid = true;
    }
}

/**
 * Generate graph connects and update the graph variable accordingly. Generates
 * a graph such that is connected
 */
function generateGraphConnections() {
    let connections = 0;
    let dsu = new DisjointUnion(nodeCount);
    let connected = [];
    for (let i = 0; i < nodeCount; i++) {
        connected.push([]);
        for (let j = 0; j < nodeCount; j++)
            connected[connected.length - 1].push(false);
    }
    while (connections < minConnections || dsu.parts > 1) {
        let nodeA = Math.floor(random() * nodeCount);
        let nodeB = Math.floor(random() * nodeCount);
        if (connected[nodeA][nodeB] || !canBeConnected(nodeA, nodeB))
            continue;
        // Random chance to reject based on node distance
        if (random() > 1.0 / Math.pow(dist(positions[nodeA], positions[nodeB]),
        closenessBias))
            continue;
        graph[nodeA].push(nodeB);
        graph[nodeB].push(nodeA);
        connected[nodeA][nodeB] = true;
        connected[nodeB][nodeA] = true;
        dsu.join(nodeA, nodeB);
        connections++;
    }
}

/**
 * Check if two nodes can be connected in the graph, depending on their
 * positions
 * @param {number} nodeA Index of the first node
 * @param {number} nodeB Index of the second node
 * @returns A boolean indicating if the two nodes can be connected
 */
function canBeConnected(nodeA, nodeB) {
    if (nodeA == nodeB)
        return false;
    for (let i = 0; i < nodeCount; i++) {
        if (i == nodeA || i == nodeB)
            continue;
        if (distFromLineSegment(positions[i], positions[nodeA],
        positions[nodeB]) < minLineDistance)
            return false;
    }
    return true;
}

/**
 * Get the distance of a point to a line segment
 * @param {number[]} pos The position to get distance to the line segment of
 * @param {number[]} lineA First point defining the line segment
 * @param {number[]} lineB Second point defining the line segment
 * @returns The distance from pos to the line segment [lineA, lineB]
 */
function distFromLineSegment(pos, lineA, lineB) {
    let d = Math.pow(dist(lineA, lineB), 2);
    if (Math.abs(d) < 1e-7)
        return dist(pos, lineA);
    let t = ((pos[0] - lineA[0]) * (lineB[0] - lineA[0]) + (pos[1] - lineA[1]) *
    (lineB[1] - lineA[1]));
    t /= d;
    t = Math.max(0.0, Math.min(1.0, t));
    return dist(pos, [lineA[0] + t * (lineB[0] - lineA[0]), lineA[1] + t *
    (lineB[1] - lineA[1])]);
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
    return Math.atan(vec[1] / vec[0]);
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
        child.setAttribute("data-connection", String(Math.min(i, j)) + "-" +
        String(Math.max(i, j)));
        container.appendChild(child);
    }
    // Display nodes
    for (let i = 0; i < positions.length; i++) {
        let child = document.createElement("div");
        let pos = toPercentPosition(positions[i]);
        child.classList.add("graph-node", "graph-node-interactive");
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
    // Update connection colors
    for (const elt of document.querySelectorAll("[data-connection]"))
        elt.classList.remove("graph-connection-visited");
    for (let i = 0; i < history.length; i++) {
        let nodeA = history[i].node;
        let nodeB = i + 1 >= history.length ? state.node : history[i + 1].node;
        if (nodeA > nodeB) {
            let t = nodeA;
            nodeA = nodeB;
            nodeB = t;
        }
        let query = `[data-connection="${nodeA}-${nodeB}"]`;
        for (const elt of document.querySelectorAll(query))
            elt.classList.add("graph-connection-visited");
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
    checkFinished();
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
    for (const elt of document.getElementsByClassName("graph-node-interactive"))
    {
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
                console.log("Minimum moves:", minMoves);
                console.log("Time to calculate", endTime - startTime, "ms");
                return;
            }
        }
    }
    console.error("Could not determine minimum number of moves");
}

/**
 * Check if the current state of the game has all nodes visited. If this is the
 * case, show the result screen to the user
 */
function checkFinished() {
    // Check if finished
    for (const v of state.visited)
        if (!v)
            return;
    // Show result screen
    let moveCount = history.length;
    // Displayed text
    let minText = "";
    if (minMoves >= 0)
        minText = `The minimum number of moves is ${minMoves}. `;
    let titleText = null;
    if (moveCount <= minMoves) {
        titleText = "Perfect! 🏆";
        minText = "That's the minimum number of moves! ";
    }
    // Share text
    let shareText = `I solved today's puzzle in ${moveCount} moves.`;
    if (moveCount <= minMoves)
        shareText += " 🏆";
    let moveBoxes = "";
    for (let i = 0; i < moveCount; i++) {
        if (i % 10 == 0)
            moveBoxes += "\n";
        moveBoxes += "🟩";
    }
    shareText += moveBoxes;
    showSolvedPopup(titleText, `You solved today's puzzle in ${moveCount} ` +
    `moves. ${minText} But how do you compare against your friends?`,
    shareText);
}