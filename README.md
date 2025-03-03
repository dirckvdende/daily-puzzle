
# Daily Puzzle App

Hello! I made this app as a small side project. The website is available on [GitHub pages](https://dirckvdende.github.io/daily-puzzle/). If you have any suggestions for more puzzles or want to report a bug, create an issue. I hope to add more different puzzles in the future.

## Current puzzles

Below a list of currently implemented puzzles:
| Day | Color | Name |
| --- | --- | --- |
| Monday | 🟫 | Light |
| Tuesday | 🟩 | Salesman |
| Wednesday | 🟧 | Spread |
| Thursday | 🟦 | Switch |
| Friday | 🟨 | Tower |
| Saturday | 🟪 | Operator |
| Sunday | 🟥 | Slide |

## Adding new puzzles

This app was made in such a way that it is easy to add new puzzles. This can be done by creating a new folder in the `src/puzzle` directory that has the name of the new puzzle and content to this folder. The folling files are required at least:

- `puzzle.html`: This is the HTML that will be loaded into the puzzle field on the page.
- `help.html`: HTML code that will be displayed when a user pressed the help button.
- `puzzle.mjs`: The main JavaScript module of the new puzzle, which should expose a `load()` function that gets called when the puzzle needs to be loaded.
- `puzzle.css`: CSS file that is loaded when the puzzle is loaded.

To register the puzzle to the app, the following file need to be modified:

- `src/js/puzzledata.mjs`:
    - At the top add an import rule similar to the other puzzles that are imported.
    - Add the puzzle to the `puzzles` array. See the comment above it for more information.

The `src/js` directory already contains many useful functions you may want to use to create the puzzle. In particular the `random.mjs` file contains a random function that is based on the current date, so the puzzle will be the same for all users on the same day. The `src/css/colors.css` file contains some color variables that are good to use to keep the style of the puzzle in line with already existing puzzle, and automatically add support for dark mode.

You can request a puzzle to be added by creating a pull request on GitHub, or if you don't want to make it yourself create an issue :)