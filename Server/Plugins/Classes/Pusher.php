<?php

namespace MyApp;
use Ratchet\ConnectionInterface;
use Ratchet\Wamp\WampServerInterface;

date_default_timezone_set('UTC');

class Pusher implements WampServerInterface {

    protected $clients;

    public function __construct() {
        $this->clients = array();
        echo "\r\nServer listening and waiting.\r\n";
    }

    public function onUnSubscribe(ConnectionInterface $conn, $topic) {
        
    }
    public function onOpen(ConnectionInterface $conn) {
        $this->clients[$conn->resourceId] = $conn;
        
        echo "\r\nNew Client Connected ({$conn->resourceId}) (" . count($this->clients) . " total)\r\n";
    }
    public function onClose(ConnectionInterface $conn) {
        unset($this->clients[$conn->resourceId]);
        
        echo "\r\nClient Terminated (" . count($this->clients) . " total)\r\n";
    }
    public function onCall(ConnectionInterface $conn, $id, $topic, array $params) {
        // In this application if clients send data it's because the user hacked around in console
        $conn->callError($id, $topic, 'You are not allowed to make calls')->close();
    }
    public function onPublish(ConnectionInterface $conn, $topic, $event, array $exclude, array $eligible) {
        // In this application if clients send data it's because the user hacked around in console
        //echo $conn->resourceId . " - auto dcd";
        //$conn->close();
        /*
        this.onBlogEntry((object) array(
            'category' => $topic->getId(),
            
        ));
         * 
         */
        $topic->broadcast((object) array(
            'time' => date("H:i:s"),
            'ms' => microtime(true),
            'name' => $event['name'],
            'msg' => $event['msg']
        ));
    }
    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "Error: " . $e->getMessage();
        $conn->close();
    }


        /**
     * A lookup of all the topics clients have subscribed to
     */
    protected $subscribedTopics = array();

    public function onSubscribe(ConnectionInterface $conn, $topic) {
        $this->subscribedTopics[$topic->getId()] = $topic;
        echo $conn->resourceId . ' subcribed: ' . $topic . "\r\n";
    }

    /**
     * @param string JSON'ified string we'll receive from ZeroMQ
     */
    public function onBlogEntry($entry) {
        $entryData = json_decode($entry, true);

        // If the lookup topic object isn't set there is no one to publish to
        if (!array_key_exists($entryData['category'], $this->subscribedTopics)) {
            return;
        }

        $topic = $this->subscribedTopics[$entryData['category']];

        // re-send the data to all the clients subscribed to that category
        $topic->broadcast($entryData);
    }

    /* The rest of our methods were as they were, omitted from docs to save space */
}