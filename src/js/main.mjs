
import { load as loadOperator } from "./operator.mjs";
import { copyToClipboard } from "./utils.mjs";

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
}