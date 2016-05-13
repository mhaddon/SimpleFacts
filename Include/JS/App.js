document.addEventListener('DOMContentLoaded', function () {
    Scene.loadElementCache();
    Scene.attachListeners();
    Socket.connect();
});

//http://autobahn.ws/js/reference_wampv1.html


/*
 var conn = new ab.Session('ws://localhost:8080',
 function () {
 conn.subscribe('kittensCategory', function (topic, data) {
 // This is where you would add the new article to the DOM (beyond the scope of this tutorial)
 console.log('New article published to category "' + topic + '" : ' + data.title);
 });
 },
 function () {
 console.warn('WebSocket connection closed');
 },
 {'skipSubprotocolCheck': true}
 );
 *//*
var conn = null;
document.addEventListener('DOMContentLoaded', function () {
    conn = new ab.Session('wss://wss.haddon.me',
        function() {
            conn.subscribe('kittensCategory', function(topic, data) {
                // This is where you would add the new article to the DOM (beyond the scope of this tutorial)
                console.log('New article published to category "' + topic + '" : ' + data.title);
                console.log(data);
            });

         // publish event on a topic
         conn.publish("kittensCategory", {a: 23, b: "foobar"});
        },
        function(code, reason) {
            console.warn('WebSocket connection closed: ' + reason);
        },
        {'skipSubprotocolCheck': true}
    );
});
#*/