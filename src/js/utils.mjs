
export { getPuzzleHTML, getFileContent, copyToClipboard, showSolvedDisplay,
dateIndex, showHelpDisplay };

const dateUpdateInterval = 1000 * 60 * 60 * 24;
// Updates one hour earlier
const updateTimeOffset = 1000 * 60 * 60;
const startDayIndex = 20104;
const dateIndex = Math.floor((new Date().getTime() + updateTimeOffset) /
dateUpdateInterval) - startDayIndex;

/**
 * Get the contents of a file
 * @param {string} filename Path to the file to get the contents of
 * @param {function} action Function that is called with the content as
 * parameter when file is loaded
 */
function getFileContent(filename, action) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", filename, true);
    xhr.onreadystatechange = function() {
        if (this.readyState != 4 || this.status != 200)
            return;
        action(this.responseText);
    }
    xhr.send();
}

/**
 * Get HTML for the puzzle with the given name
 * @param {string} name The (file)name (without suffix) of the puzzle
 * @param {function} action FUnction that is called when puzzle HTML is loaded,
 * with content as the only parameter
 */
function getPuzzleHTML(name, action) {
    getFileContent(`./src/puzzle/${name}/puzzle.html`, action);
}

/**
 * Copy the given text to the clipboard
 * @param {string} txt The text to copy
 */
function copyToClipboard(txt) {
    navigator.clipboard.writeText(txt).then(function () {}, function (e) {
        console.error("Could not copy text to clipboard: ", e);
    });
}

let initialSolvedDisplayTitle = (document.getElementById("solved-display-title")
.innerText);

/**
 * Show the solved screen to the user
 * @param {string} displayText The text to display to the user directly
 * @param {string} shareText The text which gets copied to the clipboard when
 * sharing
 */
function showSolvedDisplay(displayText, shareText, titleText = null) {
    document.getElementById("solved-display-title").innerText = (titleText ==
    null ? initialSolvedDisplayTitle : titleText);
    document.getElementById("solved-text").innerText = displayText;
    document.getElementById("solved-share-button").setAttribute(
    "data-share-text", `Daily Puzzle #${dateIndex}\n${shareText}` +
    "\n\nhttps://dirckvdende.github.io/daily-puzzle");
    let solvedDisplay = document.getElementById("solved-display");
    let background = document.getElementById("solved-display-background");
    let box = document.getElementById("solved-display-box");
    background.style.transition = "none";
    background.style.opacity = "0";
    box.style.transition = "none";
    box.style.opacity = "0";
    box.style.top = "calc(50% + 2em)";
    solvedDisplay.style.display = "block";
    setTimeout(function () {
        background.style.transition = "opacity .3s";
        background.style.opacity = "1";
        box.style.transition = "top .3s, opacity .3s";
        box.style.opacity = "1";
        box.style.top = "50%";
    }, 1);
}

/**
 * Show the help screen to the user
 */
function showHelpDisplay() {
    let display = document.getElementById("help-display");
    let background = document.getElementById("help-display-background");
    let box = document.getElementById("help-display-box");
    background.style.transition = "none";
    background.style.opacity = "0";
    box.style.transition = "none";
    box.style.opacity = "0";
    box.style.top = "calc(50% + 2em)";
    display.style.display = "block";
    setTimeout(function () {
        background.style.transition = "opacity .3s";
        background.style.opacity = "1";
        box.style.transition = "top .3s, opacity .3s";
        box.style.opacity = "1";
        box.style.top = "50%";
    }, 1);
}