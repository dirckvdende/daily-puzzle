
export { load };
import { getPuzzleHTML } from "./utils.mjs";

const content = document.getElementById("content");

/**
 * Load this puzzle into the page
 */
function load() {
    getPuzzleHTML("operator", function(html) {
        content.innerHTML = html
    });
    document.getElementById("main-title").innerText += " - Operator";
}