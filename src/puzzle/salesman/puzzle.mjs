
export { load };

// Graph as adjacency lists (indices of adjecent nodes)
let graph = null;
// Size of the graph grid (both width and height). Some nodes are left out
// depending on next constant
const graphSize = 4;
// Number of nodes to generate on the grid
const nodeCount = 12;

function load() {
    generateGraph();
}

/**
 * Generate the problem graph and display it. Also adds functionality to all
 * 
 */
function generateGraph() {
    // TODO: Implement properly
    graph = [];
    let positions = [];
    for (let i = 0; i < graphSize * graphSize; i++) {
        let adj = [];
        if (i % graphSize != 0)
            adj.push(i - 1);
        if (i % graphSize != graphSize - 1)
            adj.push(i + 1);
        if (i >= graphSize)
            adj.push(i - graphSize)
        if (i + graphSize < graphSize * graphSize)
            adj.push(i + graphSize);
        graph.push(adj);
        positions.push([i % graphSize, Math.floor(i / graphSize)]);
    }
    displayGraph(positions);
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
function displayGraph(positions) {
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

}