<?php

/**
 * This file contains out "Server", it runs continously when executed listening
 * for inbound websocket connections.
 * 
 * I call it the Listener because this specific files goal is to just listen,
 * it isnt the entire server as there is classes and all sorts that it requires
 * to operate.
 * 
 * The below code listens for external websocket connections on port 8080, which
 * nginx redirects to with a proxy from port 443 (which is secure websockets, wss).
 * These sockets are handled and controlled by Ratchet and they would have 
 * originated from the Javascript Socket.js code.
 * 
 * This code also listens for internal socket connections on port 5555, which
 * are controlly by zmq. These websocket connections are part of the zmq message
 * queue.
 * 
 */
/**
 * We include the autoload.php file which contains all of our required classes
 * (zmq, ratchet, etc).
 * It is compiled with composer.
 * See composer.json for more information.
 */
require_once(__DIR__ . '/Plugins/vendor/autoload.php');

/**
 * 
 */
$loop = React\EventLoop\Factory::create();
$pusher = new MessangerServer\Pusher;

/**
 * Connect to the database.
 */
$database = new MessangerServer\db;


/**
 * Create our listener that listens for external socket connections.
 */
$webSock = new React\Socket\Server($loop);
$webSock->listen(8080, '0.0.0.0'); // Binding to 0.0.0.0 means remotes can connect
$webServer = new Ratchet\Server\IoServer(new Ratchet\Http\HttpServer(new Ratchet\WebSocket\WsServer(new Ratchet\Wamp\WampServer($pusher))), $webSock);

/**
 * This below code listens for internal socket connections, it is for zmq to
 * handle its message queue.
 */
$context = new React\ZMQ\Context($loop);
$pull = $context->getSocket(\ZMQ::SOCKET_PULL);
$pull->bind('tcp://127.0.0.1:5555'); // Binding to 127.0.0.1 means the only client that can connect is itself
$pull->on('message', array($database, 'saveMessage')); //When zmq receives a message we...

/**
 * Start our server for listening for ZMQ and Ratchet websocket connections
 */
$loop->run();
/**
 * We never get here
 */
?>