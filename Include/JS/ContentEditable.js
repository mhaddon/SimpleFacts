document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
        var PreviousText = "";

        var onChange = function (e) {
            var Text = this.innerText;
            if (Text.length > 0) {
                this.classList.add("hasContent");
            } else {
                this.classList.remove("hasContent");
            }
            
            if (PreviousText !== Text) {
                PreviousText = Text;

                var range = window.getSelection().getRangeAt(0);
                var end_node = range.endContainer;
                var end = range.endOffset;
                if (end_node != this) {
                    var text_nodes = get_text_nodes_in(this);
                    for (var i = 0; i < text_nodes.length; ++i) {
                        if (text_nodes[i] == end_node) {
                            break;
                        }
                        end += text_nodes[i].length;
                    }
                }
                var html = this.innerHTML;
                if (/\&nbsp;$/.test(html) && Text.length == end) {
                    end = end - 1;
                    set_range(end, end, this);
                    return;
                }

                var filter = Text.replace(/\#+([a-zA-Z_]{1,20})/g, '<a href="#">#$1</a>');
                
                if (!/\&nbsp;$/.test(html)) {
                    filter += '&nbsp;';
                }
                this.innerHTML = filter;
                set_range(end, end, this);
            }
        }

        var onx = function (e) {
            if (!/\&nbsp;$/.test(this.innerHTML)) {
                return;
            }
            var range = window.getSelection().getRangeAt(0);
            var end = range.endOffset;
            var end_node = range.endContainer;
            if (end_node != this) {
                var text_nodes = get_text_nodes_in(this);
                for (var i = 0; i < text_nodes.length; ++i) {
                    if (text_nodes[i] == end_node) {
                        break;
                    }
                    end += text_nodes[i].length;
                }
            }
            if (this.innerText.trim().length == end) {
                end = end - 1;
                set_range(end, end, this);
            }
        }
        
        var filterKeyPress = function(e) {
            if (e.which === 13) {
                Scene.onMessageSubmitted(e);
            }
        }


        Scene.Data.Elements.Field.ContentEditable.onchange = onChange;
        Scene.Data.Elements.Field.ContentEditable.onkeyup = onChange;
        Scene.Data.Elements.Field.ContentEditable.onmousedown = onx;
        Scene.Data.Elements.Field.ContentEditable.onmouseup = onx;
        Scene.Data.Elements.Field.ContentEditable.onkeydown = filterKeyPress;



        function get_text_nodes_in(node) {
            var text_nodes = [];
            if (node.nodeType === 3) {
                text_nodes.push(node);
            } else {
                var children = node.childNodes;
                for (var i = 0, len = children.length; i < len; ++i) {
                    var text_node
                    text_nodes.push.apply(text_nodes, get_text_nodes_in(children[i]));
                }
            }
            return text_nodes;
        }

        function set_range(start, end, element) {
            var range = document.createRange();
            range.selectNodeContents(element);
            var text_nodes = get_text_nodes_in(element);
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
    }, 1000);
});