
export { load };

/**
 * Load the puzzle
 */
function load() {
    loadIcons();
}

/**
 * Load icons on the action buttons
 */
function loadIcons() {
    loadIcon(document.getElementById("full-rect-button").children[0], [[10, 10],
    [10, 50], [10, 90], [50, 10], [50, 50], [50, 90], [90, 10], [90, 50],
    [90, 90]]);
    loadIcon(document.getElementById("plus-button").children[0], [[10, 50],
    [50, 10], [50, 50], [50, 90], [90, 50]]);
    loadIcon(document.getElementById("times-button").children[0], [[10, 10],
    [10, 90], [50, 50], [90, 10], [90, 90]]);
}

/**
 * Load an action button icon into an SVG element
 * @param {HTMLElement} svg The SVG element to load icon into
 * @param {Array} positions Array of positions to place dots, given as [x, y]
 */
function loadIcon(svg, positions) {
    for (const pos of positions) {
        let x = pos[0], y = pos[1];
        // Need namespaced create element here before of SVG
        let elt = document.createElementNS("http://www.w3.org/2000/svg",
        "rect");
        elt.setAttribute("x", x - 15);
        elt.setAttribute("y", y - 15);
        elt.setAttribute("width", 30);
        elt.setAttribute("height", 30);
        elt.setAttribute("rx", 10);
        elt.setAttribute("fill", "white");
        svg.appendChild(elt);
    }
}