
export { dateIndex, showSolvedPopup, trueDateIndex };
import { showPopup } from "./popup.mjs";

// One day is this many milliseconds
const dateUpdateInterval = 1000 * 60 * 60 * 24;
// Updates one hour earlier to be at midnight Western Europe winter time
const updateTimeOffset = 1000 * 60 * 60;
// Day of puzzle 0
const startDateIndex = 20104;
// Current date index
const trueDateIndex = Math.floor((new Date().getTime() + updateTimeOffset) /
dateUpdateInterval) - startDateIndex;
const dateIndex = getDateIndex();

// Default title to show when solved popup is shown
const defaultSolvedTitle = "You did it! 🎉";

/**
 * Show the solved popup to the user. Extends text with default elements
 * @param {string | null} title The HTML that is in the title of the popup. If
 * this is null the default is shown
 * @param {string | null} content The HTML to display to the user directly. If
 * this is null no content is displayed
 * @param {string | null} shareText Part of the share text which is extended
 * with default elements. If this is null, the share button is omitted
 */
function showSolvedPopup(title = null, content = null, shareText = null) {
    if (title == null)
        title = defaultSolvedTitle;
    if (shareText != null)
        shareText = (`Daily Puzzle #${dateIndex}\n${shareText}` +
        "\nhttps://dirckvdende.github.io/daily-puzzle");
    showPopup(title, content, shareText);
}

/**
 * Get the date index of the puzzle to display
 * @returns The date index of the current date, or the requested history entry
 */
function getDateIndex() {
    let searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("p") == null)
        return trueDateIndex;
    let queryIndex = Math.floor(Number(searchParams.get("p")));
    if (queryIndex < 1 || queryIndex > trueDateIndex)
        return trueDateIndex;
    return queryIndex;
}
