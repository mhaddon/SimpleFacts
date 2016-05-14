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
                Socket.Subscribe(Channel.name);
            },
            removeChannel: function (Channel) {
                Socket.unSubscribe(Channel.name);
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
            Users: [],
            Channels: []
        },
        components: {
            "messagelist-component": messageListComponent,
            "channellist-component": channelListComponent,
            "userlist-component": userListComponent
        },
        methods: {
            UserListIndex: function (ID) {
                for (var i = 0; i < this.Users.length; i++) {
                    var e = this.Users[i];
                    if (e.ID === ID) {
                        return i;
                    }
                }
                return false;
            },
            addUser: function (data) {
                this.addMessage({
                    name: 'SYSTEM',
                    value: data.name + ' has joined the server',
                    time: '',
                    ms: this.getMostRecentMessageTime() + 1
                });

                if (this.UserListIndex(data.ID) !== false) {
                    this.Users[this.UserListIndex(data.ID)].name = data.name;
                } else {
                    this.Users.push({
                        name: data.name,
                        ID: data.ID
                    });
                }
            },
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
            addMessage: function (data) {
                data.value = data.value.replace(/\#+([a-zA-Z_]{1,20})/g, '<a href="#">#$1</a>');
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
            },
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
            isSubscribed: function (topic) {
                for (var i = 0; i < this.Channels.length; i++) {
                    var e = this.Channels[i];
                    if ((e.joined === true) && (e.name === topic)) {
                        return true;
                    }
                }
                return false;
            },
            ChannelListIndex: function (topic) {
                for (var i = 0; i < this.Channels.length; i++) {
                    var e = this.Channels[i];
                    if (e.name === topic) {
                        return i;
                    }
                }
                return false;
            },
            Subscribe: function (topic) {
                this.addMessage({
                    name: 'SYSTEM',
                    value: 'You have subscribed to ' + topic,
                    time: '',
                    ms: this.getMostRecentMessageTime() + 1
                });

                if (this.ChannelListIndex(topic) !== false) {
                    this.Channels[this.ChannelListIndex(topic)].joined = true;
                } else {
                    this.Channels.push({
                        name: topic,
                        joined: true
                    });
                }
            },
            unSubscribe: function (topic) {
                this.addMessage({
                    name: 'SYSTEM',
                    value: 'You have unsubscribed from ' + topic,
                    time: '',
                    ms: this.Messages[this.Messages.length - 1].ms + 1
                });

                if (this.ChannelListIndex(topic) !== false) {
                    this.Channels[this.ChannelListIndex(topic)].joined = false;
                } else {
                    this.Channels.push({
                        name: topic,
                        joined: false
                    });
                }
            }
        }
    });

    return pageViewmodel;
});