
export { getFileContent };

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