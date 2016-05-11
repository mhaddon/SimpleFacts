<?php

date_default_timezone_set('UTC');

use Ratchet\MessageComponentInterface;

class Chat implements MessageComponentInterface {

    protected $clients;

    public function __construct() {
        $this->clients = new \SplObjectStorage;
        echo "\r\nServer listening and waiting.\r\n";
    }

    public function onClose(\Ratchet\ConnectionInterface $conn) {
        $this->clients->detach($conn);
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
            if ($client === $from) {
                break;
            }
        }
        $msgj = json_decode($msg);

        echo "\r\nRecived message: \"" . $msgj->msg . "\" from client " . $i . ".\r\n";
        $msgj->ID = $i;
        $msgj->time = date("H:i:s");

        foreach ($this->clients as $client) {

            $client->send(json_encode($msgj));
        }
    }

    public function onOpen(\Ratchet\ConnectionInterface $conn) {
        $this->clients->attach($conn);
        echo "\r\nNew Client Connected (" . count($this->clients) . " total)\r\n";
    }

}

?>