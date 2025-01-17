
import { load as loadOperator } from "./operator.mjs";
import { copyToClipboard, getFileContent, showHelpDisplay, dateIndex
} from "./utils.mjs";

let shareTextTimeout = null;

window.onload = function() {
    loadOperator();
    document.getElementById("solved-share-button").addEventListener("click",
    function () {
        document.getElementById("clipboard-text").style.display = "block";
        copyToClipboard(document.getElementById("solved-share-button")
        .getAttribute("data-share-text"));
        if (shareTextTimeout != null)
            clearTimeout(shareTextTimeout);
        shareTextTimeout = setTimeout(function () {
            document.getElementById("clipboard-text").style.display = "none";
        }, 2000);
    });
    document.getElementById("solved-display-close-button").addEventListener(
    "click", function () {
        document.getElementById("solved-display").style.display = "none";
    });
    document.getElementById("help-display-close-button").addEventListener(
    "click", function () {
        document.getElementById("help-display").style.display = "none";
    });
    // Help button
    getFileContent("./src/puzzle/operator/help.html", function (content) {
        document.getElementById("help-container").innerHTML = content;
    });
    document.getElementById("help-button").addEventListener("click",
    function () {
        showHelpDisplay();
    });
    // Add puzzle number to title
    let indexText = ` #${dateIndex}`;
    document.getElementById("main-title").innerText += indexText;
    document.getElementsByTagName("title")[0].innerText += indexText;
}