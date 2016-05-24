/**
 * This class is responsible for controlling the pages "Scene", the scene is the
 * design of the page, and just the code that modifies the DOM.
 * 
 * The goal is to seperate the code that modifies the DOM from the code that
 * works behind the scenes.
 * 
 * @returns {SceneController.SceneAnonym$0}
 */
var SceneController = function () {
    /**
     * This object caches all of the pages elements, and also stores any
     * variables that are revelent to the pages design.
     */
    this.Data = {
        Elements: {
            Overlay: {
                connecting: null,
                disconnected: null,
                connected: null,
                parent: null
            },
            Form: {
                Reconnect: null,
                ChannelInput: null,
                MessageInput: null,
                NameInput: null
            },
            Field: {
                Message: null,
                Name: null,
                MessageBox: null,
                Channel: null
            },
            Error: {
                displayName: null
            },
            List: {
                messageHistory: null
            }
        },
        User: {
            Name: "Guest"
        }
    }

    /**
     * This return function allows us to be able to see the functions and variables
     * that we define with this.
     * See the return value in Socket.js for more information.
     */
    return {
        Data: this.Data,
        loadElementCache: this.loadElementCache,
        onConnectionStart: this.onConnectionStart,
        onConnected: this.onConnected,
        onDisconnected: this.onDisconnected,
        onMessage: this.onMessage,
        attachListeners: this.attachListeners,
        onMessageSubmitted: this.onMessageSubmitted,
        onNameSubmitted: this.onNameSubmitted,
        onReconnectSubmitted: this.onReconnectSubmitted,
        onChannelSubmitted: this.onChannelSubmitted
    }
}

/**
 * This method scans the page and updates the cache of elements we have.
 * 
 * The benefit of caching the elements on the DOM is it increases the performace
 * greatly. (Especially for elements that are not found via an ID)
 * 
 * @returns {undefined}
 */
SceneController.prototype.loadElementCache = function () {
    /**
     * Elements that are part of the overlay
     */
    this.Data.Elements.Overlay.parent = document.getElementById('overlayDiv');
    this.Data.Elements.Overlay.connecting = document.getElementById('connectingOverlay');
    this.Data.Elements.Overlay.disconnected = document.getElementById('disconnectedOverlay');
    this.Data.Elements.Overlay.connected = document.getElementById('connectedOverlay');

    /**
     * Elements that are HTML forms
     */
    this.Data.Elements.Form.Reconnect = document.getElementById('ReconnectForm');
    this.Data.Elements.Form.MessageInput = document.getElementById('MessageInputForm');
    this.Data.Elements.Form.NameInput = document.getElementById('NameInputForm');
    this.Data.Elements.Form.ChannelInput = document.getElementById('ChannelInputForm');

    /**
     * Elements that are HTML form fields
     */
    this.Data.Elements.Field.Name = document.querySelector('#NameInputForm input');
    this.Data.Elements.Field.MessageBox = document.getElementById('newcomment');
    this.Data.Elements.Field.ChannelBox = document.getElementById('channelName');

    /**
     * Elements that are used for error messages
     */
    this.Data.Elements.Error.displayName = document.getElementById('displayNameError');

    /**
     * Elements that are Lists
     * ie: 
     * Message history, currently connected users, active channels
     */
    this.Data.Elements.List.messageHistory = document.getElementById('MessageHistoryList');
    this.Data.Elements.List.messageHistoryUL = document.querySelector('#MessageHistoryList .speciallist');
}

/**
 * Attaches listeners that are required for the page to run.
 * Mostly just detecting if a form has been submitted.
 * 
 * @returns {undefined}
 */
SceneController.prototype.attachListeners = function () {
    this.Data.Elements.Form.NameInput.onsubmit = this.onNameSubmitted.bind(this);
    this.Data.Elements.Form.MessageInput.onsubmit = this.onMessageSubmitted.bind(this);
    this.Data.Elements.Form.Reconnect.onsubmit = this.onReconnectSubmitted.bind(this);
    this.Data.Elements.Form.ChannelInput.onsubmit = this.onChannelSubmitted.bind(this);
}

/**
 * This method is a callback, which is ran when the user inputs a channel name
 * to connect to
 * 
 * @param {Object} e - Event information
 * @returns {undefined}
 */
