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
        onBroadcast: this.onBroadcast,
        Broadcast: this.Broadcast,
        onMessage: this.onMessage
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
    
    this.Subscribe('CatFacts');
}

SocketController.prototype.onClose = function (e) {
    this.Data.connected = false;

    Scene.onDisconnected();
}

SocketController.prototype.Close = function (e) {
    this.conn.close();
}

SocketController.prototype.Subscribe = function (topic) {
    this.conn.subscribe(topic, this.onBroadcast.bind(this));
}

SocketController.prototype.Broadcast = function (topic, data) {
    this.conn.publish(topic, data);
}

SocketController.prototype.onBroadcast = function(topic, data) {
    console.log('message from ' + topic)
    ViewModel.addMessage({
        name: data.name,
        value: data.msg,
        time: data.time,
        ms: data.ms
    });
}

var Socket = new SocketController;