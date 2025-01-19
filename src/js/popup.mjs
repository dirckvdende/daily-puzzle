
export { showPopup };

// Time before "copied to clipboard" text disappears again, in ms
const clipboardDelay = 2000;

// Timeout used to remove the "copied to clipboard" text
let clipboardTimeout = null;

/**
 * Show the popup to the user
 * @param {string | null} title The HTML that is in the title of the popup. If
 * this is null no title is displayed
 * @param {string | null} content The HTML to display to the user directly. If
 * this is null no content is displayed
 * @param {string | null} shareText The text which gets copied to the clipboard
 * when sharing. If this is null, the share button is omitted
 */
function showPopup(title = null, content = null, shareText = null) {
    console.log(title);
    console.log(content);
    console.log(shareText);
    let elt = document.getElementById("popup");
    // Close mechanics
    function closePopup() {
        elt.classList.add("popup-invisible");
        setTimeout(() => {
            elt.style.display = "none";
        }, 350);
    }
    let bg = elt.getElementsByClassName("background")[0];
    let closeButton = elt.getElementsByClassName("close-button")[0];
    bg.addEventListener("click", closePopup);
    closeButton.addEventListener("click", closePopup);
    // Title
    let titleElt = elt.getElementsByClassName("popup-title")[0];
    titleElt.style.display = title == null ? "none" : "";
    titleElt.innerHTML = title == null ? "" : title;
    // Content
    let contentElt = elt.getElementsByClassName("popup-content")[0];
    contentElt.style.display = content == null ? "none" : "";
    contentElt.innerHTML = content == null ? "" : content;
    // Share button
    let shareContainer = elt.getElementsByClassName("share-container")[0];
    shareContainer.style.display = shareText == null ? "none" : "";
    if (shareText != null) {
        let shareButton = shareContainer.getElementsByTagName("button")[0];
        let clipboardText = shareContainer.getElementsByClassName(
        "clipboard-text")[0];
        shareButton.addEventListener("click", () => {
            copyToClipboard(shareText);
            clipboardText.style.display = "block";
            if (clipboardTimeout != null)
                clearTimeout(clipboardTimeout);
            clipboardTimeout = setTimeout(() => {
                clipboardText.style.display = "";
            }, clipboardDelay);
        });
    }
    elt.style.display = "block";
    // Timeout is needed to have display = "block" be exectued before and not at
    // the same time
    setTimeout(() => elt.classList.remove("popup-invisible"), 1);
}

/**
 * Copy the given text to the clipboard
 * @param {string} txt The text to copy
 */
function copyToClipboard(txt) {
    navigator.clipboard.writeText(txt).then(() => {}, (e) => {
        console.error("Could not copy text to clipboard: ", e);
    });
}