<?php

namespace MessangerServer;

use Ratchet\ConnectionInterface;
use Ratchet\Wamp\WampServerInterface;

date_default_timezone_set('UTC');

/**
 * This class is responsible for handling the socket connections sent to us by
 * Ratchet
 */
class Pusher implements WampServerInterface {

    /**
     * This is an array of all the currently connected clients
     * @var array
     */
    protected $clients;
    /**
     * This is an array of all the currently active topics
     * @var array
     */
    protected $Topics;

    /**
     * When the server is started
     */
    public function __construct() {
        $this->clients = array();
        echo "\r\nServer listening and waiting.\r\n";
    }

    /**
     * This method is a callback which is ran when a client connects to the 
     * server
     * 
     * @param ConnectionInterface $conn
     */
    public function onOpen(ConnectionInterface $conn) {
        /**
         * We want to store this connection in our list of currently connected
         * clients.
         */
        $this->clients[$conn->resourceId] = array(
            "ID" => $conn->resourceId,
            "Name" => "Guest"
        );

        echo "\r\nNew Client Connected ({$conn->resourceId}) (" . count($this->clients) . " total)\r\n";
        
        $this->updateUserList();
    }

    /**
     * This method is a callback which is ran when a client disconnects from the
     * server
     * 
     * @param ConnectionInterface $conn
     */
    public function onClose(ConnectionInterface $conn) {
        unset($this->clients[$conn->resourceId]);

        echo "\r\nClient Terminated (" . count($this->clients) . " total)\r\n";
        
        $this->updateUserList();
    }

    /**
     * This method is a callback which is ran when a client unsubscribes from a
     * topic
     * 
     * @param ConnectionInterface $conn
     * @param type $topic
     */
    public function onUnSubscribe(ConnectionInterface $conn, $topic) {
        echo 'test';
    }

    public function onSubscribe(ConnectionInterface $conn, $Topic) {
        $this->Topics[$Topic->getId()] = $Topic;
        echo $conn->resourceId . ' subcribed: ' . $Topic . "\r\n";
    }
    
    private function updateUserList() {
        if (isset($this->Topics["System"])) {
            $this->Topics["System"]->broadcast((object) array(
                'Type' => 'nameChange',
                'Data' => array_values($this->clients))
            );
        }
    }

    public function onCall(ConnectionInterface $conn, $id, $topic, array $params) {
        // In this application if clients send data it's because the user hacked around in console
        $conn->callError($id, $topic, 'You are not allowed to make calls')->close();
    }

    public function onPublish(ConnectionInterface $conn, $topic, $event, array $exclude, array $eligible) {
        if ($topic->getId() === 'System') {
            if ((isset($event['name'])) && (strlen($event['name']) > 2)) {
                $this->clients[$conn->resourceId] = array(
                    "ID" => $conn->resourceId,
                    "Name" => htmlspecialchars($event['name'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8', false)
                );
        
                $this->updateUserList();
            }
        } else if (strtolower($topic->getId()) === $topic->getId()) {
            $this->parseData($topic, (object) array(
                        'time' => date("H:i:s"),
                        'datetime' => date("Y-m-d H:i:s"),
                        'ms' => microtime(true),
                        'name' => htmlspecialchars($event['name'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8', false),
                        'msg' => htmlspecialchars($event['msg'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8', false)
                    ), $conn);
        }
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "Error: " . $e->getMessage();
        $conn->close();
    }

    /**
     * @param string JSON'ified string we'll receive from ZeroMQ
     */
    public function parseData($topic, $data, $conn = null) {
        $topic->broadcast($data);


        $context = new \ZMQContext();
        $socket = $context->getSocket(\ZMQ::SOCKET_PUSH, 'my pusher');
        $socket->connect("tcp://localhost:5555");

        $data->topic = $topic->getId();

        /**
         * This is some very hacky code which needs to be replaced ASAP i know
         * what i am meant to do.
         * 
         * To retrieve the remote IP of the client you need to do:
         * $conn->remoteAddress
         * However, because we are behind a proxy, we instead need to do:
         * $conn->WebSocket->request->getHeader('X-Forwarded-For')
         * However, this returns an object, not a string, i cannot use this
         * object apparently, and all of its fields are protected.
         * 
         * To read the field with the IP we either need to convert it to a string
         * and scan for IPs with regex, or we do what i did below.
         * 
         * 1. We retrieve the object
         * 2. We convert it into an array, but the array fields cannot be referenced by name
         * 3. EXCEPT, if we loop over all the fields, we can read them
         * 4. We find the correct field and take the value in it, thats the IP
         * 
         * There must be a better way, but i must be too dumb to figure it out.
         */
        $forwarded = (array) $conn->WebSocket->request->getHeader('X-Forwarded-For');
        $IP = '';
        foreach ($forwarded as &$value) {
            if (gettype($value) === 'array') {
                $IP = $value[0];
                break;
            }
        }

        $data->ip = $IP;


        $socket->send(json_encode($data));
    }
}
