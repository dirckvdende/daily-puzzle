
export { getPuzzleHTML, copyToClipboard, showSolvedDisplay, dateIndex };

const dateUpdateInterval = 1000 * 60 * 60 * 24;
const dateIndex = Math.floor(new Date().getTime() / dateUpdateInterval) - 20104;

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
    getFileContent(`./src/puzzle/${name}.html`, action);
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

/**
 * Show the solved screen to the user
 * @param {string} displayText The text to display to the user directly
 * @param {string} shareText The text which gets copied to the clipboard when
 * sharing
 */
function showSolvedDisplay(displayText, shareText) {
    document.getElementById("solved-text").innerText = displayText;
    document.getElementById("solved-share-button").setAttribute(
    "data-share-text", `Daily Puzzle #${dateIndex}\n${shareText}` +
    "\n\ndirckvdende.github.io/daily-puzzle");
    document.getElementById("solved-display").style.display = "block";
}