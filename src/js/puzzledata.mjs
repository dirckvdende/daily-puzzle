
import * as operatorPuzzle from "../puzzle/operator/puzzle.mjs";
import * as switchPuzzle from "../puzzle/switch/puzzle.mjs";
import * as spreadPuzzle from "../puzzle/spread/puzzle.mjs";
import * as salesmanPuzzle from "../puzzle/salesman/puzzle.mjs";
import * as towerPuzzle from "../puzzle/tower/puzzle.mjs";
import * as slidePuzzle from "../puzzle/slide/puzzle.mjs";
export { puzzles };

// List of puzzles, with a name and a module reference. In addition a
// "dayRequirement" field can be added which is a function from a date index to
// a boolean indicating if the puzzle should be played on this specific day.
// The first puzzle in the list passing this requirement (or having no
// requirement) is loaded
// NOTE: day % 7 == 0 means the day is a Thursday
const puzzles = [
    {
        name: "switch",
        module: switchPuzzle,
        dayRequirement: (d) => d % 7 == 5, // Tuesday
    }, {
        name: "salesman",
        module: salesmanPuzzle,
        dayRequirement: (d) => d % 7 == 6, // Wednesday
    }, {
        name: "spread",
        module: spreadPuzzle,
        dayRequirement: (d) => d % 7 == 0, // Thursday
    }, {
        name: "tower",
        module: towerPuzzle,
        dayRequirement: (d) => d % 7 == 1, // Friday
    }, {
        name: "slide",
        module: slidePuzzle,
        dayRequirement: (d) => d % 7 == 2, // Saturday
    }, {
        name: "operator",
        module: operatorPuzzle
    },
];