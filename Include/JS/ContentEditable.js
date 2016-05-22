/**
 * This class is responsible for making the tags inserted into the messagebox
 * be highlighted blue.
 * 
 * The rough gist of how it works, is that the messagebox is actually a div with
 * the tag contenteditable, which means it can be edited easily in the browser.
 * 
 * We then check every time the client types something to see if we find any
 * matches with regex, which match: /\#+([a-zA-Z_]{1,20})/g
 * Essentially, any peice of a string which has a hashtag (#) and is immediately
 * followed by a letter. The maximum length is 20 characters.
 * 
 * It then replaces these matches with a <a href='#'>#$1</a> tag. The good thing
 * about this is that because it is a content editable field, then you cannot
 * actually click on these links anyway. 
 * 
 * There are some bugs with this code, which I do need to isolate and fix.
 * The hard part, is replacing what the user is typing while they are typing,
 * and not cause any problems for the user.
 * 
 * Credit to: http://jsfiddle.net/5Eu2E/2/
 * There is also a stackoverflow post that references this jsfiddle, I cannot
 * seem to find it though, it may have been removed.
 * Not all of this code do I fully understand the purpose of.
 * 
 * @param {String} elementID - The id of the contenteditable element
 * @returns {ContentEditableController.ContentEditableAnonym$0}
 */
var ContentEditableController = function (elementID) {
    /**
     * The currently acted on contenteditable container.
     */
    this.el = document.getElementById(elementID);

    /**
     * This object holds all the various loose variables
     */
    this.Data = {
        PreviousText: ""
    }

    /**
     * This return function allows us to be able to see the functions and variables
     * that we define with this.
     * See the return value in Socket.js for more information.
     */
    return {
        Data: this.Data,
        el: this.el,
        attachListeners: this.attachListeners,
        onContentChanged: this.onContentChanged,
        onRangeChanged: this.onRangeChanged,
        onKeyPressed: this.onKeyPressed,
        get_text_nodes_in: this.get_text_nodes_in,
        set_range: this.set_range,
        setText: this.setText
    }
}

/**
 * This method attaches the various listeners to the contenteditable element
 * that are needed in order to properly update the content.
 * 
 * @returns {undefined}
 */
ContentEditableController.prototype.attachListeners = function () {
    this.el.onchange = this.onContentChanged.bind(this);
    this.el.onkeyup = this.onContentChanged.bind(this);
    this.el.onmousedown = this.onRangeChanged.bind(this);
    this.el.onmouseup = this.onRangeChanged.bind(this);
    this.el.onkeydown = this.onKeyPressed.bind(this);
}

/**
 * This method is ran when the content of the element has changed, or we if need
 * to check if it has been changed.
 * I did not write this code. 
 * Please see credit at top of page.
 * 
 * @param {Object} e - Event information
 * @returns {undefined}
 */
