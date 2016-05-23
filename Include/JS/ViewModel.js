/**
 * When adapting Vue it seems that you dont really need to be able to reference
 * the components in javascript after you have created the vue object.
 *
 * So instead of having loads of random components accessable globally, i have
 * contained them all in one function/class.
 *
 * I could have nestled these components into the parent, but i think that
 * would have made the code unreadable.
 *
 * This class returns the vue model controller.
 *
 * @returns {Vue}
 */
var ViewModel = new (function () {
    /**
     * Create the component that controlls the list of messages.
     */
    var messageListComponent = Vue.extend({
        /**
         * The components design template, see the "text/x-template" tags in
         * index.html
         */
        template: '#messageList-template',
        /**
         * The components variables that it inherits from its parent
         */
        props: ['Messages'],
        /**
         * Every component requires a data feild, but i do not need it as
         * i inherit all the relevent data. So it is filled with nonsense.
         */
        data: function () {
            return {
                a: 1
            }
        }
    });

    /**
     * Create the component that controlls the list of logged in users
     */
    var userListComponent = Vue.extend({
        /**
         * The components design template, see the "text/x-template" tags in
         * index.html
         */
        template: '#userList-template',
        /**
         * The components variables that it inherits from its parent
         */
        props: ['Users'],
        /**
         * Every component requires a data feild, but i do not need it as
         * i inherit all the relevent data. So it is filled with nonsense.
         */
        data: function () {
            return {
                a: 1
            }
        }
    });

    /**
     * Create the component that controlls the list of active channels
     */
    var channelListComponent = Vue.extend({
        /**
         * The components design template, see the "text/x-template" tags in
         * index.html
         */
        template: '#channelList-template',
        /**
         * The components variables that it inherits from its parent
         */
        props: ['Channels'],
        /**
         * Every component requires a data feild, but i do not need it as
         * i inherit all the relevent data. So it is filled with nonsense.
         */
        data: function () {
            return {
                a: 1
            }
        },
        /**
         * The components specific methods.
         * Because of how it is set up, these are methods that we cannot execute
         * externally with Javascript.
         * The purpose of these methods is to execute them directly from the
         * template.
         * Look at index.html to see them referenced.
         */
        methods: {
            /**
             * Subscribe the client to this channel
             *
             * @param {channelListComponent} Channel
             * @returns {undefined}
             */
            subscribeChannel: function (Channel) {
                Socket.Subscribe(Channel.name);
            },
            /**
             * unSubscribe the client from this channel
             *
             * @param {channelListComponent} Channel
             * @returns {undefined}
             */
            removeChannel: function (Channel) {
                Socket.unSubscribe(Channel.name);
            }
        }
    });

    /**
     * Create the parent vue controller which incorporates all of the above
     * components.
     * This class is what the ViewModel class returns.
     */
    var pageViewmodel = new Vue({
        el: '#vueApp',
        data: {
            /**
             * All of the rendered messages.
             * See messageListComponent to see its use.
             */
            Messages: [],
            /**
             * All of the logged in users.
             * See userListComponent to see its use.
             */
            Users: [],
            /**
             * All of the active channels.
             * See channelListComponent to see its use.
             */
            Channels: []
        },
        /**
         * All the components that this vue class uses.
         * Vue component names have a - requirement, for some reason
         */
        components: {
            "messagelist-component": messageListComponent,
            "channellist-component": channelListComponent,
            "userlist-component": userListComponent
        },
        /**
         * The various methods we can call to modify the displays information.
         * All these methods can be accessed and called from outside of this class
         * by doing:
         * ViewModel.UserListIndex(), or whatever.
         */
        methods: {
            /**
             * Finds the index of a specific session id in the userlist.
             * @param {String} ID
             * @returns {Number|Boolean}
             */
            UserListIndex: function (ID) {
                for (var i = 0; i < this.Users.length; i++) {
                    var e = this.Users[i];
                    if (e.ID === ID) {
                        return i;
                    }
                }
                return false;
            },
            /**
             * Finds the index of a specific message id in the messagelist.
             * @param {String} ID
             * @returns {Number|Boolean}
             */
            MessageListIndex: function (ID) {
                for (var i = 0; i < this.Messages.length; i++) {
                    var e = this.Messages[i];
                    if ((typeof e.ID !== 'undefined') && (e.ID === ID)) {
                        return i;
                    }
                }
                return false;
            },
            /**
             * Adds a new user to the UsersList.
             * It will also check to see if a user already exists with that session id.
             * Because if it does, it will simply just update that user.
             * @param {Object} data
             * @returns {undefined}
             */
            addUser: function (data) {
                this.addMessage({
                    name: 'SYSTEM',
                    value: data.Name + ' has joined the server',
                    time: '',
                    ms: this.getMostRecentMessageTime() + 1
                });

                if (this.UserListIndex(data.ID) !== false) {
                    this.Users[this.UserListIndex(data.ID)].name = data.Name;
                } else {
                    this.Users.push({
                        name: data.Name,
                        ID: data.ID
                    });
                }
            },
            /**
             * This method removes a user from the list with a specific session id.
             * @param {Object} data
             * @returns {undefined}
             */
            removeUser: function (data) {
                var UserIndex = this.UserListIndex(data.ID);

                if (UserIndex !== false) {
                    this.addMessage({
                        name: 'SYSTEM',
                        value: this.Users[UserIndex].name + ' has disconnected',
                        time: '',
                        ms: this.getMostRecentMessageTime() + 1
                    });

                    this.Users.$remove(this.Users[UserIndex]);
                }
            },
            /**
             * This method adds a new message to the message log.
             * It also is responsible for causing the page to jump down with the
             * new message.
             *
             * @param {Object} data
             * @returns {undefined}
             */
            addMessage: function (data) {
                /**
                 * If a client is connected to multiple channels, and they recieve
                 * a message that goes out to these channels, then the client
                 * will recieve the message multiple times.
                 *
                 * This ensures that the message will not be added multiple times
                 * to the message log.
                 */
                if (!this.MessageListIndex(data.ID)) {
                    data.value = data.value.replace(/\#+([a-zA-Z_]{1,20})/g, '<a href="#" onclick="addTagToChat(\'$1\')">#$1</a>');
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
                        var scrollTop = Scene.Data.Elements.List.messageHistory.scrollTop;
                        var childHeight = Scene.Data.Elements.List.messageHistoryUL.getBoundingClientRect().height;
                        var parentHeight = Scene.Data.Elements.List.messageHistory.getBoundingClientRect().height;
                        var maxYScroll = childHeight - parentHeight;

                        if ((childHeight > parentHeight) && (maxYScroll - scrollTop < 100)) {
                            Scene.Data.Elements.List.messageHistory.scrollTop = maxYScroll + 60;
                        }
                    });
                }
            },
            /**
             * What was the time in ms, that the last message was added to the list
             * @returns {Number}
             */
            getMostRecentMessageTime: function () {
                var lastTime = 0;
                for (var i = 0; i < this.Messages.length; i++) {
                    var e = this.Messages[i];
                    if (e.ms > lastTime) {
                        lastTime = e.ms;
                    }
                }
                return lastTime;
            },
            /**
             * Is the client already listed as being subscribed to a channel
             * @param {String} topic
             * @returns {Boolean}
             */
            isSubscribed: function (topic) {
                for (var i = 0; i < this.Channels.length; i++) {
                    var e = this.Channels[i];
                    if ((e.joined === true) && (e.name.toLowerCase() === topic.toLowerCase())) {
                        return true;
                    }
                }
                return false;
            },
            /**
             * Can we find the channel on the list of currently active channels?
             * If we can, what is its ID?
             * @param {String} topic
             * @returns {Number|Boolean}
             */
            ChannelListIndex: function (topic) {
                for (var i = 0; i < this.Channels.length; i++) {
                    var e = this.Channels[i];
                    if (e.name === topic) {
                        return i;
                    }
                }
                return false;
            },
            /**
             * Subscribe to a new channel.
             * @param {String} topic
             * @returns {undefined}
             */
            Subscribe: function (topic) {
                this.addMessage({
                    name: 'SYSTEM',
                    value: 'You have subscribed to ' + topic,
                    time: '',
                    ms: this.getMostRecentMessageTime() + 1
                });

                this.addChannel(topic, true, true);
            },
            /**
             * unSubscribe from a channel.
             * @param {String} topic
             * @returns {undefined}
             */
            unSubscribe: function (topic) {
                this.addMessage({
                    name: 'SYSTEM',
                    value: 'You have unsubscribed from ' + topic,
                    time: '',
                    ms: this.Messages[this.Messages.length - 1].ms + 1
                });

                this.addChannel(topic, false, true);
            },
            /**
             * Adds a new channel to the list of channels
             * @param {String} topic
             * @param {Boolean} joined
             * @param {Boolean} override
             * @returns {undefined}
             */
            addChannel: function (topic, joined, override) {
                if (this.ChannelListIndex(topic) !== false) {
                    this.Channels[this.ChannelListIndex(topic)].joined = (override) ? joined : this.Channels[this.ChannelListIndex(topic)].joined;
                } else {
                    this.Channels.push({
                        name: topic,
                        joined: joined
                    });
                }
            }
        }
    });

    return pageViewmodel;
});