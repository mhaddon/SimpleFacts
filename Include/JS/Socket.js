var SocketController = function () {
    this.conn = null;

    this.Data = {
        connected: false
    }

    return {
        conn: this.conn,
        Data: this.Data,
        connect: this.connect,
        onOpen: this.onOpen,
        onClose: this.onClose,
        Close: this.Close,
        Subscribe: this.Subscribe,
        unSubscribe: this.unSubscribe,
        onBroadcast: this.onBroadcast,
        Broadcast: this.Broadcast,
        onMessage: this.onMessage,
        updateName: this.updateName
    }
}

SocketController.prototype.connect = function () {
    this.conn = new ab.Session('wss://wss.haddon.me',
            this.onOpen.bind(this),
            this.onClose.bind(this),
            {'skipSubprotocolCheck': true});

    Scene.onConnectionStart();
}

SocketController.prototype.onOpen = function (e) {
    this.Data.connected = true;

    Scene.onConnected();

    this.Subscribe(['System', '#Cats', '#Dogs', '#ApacheHelicopters']);
}

SocketController.prototype.onClose = function (e) {
    this.Data.connected = false;

    Scene.onDisconnected();
}

SocketController.prototype.Close = function (e) {
    this.conn.close();
}

SocketController.prototype.Subscribe = function (topic) {
    if (typeof topic === 'string') {
        topic = [topic];
    }

    for (var i = 0; i < topic.length; i++) {
        var e = topic[i];
        if (!ViewModel.isSubscribed(e)) {
            if (e !== 'System') {
                ViewModel.Subscribe(e);
            }
            this.conn.subscribe(e, this.onBroadcast.bind(this));
        }
    }
}

SocketController.prototype.unSubscribe = function (topic) {
    if (typeof topic === 'string') {
        topic = [topic];
    }

    for (var i = 0; i < topic.length; i++) {
        var e = topic[i];
        if (ViewModel.isSubscribed(e)) {
            ViewModel.unSubscribe(e);
            this.conn.unsubscribe(e);
        }
    }
}

SocketController.prototype.Broadcast = function (topic, data) {
    this.conn.publish(topic, data);
}

SocketController.prototype.onBroadcast = function (topic, data) {
    if (topic === 'System') {
        if (data.Type === 'nameChange') {
            if (data.name.length === 0) {
                ViewModel.removeUser(data);
            } else {
                ViewModel.addUser(data);                
            }
        }
    } else {
        ViewModel.addMessage({
            name: data.name,
            value: data.msg,
            time: data.time,
            ms: data.ms
        });
    }
}

SocketController.prototype.updateName = function () {
    this.conn.publish('System', {
        name: Scene.Data.User.Name
    });
}

var Socket = new SocketController;