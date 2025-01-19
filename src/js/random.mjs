
export { random };
import { dateIndex } from "./puzzle.mjs";

let a = 16807;
let m = 2147483647;
let seed = dateIndex;

if (dateIndex > 3)
    for (let i = 0; i < 100; i++)
        random();

/**
 * Generate a random number between 0 and 1
 * @returns The random number
 */
function random() {
    seed = (a * seed) % m;
    return seed / m;
}