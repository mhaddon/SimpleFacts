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