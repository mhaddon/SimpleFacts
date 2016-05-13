var ViewModel = new (function () {
    var messageListComponent = Vue.extend({
        template: '#messageList-template',
        props: ['Messages'],
        data: function () {
            return {
                a: 1
            }
        }
    });

    var userListComponent = Vue.extend({
        template: '#userList-template',
        props: ['Users'],
        data: function () {
            return {
                a: 1
            }
        }
    });

    var channelListComponent = Vue.extend({
        template: '#channelList-template',
        props: ['Channels'],
        data: function () {
            return {
                a: 1
            }
        },
        methods: {
            subscribeChannel: function (Channel) {
                Channel.joined = true;
            },
            removeChannel: function (Channel) {
                Channel.joined = false;
            }
        }
    });

    var pageViewmodel = new Vue({
        el: '#vueApp',
        data: {
            Messages: [
                {
                    name: "Michael",
                    value: "Did you know, that cows have snouts?",
                    time: "12:31:24",
                    ms: 1
                },
                {
                    name: "Bob",
                    value: "What about trees having hairs?!",
                    time: "12:32:32",
                    ms: 2
                }
            ],
            Users: [
                {
                    name: "Michael"
                },
                {
                    name: "Bob"
                }
            ],
            Channels: [
                {
                    name: "Cats",
                    joined: true
                },
                {
                    name: "Dogs",
                    joined: false
                }
            ]
        },
        components: {
            "messagelist-component": messageListComponent,
            "channellist-component": channelListComponent,
            "userlist-component": userListComponent
        },
        methods: {
            addMessage: function (data) {
                this.Messages.push(data);

                /**
                 * Vue does not instantly add the messages to the page. It instead
                 * seems to add the item after a short delay. This means that if we
                 * want to update the DOM after the message has been added, we also
                 * need to wait.
                 *
                 * The below callback runs after Vue has finished updating the DOM.
                 *
                 * The following block of code is responsible for causing the message
                 * history scrollbar to update and scrolldown after the message is
                 * posted, this is so the user can instantly see the new message, if
                 * it otherwise would have been hidden by overflow-y.
                 *
                 * This block of code also makes it so the page does not scroll down
                 * if the user does not seem to be currently interested in viewing
                 * the lastest messages. (IE they have scrolled up purposefully).
                 *
                 * @returns {undefined}
                 */
                Vue.nextTick(function () {
                    var scrollTop = Scene.Data.Elements.Error.messageHistory.scrollTop;
                    var childHeight = Scene.Data.Elements.Field.messageHistoryUL.getBoundingClientRect().height;
                    var parentHeight = Scene.Data.Elements.Error.messageHistory.getBoundingClientRect().height;
                    var maxYScroll = childHeight - parentHeight;

                    if ((childHeight > parentHeight) && (maxYScroll - scrollTop < 100)) {
                        Scene.Data.Elements.Error.messageHistory.scrollTop = maxYScroll + 60;
                    }
                });
            }
        }
    });
    
    return pageViewmodel;
});