document.addEventListener('DOMContentLoaded', function () {
    Scene.loadElementCache();
    Scene.attachListeners();
    Socket.connect();
});

var messageListViewModel = new Vue({
    // We want to target the div with an id of 'events'
    el: '#MessageHistoryList',
    // Here we can register any values or collections that hold data
    // for the application
    data: {
        Messages: [
            {
                name: "Michael",
                value: "Did you know, that cows have snouts?",
                time: "12:31:24"
            },
            {
                name: "Bob",
                value: "What about trees having hairs?!",
                time: "12:32:32"
            }
        ]
    },
    // Anything within the ready function will run when the application loads
    ready: function () {},
    // Methods we want to use in our application are registered here
    methods: {
        addMessage: function (data) {
            this.Messages.push(data);
            
            /**
             * Vue does not instantly add the messages to the page. It instead
             * seems to add the item after a short delay. This means that if we
             * want to update the DOM after the message has been added, we also
             * need to wait.
             * 
             * There might be a better way to do this.
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
            setTimeout(function () {
                var scrollTop = Scene.Data.Elements.Error.messageHistory.scrollTop;
                var childHeight = Scene.Data.Elements.Field.messageHistoryUL.getBoundingClientRect().height;
                var parentHeight = Scene.Data.Elements.Error.messageHistory.getBoundingClientRect().height;
                var maxYScroll = childHeight - parentHeight;
                
                if ((childHeight > parentHeight) && (maxYScroll - scrollTop < 100)) {
                    Scene.Data.Elements.Error.messageHistory.scrollTop = maxYScroll + 60;
                }
            }, 100);
        }
    }
});

var channelListViewModel = new Vue({
    // We want to target the div with an id of 'events'
    el: '#ActiveChannelsList',
    // Here we can register any values or collections that hold data
    // for the application
    data: {
        joinedchannels: [
            {
                name: "cat"
            }
        ],
        otherchannels: [
            {
                name: "dog"
            }
        ]
    },
    // Anything within the ready function will run when the application loads
    ready: function () {},
    // Methods we want to use in our application are registered here
    methods: {
        subscribeChannel: function (i) {
            var e = this.otherchannels[i];

            this.joinedchannels.push(e);
            this.otherchannels.splice(i, 1);
        },
        removeChannel: function (i) {
            var e = this.joinedchannels[i];

            this.otherchannels.push(e);
            this.joinedchannels.splice(i, 1);
        }
    }
});

var participantsListViewModel = new Vue({
    // We want to target the div with an id of 'events'
    el: '#ParticipantsList',
    // Here we can register any values or collections that hold data
    // for the application
    data: {
        people: [
            {
                name: "Michael"
            },
            {
                name: "Bob"
            },
        ]
    },
    // Anything within the ready function will run when the application loads
    ready: function () {},
    // Methods we want to use in our application are registered here
    methods: {}
});