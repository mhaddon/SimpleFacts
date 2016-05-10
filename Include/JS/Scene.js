var SceneController = function () {
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
            },
            Field: {
                Message: null,
                Name: null
            },
            Error: {
                displayName: null
            }
        },
        User: {
            Name: "Guest"
        }
    }

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
        onReconnectSubmitted: this.onReconnectSubmitted
    }
}

SceneController.prototype.loadElementCache = function () {
    //Overlay Divs
    this.Data.Elements.Overlay.parent = document.getElementById('overlayDiv');
    this.Data.Elements.Overlay.connecting = document.getElementById('connectingOverlay');
    this.Data.Elements.Overlay.disconnected = document.getElementById('disconnectedOverlay');
    this.Data.Elements.Overlay.connected = document.getElementById('connectedOverlay');

    //Forms
    this.Data.Elements.Form.Reconnect = document.getElementById('ReconnectForm');
    this.Data.Elements.Form.MessageInput = document.getElementById('MessageInputForm');
    this.Data.Elements.Form.NameInput = document.getElementById('NameInputForm');

    //Fields
    this.Data.Elements.Field.Message = document.querySelector('#MessageInputForm input');
    this.Data.Elements.Field.Name = document.querySelector('#NameInputForm input');
    
    //Errors
    this.Data.Elements.Error.displayName = document.getElementById('displayNameError');
}

SceneController.prototype.attachListeners = function () {
    this.Data.Elements.Form.NameInput.onsubmit = this.onNameSubmitted.bind(this);
    this.Data.Elements.Form.MessageInput.onsubmit = this.onMessageSubmitted.bind(this);
    this.Data.Elements.Form.Reconnect.onsubmit = this.onReconnectSubmitted.bind(this);
}

SceneController.prototype.onNameSubmitted = function (e) {
    e.preventDefault();

    if (this.Data.Elements.Field.Name.value.length > 3) {
        this.Data.User.Name = this.Data.Elements.Field.Name.value;

        this.Data.Elements.Overlay.parent.style.display = 'none';
        this.Data.Elements.Error.displayName.style.display = '';
    } else {
        this.Data.Elements.Error.displayName.style.display = 'block';
    }
}

SceneController.prototype.onMessageSubmitted = function (e) {
    e.preventDefault();
    if ((this.Data.Elements.Field.Message.value.trim() === "") || (!Socket.Data.connected)) {
        return;
    }

    Socket.conn.send(JSON.stringify({
        msg: this.Data.Elements.Field.Message.value
    }));

    this.Data.Elements.Field.Message.value = "";
}

SceneController.prototype.onReconnectSubmitted = function (e) {
    e.preventDefault();
    Socket.connect();
}

SceneController.prototype.onConnectionStart = function () {
    this.Data.Elements.Overlay.parent.style.display = 'block';
    this.Data.Elements.Overlay.connecting.style.display = 'block';
    this.Data.Elements.Overlay.disconnected.style.display = '';
    this.Data.Elements.Overlay.connected.style.display = '';
}

SceneController.prototype.onConnected = function (e) {
    this.Data.Elements.Overlay.parent.style.display = 'block';
    this.Data.Elements.Overlay.connecting.style.display = '';
    this.Data.Elements.Overlay.disconnected.style.display = '';
    this.Data.Elements.Overlay.connected.style.display = 'block';
}

SceneController.prototype.onDisconnected = function (e) {
    /**
     * You cannot show a user a disconnected screen instantly, as if you do this
     * they may not see the Connecting... screen, and think that the program did
     * not even try to connect, so they spam the reconnect button... Which could
     * put unneeded strain on the server.
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

SceneController.prototype.onMessage = function (e) {
    var data = JSON.parse(e.data);

    console.log(data);




    messageListViewModel.Messages.push({
        name: participantsListViewModel.people[data.ID - 1].name,
        value: data.msg,
        time: data.time
    })
}

var Scene = new SceneController;