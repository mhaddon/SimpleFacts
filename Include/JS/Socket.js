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
        onMessage: this.onMessage
    }
}

SocketController.prototype.connect = function () {
    this.conn = new WebSocket("wss://wss.haddon.me");
    this.conn.onopen = this.onOpen.bind(this);
    this.conn.onmessage = this.onMessage.bind(this);
    this.conn.onclose = this.onClose.bind(this);
}

SocketController.prototype.onOpen = function (e) {
    this.Data.connected = true;

    console.log('Connection to server established.');
}

SocketController.prototype.onClose = function (e) {
    this.Data.connected = false;

    console.log('Connection to server terminated.');
}

SocketController.prototype.onMessage = function (e) {
    var data = JSON.parse(e.data);

    console.log(data);
    
    
    
    
    messageListViewModel.Messages.push({
        name: participantsListViewModel.people[data.ID - 1].name,
        value: data.msg,
        time: data.time
    })
}

var Socket = new SocketController;