ContentEditableController.prototype.onContentChanged = function (e) {
    var Text = this.el.innerText;
    if (Text.length > 0) {
        this.el.classList.add("hasContent");
    } else {
        this.el.classList.remove("hasContent");
    }

    if (this.Data.PreviousText !== Text) {
        this.Data.PreviousText = Text;

        if (window.getSelection().rangeCount > 0) {
            var range = window.getSelection().getRangeAt(0);
            var end_node = range.endContainer;
            var end = range.endOffset;
            if (end_node != this.el) {
                var text_nodes = this.get_text_nodes_in(this.el);
                for (var i = 0; i < text_nodes.length; ++i) {
                    if (text_nodes[i] == end_node) {
                        break;
                    }
                    end += text_nodes[i].length;
                }
            }
            var html = this.el.innerHTML;
            if (/\&nbsp;$/.test(html) && Text.length == end) {
                end = end - 1;
                this.set_range(end, end, this.el);
                return;
            }
        }

        /**
         * This is the part of the code that you will want to replace a string
         * with a tag or something else.
         */
        var filter = Text.replace(/\#+([a-zA-Z_]{1,20})/g, '<a href="#">#$1</a>');

        if (!/\&nbsp;$/.test(html)) {
            filter += '&nbsp;';
        }
        this.el.innerHTML = filter;
        this.set_range(end, end, this.el);
    }
}

/**
 * This method is ran if the range of the users mouse cursor has changed.
 * In short, if they might have selected a different part of the string.
 * I did not write this code. 
 * Please see credit at top of page.
 * 
 * @param {Object} e - Event information
 * @returns {undefined}
 */
ContentEditableController.prototype.onRangeChanged = function (e) {
    if (!/\&nbsp;$/.test(this.el.innerHTML)) {
        return;
    }
    var range = window.getSelection().getRangeAt(0);
    var end = range.endOffset;
    var end_node = range.endContainer;
    if (end_node != this.el) {
        var text_nodes = this.get_text_nodes_in(this.el);
        for (var i = 0; i < text_nodes.length; ++i) {
            if (text_nodes[i] == end_node) {
                break;
            }
            end += text_nodes[i].length;
        }
    }
    if (this.el.innerText.trim().length == end) {
        end = end - 1;
        this.set_range(end, end, this.el);
    }
}

/**
 * This method is used to determine if the user has submitted the current message
 * 
 * @param {type} e
 * @returns {undefined}
 */
ContentEditableController.prototype.onKeyPressed = function (e) {
    /**
     * If the user has pressed the enter key then we need to submit this elements
     * parent form.
     * We do not trigger the actual form submit() event as that seems to bypass
     * any listeners we have in place to detect the form being submitted.
     * Instead we call onsubmit(), which calls any listeners we have attached.
     */
    if (e.which === 13) {
        var parentForm = getClosest(this.el, 'form');
        if (parentForm !== null) {
            parentForm.onsubmit(e);
        }
    }
}

/**
 * This method seems to recieve the currently selected area of a textbox.
 * I did not write this code. 
 * Please see credit at top of page.
 * 
 * @param {type} node
 * @returns {Array|ContentEditableController.prototype.get_text_nodes_in.text_nodes}
 */
ContentEditableController.prototype.get_text_nodes_in = function (node) {
    var text_nodes = [];
    if (node.nodeType === 3) {
        text_nodes.push(node);
    } else {
        var children = node.childNodes;
        for (var i = 0, len = children.length; i < len; ++i) {
            var text_node
            text_nodes.push.apply(text_nodes, this.get_text_nodes_in(children[i]));
        }
    }
    return text_nodes;
}

/**
 * Presumably this method sets the the range of the element.
 * The range is the text on the element that is currently selected.
 * It also seems to remove any existing ranges from other elements aswell.
 * I did not write this code. 
 * Please see credit at top of page.
 * 
 * @param {type} start
 * @param {type} end
 * @param {type} element
 * @returns {undefined}
 */
ContentEditableController.prototype.set_range = function (start, end, element) {
    var range = document.createRange();
    range.selectNodeContents(element);
    var text_nodes = this.get_text_nodes_in(element);
    var foundStart = false;
    var char_count = 0, end_char_count;

    for (var i = 0, text_node; text_node = text_nodes[i++]; ) {
        end_char_count = char_count + text_node.length;
        if (!foundStart && start >= char_count && (start < end_char_count || (start === end_char_count && i < text_nodes.length))) {
            range.setStart(text_node, start - char_count);
            foundStart = true;
        }
        if (foundStart && end <= end_char_count) {
            range.setEnd(text_node, end - char_count);
            break;
        }
        char_count = end_char_count;
    }

    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

/**
 * Safely add new text to this element remotely.
 * 
 * @param {String} Text
 * @returns {undefined}
 */
ContentEditableController.prototype.setText = function (Text) {
    this.el.innerText = Text;
    this.onContentChanged();
    this.onRangeChanged();
}

/**
 * We instantiate this element. If we had several contenteditable elements on  
 * this page we should be able to instantiate each one by just having a seperate
 * ID for each one.
 * 
 * ie:
 * var ContentEditable1 = new ContentEditableController('newcomment1');
 * var ContentEditable2 = new ContentEditableController('newcomment2');
 * 
 * You can also just do new ContentEditableController('newcomment').attachListeners();
 * but I prefer to wait until the page has been fully loaded before i attach
 * listeners.
 * 
 * @type ContentEditableController
 */
var MessageBoxInput = new ContentEditableController('newcomment');

/**
 * 
 * @type ContentEditableController
 */
var ChannelBoxInput = new ContentEditableController('channelName');