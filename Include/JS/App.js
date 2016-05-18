/**
 * When the document has been loaded we will initiate the application and run
 * all the necessary javascript stuffness.
 * 
 * This small block of code is what makes everything work. Without it, nothing
 * happens.
 */
document.addEventListener('DOMContentLoaded', function () {
    Scene.loadElementCache();
    Scene.attachListeners();
    ContentEditable.attachListeners();
    Socket.connect();
});

/**
 * This function makes an array have unique elements by comparing them to a hash
 * table.
 * It will return an array with unique elements.
 * 
 * Credit to this Stackoverflow post: http://stackoverflow.com/a/9229821/1507692
 * 
 * @param {Array} a
 * @returns {Array}
 */
function uniq(a) {
    var seen = {};
    return a.filter(function (item) {
        return seen.hasOwnProperty(item.toLowerCase()) ? false : (seen[item.toLowerCase()] = true);
    });
}

/**
 * Adds a tag to the message input box, this is so the user can quickly respond
 * to something someone has said.
 * 
 * @param {String} a
 * @returns {undefined}
 */
function addTagToChat(TagName) {
    ContentEditable.setText(ContentEditable.el.innerText + '#' + TagName);
}