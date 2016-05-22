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
    MessageBoxInput.attachListeners();
    ChannelBoxInput.attachListeners();
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
    MessageBoxInput.setText(MessageBoxInput.el.innerText + '#' + TagName);
}

/**
 * This function gets the closest parent of a Javascript element with a particular
 * tag name.
 * If no element is found than it returns null.
 * 
 * Credit to this Stackoverflow post: http://stackoverflow.com/a/18664016/1507692
 * 
 * @param {Object} el - Javascript Document Element
 * @param {String} tag - The tag name we are looking for
 * @returns {el.parentNode|null}
 */
function getClosest(el, tag) {
    // this is necessary since nodeName is always in upper case
    tag = tag.toUpperCase();
    do {
        if (el.nodeName === tag) {
            // tag name is found! let's return it. :)
            return el;
        }
    } while (el = el.parentNode);

    // not found :(
    return null;
}