SceneController.prototype.onChannelSubmitted = function (e) {
    e.preventDefault();

    var Input = Scene.Data.Elements.Field.ChannelBox.innerText.trim();

    if ((Input.length > 0) && (Socket.Data.connected)) {
        var Tags = uniq(Input.match(/#+([a-zA-Z_]{1,20})/g));
        if (Tags !== null) {
            Socket.Subscribe(Tags);
            this.Data.Elements.Field.ChannelBox.innerHTML = '';
        } else {
            alert('invalid channel name');
        }
    }
}

/**
 * This method is a callback, which is ran when the user inputs their display
 * name.
 * 
 * @param {Object} e - Event information
 * @returns {undefined}
 */
SceneController.prototype.onNameSubmitted = function (e) {
    e.preventDefault();

    if (this.Data.Elements.Field.Name.value.length > 2) {
        this.Data.User.Name = this.Data.Elements.Field.Name.value;

        this.Data.Elements.Overlay.parent.style.display = 'none';
        this.Data.Elements.Error.displayName.style.display = '';

        Socket.updateName();
    } else {
        this.Data.Elements.Error.displayName.style.display = 'block';
    }
}

/**
 * This method is ran when the user submits a message
 * 
 * 
 * @param {Object} e - Event information
 * @returns {undefined}
 */
SceneController.prototype.onMessageSubmitted = function (e) {
    e.preventDefault();

    var Message = Scene.Data.Elements.Field.MessageBox.innerText.trim();

    if ((Message.length > 0) && (Socket.Data.connected)) {

        var Tags = uniq(Message.match(/#+([a-zA-Z_]{1,20})/g));

        /**
         * We must try to create a unique id for this message. So we will get
         * the current time in ms, and we will add a random amount to the number.
         * 
         * There will be possibilities for collisions, but I think for this demo
         * the chance of collision is reasonably low.
         * @type Number
         */
        var messageID = (((new Date().getTime()) * 1000) + (Math.random() * 1000)).toString(36);

        if (Tags !== null) {
            Socket.Subscribe(Tags);
            Tags.forEach(function (e) {
                Socket.Broadcast(e, {
                    ID: messageID,
                    msg: Message,
                    name: this.Data.User.Name
                });
            }.bind(this));

            Scene.Data.Elements.Field.MessageBox.innerText = "";
        } else {
            alert('A message must contain a tag #likethis')
        }
    }
}

/**
 * This method is ran when the user attempts to reconnect.
 * @param {Object} e - Event information
 * @returns {undefined}
 */
SceneController.prototype.onReconnectSubmitted = function (e) {
    e.preventDefault();
    Socket.connect();
}

/**
 * This method is ran when the client has begun connecting to the server.
 * It doest mean its connected, but its attempting to connect.
 * 
 * So we show them a message that says "Connecting..."
 * 
 * @returns {undefined}
 */
SceneController.prototype.onConnectionStart = function () {
    this.Data.Elements.Overlay.parent.style.display = 'block';
    this.Data.Elements.Overlay.connecting.style.display = 'block';
    this.Data.Elements.Overlay.disconnected.style.display = '';
    this.Data.Elements.Overlay.connected.style.display = '';
}

/**
 * This method is ran when the client has connected to the server.
 * It updates the DOM to prompt the user for their display name.
 * 
 * @param {object} e - Event information
 * @returns {undefined}
 */
SceneController.prototype.onConnected = function (e) {
    this.Data.Elements.Overlay.parent.style.display = 'block';
    this.Data.Elements.Overlay.connecting.style.display = '';
    this.Data.Elements.Overlay.disconnected.style.display = '';
    this.Data.Elements.Overlay.connected.style.display = 'block';
}

/**
 * This method is ran when the client has disconnected from the server.
 * It must update the DOM with a prompt asking the user to reconnect.
 * 
 * @param {object} e - Event information
 * @returns {undefined}
 */
SceneController.prototype.onDisconnected = function (e) {
    /**
     * You cannot show a user a disconnected screen instantly, as if you do this
     * they may not see the Connecting... screen, and think that the program did
     * not even try to connect, so they spam the reconnect button... Which could
     * put unneeded strain on the server and frustration for the user.
     *
     * The timeout is just so the user can see that it attempted to reconnect.
     */
    setTimeout(function () {
        this.Data.Elements.Overlay.parent.style.display = 'block';
        this.Data.Elements.Overlay.connecting.style.display = '';
        this.Data.Elements.Overlay.disconnected.style.display = 'block';
        this.Data.Elements.Overlay.connected.style.display = '';
    }.bind(this), 500);
}

/**
 * Because of how I created this function/object prototype, we need to 
 * instantiate it. 
 * So it is instantiated as Scene.
 * @type SceneController
 */
var Scene = new SceneController;