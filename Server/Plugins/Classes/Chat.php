<?php

date_default_timezone_set('UTC');

use Ratchet\MessageComponentInterface;

class Chat implements MessageComponentInterface {

    protected $clients;

    public function __construct() {
        $this->clients = array();
        echo "\r\nServer listening and waiting.\r\n";
    }

    public function onOpen(\Ratchet\ConnectionInterface $conn) {
        $this->clients[$conn->resourceId] = (object) array(
            'Info' => (object) array(
                "Name" => "Guest",
                "JoinMS" => microtime(true),
                "SubscribedChannels" => 1
            ),
            'conn' => $conn
        );
        
        echo "\r\nNew Client Connected ({$conn->resourceId}) (" . count($this->clients) . " total)\r\n";
    }

    public function onClose(\Ratchet\ConnectionInterface $conn) {
        unset($this->clients[$conn->resourceId]);
        
        echo "\r\nClient Terminated (" . count($this->clients) . " total)\r\n";
    }

    public function onError(\Ratchet\ConnectionInterface $conn, \Exception $e) {
        echo "Error: " . $e->getMessage();
        $conn->close();
    }

    public function onMessage(\Ratchet\ConnectionInterface $from, $msg) {
        $i = 0;

        foreach ($this->clients as $client) {
            $i++;
            if ($client->conn === $from) {
                break;
            }
        }
        $msgj = json_decode($msg);

        echo "\r\nRecived message: \"" . $msgj->msg . "\" from client " . $i . ".\r\n";
        $msgj->ID = $i;
        $msgj->time = date("H:i:s");
        $msgj->ms = microtime(true);
        

        foreach ($this->clients as $client) {

            $client->conn->send(json_encode($msgj));
        }
    }
}

?>