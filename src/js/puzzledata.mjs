
import * as operatorPuzzle from "../puzzle/operator/puzzle.mjs";
import * as switchPuzzle from "../puzzle/switch/puzzle.mjs";
import * as spreadPuzzle from "../puzzle/spread/puzzle.mjs";
import * as salesmanPuzzle from "../puzzle/salesman/puzzle.mjs";
import * as towerPuzzle from "../puzzle/tower/puzzle.mjs";
import * as slidePuzzle from "../puzzle/slide/puzzle.mjs";
import * as lightPuzzle from "../puzzle/light/puzzle.mjs";
export { puzzles, getPuzzleData };

// List of puzzles, with a name and a module reference. In addition a
// "dayRequirement" field can be added which is a function from a date index to
// a boolean indicating if the puzzle should be played on this specific day.
// The first puzzle in the list passing this requirement (or having no
// requirement) is loaded
// NOTE: day % 7 == 0 means the day is a Thursday
const puzzles = [
    {
        name: "light",
        module: lightPuzzle,
        color: "brown",
        dayRequirement: (d) => d % 7 == 4, // Monday
    }, {
        name: "salesman",
        module: salesmanPuzzle,
        color: "green",
        dayRequirement: (d) => d % 7 == 5, // Tuesday
    }, {
        name: "spread",
        module: spreadPuzzle,
        color: "orange",
        dayRequirement: (d) => d % 7 == 6, // Wednesday
    }, {
        name: "switch",
        module: switchPuzzle,
        color: "blue",
        dayRequirement: (d) => d % 7 == 0, // Thursday
    }, {
        name: "tower",
        module: towerPuzzle,
        color: "yellow",
        dayRequirement: (d) => d % 7 == 1, // Friday
    }, {
        name: "operator",
        color: "pink",
        module: operatorPuzzle,
        dayRequirement: (d) => d % 7 == 2, // Saturday
    }, {
        name: "slide",
        module: slidePuzzle,
        color: "red",
        dayRequirement: (d) => d % 7 == 3, // Sunday
    },
];

/**
 * Get the puzzle data for today's puzzle (or another date)
 * @param {number} dateIndex The index of the date to get the data of
 * @returns The data for the puzzle of today
 */
function getPuzzleData(dateIndex) {
    for (const puzzle of puzzles) {
        if ("dayRequirement" in puzzle && !puzzle.dayRequirement(dateIndex))
            continue;
        return puzzle;
    }
    console.warn("No puzzle first date requirement, picking last");
    return puzzles[puzzles.length - 1];
}