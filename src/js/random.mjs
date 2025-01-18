
export { random };
import { dateIndex } from "./puzzle.mjs";

let a = 16807;
let m = 2147483647;
let seed = dateIndex;

/**
 * Generate a random number between 0 and 1
 * @returns The random number
 */
function random() {
    seed = (a * seed) % m;
    return seed / m;
}